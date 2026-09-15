import { Industry, IIndustry } from '../models/Industry.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../constants/cacheKeys.js';
import { AppError } from '../utils/appError.js';

export interface IndustryReorderItem {
  slug: string;
  sortOrder: number;
}

export class IndustryService {
  async getIndustries(publishedOnly: boolean = true): Promise<IIndustry[]> {
    const cacheKey = publishedOnly ? CACHE_KEYS.INDUSTRIES_LIST() : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<IIndustry[]>(cacheKey);
      if (cached) return cached;
    }

    const filter = publishedOnly ? { published: true } : {};
    const industries = await Industry.find(filter)
      .select('_id title slug shortDescription icon image sortOrder featured published')
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (cacheKey) {
      await cacheService.setCached(cacheKey, industries, CACHE_TTL.MEDIUM);
    }

    return industries as unknown as IIndustry[];
  }

  async getIndustryBySlug(slug: string, publishedOnly: boolean = true): Promise<IIndustry> {
    const cacheKey = publishedOnly ? CACHE_KEYS.INDUSTRY_DETAIL(slug) : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<IIndustry>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (publishedOnly) {
      filter.published = true;
    }

    const industry = await Industry.findOne(filter).lean();
    if (!industry) {
      throw AppError.notFound(`Industry "${slug}" not found.`);
    }

    if (cacheKey) {
      await cacheService.setCached(cacheKey, industry as unknown as IIndustry, CACHE_TTL.MEDIUM);
    }

    return industry as unknown as IIndustry;
  }

  async createIndustry(data: Partial<IIndustry>): Promise<IIndustry> {
    const existing = await Industry.findOne({ slug: data.slug?.toLowerCase().trim() });
    if (existing) {
      throw AppError.conflict(`An industry with slug "${data.slug}" already exists.`);
    }

    // Default sortOrder if not provided
    if (data.sortOrder === undefined || data.sortOrder === null) {
      const count = await Industry.countDocuments();
      data.sortOrder = count + 1;
    }

    const industry = await Industry.create(data);
    await this.invalidateCache(industry.slug);
    return industry;
  }

  async updateIndustry(slug: string, data: Partial<IIndustry>): Promise<IIndustry> {
    const targetSlug = slug.toLowerCase();
    
    // If slug is changing, ensure uniqueness
    if (data.slug && data.slug.toLowerCase() !== targetSlug) {
      const existing = await Industry.findOne({ slug: data.slug.toLowerCase().trim() });
      if (existing) {
        throw AppError.conflict(`An industry with slug "${data.slug}" already exists.`);
      }
    }

    const industry = await Industry.findOneAndUpdate(
      { slug: targetSlug },
      data,
      { new: true, runValidators: true }
    );
    if (!industry) {
      throw AppError.notFound(`Industry "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
    if (data.slug && data.slug.toLowerCase() !== targetSlug) {
      await this.invalidateCache(data.slug);
    }
    return industry;
  }

  async reorderIndustries(orders: IndustryReorderItem[]): Promise<IIndustry[]> {
    if (!orders || orders.length === 0) {
      throw AppError.badRequest('Orders array is required');
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { slug: item.slug.toLowerCase() },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await Industry.bulkWrite(bulkOps);
    await this.invalidateCache();
    return this.getIndustries(false);
  }

  async deleteIndustry(slug: string): Promise<void> {
    const industry = await Industry.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!industry) {
      throw AppError.notFound(`Industry "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
  }

  public async invalidateCache(slug?: string): Promise<void> {
    await Promise.all([
      cacheService.deleteByPattern(CACHE_PATTERNS.ALL_INDUSTRIES),
      slug ? cacheService.deleteCached(CACHE_KEYS.INDUSTRY_DETAIL(slug)) : Promise.resolve(),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
  }
}

export const industryService = new IndustryService();

