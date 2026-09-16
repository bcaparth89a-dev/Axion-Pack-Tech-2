import mongoose from 'mongoose';
import { Product, IProduct } from '../models/Product.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { Category } from '../models/Category.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { categoryService } from './category.service.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';
import { generateUniqueSlug } from '../utils/slugify.js';

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
   * Get single product by slug with all direct children (models, sub-products, sub-categories),
   * ancestry breadcrumbs, and full path.
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

    // Build universal breadcrumbs
    const breadcrumbs = await categoryService.buildEntityBreadcrumbs(product._id, 'product');
    const fullPath = breadcrumbs[breadcrumbs.length - 1]?.path || `/products/${product.slug}`;

    // Direct children queries: can be models, nested products, or nested categories
    const modelFilter: Record<string, unknown> = {
      $or: [{ productId: product._id }, { parentId: product._id }],
    };
    const childProdFilter: Record<string, unknown> = {
      parentId: product._id,
    };
    const childCatFilter: Record<string, unknown> = {
      parentId: product._id,
    };

    if (activeOnly) {
      modelFilter.isActive = true;
      childProdFilter.isActive = true;
      childCatFilter.isActive = true;
    }

    const [models, childProducts, childCategories] = await Promise.all([
      ProductModel.find(modelFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find(childProdFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      Category.find(childCatFilter).sort({ displayOrder: 1, name: 1 }).lean(),
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

    // Build unified directChildren array across models, products, and categories
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
      ...models.map((m) => ({
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
    ];

    directChildren.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));

    const result = {
      product,
      models,
      directChildren,
      breadcrumbs,
      fullPath,
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
    const uniqueSlug = await generateUniqueSlug(data.name || 'product', Product, null, data.slug);

    if (data.categoryId) {
      const catExists = await Category.findById(data.categoryId);
      if (!catExists) {
        throw AppError.badRequest('Specified category does not exist');
      }
    }

    const product = await Product.create({
      ...data,
      slug: uniqueSlug,
      categoryId: data.categoryId || (data.parentType === 'category' && data.parentId ? data.parentId : null),
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.categoryId || null),
      parentType: data.parentType || (data.categoryId ? 'category' : null),
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

    if (data.slug || (data.name && data.name !== product.name && !data.slug)) {
      data.slug = await generateUniqueSlug(data.name || product.name, Product, id, data.slug);
    }

    if (data.categoryId) {
      const catExists = await Category.findById(data.categoryId);
      if (!catExists) {
        throw AppError.badRequest('Specified category does not exist');
      }
    }

    if (data.parentId !== undefined) {
      data.categoryId = (data.parentType === 'category' && data.parentId ? data.parentId : null) as any;
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

  /**
   * Retrieves all published catalogs across Categories, Products, and Models.
   * Resolves hierarchy names (Category, Product, Model) and thumbnail imagery.
   */
  public async getAllCatalogs(): Promise<CatalogItemResponse[]> {
    const cacheKey = 'axion:public:all_catalogs';
    const cached = await cacheService.getCached<CatalogItemResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const [categories, products, models] = await Promise.all([
      Category.find({ isActive: true }).lean(),
      Product.find({ isActive: true }).lean(),
      ProductModel.find({ isActive: true }).lean(),
    ]);

    const catMap = new Map<string, any>();
    for (const c of categories) {
      catMap.set(c._id.toString(), c);
    }

    const prodMap = new Map<string, any>();
    for (const p of products) {
      prodMap.set(p._id.toString(), p);
    }

    const catalogs: CatalogItemResponse[] = [];

    // 1. Categories with catalogPdf
    for (const c of categories) {
      if (c.catalogPdf && c.catalogPdf.url && c.catalogPdf.url.trim()) {
        catalogs.push({
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          entityType: 'category',
          categoryName: c.name,
          categorySlug: c.slug,
          thumbnail: c.media?.image || c.media?.heroImage || c.galleryMedia?.[0]?.url || '/images/products/conveyor-default.jpg',
          shortDescription: c.shortDescription || c.description || 'Comprehensive industrial machinery and engineered conveyor equipment catalog.',
          catalogPdf: c.catalogPdf,
          displayOrder: c.displayOrder || 0,
        });
      }
    }

    // 2. Products with catalogPdf
    for (const p of products) {
      if (p.catalogPdf && p.catalogPdf.url && p.catalogPdf.url.trim()) {
        const parentCatId = p.categoryId?.toString() || (p.parentType === 'category' && p.parentId ? p.parentId.toString() : null);
        const parentCat = parentCatId ? catMap.get(parentCatId) : null;

        catalogs.push({
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          entityType: 'product',
          categoryName: parentCat?.name || undefined,
          categorySlug: parentCat?.slug || undefined,
          productName: p.name,
          productSlug: p.slug,
          thumbnail: p.media?.image || p.media?.heroImage || p.galleryMedia?.[0]?.url || parentCat?.media?.image || '/images/products/conveyor-default.jpg',
          shortDescription: p.shortDescription || p.description || 'Technical datasheet and engineered specifications brochure.',
          catalogPdf: p.catalogPdf,
          displayOrder: p.displayOrder || 0,
        });
      }
    }

    // 3. Models with catalogPdf
    for (const m of models) {
      if (m.catalogPdf && m.catalogPdf.url && m.catalogPdf.url.trim()) {
        const parentProdId = m.productId?.toString() || (m.parentType === 'product' && m.parentId ? m.parentId.toString() : null);
        const parentProd = parentProdId ? prodMap.get(parentProdId) : null;
        
        const parentCatId = parentProd?.categoryId?.toString() || (m.parentType === 'category' && m.parentId ? m.parentId.toString() : null);
        const parentCat = parentCatId ? catMap.get(parentCatId) : null;

        catalogs.push({
          id: m._id.toString(),
          name: m.name,
          slug: m.slug,
          entityType: 'model',
          modelNumber: (m as any).modelNumber || undefined,
          categoryName: parentCat?.name || undefined,
          categorySlug: parentCat?.slug || undefined,
          productName: parentProd?.name || undefined,
          productSlug: parentProd?.slug || undefined,
          thumbnail: (m as any).media?.image || (m as any).media?.heroImage || (m as any).galleryMedia?.[0]?.url || parentProd?.media?.image || '/images/products/conveyor-default.jpg',
          shortDescription: (m as any).shortDescription || (m as any).description || 'Certified model specifications, throughput rating, and mechanical dimensions.',
          catalogPdf: m.catalogPdf,
          displayOrder: (m as any).displayOrder || 0,
        });
      }
    }

    catalogs.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    await cacheService.setCached(cacheKey, catalogs, CACHE_TTL.LONG);
    return catalogs;
  }

  public async invalidateProductCache(): Promise<void> {
    try {
      await cacheService.invalidateAllCatalogCaches();
      await cacheService.deleteCached('axion:public:all_catalogs');
    } catch (err) {
      logger.warn('[ProductService] Cache invalidation warning:', err);
    }
  }
}

export interface CatalogItemResponse {
  id: string;
  name: string;
  slug: string;
  entityType: 'category' | 'product' | 'model';
  modelNumber?: string;
  categoryName?: string;
  productName?: string;
  categorySlug?: string;
  productSlug?: string;
  thumbnail: string;
  shortDescription?: string;
  description?: string;
  catalogPdf: {
    url: string;
    name?: string;
    size?: number;
    key?: string;
  };
  displayOrder: number;
}

export const productService = new ProductService();
