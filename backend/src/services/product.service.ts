import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { Category } from '../models/Category.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { categoryService, BreadcrumbItem } from './category.service.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';

export interface ProductListParams {
  categoryId?: string;
  isStandalone?: boolean;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  page?: number | string;
  limit?: number | string;
}

export class ProductService {
  /**
   * Retrieves products with filtering, search, and pagination.
   */
  public async getProducts(params: ProductListParams): Promise<PaginatedResponse<IProduct>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};

    if (params.isActive !== undefined) {
      filter.isActive = params.isActive;
    }

    if (params.isFeatured !== undefined) {
      filter.isFeatured = params.isFeatured;
    }

    if (params.isStandalone) {
      filter.categoryId = null;
    } else if (params.categoryId) {
      filter.categoryId = new mongoose.Types.ObjectId(params.categoryId);
    }

    if (params.search && params.search.trim()) {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
      ];
    }

    const cacheKey =
      !params.search && params.isActive !== false
        ? CACHE_KEYS.PRODUCTS_LIST(
            `${params.categoryId || 'all'}:${params.isStandalone ? 'standalone' : 'all'}:${params.isFeatured ? 'featured' : 'all'}:${page}:${limit}`
          )
        : null;

    if (cacheKey) {
      const cached = await cacheService.getCached<PaginatedResponse<IProduct>>(cacheKey);
      if (cached) return cached;
    }

    const [items, totalItems] = await Promise.all([
      Product.find(filter)
        .select('-description -specifications -features -applications -benefits')
        .populate('categoryId', 'name slug')
        .sort({ displayOrder: 1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Enrich with model count for admin convenience
    const productIds = items.map((p) => p._id);
    const modelCounts = await ProductModel.aggregate([
      { $match: { productId: { $in: productIds } } },
      { $group: { _id: '$productId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const mc of modelCounts) {
      countMap.set(mc._id.toString(), mc.count);
    }

    const enrichedItems = items.map((p) => ({
      ...p,
      modelCount: countMap.get(p._id.toString()) || 0,
    }));

    const response = buildPaginatedResponse(enrichedItems as unknown as IProduct[], totalItems, page, limit);

    if (cacheKey) {
      await cacheService.setCached(cacheKey, response, CACHE_TTL.MEDIUM);
    }

    return response;
  }

  /**
   * Get single product by slug with parent category ancestry breadcrumbs and child models.
   */
  public async getProductBySlug(slug: string, activeOnly: boolean = true) {
    const cacheKey = activeOnly
      ? CACHE_KEYS.PRODUCT_DETAIL(slug)
      : `${CACHE_KEYS.PRODUCT_DETAIL(slug)}:admin`;

    const cached = await cacheService.getCached<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const prodQuery: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (activeOnly) {
      prodQuery.isActive = true;
    }

    const product = await Product.findOne(prodQuery).populate('categoryId', 'name slug').lean();
    if (!product) {
      throw AppError.notFound(`Product with slug "${slug}" not found`);
    }

    if (activeOnly && product.categoryId) {
      const catId = (product.categoryId as { _id?: mongoose.Types.ObjectId })._id || product.categoryId;
      const parentCat = await Category.findById(catId).select('_id isActive').lean();
      if (!parentCat || !parentCat.isActive) {
        throw AppError.notFound(`Product with slug "${slug}" not found`);
      }
    }

    // Build breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Products', slug: '', path: '/products', type: 'root' },
    ];

    let currentPath = '/products';
    if (product.categoryId) {
      const ancestry = await categoryService.getCategoryAncestry(
        (product.categoryId as { _id: mongoose.Types.ObjectId })._id || product.categoryId
      );
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

    currentPath += `/${product.slug}`;
    breadcrumbs.push({
      name: product.name,
      slug: product.slug,
      path: currentPath,
      type: 'product',
    });

    // Fetch child models
    const modelFilter: Record<string, unknown> = { productId: product._id };
    if (activeOnly) {
      modelFilter.isActive = true;
    }

    const models = await ProductModel.find(modelFilter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const result = {
      product,
      models,
      breadcrumbs,
      fullPath: currentPath,
    };

    await cacheService.setCached(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  public async getProductById(id: string) {
    const product = await Product.findById(id).populate('categoryId', 'name slug').lean();
    if (!product) {
      throw AppError.notFound('Product not found');
    }
    const models = await ProductModel.find({ productId: id }).sort({ displayOrder: 1 }).lean();
    return { ...product, models };
  }

  public async getFeaturedProducts(limit: number = 8) {
    const cacheKey = `${CACHE_KEYS.PRODUCTS_FEATURED}:${limit}`;
    const cached = await cacheService.getCached<IProduct[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate('categoryId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .limit(limit)
      .lean();

    await cacheService.setCached(cacheKey, products, CACHE_TTL.MEDIUM);
    return products;
  }

  public async createProduct(data: Partial<IProduct>) {
    const existing = await Product.findOne({ slug: data.slug?.toLowerCase().trim() });
    if (existing) {
      throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
    }

    if (data.categoryId) {
      const catExists = await Category.findById(data.categoryId);
      if (!catExists) {
        throw AppError.badRequest('Specified category does not exist');
      }
    }

    const product = await Product.create({
      ...data,
      slug: data.slug?.toLowerCase().trim(),
      categoryId: data.categoryId || null,
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.categoryId || null),
    });

    await this.invalidateProductCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['products', 'products-featured', 'catalog-tree', `product-${product.slug}`]
    );
    return product;
  }

  public async updateProduct(id: string, data: Partial<IProduct>) {
    const product = await Product.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    if (data.slug && data.slug.toLowerCase().trim() !== product.slug) {
      const existing = await Product.findOne({
        slug: data.slug.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
      }
      data.slug = data.slug.toLowerCase().trim();
    }

    if (data.categoryId) {
      const catExists = await Category.findById(data.categoryId);
      if (!catExists) {
        throw AppError.badRequest('Specified category does not exist');
      }
    }

    Object.assign(product, data);
    await product.save();

    await this.invalidateProductCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['products', 'products-featured', 'catalog-tree', `product-${product.slug}`]
    );
    return product;
  }

  public async getProductHero(id: string) {
    const product = await Product.findById(id).select('hero name slug').lean();
    if (!product) throw AppError.notFound('Product not found');
    return product.hero;
  }

  public async updateProductHero(id: string, heroData: Partial<IEntityHero>) {
    const product = await Product.findById(id);
    if (!product) throw AppError.notFound('Product not found');
    product.hero = {
      ...((product.hero as any)?.toObject?.() || product.hero || {}),
      ...heroData,
    };
    product.markModified('hero');
    await product.save();
    await this.invalidateProductCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['products', 'products-featured', 'catalog-tree', `product-${product.slug}`]
    );
    return product.hero;
  }

  public async reorderProducts(orders: Array<{ id: string; displayOrder: number }>) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await Product.bulkWrite(bulkOps);
    await this.invalidateProductCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['products', 'products-featured', 'catalog-tree']
    );
    return { success: true, count: orders.length };
  }

  public async deleteProduct(id: string, cascade: boolean = false) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Product ID');
    }

    const product = await Product.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found');
    }

    const modelCount = await ProductModel.countDocuments({
      $or: [{ productId: id }, { parentId: id }],
    });

    if (modelCount > 0 && !cascade) {
      throw AppError.badRequest(
        `Cannot delete product: contains ${modelCount} model(s). Please delete models first or confirm cascade deletion.`
      );
    }

    // 1. Delete associated models
    await ProductModel.deleteMany({
      $or: [{ productId: id }, { parentId: id }],
    });

    // 2. Clean up Category references
    await Category.updateMany(
      { catalogProductId: id },
      { $set: { catalogProductId: null } }
    );

    // 3. Permanently delete from MongoDB
    await Product.findByIdAndDelete(id);

    // 4. Invalidate all product & catalog caches
    await this.invalidateProductCache();

    // 5. Trigger Next.js revalidation
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['products', 'products-featured', 'models', 'catalog-tree', 'categories', `product-${product.slug}`]
    );

    return { message: 'Product deleted successfully' };
  }

  public async invalidateProductCache(): Promise<void> {
    try {
      await cacheService.invalidateAllCatalogCaches();
    } catch (err) {
      logger.warn('[ProductService] Cache invalidation warning:', err);
    }
  }
}

export const productService = new ProductService();
