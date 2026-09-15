import { Service, IService } from '../models/Service.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../constants/cacheKeys.js';
import { AppError } from '../utils/appError.js';

export interface ServiceReorderItem {
  slug: string;
  sortOrder: number;
}

export class ServiceService {
  async getServices(publishedOnly: boolean = true): Promise<IService[]> {
    const cacheKey = publishedOnly ? CACHE_KEYS.SERVICES_LIST : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<IService[]>(cacheKey);
      if (cached) return cached;
    }

    const filter = publishedOnly ? { published: true } : {};
    const services = await Service.find(filter)
      .select('_id title slug shortDescription icon image sortOrder featured published')
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (cacheKey) {
      await cacheService.setCached(cacheKey, services, CACHE_TTL.LONG);
    }

    return services as unknown as IService[];
  }

  async getServiceBySlug(slug: string, publishedOnly: boolean = true): Promise<IService> {
    const cacheKey = publishedOnly ? CACHE_KEYS.SERVICE_DETAIL(slug) : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<IService>(cacheKey);
      if (cached) return cached;
    }

    const filter: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (publishedOnly) {
      filter.published = true;
    }

    const service = await Service.findOne(filter).lean();
    if (!service) {
      throw AppError.notFound(`Service "${slug}" not found.`);
    }

    if (cacheKey) {
      await cacheService.setCached(cacheKey, service as unknown as IService, CACHE_TTL.LONG);
    }

    return service as unknown as IService;
  }

  async createService(data: Partial<IService>): Promise<IService> {
    const existing = await Service.findOne({ slug: data.slug?.toLowerCase().trim() });
    if (existing) {
      throw AppError.conflict(`A service with slug "${data.slug}" already exists.`);
    }

    if (data.sortOrder === undefined || data.sortOrder === null) {
      const count = await Service.countDocuments();
      data.sortOrder = count + 1;
    }

    const service = await Service.create(data);
    await this.invalidateCache(service.slug);
    return service;
  }

  async updateService(slug: string, data: Partial<IService>): Promise<IService> {
    const targetSlug = slug.toLowerCase().trim();

    if (data.slug && data.slug.toLowerCase().trim() !== targetSlug) {
      const existing = await Service.findOne({ slug: data.slug.toLowerCase().trim() });
      if (existing) {
        throw AppError.conflict(`A service with slug "${data.slug}" already exists.`);
      }
    }

    const service = await Service.findOneAndUpdate(
      { slug: targetSlug },
      data,
      { new: true, runValidators: true }
    );
    if (!service) {
      throw AppError.notFound(`Service "${slug}" not found.`);
    }

    await this.invalidateCache(slug);
    if (data.slug && data.slug.toLowerCase().trim() !== targetSlug) {
      await this.invalidateCache(data.slug.toLowerCase().trim());
    }
    return service;
  }

  async reorderServices(orders: ServiceReorderItem[]): Promise<IService[]> {
    if (!orders || orders.length === 0) {
      throw AppError.badRequest('Orders array is required');
    }

    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { slug: item.slug.toLowerCase() },
        update: { $set: { sortOrder: item.sortOrder } },
      },
    }));

    await Service.bulkWrite(bulkOps);
    await this.invalidateCache();
    return this.getServices(false);
  }

  async deleteService(slug: string): Promise<void> {
    const service = await Service.findOneAndDelete({ slug: slug.toLowerCase() });
    if (!service) {
      throw AppError.notFound(`Service "${slug}" not found.`);
    }
    await this.invalidateCache(slug);
  }

  public async invalidateCache(slug?: string): Promise<void> {
    await Promise.all([
      cacheService.deleteByPattern(CACHE_PATTERNS.ALL_SERVICES),
      cacheService.deleteCached(CACHE_KEYS.SERVICES_LIST),
      slug ? cacheService.deleteCached(CACHE_KEYS.SERVICE_DETAIL(slug)) : Promise.resolve(),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
  }
}

export const serviceService = new ServiceService();

