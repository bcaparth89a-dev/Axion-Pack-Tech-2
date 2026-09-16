import mongoose from 'mongoose';
import { ProductModel, IProductModel } from '../models/ProductModel.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { categoryService } from './category.service.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';
import { generateUniqueSlug } from '../utils/slugify.js';

export interface ModelListParams {
  productId?: string;
  search?: string;
  isActive?: boolean;
  page?: number | string;
  limit?: number | string;
}

export class ProductModelService {
  public async getModels(params: ModelListParams): Promise<PaginatedResponse<IProductModel>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};

    if (params.isActive !== undefined) {
      filter.isActive = params.isActive;
    }

    if (params.productId) {
      filter.productId = new mongoose.Types.ObjectId(params.productId);
    }

    if (params.search && params.search.trim()) {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { modelNumber: searchRegex },
        { shortDescription: searchRegex },
      ];
    }

    const cacheKey =
      !params.search && params.isActive !== false
        ? CACHE_KEYS.MODELS_LIST(`${params.productId || 'all'}:${page}:${limit}`)
        : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<PaginatedResponse<IProductModel>>(cacheKey);
      if (cached) return cached;
    }

    const [items, totalItems] = await Promise.all([
      ProductModel.find(filter)
        .select('-description -specifications -features')
        .populate('productId', 'name slug categoryId')
        .sort({ displayOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const response = buildPaginatedResponse(items as unknown as IProductModel[], totalItems, page, limit);

    if (cacheKey) {
      await cacheService.setCached(cacheKey, response, CACHE_TTL.MEDIUM);
    }

    return response;
  }

  public async getModelBySlug(slug: string, activeOnly: boolean = true) {
    const cacheKey = activeOnly
      ? CACHE_KEYS.MODEL_DETAIL(slug)
      : `${CACHE_KEYS.MODEL_DETAIL(slug)}:admin`;

    const cached = await cacheService.getCached<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const query: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (activeOnly) {
      query.isActive = true;
    }

    const model = await ProductModel.findOne(query).populate('productId').lean();
    if (!model) {
      throw AppError.notFound(`Model with slug "${slug}" not found`);
    }

    let product = model.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      categoryId?: mongoose.Types.ObjectId;
      isActive?: boolean;
      media?: any;
      shortDescription?: string;
      description?: string;
      catalogPdf?: any;
    };

    if (!product && model.parentId && model.parentType === 'product') {
      product = (await Product.findById(model.parentId).lean()) as any;
    }

    // Build universal breadcrumbs
    const breadcrumbs = await categoryService.buildEntityBreadcrumbs(model._id, 'model');
    const fullPath = breadcrumbs[breadcrumbs.length - 1]?.path || `/products/${model.slug}`;

    // Direct children queries: models can have categories, products, or models under them!
    const childCatFilter: Record<string, unknown> = { parentId: model._id };
    const childProdFilter: Record<string, unknown> = { parentId: model._id };
    const childModelFilter: Record<string, unknown> = { parentId: model._id };

    if (activeOnly) {
      childCatFilter.isActive = true;
      childProdFilter.isActive = true;
      childModelFilter.isActive = true;
    }

    const [childCategories, childProducts, childModels] = await Promise.all([
      Category.find(childCatFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find(childProdFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      ProductModel.find(childModelFilter).sort({ displayOrder: 1, name: 1 }).lean(),
    ]);

    // Count models for child products
    const childProductIds = childProducts.map((p) => p._id);
    const childModelCounts = await ProductModel.aggregate([
      { $match: { productId: { $in: childProductIds } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const mc of childModelCounts) {
      countMap.set(mc._id.toString(), mc.count);
    }

    const directChildren: Array<{
      _id: string;
      name: string;
      slug: string;
      type: 'category' | 'product' | 'model';
      modelNumber?: string;
      shortDescription?: string;
      description?: string;
      media?: any;
      displayOrder: number;
      isActive: boolean;
      modelCount?: number;
      isFeatured?: boolean;
    }> = [
      ...childCategories.map((c) => ({
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        type: 'category' as const,
        shortDescription: c.shortDescription,
        description: c.description,
        media: c.media,
        displayOrder: c.displayOrder || 0,
        isActive: c.isActive,
      })),
      ...childProducts.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        type: 'product' as const,
        shortDescription: p.shortDescription,
        description: p.description,
        media: p.media,
        displayOrder: p.displayOrder || 0,
        isActive: p.isActive,
        modelCount: countMap.get(p._id.toString()) || 0,
        isFeatured: p.isFeatured || false,
      })),
      ...childModels.map((m) => ({
        _id: m._id.toString(),
        name: m.name,
        slug: m.slug,
        type: 'model' as const,
        modelNumber: m.modelNumber,
        shortDescription: m.shortDescription,
        description: m.description,
        media: m.media,
        displayOrder: m.displayOrder || 0,
        isActive: m.isActive,
      })),
    ];

    directChildren.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

    const result = {
      model,
      product: product || { _id: model._id, name: model.name, slug: model.slug },
      directChildren,
      breadcrumbs,
      fullPath,
    };

    await cacheService.setCached(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  public async getModelById(id: string) {
    const model = await ProductModel.findById(id).populate('productId').lean();
    if (!model) {
      throw AppError.notFound('Model not found');
    }
    return model;
  }

  public async createModel(data: Partial<IProductModel>) {
    const uniqueSlug = await generateUniqueSlug(
      data.name || data.modelNumber || 'model',
      ProductModel,
      null,
      data.slug
    );

    if (data.productId) {
      const productExists = await Product.findById(data.productId);
      if (!productExists) {
        throw AppError.badRequest('Parent Product does not exist');
      }
    }

    const model = await ProductModel.create({
      ...data,
      slug: uniqueSlug,
      productId: data.productId || (data.parentType === 'product' && data.parentId ? data.parentId : null),
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.productId || null),
      parentType: data.parentType || (data.productId ? 'product' : null),
    });

    await this.invalidateModelCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['models', 'products', 'catalog-tree', `model-${model.slug}`]
    );
    return model;
  }

  public async updateModel(id: string, data: Partial<IProductModel>) {
    const model = await ProductModel.findById(id);
    if (!model) {
      throw AppError.notFound('Model not found');
    }

    if (data.slug || (data.name && data.name !== model.name && !data.slug)) {
      data.slug = await generateUniqueSlug(
        data.name || data.modelNumber || model.name,
        ProductModel,
        id,
        data.slug
      );
    }

    if (data.productId) {
      const productExists = await Product.findById(data.productId);
      if (!productExists) {
        throw AppError.badRequest('Parent Product does not exist');
      }
    }

    if (data.parentId !== undefined) {
      data.productId = (data.parentType === 'product' && data.parentId ? data.parentId : null) as any;
    }

    Object.assign(model, data);
    await model.save();

    await this.invalidateModelCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['models', 'products', 'catalog-tree', `model-${model.slug}`]
    );
    return model;
  }

  public async getModelHero(id: string) {
    const model = await ProductModel.findById(id).select('hero name modelNumber slug').lean();
    if (!model) throw AppError.notFound('Model not found');
    return model.hero;
  }

  public async updateModelHero(id: string, heroData: Partial<IEntityHero>) {
    const model = await ProductModel.findById(id);
    if (!model) throw AppError.notFound('Model not found');
    model.hero = {
      ...((model.hero as any)?.toObject?.() || model.hero || {}),
      ...heroData,
    };
    model.markModified('hero');
    await model.save();
    await this.invalidateModelCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['models', 'products', 'catalog-tree', `model-${model.slug}`]
    );
    return model.hero;
  }

  public async reorderModels(orders: Array<{ id: string; displayOrder: number }>) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await ProductModel.bulkWrite(bulkOps);
    await this.invalidateModelCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['models', 'products', 'catalog-tree']
    );
    return { success: true, count: orders.length };
  }

  public async deleteModel(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Model ID');
    }

    const model = await ProductModel.findById(id);
    if (!model) {
      throw AppError.notFound('Model not found');
    }

    // 1. Remove references from parent products if present
    await Product.updateMany(
      { models: id },
      { $pull: { models: id } }
    );

    // 2. Permanently delete from MongoDB
    await ProductModel.findByIdAndDelete(id);

    // 3. Invalidate caches
    await this.invalidateModelCache();

    // 4. Trigger Next.js revalidation
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['models', 'products', 'catalog-tree', `model-${model.slug}`]
    );

    return { message: 'Model deleted successfully' };
  }

  public async invalidateModelCache(): Promise<void> {
    try {
      await cacheService.invalidateAllCatalogCaches();
    } catch (err) {
      logger.warn('[ProductModelService] Cache invalidation warning:', err);
    }
  }
}

export const productModelService = new ProductModelService();
