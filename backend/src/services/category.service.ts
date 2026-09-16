import mongoose from 'mongoose';
import { Category, ICategory } from '../models/Category.model.js';
import { IEntityHero } from '../models/Hero.schema.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { CategoryHero } from '../models/CategoryHero.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';
import { generateUniqueSlug } from '../utils/slugify.js';

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  type?: 'category' | 'product' | 'model';
  catalogProductId?: string | null;
  parentCategoryId?: string | null;
  parentId?: string | null;
  parentType?: string | null;
  shortDescription?: string;
  description?: string;
  media: {
    image?: string;
    heroImage?: string;
    videoUrl?: string;
    gallery?: string[];
  };
  features: string[];
  applications: string[];
  benefits: string[];
  displayOrder: number;
  isActive: boolean;
  children: CategoryTreeNode[];
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    media: {
      image?: string;
      heroImage?: string;
    };
    displayOrder: number;
    modelCount?: number;
    models?: Array<{
      _id: string;
      name: string;
      slug: string;
      modelNumber?: string;
      shortDescription?: string;
      media?: {
        image?: string;
        heroImage?: string;
      };
      displayOrder?: number;
    }>;
  }>;
  modelCount?: number;
  models?: Array<{
    _id: string;
    name: string;
    slug: string;
    modelNumber?: string;
    shortDescription?: string;
    media?: {
      image?: string;
      heroImage?: string;
    };
    displayOrder?: number;
  }>;
}

export interface BreadcrumbItem {
  name: string;
  slug: string;
  path: string;
  type: 'root' | 'category' | 'product' | 'model';
}

export class CategoryService {
  /**
   * Retrieves lightweight category tier for navigation on demand.
   * If parentCategoryId is null or omitted, returns root categories.
   * If parentCategoryId is specified, returns direct child categories.
   * Cached in Redis for maximum performance.
   */
  public async getNavigationHierarchy(
    parentCategoryId: string | null = null,
    activeOnly: boolean = true
  ) {
    const parentKey = parentCategoryId || 'root';
    const cacheKey = activeOnly
      ? CACHE_KEYS.CATEGORY_NAV(parentKey)
      : `${CACHE_KEYS.CATEGORY_NAV(parentKey)}:all`;

    const cached = await cacheService.getCached<unknown[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const filter: Record<string, unknown> = {
      parentCategoryId: parentCategoryId ? new mongoose.Types.ObjectId(parentCategoryId) : null,
    };
    if (activeOnly) {
      filter.isActive = true;
    }

    const categories = await Category.find(filter)
      .select('_id name slug parentCategoryId shortDescription media displayOrder isActive')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const categoryIds = categories.map((c) => c._id);

    // Get subcategory count and product count for each category
    const [childCounts, productCounts] = await Promise.all([
      Category.aggregate([
        { $match: { parentCategoryId: { $in: categoryIds }, ...(activeOnly ? { isActive: true } : {}) } },
        { $group: { _id: '$parentCategoryId', count: { $sum: 1 } } },
      ]),
      Product.aggregate([
        { $match: { categoryId: { $in: categoryIds }, ...(activeOnly ? { isActive: true } : {}) } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      ]),
    ]);

    const childMap = new Map<string, number>();
    for (const item of childCounts) {
      if (item._id) childMap.set(item._id.toString(), item.count);
    }

    const productMap = new Map<string, number>();
    for (const item of productCounts) {
      if (item._id) productMap.set(item._id.toString(), item.count);
    }

    const result = categories.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      parentCategoryId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
      shortDescription: cat.shortDescription || '',
      media: {
        image: cat.media?.image || '',
        heroImage: cat.media?.heroImage || '',
      },
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
      childCount: childMap.get(cat._id.toString()) || 0,
      productCount: productMap.get(cat._id.toString()) || 0,
    }));

