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

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
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
   * Builds full multi-tier category tree with child categories and nested products.
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
        .select('_id name slug parentCategoryId shortDescription media displayOrder isActive')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      Product.find(prodFilter)
        .select('_id name slug categoryId shortDescription media displayOrder')
        .sort({ displayOrder: 1, name: 1 })
        .lean(),
      ProductModel.find(activeOnly ? { isActive: true } : {})
        .select('_id productId')
        .lean(),
    ]);

    // Group models count by productId
    const modelCountsByProduct = new Map<string, number>();
    for (const m of models) {
      const pid = m.productId?.toString();
      if (pid) {
        modelCountsByProduct.set(pid, (modelCountsByProduct.get(pid) || 0) + 1);
      }
    }

    // Map categories into nodes
    const nodeMap = new Map<string, CategoryTreeNode>();
    for (const cat of categories) {
      nodeMap.set(cat._id.toString(), {
        _id: cat._id.toString(),
        name: cat.name,
        slug: cat.slug,
        parentCategoryId: cat.parentCategoryId ? cat.parentCategoryId.toString() : null,
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

    // Assign products to categories
    for (const prod of products) {
      if (prod.categoryId) {
        const parentNode = nodeMap.get(prod.categoryId.toString());
        if (parentNode) {
          parentNode.products.push({
            _id: prod._id.toString(),
            name: prod.name,
            slug: prod.slug,
            shortDescription: prod.shortDescription,
            media: prod.media || {},
            displayOrder: prod.displayOrder,
            modelCount: modelCountsByProduct.get(prod._id.toString()) || 0,
          });
        }
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

    // Sort children and products
    const sortTreeRecursively = (nodes: CategoryTreeNode[]) => {
      nodes.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
      for (const node of nodes) {
        node.products.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
        if (node.children.length > 0) {
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
   * Generates breadcrumbs for a category path
   */
  public async buildCategoryBreadcrumbs(categoryId: string | mongoose.Types.ObjectId): Promise<BreadcrumbItem[]> {
    const ancestry = await this.getCategoryAncestry(categoryId);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Products', slug: '', path: '/products', type: 'root' },
    ];

    let currentPath = '/products';
    for (const item of ancestry) {
      currentPath += `/${item.slug}`;
      breadcrumbs.push({
        name: item.name,
        slug: item.slug,
        path: currentPath,
        type: 'category',
      });
    }

    return breadcrumbs;
  }

  /**
   * Get single category by slug with its direct children, products, models count, and breadcrumbs.
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

    const childFilter: Record<string, unknown> = { parentCategoryId: category._id };
    const prodFilter: Record<string, unknown> = { categoryId: category._id };
    if (activeOnly) {
      childFilter.isActive = true;
      prodFilter.isActive = true;
    }

    const [children, products, breadcrumbs] = await Promise.all([
      Category.find(childFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      Product.find(prodFilter).sort({ displayOrder: 1, name: 1 }).lean(),
      this.buildCategoryBreadcrumbs(category._id),
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

    const result = {
      category,
      children,
      products: enrichedProducts,
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
    const existing = await Category.findOne({ slug: data.slug?.toLowerCase().trim() });
    if (existing) {
      throw AppError.badRequest(`Category with slug "${data.slug}" already exists`);
    }

    if (data.parentCategoryId) {
      const parentExists = await Category.findById(data.parentCategoryId);
      if (!parentExists) {
        throw AppError.badRequest('Specified parent category does not exist');
      }
    }

    const category = await Category.create({
      ...data,
      slug: data.slug?.toLowerCase().trim(),
      parentCategoryId: data.parentCategoryId || null,
      parentId: data.parentId !== undefined ? (data.parentId || null) : (data.parentCategoryId || null),
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

    if (data.slug && data.slug.toLowerCase().trim() !== category.slug) {
      const existing = await Category.findOne({
        slug: data.slug.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (existing) {
        throw AppError.badRequest(`Category with slug "${data.slug}" already exists`);
      }
      data.slug = data.slug.toLowerCase().trim();
    }

    // Validate parent change to prevent circular loops
    if (data.parentCategoryId !== undefined) {
      const newParent = data.parentCategoryId ? data.parentCategoryId.toString() : null;
      if (newParent) {
        if (newParent === id) {
          throw AppError.badRequest('A category cannot be its own parent');
        }
        const descendants = await this.getDescendantIds(id);
        if (descendants.includes(newParent)) {
          throw AppError.badRequest('Cannot move category under one of its own descendants');
        }
        const parentExists = await Category.findById(newParent);
        if (!parentExists) {
          throw AppError.badRequest('Specified parent category does not exist');
        }
      }
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
