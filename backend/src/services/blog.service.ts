import mongoose from 'mongoose';
import { Blog, IBlog } from '../models/Blog.model.js';
import { BlogCategory, IBlogCategory } from '../models/BlogCategory.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';

export interface BlogQueryParams {
  page?: string | number;
  limit?: string | number;
  category?: string;
  search?: string;
  featured?: string;
  publishedOnly?: boolean;
}

export class BlogService {
  async getCategories(): Promise<IBlogCategory[]> {
    const cached = await cacheService.getCached<IBlogCategory[]>(CACHE_KEYS.BLOG_CATEGORIES);
    if (cached) return cached;

    const categories = await BlogCategory.find().sort({ sortOrder: 1, title: 1 }).lean();
    await cacheService.setCached(CACHE_KEYS.BLOG_CATEGORIES, categories, CACHE_TTL.LONG);

    return categories as unknown as IBlogCategory[];
  }

  async createCategory(data: Partial<IBlogCategory>): Promise<IBlogCategory> {
    const slug = data.slug?.toLowerCase().trim();
    if (slug) {
      const existing = await BlogCategory.findOne({ slug });
      if (existing) {
        throw AppError.conflict(`Blog category with slug "${slug}" already exists.`);
      }
    }
    const category = await BlogCategory.create(data);
    await cacheService.deleteCached(CACHE_KEYS.BLOG_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
    return category;
  }

  async updateCategory(slug: string, data: Partial<IBlogCategory>): Promise<IBlogCategory> {
    const category = await BlogCategory.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      data,
      { new: true, runValidators: true }
    );
    if (!category) {
      throw AppError.notFound(`Blog category "${slug}" not found.`);
    }
    await cacheService.deleteCached(CACHE_KEYS.BLOG_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
    return category;
  }

  async deleteCategory(slug: string): Promise<void> {
    const category = await BlogCategory.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!category) {
      throw AppError.notFound(`Blog category "${slug}" not found.`);
    }
    await cacheService.deleteCached(CACHE_KEYS.BLOG_CATEGORIES);
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
  }

