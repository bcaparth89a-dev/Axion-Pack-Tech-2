import mongoose from 'mongoose';
import { News, INews } from '../models/News.model.js';
import { NewsCategory, INewsCategory } from '../models/NewsCategory.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';

export interface NewsQueryParams {
  page?: string | number;
  limit?: string | number;
  category?: string;
  search?: string;
  featured?: string;
  publishedOnly?: boolean;
}

export class NewsService {
  async getCategories(): Promise<INewsCategory[]> {
    const cached = await cacheService.getCached<INewsCategory[]>(CACHE_KEYS.NEWS_CATEGORIES);
    if (cached) return cached;

    const categories = await NewsCategory.find().sort({ sortOrder: 1, title: 1 }).lean();
    await cacheService.setCached(CACHE_KEYS.NEWS_CATEGORIES, categories, CACHE_TTL.LONG);

    return categories as unknown as INewsCategory[];
  }

  async createCategory(data: Partial<INewsCategory>): Promise<INewsCategory> {
    const slug = data.slug?.toLowerCase().trim();
    if (slug) {
      const existing = await NewsCategory.findOne({ slug });
      if (existing) {
        throw AppError.conflict(`News category with slug "${slug}" already exists.`);
      }
    }
    const category = await NewsCategory.create(data);
    await cacheService.deleteCached(CACHE_KEYS.NEWS_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
    return category;
  }

  async updateCategory(slug: string, data: Partial<INewsCategory>): Promise<INewsCategory> {
    const category = await NewsCategory.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      data,
      { new: true, runValidators: true }
    );
    if (!category) {
      throw AppError.notFound(`News category "${slug}" not found.`);
    }
    await cacheService.deleteCached(CACHE_KEYS.NEWS_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
    return category;
  }

  async deleteCategory(slug: string): Promise<void> {
    const category = await NewsCategory.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!category) {
      throw AppError.notFound(`News category "${slug}" not found.`);
    }
    await cacheService.deleteCached(CACHE_KEYS.NEWS_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
  }

  async getNews(params: NewsQueryParams): Promise<PaginatedResponse<INews>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const isPublic = params.publishedOnly !== false;
    const cacheKey = isPublic
      ? CACHE_KEYS.NEWS_LIST(`cat_${params.category || ''}_s_${params.search || ''}_f_${params.featured || ''}_p${page}_l${limit}`)
      : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<PaginatedResponse<INews>>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = {};
    if (isPublic) {
      filter.published = true;
    }
    if (params.category) {
      filter.categorySlug = params.category.toLowerCase();
    }
    if (params.featured !== undefined && params.featured !== '') {
      filter.featured = params.featured === 'true';
    }
    if (params.search) {
      filter.$text = { $search: params.search };
    }

    const [items, totalItems] = await Promise.all([
      News.find(filter)
        .select('title slug category categorySlug categoryName excerpt content image featuredImage video videoUrl author readTime tags published publishedAt featured sortOrder')
        .sort(
          filter.$text
            ? { score: { $meta: 'textScore' } }
            : { sortOrder: 1, publishedAt: -1, createdAt: -1 }
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      News.countDocuments(filter),
    ]);

    const result = buildPaginatedResponse(items as unknown as INews[], totalItems, page, limit);

    if (cacheKey) {
      await cacheService.setCached(cacheKey, result, CACHE_TTL.SHORT);
    }

    return result;
  }

  async getNewsBySlug(
    categoryOrSlug: string,
    slugOrPublishedOnly?: string | boolean,
    publishedOnly: boolean = true
  ): Promise<INews> {
    let categorySlug: string | undefined;
    let articleSlug: string;
    let isPublic = publishedOnly;

    if (typeof slugOrPublishedOnly === 'string') {
      categorySlug = categoryOrSlug.toLowerCase();
      articleSlug = slugOrPublishedOnly.toLowerCase();
    } else {
      articleSlug = categoryOrSlug.toLowerCase();
      if (typeof slugOrPublishedOnly === 'boolean') {
        isPublic = slugOrPublishedOnly;
      }
    }

    const cacheKey = isPublic ? `news:detail:${categorySlug || 'direct'}:${articleSlug}` : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<INews>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = {
      slug: articleSlug,
    };
    if (categorySlug) {
      filter.categorySlug = categorySlug;
    }
    if (isPublic) {
      filter.published = true;
    }

    const item = await News.findOne(filter).lean();
    if (!item) {
      throw AppError.notFound(`News article "${articleSlug}" not found.`);
    }

    if (cacheKey) {
      await cacheService.setCached(cacheKey, item as unknown as INews, CACHE_TTL.MEDIUM);
    }

    return item as unknown as INews;
  }

  async createNews(data: Partial<INews> & Record<string, unknown>): Promise<INews> {
    const slug = data.slug?.toLowerCase().trim();
    if (!slug) {
      throw AppError.badRequest('Article slug is required.');
    }

    const existing = await News.findOne({ slug });
    if (existing) {
      throw AppError.conflict(`News article with slug "${slug}" already exists.`);
    }

    // Normalize field variations
    let categorySlug = (data.categorySlug || data.category || 'company-news')
      .toString()
      .toLowerCase()
      .trim();

    let categoryId: mongoose.Types.ObjectId | undefined = undefined;
    let categoryName = typeof data.categoryName === 'string' ? data.categoryName.trim() : undefined;

    if (mongoose.Types.ObjectId.isValid(categorySlug)) {
      const catById = await NewsCategory.findById(categorySlug);
      if (catById) {
        categoryId = catById._id as mongoose.Types.ObjectId;
        categorySlug = catById.slug;
        categoryName = categoryName || catById.title;
      }
    } else {
      const catBySlug = await NewsCategory.findOne({ slug: categorySlug });
      if (catBySlug) {
        categoryId = catBySlug._id as mongoose.Types.ObjectId;
        categoryName = categoryName || catBySlug.title;
      }
    }

    const image = data.image || data.featuredImage || '/images/news/news-default.jpg';
    const featuredImage = data.featuredImage || data.image || '/images/news/news-default.jpg';

    const { category: _rawCat, ...cleanData } = data;

    const item = await News.create({
      ...cleanData,
      slug,
      categorySlug,
      categoryName: categoryName || (categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Company News'),
      category: categoryId,
      image,
      featuredImage,
      published: data.published !== false,
      publishedAt: data.publishedAt || new Date(),
    });

    await this.invalidateCache(item.categorySlug, item.slug);
    return item;
  }

  async updateNews(slug: string, data: Partial<INews> & Record<string, unknown>): Promise<INews> {
    const updateData: Record<string, unknown> = { ...data };
    if (updateData.slug) {
      updateData.slug = String(updateData.slug).toLowerCase().trim();
    }

    let categorySlug: string | undefined = undefined;
    if (updateData.categorySlug) {
      categorySlug = String(updateData.categorySlug).toLowerCase().trim();
    } else if (updateData.category) {
      categorySlug = String(updateData.category).toLowerCase().trim();
    }

    if (categorySlug) {
      updateData.categorySlug = categorySlug;
      if (mongoose.Types.ObjectId.isValid(categorySlug)) {
        const catById = await NewsCategory.findById(categorySlug);
        if (catById) {
          updateData.category = catById._id;
          updateData.categorySlug = catById.slug;
          if (!updateData.categoryName) updateData.categoryName = catById.title;
        } else {
          delete updateData.category;
        }
      } else {
        const catBySlug = await NewsCategory.findOne({ slug: categorySlug });
        if (catBySlug) {
          updateData.category = catBySlug._id;
          if (!updateData.categoryName) updateData.categoryName = catBySlug.title;
        } else {
          delete updateData.category;
        }
      }
    } else {
      delete updateData.category;
    }

    if (updateData.featuredImage && !updateData.image) {
      updateData.image = updateData.featuredImage;
    } else if (updateData.image && !updateData.featuredImage) {
      updateData.featuredImage = updateData.image;
    }

    const item = await News.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      updateData,
      { new: true, runValidators: true }
    );
    if (!item) {
      throw AppError.notFound(`News article "${slug}" not found.`);
    }

    await this.invalidateCache(item.categorySlug, item.slug);
    if (slug.toLowerCase() !== item.slug) {
      await this.invalidateCache(item.categorySlug, slug.toLowerCase());
    }
    return item;
  }

  async deleteNews(slug: string): Promise<void> {
    const item = await News.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!item) {
      throw AppError.notFound(`News article "${slug}" not found.`);
    }
    await this.invalidateCache(item.categorySlug, item.slug);
  }

  async reorderNews(orders: Array<{ slug: string; sortOrder: number }>): Promise<INews[]> {
    if (!orders || orders.length === 0) {
      throw AppError.badRequest('Orders list cannot be empty.');
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { slug: item.slug.toLowerCase() },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await News.bulkWrite(bulkOps);
    await this.invalidateCache();

    const updated = await News.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return updated as unknown as INews[];
  }

  private async invalidateCache(categorySlug?: string, slug?: string): Promise<void> {
    await Promise.all([
      cacheService.deleteByPattern(CACHE_PATTERNS.ALL_NEWS),
      categorySlug && slug
        ? cacheService.deleteCached(CACHE_KEYS.NEWS_DETAIL(categorySlug, slug))
        : Promise.resolve(),
      slug ? cacheService.deleteCached(`news:detail:direct:${slug}`) : Promise.resolve(),
      cacheService.deleteCached(CACHE_KEYS.NEWS_CATEGORIES),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
  }
}

export const newsService = new NewsService();
