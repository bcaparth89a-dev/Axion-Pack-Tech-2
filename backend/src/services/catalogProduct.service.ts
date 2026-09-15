import mongoose from 'mongoose';
import { CatalogProduct, ICatalogProduct } from '../models/CatalogProduct.model.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { CategoryHero } from '../models/CategoryHero.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { cacheService } from '../cache/cache.service.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';

export interface CatalogProductStats {
  mainCategoriesCount: number;
  subCategoriesCount: number;
  productsCount: number;
  modelsCount: number;
}

export interface CatalogHierarchyNode {
  _id: string;
  name: string;
  slug: string;
  type: 'mainCategory' | 'subCategory' | 'product' | 'model';
  modelNumber?: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  heroImage?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: string | null;
  parentType?: string | null;
  children?: CatalogHierarchyNode[];
  specifications?: Array<{ key?: string; label?: string; value: string; group?: string }>;
  specificationsTable?: { columns: Array<{ key: string; label: string; value: string; order?: number }> };
  features?: string[];
  infoPoints?: string[];
  applications?: string[];
  benefits?: string[];
  documents?: string[];
  catalogPdf?: { url: string; name?: string; size?: number; key?: string };
  galleryMedia?: Array<{
    _id?: string;
    url: string;
    type: 'image' | 'video';
    posterUrl?: string;
    title?: string;
    caption?: string;
    altText?: string;
    order: number;
  }>;
  hero?: IEntityHero;
}

export class CatalogProductService {
  /**
   * Automatically initializes default top-level product if none exists,
   * migrating existing CategoryHero and associating orphan root categories.
   */
  public async ensureDefaultCatalogProduct(): Promise<ICatalogProduct> {
    let defaultProduct = await CatalogProduct.findOne({ isDefault: true });
    if (!defaultProduct) {
      defaultProduct = await CatalogProduct.findOne({ slug: 'industrial-machinery' });
    }

    if (!defaultProduct) {
      // Check if existing CategoryHero has data
      const existingHero = await CategoryHero.findOne({ page: 'main-categories' }).lean();

      defaultProduct = await CatalogProduct.create({
        name: 'Industrial Machinery',
        slug: 'industrial-machinery',
        shortDescription:
          'Explore our comprehensive range of high-throughput automated machinery, sanitary conveying systems, and flexible standalone packaging solutions.',
        description:
          'AXION PackTech provides industry-leading automation, packaging machinery, and hygienic conveyor systems engineered for optimal production uptime.',
        image:
          existingHero?.visual?.image ||
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        status: 'active',
        isDefault: true,
        displayOrder: 1,
        hero: {
          eyebrow: existingHero?.eyebrow || 'Industrial Machinery Catalog',
          title:
            existingHero?.title ||
            'Packaging & Material Handling Equipment Portfolio',
          description:
            existingHero?.description ||
            'Explore our comprehensive range of high-throughput automated machinery, sanitary conveying systems, and flexible standalone packaging solutions.',
          primaryButton: {
            text: existingHero?.primaryButton?.text || 'Explore Equipment',
            link: existingHero?.primaryButton?.link || '#categories',
          },
          secondaryButton: {
            enabled: existingHero?.secondaryButton?.enabled ?? true,
            text:
              existingHero?.secondaryButton?.text ||
              'Request Engineering Quote',
            link: existingHero?.secondaryButton?.link || '/contact',
          },
          background: {
            type: existingHero?.background?.type || 'gradient',
            image: existingHero?.background?.image || '',
            color: existingHero?.background?.color || '#061527',
            gradient:
              existingHero?.background?.gradient ||
              'linear-gradient(135deg, #051324 0%, #091D38 50%, #061527 100%)',
          },
          visual: {
            type: existingHero?.visual?.type || 'image',
            image:
              existingHero?.visual?.image ||
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
            video: existingHero?.visual?.video || '',
            videoPoster: existingHero?.visual?.videoPoster || '',
            altText:
              existingHero?.visual?.altText ||
              'AXION PackTech Advanced Machinery and Packaging Systems',
          },
        },
      });

      logger.info(
        `Created default CatalogProduct [${defaultProduct._id}] "${defaultProduct.name}"`
      );
    }

    // Attach any root categories lacking a catalogProductId to this default product
    await Category.updateMany(
      { parentCategoryId: null, catalogProductId: null },
      { $set: { catalogProductId: defaultProduct._id } }
    );

    return defaultProduct;
  }