  async getBlogs(params: BlogQueryParams): Promise<PaginatedResponse<IBlog>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });
    const filter: Record<string, unknown> = {};

    if (params.publishedOnly !== false) {
      filter.published = true;
    }

    if (params.category && params.category !== 'all') {
      filter.categorySlug = params.category.toLowerCase().trim();
    }

    if (params.featured !== undefined && params.featured !== '') {
      filter.featured = params.featured === 'true';
    }

    if (params.search && params.search.trim()) {
      filter.$text = { $search: params.search.trim() };
    }

    const cacheKey = params.publishedOnly !== false
      ? CACHE_KEYS.BLOGS_LIST(`cat_${params.category || ''}_s_${params.search || ''}_f_${params.featured || ''}_p${page}_l${limit}`)
      : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<PaginatedResponse<IBlog>>(cacheKey);
      if (cached) return cached;
    }

    const sortOptions: Record<string, 1 | -1> = {
      sortOrder: 1,
      publishedAt: -1,
      createdAt: -1,
    };

    const [items, totalItems] = await Promise.all([
      Blog.find(filter)
        .select('title slug category categorySlug categoryName excerpt content introduction sections conclusion image featuredImage author authorRole readTime readingTime publishedDate tags published publishedAt featured sortOrder seo')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    const result = buildPaginatedResponse(items as unknown as IBlog[], totalItems, page, limit);

    if (cacheKey) {
      await cacheService.setCached(cacheKey, result, CACHE_TTL.SHORT);
    }

    return result;
  }

  async getBlogBySlug(slug: string, publishedOnly: boolean = true): Promise<IBlog> {
    const normalizedSlug = slug.toLowerCase().trim();
    const cacheKey = publishedOnly ? CACHE_KEYS.BLOG_DETAIL(normalizedSlug) : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<IBlog>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = {
      slug: normalizedSlug,
    };
    if (publishedOnly) {
      filter.published = true;
    }

    const blog = await Blog.findOne(filter).lean();
    if (!blog) {
      throw AppError.notFound(`Blog article "${normalizedSlug}" not found.`);
    }

    if (cacheKey) {
      await cacheService.setCached(cacheKey, blog as unknown as IBlog, CACHE_TTL.MEDIUM);
    }

    return blog as unknown as IBlog;
  }

  async createBlog(data: Partial<IBlog> & Record<string, unknown>): Promise<IBlog> {
    const slug = data.slug?.toLowerCase().trim();
    if (!slug) {
      throw AppError.badRequest('Blog slug is required.');
    }

    const existing = await Blog.findOne({ slug });
    if (existing) {
      throw AppError.conflict(`Blog article with slug "${slug}" already exists.`);
    }

    // Determine categorySlug
    let categorySlug = (data.categorySlug || data.category || 'packaging-technology')
      .toString()
      .toLowerCase()
      .trim();

    // Look up category if available
    let categoryId: mongoose.Types.ObjectId | undefined = undefined;
    let categoryName = typeof data.categoryName === 'string' ? data.categoryName.trim() : undefined;

    if (mongoose.Types.ObjectId.isValid(categorySlug)) {
      const catById = await BlogCategory.findById(categorySlug);
      if (catById) {
        categoryId = catById._id as mongoose.Types.ObjectId;
        categorySlug = catById.slug;
        categoryName = categoryName || catById.title;
      }
    } else {
      const catBySlug = await BlogCategory.findOne({ slug: categorySlug });
      if (catBySlug) {
        categoryId = catBySlug._id as mongoose.Types.ObjectId;
        categoryName = categoryName || catBySlug.title;
      }
    }

    const image = data.image || data.featuredImage || '/images/blog/blog-default.jpg';
    const featuredImage = data.featuredImage || data.image || '/images/blog/blog-default.jpg';
    const readingTime = data.readingTime || data.readTime || '5 min read';
    const readTime = data.readTime || data.readingTime || '5 min read';
    
    let publishedDate = typeof data.publishedDate === 'string' ? data.publishedDate.trim() : '';
    if (!publishedDate) {
      const dateToFormat = data.publishedAt ? new Date(data.publishedAt as string | number | Date) : new Date();
      publishedDate = dateToFormat.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    // Remove raw string category so Mongoose doesn't fail CastError
    const { category: _rawCat, ...cleanData } = data;

    const blog = await Blog.create({
      ...cleanData,
      slug,
      categorySlug,
      categoryName: categoryName || (categorySlug ? categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Packaging Technology'),
      category: categoryId,
      image,
      featuredImage,
      readingTime,
      readTime,
      publishedDate,
      published: data.published !== false,
      publishedAt: data.publishedAt || new Date(),
    });

    await this.invalidateCache(blog.slug);
    return blog;
  }

  async updateBlog(slug: string, data: Partial<IBlog> & Record<string, unknown>): Promise<IBlog> {
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
        const catById = await BlogCategory.findById(categorySlug);
        if (catById) {
          updateData.category = catById._id;
          updateData.categorySlug = catById.slug;
          if (!updateData.categoryName) updateData.categoryName = catById.title;
        } else {
          delete updateData.category;
        }
      } else {
        const catBySlug = await BlogCategory.findOne({ slug: categorySlug });
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
    if (updateData.readingTime && !updateData.readTime) {
      updateData.readTime = updateData.readingTime;
    } else if (updateData.readTime && !updateData.readingTime) {
      updateData.readingTime = updateData.readTime;
    }

    const blog = await Blog.findOneAndUpdate(
      { slug: slug.toLowerCase() },
      updateData,
      { new: true, runValidators: true }
    );
    if (!blog) {
      throw AppError.notFound(`Blog article "${slug}" not found.`);
    }

    await this.invalidateCache(slug);
    if (slug.toLowerCase() !== blog.slug) {
      await this.invalidateCache(blog.slug);
    }
    return blog;
  }

  async deleteBlog(slug: string): Promise<void> {
    const blog = await Blog.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!blog) {
      throw AppError.notFound(`Blog article "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
  }

  async reorderBlogs(orders: Array<{ slug: string; sortOrder: number }>): Promise<IBlog[]> {
    if (!orders || orders.length === 0) {
      throw AppError.badRequest('Orders list cannot be empty.');
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { slug: item.slug.toLowerCase() },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await Blog.bulkWrite(bulkOps);
    await this.invalidateCache();

    const updated = await Blog.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    return updated as unknown as IBlog[];
  }

  private async invalidateCache(slug?: string): Promise<void> {
    await Promise.all([
      cacheService.deleteByPattern(CACHE_PATTERNS.ALL_BLOGS),
      slug ? cacheService.deleteCached(CACHE_KEYS.BLOG_DETAIL(slug)) : Promise.resolve(),
      cacheService.deleteCached(CACHE_KEYS.BLOG_CATEGORIES),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
  }
}

export const blogService = new BlogService();
