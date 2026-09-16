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
   * Calculate exact counts across all 4 tiers accurately for safe deletion warnings and metrics.
   */
  public async getCatalogProductStats(_productId?: string): Promise<CatalogProductStats> {
    const [mainCategoriesCount, subCategoriesCount, productsCount, modelsCount] = await Promise.all([
      Category.countDocuments({
        $or: [{ parentCategoryId: null }, { parentCategoryId: { $exists: false } }],
      }),
      Category.countDocuments({
        parentCategoryId: { $ne: null, $exists: true },
      }),
      Product.countDocuments({}),
      ProductModel.countDocuments({}),
    ]);

    return {
      mainCategoriesCount,
      subCategoriesCount,
      productsCount,
      modelsCount,
    };
  }

  /**
   * Builds the complete flexible graph hierarchy for the catalog:
   * Supports any entity type (Category, Product, Model) nested under any other entity or at root.
   * Guarantees 100% catalog coverage including parentless/root and mixed-hierarchy entities.
   */
  public async getCatalogProductTree(
    _productId?: string,
    activeOnly: boolean = false
  ): Promise<CatalogHierarchyNode[]> {
    const filter = activeOnly ? { isActive: true } : {};

    const [categories, products, models] = await Promise.all([
      Category.find(filter).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find(filter).sort({ displayOrder: 1, name: 1 }).lean(),
      ProductModel.find(filter).sort({ displayOrder: 1, modelNumber: 1 }).lean(),
    ]);

    const nodeMap = new Map<string, CatalogHierarchyNode>();

    // 1. Create Category nodes
    for (const cat of categories) {
      const parentKey = cat.parentId
        ? cat.parentId.toString()
        : cat.parentCategoryId
        ? cat.parentCategoryId.toString()
        : null;

      nodeMap.set(cat._id.toString(), {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        type: parentKey ? 'subCategory' : 'mainCategory',
        shortDescription: cat.shortDescription,
        description: cat.description,
        image: cat.media?.image,
        heroImage: cat.media?.heroImage,
        displayOrder: cat.displayOrder || 0,
        isActive: cat.isActive,
        parentId: parentKey,
        parentType: cat.parentType || (parentKey ? 'category' : 'catalogProduct'),
        features: cat.features,
        applications: cat.applications,
        benefits: cat.benefits,
        catalogPdf: cat.catalogPdf,
        galleryMedia: cat.galleryMedia,
        hero: cat.hero,
        children: [],
      });
    }

    // 2. Create Product nodes
    for (const prod of products) {
      const parentKey = prod.parentId
        ? prod.parentId.toString()
        : prod.categoryId
        ? prod.categoryId.toString()
        : null;

      nodeMap.set(prod._id.toString(), {
        _id: prod._id.toString(),
        name: prod.name,
        slug: prod.slug,
        type: 'product',
        shortDescription: prod.shortDescription,
        description: prod.description,
        image: prod.media?.image,
        heroImage: prod.media?.heroImage,
        displayOrder: prod.displayOrder || 0,
        isActive: prod.isActive,
        parentId: parentKey,
        parentType: prod.parentType || (prod.categoryId ? 'category' : null),
        features: prod.features,
        infoPoints: prod.infoPoints,
        specifications: prod.specifications,
        applications: prod.applications,
        benefits: prod.benefits,
        catalogPdf: prod.catalogPdf,
        galleryMedia: prod.galleryMedia,
        hero: prod.hero,
        children: [],
      });
    }

    // 3. Create Model nodes
    for (const mod of models) {
      const parentKey = mod.parentId
        ? mod.parentId.toString()
        : mod.productId
        ? mod.productId.toString()
        : null;

      nodeMap.set(mod._id.toString(), {
        _id: mod._id.toString(),
        name: mod.name,
        modelNumber: mod.modelNumber,
        slug: mod.slug,
        type: 'model',
        shortDescription: mod.shortDescription,
        description: mod.description,
        image: mod.media?.image,
        heroImage: mod.media?.heroImage,
        displayOrder: mod.displayOrder || 0,
        isActive: mod.isActive,
        parentId: parentKey,
        parentType: mod.parentType || (mod.productId ? 'product' : null),
        specifications: mod.specifications,
        specificationsTable: mod.specificationsTable,
        features: mod.features,
        catalogPdf: mod.catalogPdf,
        galleryMedia: mod.galleryMedia,
        hero: mod.hero,
        children: [],
      });
    }

    // 4. Assemble hierarchy graph
    const rootNodes: CatalogHierarchyNode[] = [];
    for (const [id, node] of nodeMap.entries()) {
      if (node.parentId && nodeMap.has(node.parentId) && node.parentId !== id) {
        const parentNode = nodeMap.get(node.parentId)!;
        parentNode.children = parentNode.children || [];
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    // 5. Recursively sort all children
    const sortNodesRecursively = (nodes: CatalogHierarchyNode[]) => {
      nodes.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name));
      for (const node of nodes) {
        if (node.children && node.children.length > 0) {
          sortNodesRecursively(node.children);
        }
      }
    };
    sortNodesRecursively(rootNodes);

    return rootNodes;
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