  /**
   * List all top-level products with item counts.
   */
  public async listCatalogProducts(includeArchived: boolean = false) {
    await this.ensureDefaultCatalogProduct();

    const query: Record<string, unknown> = {};
    if (!includeArchived) {
      query.status = { $ne: 'archived' };
    }

    const products = await CatalogProduct.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    // Compute stats for each product in parallel
    const enhanced = await Promise.all(
      products.map(async (prod) => {
        const stats = await this.getCatalogProductStats(prod._id.toString());
        return {
          ...prod,
          stats,
        };
      })
    );

    return enhanced;
  }

  /**
   * Get single CatalogProduct by ID.
   */
  public async getCatalogProductById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Catalog Product ID');
    }

    const product = await CatalogProduct.findById(id).lean();
    if (!product) {
      throw AppError.notFound('Catalog Product not found');
    }

    const stats = await this.getCatalogProductStats(id);
    return { ...product, stats };
  }

  /**
   * Get CatalogProduct by slug.
   */
  public async getCatalogProductBySlug(slug: string) {
    let product = await CatalogProduct.findOne({ slug }).lean();
    if (!product) {
      // Fallback to default if slug is default or matches
      await this.ensureDefaultCatalogProduct();
      product = await CatalogProduct.findOne({ slug }).lean();
      if (!product) {
        throw AppError.notFound(`Catalog Product with slug "${slug}" not found`);
      }
    }

    return product;
  }

  /**
   * Calculate exact counts across the 4 child tiers for safe deletion warnings.
   */
  public async getCatalogProductStats(_productId?: string): Promise<CatalogProductStats> {
    // 1. Main Categories (direct root categories)
    const mainCategories = await Category.find(
      {
        parentCategoryId: null,
      },
      '_id'
    ).lean();

    const mainCategoryIds = mainCategories.map((c) => c._id);
    if (mainCategoryIds.length === 0) {
      return {
        mainCategoriesCount: 0,
        subCategoriesCount: 0,
        productsCount: 0,
        modelsCount: 0,
      };
    }

    // 2. Sub Categories (descendants of main categories)
    const allDescendantCategoryIds: mongoose.Types.ObjectId[] = [];
    let currentLevelIds = [...mainCategoryIds];

    while (currentLevelIds.length > 0) {
      const nextChildren = await Category.find(
        { parentCategoryId: { $in: currentLevelIds } },
        '_id'
      ).lean();
      if (nextChildren.length === 0) break;
      const nextIds = nextChildren.map((c) => c._id as mongoose.Types.ObjectId);
      allDescendantCategoryIds.push(...nextIds);
      currentLevelIds = nextIds;
    }

    // 3. Products in these categories
    const allRelevantCategoryIds = [
      ...mainCategoryIds,
      ...allDescendantCategoryIds,
    ];

    const products = await Product.find(
      { categoryId: { $in: allRelevantCategoryIds } },
      '_id'
    ).lean();
    const productIds = products.map((p) => p._id);

    // 4. Models for these products
    const modelsCount =
      productIds.length > 0
        ? await ProductModel.countDocuments({ productId: { $in: productIds } })
        : 0;

    return {
      mainCategoriesCount: mainCategoryIds.length,
      subCategoriesCount: allDescendantCategoryIds.length,
      productsCount: products.length,
      modelsCount,
    };
  }

  /**
   * Builds the complete nested 4-tier tree for a CatalogProduct:
   * Main Category -> Sub Category -> Product Item -> Model
   */
  public async getCatalogProductTree(
    productId: string,
    activeOnly: boolean = false
  ): Promise<CatalogHierarchyNode[]> {
    const categoryFilter: Record<string, unknown> = {
      parentCategoryId: null,
    };
    if (activeOnly) categoryFilter.isActive = true;

    // Track all included entity IDs to guarantee zero orphaned/ghost entities
    const includedCategoryIds = new Set<string>();
    const includedProductIds = new Set<string>();
    const includedModelIds = new Set<string>();

    // Fetch all main categories
    const mainCategories = await Category.find(categoryFilter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Helper to map model docs to nodes
    const mapModelDocToNode = (m: any, parentNodeId: string | null = null): CatalogHierarchyNode => {
      includedModelIds.add(m._id.toString());
      return {
        _id: m._id.toString(),
        name: m.name,
        modelNumber: m.modelNumber,
        slug: m.slug,
        type: 'model',
        shortDescription: m.shortDescription,
        description: m.description,
        image: m.media?.image,
        heroImage: m.media?.heroImage,
        displayOrder: m.displayOrder,
        isActive: m.isActive,
        parentId: m.parentId ? m.parentId.toString() : m.productId ? m.productId.toString() : parentNodeId,
        parentType: m.parentType || (m.productId || parentNodeId ? 'product' : null),
        specifications: m.specifications,
        specificationsTable: m.specificationsTable,
        features: m.features,
        catalogPdf: m.catalogPdf,
        galleryMedia: m.galleryMedia,
        hero: m.hero,
      };
    };

    // Helper to map product docs to nodes with their child models
    const mapProductDocToNode = async (
      prod: any,
      parentCatId: string | null = null
    ): Promise<CatalogHierarchyNode> => {
      includedProductIds.add(prod._id.toString());

      const modelFilter: Record<string, unknown> = {
        $or: [{ productId: prod._id }, { parentId: prod._id }],
      };
      if (activeOnly) modelFilter.isActive = true;
      const modelDocs = await ProductModel.find(modelFilter)
        .sort({ displayOrder: 1, modelNumber: 1 })
        .lean();

      const modelNodes: CatalogHierarchyNode[] = modelDocs.map((m: any) =>
        mapModelDocToNode(m, prod._id.toString())
      );

      return {
        _id: prod._id.toString(),
        name: prod.name,
        slug: prod.slug,
        type: 'product',
        shortDescription: prod.shortDescription,
        description: prod.description,
        image: prod.media?.image,
        heroImage: prod.media?.heroImage,
        displayOrder: prod.displayOrder,
        isActive: prod.isActive,
        parentId: prod.parentId
          ? prod.parentId.toString()
          : prod.categoryId
          ? prod.categoryId.toString()
          : parentCatId,
        parentType: prod.parentType || (prod.categoryId || parentCatId ? 'category' : null),
        features: prod.features,
        infoPoints: prod.infoPoints,
        specifications: prod.specifications,
        applications: prod.applications,
        benefits: prod.benefits,
        catalogPdf: prod.catalogPdf,
        galleryMedia: prod.galleryMedia,
        hero: prod.hero,
        children: modelNodes,
      };
    };

    // Helper to recursively build category tree
    const buildCategorySubtree = async (
      catDoc: any,
      isRoot: boolean
    ): Promise<CatalogHierarchyNode> => {
      const catId = catDoc._id;
      includedCategoryIds.add(catId.toString());

      // 1. Fetch child categories
      const subCatFilter: Record<string, unknown> = {
        $or: [{ parentCategoryId: catId }, { parentId: catId }],
      };
      if (activeOnly) subCatFilter.isActive = true;
      const subCategories = await Category.find(subCatFilter)
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      // 2. Fetch direct product items for this category
      const productFilter: Record<string, unknown> = {
        $or: [{ categoryId: catId }, { parentId: catId }],
      };
      if (activeOnly) productFilter.isActive = true;
      const productDocs = await Product.find(productFilter)
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      // 3. For each product item, fetch its models
      const productNodes: CatalogHierarchyNode[] = await Promise.all(
        productDocs.map(async (prod) => mapProductDocToNode(prod, catId.toString()))
      );

      // Recursively build subcategories
      const subCatNodes = await Promise.all(
        subCategories.map((sc) => buildCategorySubtree(sc, false))
      );

      return {
        _id: catId.toString(),
        name: catDoc.name,
        slug: catDoc.slug,
        type: isRoot ? 'mainCategory' : 'subCategory',
        shortDescription: catDoc.shortDescription,
        description: catDoc.description,
        image: catDoc.media?.image,
        heroImage: catDoc.media?.heroImage,
        displayOrder: catDoc.displayOrder,
        isActive: catDoc.isActive,
        parentId: catDoc.parentId
          ? catDoc.parentId.toString()
          : catDoc.parentCategoryId
          ? catDoc.parentCategoryId.toString()
          : productId,
        parentType: catDoc.parentType || (isRoot ? 'catalogProduct' : 'category'),
        features: catDoc.features,
        applications: catDoc.applications,
        benefits: catDoc.benefits,
        catalogPdf: catDoc.catalogPdf,
        galleryMedia: catDoc.galleryMedia,
        hero: catDoc.hero,
        children: [...subCatNodes, ...productNodes],
      };
    };

    const categoryTree = await Promise.all(
      mainCategories.map((mc) => buildCategorySubtree(mc, true))
    );

    // 4. Retrieve ALL products not already nested in the category tree (root or orphan products)
    const unnestedProductFilter: Record<string, unknown> = {
      _id: { $nin: Array.from(includedProductIds).map((id) => new mongoose.Types.ObjectId(id)) },
    };
    if (activeOnly) unnestedProductFilter.isActive = true;
    const unnestedProducts = await Product.find(unnestedProductFilter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const rootProductNodes = await Promise.all(
      unnestedProducts.map((prod) => mapProductDocToNode(prod, null))
    );

    // 5. Retrieve ALL models not already nested under products (root or orphan models)
    const unnestedModelFilter: Record<string, unknown> = {
      _id: { $nin: Array.from(includedModelIds).map((id) => new mongoose.Types.ObjectId(id)) },
    };
    if (activeOnly) unnestedModelFilter.isActive = true;
    const unnestedModels = await ProductModel.find(unnestedModelFilter)
      .sort({ displayOrder: 1, modelNumber: 1 })
      .lean();

    const rootModelNodes = unnestedModels.map((m) => mapModelDocToNode(m, null));

    return [...categoryTree, ...rootProductNodes, ...rootModelNodes];
  }

  /**
   * Create a new top-level CatalogProduct.
   */
  public async createCatalogProduct(data: Partial<ICatalogProduct>) {
    if (!data.name || !data.slug) {
      throw AppError.badRequest('Name and Slug are required');
    }

    const existing = await CatalogProduct.findOne({ slug: data.slug });
    if (existing) {
      throw AppError.badRequest(`Product with slug "${data.slug}" already exists`);
    }

    const maxOrder = await CatalogProduct.findOne()
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean();
    const displayOrder = (maxOrder?.displayOrder ?? 0) + 1;

    const created = await CatalogProduct.create({
      ...data,
      displayOrder: data.displayOrder ?? displayOrder,
    });

    await cacheService.deleteByPattern('catalog:*');
    return created;
  }

  /**
   * Update top-level CatalogProduct.
   */
  public async updateCatalogProduct(id: string, data: Partial<ICatalogProduct>) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Catalog Product ID');
    }

    if (data.slug) {
      const existing = await CatalogProduct.findOne({
        slug: data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        throw AppError.badRequest(`Slug "${data.slug}" is already in use`);
      }
    }

    const updated = await CatalogProduct.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw AppError.notFound('Catalog Product not found');
    }

    await cacheService.deleteByPattern('catalog:*');
    await cacheService.deleteByPattern('category:*');
    return updated;
  }

  /**
   * Duplicate top-level CatalogProduct and its child hierarchy.
   */
  public async duplicateCatalogProduct(id: string) {
    const original = await this.getCatalogProductById(id);
    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;

    const duplicatedProduct = await CatalogProduct.create({
      name: `${original.name} (Copy)`,
      slug: newSlug,
      shortDescription: original.shortDescription,
      description: original.description,
      image: original.image,
      status: 'draft',
      hero: original.hero,
      isDefault: false,
      displayOrder: original.displayOrder + 1,
    });

    await cacheService.deleteByPattern('catalog:*');
    return duplicatedProduct;
  }

  /**
   * Reorder top-level products.
   */
  public async reorderCatalogProducts(
    orders: Array<{ id: string; displayOrder: number }>
  ) {
    if (!Array.isArray(orders)) {
      throw AppError.badRequest('Orders array is required');
    }

    const bulkOps = orders.map(({ id, displayOrder }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: { $set: { displayOrder } },
      },
    }));

    await CatalogProduct.bulkWrite(bulkOps);
    await cacheService.deleteByPattern('catalog:*');
    return { message: 'Order updated successfully' };
  }

  /**
   * Delete or archive CatalogProduct.
   */
  public async deleteCatalogProduct(id: string, force: boolean = false) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Catalog Product ID');
    }

    const product = await CatalogProduct.findById(id);
    if (!product) {
      throw AppError.notFound('Catalog Product not found');
    }

    if (product.isDefault && !force) {
      throw AppError.badRequest('The default Catalog Product cannot be deleted');
    }

    if (!force) {
      // Soft-delete / Archive
      product.status = 'archived';
      await product.save();
      await cacheService.deleteByPattern('catalog:*');
      return { message: 'Catalog Product archived successfully' };
    }

    // Force hard delete
    await CatalogProduct.findByIdAndDelete(id);
    await cacheService.deleteByPattern('catalog:*');
    await cacheService.deleteByPattern('category:*');
    await cacheService.deleteByPattern('axion:public:*');
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree', 'products', 'models']
    );
    return { message: 'Catalog Product deleted successfully' };
  }
}

export const catalogProductService = new CatalogProductService();