    await cacheService.setCached(cacheKey, result, CACHE_TTL.LONG);
    return result;
  }

  /**
   * Builds full multi-tier catalog tree with categories, subcategories, products, and models.
   * Dynamically includes root categories, nested products, and parentless products/models.
   * Cached for maximum performance.
   */
  public async getCategoryTree(activeOnly: boolean = true): Promise<CategoryTreeNode[]> {
    const cacheKey = activeOnly
      ? CACHE_KEYS.CATEGORY_TREE
      : `${CACHE_KEYS.CATEGORY_TREE}:all`;

    const cached = await cacheService.getCached<CategoryTreeNode[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const catFilter = activeOnly ? { isActive: true } : {};
    const prodFilter = activeOnly ? { isActive: true } : {};

    const [categories, products, models] = await Promise.all([
      Category.find(catFilter)
        .select('_id name slug parentCategoryId shortDescription description media features applications benefits displayOrder isActive')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      Product.find(prodFilter)
        .select('_id name slug categoryId parentId parentType shortDescription description media features applications benefits displayOrder isActive')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      ProductModel.find(activeOnly ? { isActive: true } : {})
        .select('_id productId parentId parentType name slug modelNumber shortDescription description media displayOrder isActive')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
    ]);

    // Group models and model counts by productId
    const modelCountsByProduct = new Map<string, number>();
    const modelsByProduct = new Map<
      string,
      Array<{
        _id: string;
        name: string;
        slug: string;
        modelNumber?: string;
        shortDescription?: string;
        media?: { image?: string; heroImage?: string };
        displayOrder?: number;
      }>
    >();

    for (const m of models) {
      const pid =
        m.productId?.toString() ||
        (m.parentType === 'product' && m.parentId ? m.parentId.toString() : null);
      if (pid) {
        modelCountsByProduct.set(pid, (modelCountsByProduct.get(pid) || 0) + 1);
        if (!modelsByProduct.has(pid)) {
          modelsByProduct.set(pid, []);
        }
        modelsByProduct.get(pid)!.push({
          _id: m._id.toString(),
          name: m.name,
          slug: m.slug,
          modelNumber: (m as any).modelNumber,
          shortDescription: (m as any).shortDescription,
          media: (m as any).media || {},
          displayOrder: (m as any).displayOrder || 0,
        });
      }
    }

    // Map categories into nodes
    const nodeMap = new Map<string, CategoryTreeNode>();
    for (const cat of categories) {
      nodeMap.set(cat._id.toString(), {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        type: 'category',
        parentCategoryId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
        parentId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
        parentType: 'category',
        shortDescription: cat.shortDescription,
        description: cat.description,
        media: cat.media || {},
        features: cat.features || [],
        applications: cat.applications || [],
        benefits: cat.benefits || [],
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
        children: [],
        products: [],
      });
    }

    // Assign products to categories or collect standalone/parentless products
    const rootProducts: CategoryTreeNode[] = [];
    for (const prod of products) {
      const prodCategoryKey = prod.categoryId
        ? prod.categoryId.toString()
        : prod.parentType === 'category' && prod.parentId
        ? prod.parentId.toString()
        : null;

      const parentCategory = prodCategoryKey ? nodeMap.get(prodCategoryKey) : null;
      if (parentCategory) {
        parentCategory.products.push({
          _id: prod._id.toString(),
          name: prod.name,
          slug: prod.slug,
          shortDescription: prod.shortDescription,
          media: prod.media || {},
          displayOrder: prod.displayOrder,
          modelCount: modelCountsByProduct.get(prod._id.toString()) || 0,
          models: modelsByProduct.get(prod._id.toString()) || [],
        });
      } else {
        // Standalone / Parentless Product at root level
        rootProducts.push({
          _id: prod._id.toString(),
          name: prod.name,
          slug: prod.slug,
          type: 'product',
          parentCategoryId: null,
          parentId: null,
          parentType: null,
          shortDescription: prod.shortDescription,
          description: prod.description,
          media: prod.media || {},
          features: prod.features || [],
          applications: prod.applications || [],
          benefits: prod.benefits || [],
          displayOrder: prod.displayOrder,
          isActive: prod.isActive,
          children: [],
          products: [],
          models: modelsByProduct.get(prod._id.toString()) || [],
          modelCount: modelCountsByProduct.get(prod._id.toString()) || 0,
        });
      }
    }

    // Assemble hierarchical tree
    const rootNodes: CategoryTreeNode[] = [];
    for (const cat of categories) {
      const node = nodeMap.get(cat._id.toString());
      if (!node) continue;

      if (cat.parentCategoryId && nodeMap.has(cat.parentCategoryId.toString())) {
        const parent = nodeMap.get(cat.parentCategoryId.toString());
        parent?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    // Append standalone root products to rootNodes
    rootNodes.push(...rootProducts);

    // Check for parentless models (models not attached to any product)
    const assignedModelIds = new Set<string>();
    for (const [_, pModels] of modelsByProduct.entries()) {
      for (const m of pModels) {
        assignedModelIds.add(m._id);
      }
    }

    for (const m of models) {
      if (!assignedModelIds.has(m._id.toString())) {
        rootNodes.push({
          _id: m._id.toString(),
          name: m.name,
          slug: m.slug,
          type: 'model',
          parentCategoryId: null,
          parentId: null,
          parentType: null,
          shortDescription: (m as any).shortDescription,
          description: (m as any).description,
          media: (m as any).media || {},
          features: [],
          applications: [],
          benefits: [],
          displayOrder: (m as any).displayOrder || 0,
          isActive: m.isActive,
          children: [],
          products: [],
          models: [],
          modelCount: 0,
        });
      }
    }

    // Sort children and products recursively
    const sortTreeRecursively = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
      for (const node of nodes) {
        if (node.products && node.products.length > 0) {
          node.products.sort(
            (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
          );
          for (const prod of node.products) {
            if (prod.models && prod.models.length > 0) {
              prod.models.sort(
                (a, b) =>
                  (a.displayOrder || 0) - (b.displayOrder || 0) ||
                  a.name.localeCompare(b.name)
              );
            }
          }
        }
        if (node.models && node.models.length > 0) {
          node.models.sort(
            (a, b) =>
              (a.displayOrder || 0) - (b.displayOrder || 0) || a.name.localeCompare(b.name)
          );
        }
        if (node.children && node.children.length > 0) {
          sortTreeRecursively(node.children);
        }
      }
    };
    sortTreeRecursively(rootNodes);

    await cacheService.setCached(cacheKey, rootNodes, CACHE_TTL.LONG);
    return rootNodes;
  }

  /**
   * Resolves category ancestry chain from root to this category
   */
  public async getCategoryAncestry(categoryId: string | mongoose.Types.ObjectId): Promise<Array<{ _id: string; name: string; slug: string }>> {
    const ancestry: Array<{ _id: string; name: string; slug: string }> = [];
    let currentId: string | null = categoryId.toString();

    const visited = new Set<string>();
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const cat: { _id: any; name: string; slug: string; parentCategoryId?: any } | null =
        await Category.findById(currentId).select('_id name slug parentCategoryId').lean();
      if (!cat) break;

      ancestry.unshift({
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
      });

      currentId = cat.parentCategoryId ? cat.parentCategoryId.toString() : null;
    }

    return ancestry;
  }

  /**
   * Generates breadcrumbs for any entity path (category, product, model)
   */
  public async buildCategoryBreadcrumbs(categoryId: string | mongoose.Types.ObjectId): Promise<BreadcrumbItem[]> {
    return this.buildEntityBreadcrumbs(categoryId, 'category');
  }

  /**
   * Resolves full breadcrumb trail for ANY catalog entity regardless of depth or mixed parent types.
   */
  public async buildEntityBreadcrumbs(
    entityId: string | mongoose.Types.ObjectId,
    entityType: 'category' | 'product' | 'model'
  ): Promise<BreadcrumbItem[]> {
    const trail: Array<{ name: string; slug: string; type: 'category' | 'product' | 'model' }> = [];
    let currentId: string | null = entityId.toString();
    let currentType: 'category' | 'product' | 'model' | null = entityType;
    const visited = new Set<string>();

    while (currentId && currentType && !visited.has(`${currentType}:${currentId}`)) {
      visited.add(`${currentType}:${currentId}`);

      if (currentType === 'category') {
        const doc: any = await Category.findById(currentId)
          .select('_id name slug parentCategoryId parentId parentType')
          .lean();
        if (!doc) break;
        trail.unshift({ name: doc.name, slug: doc.slug, type: 'category' });
        if (doc.parentId && doc.parentType) {
          currentId = doc.parentId.toString();
          currentType = doc.parentType as 'category' | 'product' | 'model';
        } else if (doc.parentCategoryId) {
          currentId = doc.parentCategoryId.toString();
          currentType = 'category';
        } else {
          currentId = null;
          currentType = null;
        }
      } else if (currentType === 'product') {
        const doc: any = await Product.findById(currentId)
          .select('_id name slug categoryId parentId parentType')
          .lean();
        if (!doc) break;
        trail.unshift({ name: doc.name, slug: doc.slug, type: 'product' });
        if (doc.parentId && doc.parentType) {
          currentId = doc.parentId.toString();
          currentType = doc.parentType as 'category' | 'product' | 'model';
        } else if (doc.categoryId) {
          currentId = doc.categoryId.toString();
          currentType = 'category';
        } else {
          currentId = null;
          currentType = null;
        }
      } else if (currentType === 'model') {
        const doc: any = await ProductModel.findById(currentId)
          .select('_id name modelNumber slug productId parentId parentType')
          .lean();
        if (!doc) break;
        trail.unshift({
          name: doc.modelNumber ? `${doc.name} (${doc.modelNumber})` : doc.name,
          slug: doc.slug,
          type: 'model',
        });
        if (doc.parentId && doc.parentType) {
          currentId = doc.parentId.toString();
          currentType = doc.parentType as 'category' | 'product' | 'model';
        } else if (doc.productId) {
          currentId = doc.productId.toString();
          currentType = 'product';
        } else {
          currentId = null;
          currentType = null;
        }
      } else {
        break;
      }
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Products', slug: '', path: '/products', type: 'root' },
    ];
    let cumulativePath = '/products';
    for (const item of trail) {
      cumulativePath += `/${item.slug}`;
      breadcrumbs.push({
        name: item.name,
        slug: item.slug,
        path: cumulativePath,
        type: item.type,
      });
    }

    return breadcrumbs;
  }

  /**
   * Get single category by slug with all direct children (categories, products, models),
   * enriched products, models count, and universal breadcrumbs.
   */
  public async getCategoryBySlug(slug: string, activeOnly: boolean = true) {
    const cacheKey = activeOnly
      ? CACHE_KEYS.CATEGORY_DETAIL(slug)
      : `${CACHE_KEYS.CATEGORY_DETAIL(slug)}:admin`;

    const cached = await cacheService.getCached<unknown>(cacheKey);
    if (cached) {
      return cached;
    }

    const catQuery: Record<string, unknown> = { slug: slug.toLowerCase() };
    if (activeOnly) {
      catQuery.isActive = true;
    }

    const category = await Category.findOne(catQuery).lean();
    if (!category) {
      throw AppError.notFound(`Category with slug "${slug}" not found`);
    }

    if (activeOnly && category.parentCategoryId) {
      const parentCat = await Category.findById(category.parentCategoryId).select('_id isActive').lean();
      if (!parentCat || !parentCat.isActive) {
        throw AppError.notFound(`Category with slug "${slug}" not found`);
      }
    }

    // Direct children queries: can be categories, products, or models
    const childCatFilter: Record<string, unknown> = {
      $or: [{ parentCategoryId: category._id }, { parentId: category._id }],
    };
    const childProdFilter: Record<string, unknown> = {
      $or: [{ categoryId: category._id }, { parentId: category._id }],
    };
    const childModelFilter: Record<string, unknown> = {
      parentId: category._id,
    };

    if (activeOnly) {
      childCatFilter.isActive = true;
      childProdFilter.isActive = true;
      childModelFilter.isActive = true;
    }

    const [children, products, directModels, breadcrumbs] = await Promise.all([
      Category.find(childCatFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find(childProdFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      ProductModel.find(childModelFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      this.buildEntityBreadcrumbs(category._id, 'category'),
    ]);

    // Fetch models for each product
    const productIds = products.map((p) => p._id);
    const models = await ProductModel.find({
      productId: { $in: productIds },
      ...(activeOnly ? { isActive: true } : {}),
    })
      .select('_id name modelNumber slug productId displayOrder')
      .sort({ displayOrder: 1 })
      .lean();

    const modelsByProductId = new Map<string, typeof models>();
    for (const m of models) {
      if (m.productId) {
        const pid = m.productId.toString();
        if (!modelsByProductId.has(pid)) {
          modelsByProductId.set(pid, []);
        }
        modelsByProductId.get(pid)?.push(m);
      }
    }

    const enrichedProducts = products.map((p) => ({
      ...p,
      models: modelsByProductId.get(p._id.toString()) || [],
      modelCount: (modelsByProductId.get(p._id.toString()) || []).length,
    }));

    // Build unified directChildren array across categories, products, and models
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
      ...children.map((c) => ({
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
      ...enrichedProducts.map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        slug: p.slug,
        type: 'product' as const,
        shortDescription: p.shortDescription,
        description: p.description,
        media: p.media,
        displayOrder: p.displayOrder || 0,
        isActive: p.isActive,
        modelCount: p.modelCount || 0,
        isFeatured: p.isFeatured || false,
      })),
      ...directModels.map((m) => ({
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
      category,
      children,
      products: enrichedProducts,
      directChildren,
      breadcrumbs,
    };

    await cacheService.setCached(cacheKey, result, CACHE_TTL.MEDIUM);
    return result;
  }

  /**
   * Retrieves all descendant category IDs of a given category.
   * Useful to prevent circular references when reparenting.
   */
  public async getDescendantIds(categoryId: string): Promise<string[]> {
    const descendants: string[] = [];
    const queue: string[] = [categoryId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const children = await Category.find({ parentCategoryId: current }).select('_id').lean();
      for (const child of children) {
        const childId = child._id.toString();
        descendants.push(childId);
        queue.push(childId);
      }
    }

    return descendants;
  }

  /**
   * Admin list of categories (flat list with parent name populated)
   */
  public async getAllCategories(activeOnly: boolean = false) {
    const filter = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(filter)
      .populate('parentCategoryId', 'name slug')
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Count products per category
    const productCounts = await Product.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>();
    for (const item of productCounts) {
      if (item._id) {
        countMap.set(item._id.toString(), item.count);
      }
    }

    return categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat._id.toString()) || 0,
    }));
  }

  public async getCategoryById(id: string) {
    const category = await Category.findById(id).populate('parentCategoryId', 'name slug').lean();
    if (!category) {
      throw AppError.notFound('Category not found');
    }
    return category;
  }

  public async createCategory(data: Partial<ICategory>) {
    const uniqueSlug = await generateUniqueSlug(data.name || 'category', Category, null, data.slug);

    if (data.parentCategoryId) {
      const parentExists = await Category.findById(data.parentCategoryId);
      if (!parentExists) {
        throw AppError.badRequest('Specified parent category does not exist');
      }
    }

    const category = await Category.create({
      ...data,
      slug: uniqueSlug,
      parentCategoryId: data.parentCategoryId || (data.parentType === 'category' && data.parentId ? data.parentId : null),
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.parentCategoryId || null),
      parentType: data.parentType || (data.parentCategoryId ? 'category' : null),
    });

    await this.invalidateCategoryCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree', 'products', 'products-featured', 'models', 'navbar', 'pages', 'home', `category-${category.slug}`]
    );
    return category;
  }

  public async updateCategory(id: string, data: Partial<ICategory>) {
    const category = await Category.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    if (data.slug || (data.name && data.name !== category.name && !data.slug)) {
      data.slug = await generateUniqueSlug(data.name || category.name, Category, id, data.slug);
    }

    // Validate parent change to prevent circular loops
    if (data.parentCategoryId !== undefined || data.parentId !== undefined) {
      const newParent = data.parentId ? data.parentId.toString() : data.parentCategoryId ? data.parentCategoryId.toString() : null;
      if (newParent) {
        if (newParent === id) {
          throw AppError.badRequest('A category cannot be its own parent');
        }
        const descendants = await this.getDescendantIds(id);
        if (descendants.includes(newParent)) {
          throw AppError.badRequest('Cannot move category under one of its own descendants');
        }
      }
    }

    if (data.parentId !== undefined) {
      data.parentCategoryId = (data.parentType === 'category' && data.parentId ? data.parentId : null) as any;
    }

    Object.assign(category, data);
    await category.save();

    await this.invalidateCategoryCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree', 'products', 'products-featured', 'models', 'navbar', 'pages', 'home', `category-${category.slug}`]
    );
    return category;
  }

  public async moveCategory(id: string, newParentCategoryId: string | null) {
    return this.updateCategory(id, { parentCategoryId: (newParentCategoryId ? new mongoose.Types.ObjectId(newParentCategoryId) : null) as unknown as mongoose.Types.ObjectId });
  }

  public async getCategoryHero(id: string) {
    const category = await Category.findById(id).select('hero name slug').lean();
    if (!category) throw AppError.notFound('Category not found');
    return category.hero;
  }

  public async updateCategoryHero(id: string, heroData: Partial<IEntityHero>) {
    const category = await Category.findById(id);
    if (!category) throw AppError.notFound('Category not found');
    category.hero = {
      ...((category.hero as any)?.toObject?.() || category.hero || {}),
      ...heroData,
    };
    category.markModified('hero');
    await category.save();
    await this.invalidateCategoryCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree', `category-${category.slug}`]
    );
    return category.hero;
  }

  public async reorderCategories(orders: Array<{ id: string; displayOrder: number }>) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await Category.bulkWrite(bulkOps);
    await this.invalidateCategoryCache();
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree']
    );
    return { success: true, count: orders.length };
  }

  public async getAllDescendantCategoryIds(rootCatId: string | mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]> {
    const result: mongoose.Types.ObjectId[] = [];
    const visited = new Set<string>([rootCatId.toString()]);
    const queue: mongoose.Types.ObjectId[] = [new mongoose.Types.ObjectId(rootCatId)];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = await Category.find({
        $or: [{ parentCategoryId: currentId }, { parentId: currentId }],
      }).select('_id').lean();

      for (const child of children) {
        const childId = child._id as mongoose.Types.ObjectId;
        const idStr = childId.toString();
        if (!visited.has(idStr)) {
          visited.add(idStr);
          result.push(childId);
          queue.push(childId);
        }
      }
    }
    return result;
  }

  public async deleteCategory(id: string, cascade: boolean = false) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid Category ID');
    }

    const category = await Category.findById(id);
    if (!category) {
      throw AppError.notFound('Category not found');
    }

    const descendantIds = await this.getAllDescendantCategoryIds(category._id);
    const allCatIds = [category._id as mongoose.Types.ObjectId, ...descendantIds];

    // Check for child products/categories if not cascading
    const directProductCount = await Product.countDocuments({
      $or: [{ categoryId: id }, { parentId: id }],
    });
    const directChildCategoryCount = await Category.countDocuments({
      $or: [{ parentCategoryId: id }, { parentId: id }],
    });

    if (!cascade && (directProductCount > 0 || directChildCategoryCount > 0)) {
      const parts: string[] = [];
      if (directProductCount > 0) parts.push(`${directProductCount} product(s)`);
      if (directChildCategoryCount > 0) parts.push(`${directChildCategoryCount} subcategory(s)`);
      throw AppError.badRequest(
        `Cannot delete category: contains ${parts.join(' and ')}. Please move or delete them first, or confirm cascade delete.`
      );
    }

    // Cascade deletion:
    // 1. Find all products belonging to these categories
    const productsToDelete = await Product.find({
      $or: [{ categoryId: { $in: allCatIds } }, { parentId: { $in: allCatIds } }],
    }).select('_id').lean();
    const productIdsToDelete = productsToDelete.map((p) => p._id);

    // 2. Delete all models belonging to those products or categories
    await ProductModel.deleteMany({
      $or: [
        { productId: { $in: productIdsToDelete } },
        { parentId: { $in: productIdsToDelete } },
        { categoryId: { $in: allCatIds } },
      ],
    });

    // 3. Delete the products
    if (productIdsToDelete.length > 0) {
      await Product.deleteMany({ _id: { $in: productIdsToDelete } });
    }

    // 4. Delete the categories (both target and all descendants)
    await Category.deleteMany({ _id: { $in: allCatIds } });

    // 5. Delete associated CategoryHero records if any
    await CategoryHero.deleteMany({
      $or: [
        { categoryId: { $in: allCatIds } },
        { page: category.slug },
      ],
    }).catch(() => {});

    // 6. Safely clean up any other categories referencing these as parents
    await Category.updateMany(
      { $or: [{ parentCategoryId: { $in: allCatIds } }, { parentId: { $in: allCatIds } }] },
      { $set: { parentCategoryId: null, parentId: null } }
    );

    // 7. Clean up any categories referencing deleted products
    if (productIdsToDelete.length > 0) {
      await Category.updateMany(
        { catalogProductId: { $in: productIdsToDelete } },
        { $set: { catalogProductId: null } }
      );
    }

    // 8. Invalidate all relevant Redis cache keys
    await this.invalidateCategoryCache();

    // 9. Trigger Next.js revalidation
    await triggerNextjsRevalidation(
      ['/', '/products', '/products/[...slug]'],
      ['categories', 'catalog-nav', 'catalog-tree', 'products', 'products-featured', 'models', 'navbar', 'pages', 'home', `category-${category.slug}`]
    );

    return { message: 'Category deleted successfully' };
  }

  public async invalidateCategoryCache(): Promise<void> {
    try {
      await cacheService.invalidateAllCatalogCaches();
    } catch (err) {
      logger.warn('[CategoryService] Cache invalidation warning:', err);
    }
  }
}

export const categoryService = new CategoryService();
