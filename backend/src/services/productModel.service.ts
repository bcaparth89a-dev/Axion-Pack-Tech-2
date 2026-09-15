import mongoose from 'mongoose';
import { ProductModel, IProductModel } from '../models/ProductModel.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { categoryService, BreadcrumbItem } from './category.service.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';

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

    const product = model.productId as unknown as {
      _id: mongoose.Types.ObjectId;
      name: string;
      slug: string;
      categoryId?: mongoose.Types.ObjectId;
      isActive?: boolean;
    };

    if (activeOnly && model.productId) {
      if (!product || product.isActive === false) {
        throw AppError.notFound(`Model with slug "${slug}" not found`);
      }
      if (product.categoryId) {
        const parentCat = await Category.findById(product.categoryId).select('_id isActive').lean();
        if (!parentCat || !parentCat.isActive) {
          throw AppError.notFound(`Model with slug "${slug}" not found`);
        }
      }
    }

    // Build breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Products', slug: '', path: '/products', type: 'root' },
    ];

    let currentPath = '/products';
    if (product && product.categoryId) {
      const ancestry = await categoryService.getCategoryAncestry(product.categoryId);
      for (const item of ancestry) {
        currentPath += `/${item.slug}`;
        breadcrumbs.push({
          name: item.name,
          slug: item.slug,
          path: currentPath,
          type: 'category',
        });
      }
    }

    if (product) {
      currentPath += `/${product.slug}`;
      breadcrumbs.push({
        name: product.name,
        slug: product.slug,
        path: currentPath,
        type: 'product',
      });
    }

    currentPath += `/${model.slug}`;
    breadcrumbs.push({
      name: `${model.name} (${model.modelNumber})`,
      slug: model.slug,
      path: currentPath,
      type: 'model',
    });

    const result = {
      model,
      product,
      breadcrumbs,
      fullPath: currentPath,
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
    const existing = await ProductModel.findOne({ slug: data.slug?.toLowerCase().trim() });
    if (existing) {
      throw AppError.badRequest(`Model with slug "${data.slug}" already exists`);
    }

    if (data.productId) {
      const productExists = await Product.findById(data.productId);
      if (!productExists) {
        throw AppError.badRequest('Parent Product does not exist');
      }
    }

    const model = await ProductModel.create({
      ...data,
      slug: data.slug?.toLowerCase().trim(),
      productId: data.productId || null,
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.productId || null),
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

    if (data.slug && data.slug.toLowerCase().trim() !== model.slug) {
      const existing = await ProductModel.findOne({
        slug: data.slug.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw AppError.badRequest(`Model with slug "${data.slug}" already exists`);
      }
      data.slug = data.slug.toLowerCase().trim();
    }

    if (data.productId) {
      const productExists = await Product.findById(data.productId);
      if (!productExists) {
        throw AppError.badRequest('Parent Product does not exist');
      }
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
