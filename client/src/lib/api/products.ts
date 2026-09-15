import { cache } from 'react';
import { apiClient, ApiError } from './client';
import {
  CategoryTreeNode,
  CategoryItem,
  ProductItem,
  ProductModelItem,
  CategoryDetailResponse,
  ProductDetailResponse,
  ModelDetailResponse,
} from '@/types/products';

export interface ProductListParams {
  categoryId?: string;
  standalone?: boolean;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface ModelListParams {
  productId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NavigationCategoryItem {
  _id: string;
  name: string;
  slug: string;
  parentCategoryId: string | null;
  shortDescription: string;
  media: {
    image?: string;
    heroImage?: string;
  };
  displayOrder: number;
  isActive: boolean;
  childCount: number;
  productCount: number;
}

/**
 * Fetch lightweight category tier for navigation on demand.
 * If parentCategoryId is omitted or null, returns root categories.
 * If parentCategoryId is provided, returns child categories for that parent.
 */
export const getNavigationCategories = cache(
  async (parentCategoryId?: string | null): Promise<NavigationCategoryItem[]> => {
    try {
      const query = parentCategoryId ? `?parentCategoryId=${parentCategoryId}` : '';
      const data = await apiClient.get<NavigationCategoryItem[]>(`/categories/nav${query}`, {
        revalidate: 300,
        tags: ['categories', 'catalog-nav'],
      });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.warn('[getNavigationCategories] Fetch failed:', err);
      return [];
    }
  }
);

/**
 * Fetch full hierarchical category tree with nested children and products.
 */
export const getCategoryTree = cache(async (): Promise<CategoryTreeNode[]> => {
  try {
    const data = await apiClient.get<CategoryTreeNode[]>('/categories/tree', {
      revalidate: 300,
      tags: ['categories', 'catalog-tree'],
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[getCategoryTree] Fetch failed:', err);
    return [];
  }
});

/**
 * Fetch flat list of categories.
 */
export const getAllCategories = cache(async (activeOnly: boolean = true): Promise<CategoryItem[]> => {
  try {
    const data = await apiClient.get<CategoryItem[]>(`/categories?activeOnly=${activeOnly}`, {
      revalidate: 300,
      tags: ['categories'],
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[getAllCategories] Fetch failed:', err);
    return [];
  }
});

/**
 * Fetch a single category by slug with direct children, products, and ancestry breadcrumbs.
 */
export const getCategoryBySlug = cache(async (slug: string): Promise<CategoryDetailResponse | null> => {
  const cleanSlug = (slug || '').toLowerCase().trim();
  try {
    const data = await apiClient.get<CategoryDetailResponse>(`/categories/slug/${cleanSlug}`, {
      revalidate: 300,
      tags: ['categories', `category-${cleanSlug}`],
    });
    return data && data.category ? data : null;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      return null;
    }
    console.warn(`[getCategoryBySlug] Fetch failed for "${cleanSlug}":`, err);
    return null;
  }
});

/**
 * Fetch products with optional category, standalone, or search filter.
 */
export const getProducts = cache(
  async (
    params?: ProductListParams
  ): Promise<{
    items: ProductItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const searchParams: Record<string, string | number | boolean | undefined> = {};
      if (params?.categoryId) searchParams.categoryId = params.categoryId;
      if (params?.standalone) searchParams.standalone = true;
      if (params?.search) searchParams.search = params.search;
      if (params?.featured !== undefined) searchParams.featured = params.featured;
      if (params?.page) searchParams.page = params.page;
      if (params?.limit) searchParams.limit = params.limit;

      const data = await apiClient.get<{
        items: ProductItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/products', {
        params: searchParams,
        revalidate: 300,
        tags: ['products'],
      });

      return data || { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
    } catch (err) {
      console.warn('[getProducts] Fetch failed:', err);
      return { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
    }
  }
);

/**
 * Fetch a single product by slug with models, ancestry breadcrumbs, and full path.
 */
export const getProductBySlug = cache(async (slug: string): Promise<ProductDetailResponse | null> => {
  const cleanSlug = (slug || '').toLowerCase().trim();
  try {
    const data = await apiClient.get<ProductDetailResponse>(`/products/slug/${cleanSlug}`, {
      revalidate: 300,
      tags: ['products', `product-${cleanSlug}`],
    });
    return data && data.product ? data : null;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      return null;
    }
    console.warn(`[getProductBySlug] Fetch failed for "${cleanSlug}":`, err);
    return null;
  }
});

/**
 * Fetch featured products for homepage and highlights.
 */
export const getFeaturedProducts = cache(async (limit: number = 8): Promise<ProductItem[]> => {
  try {
    const data = await apiClient.get<ProductItem[]>(`/products/featured?limit=${limit}`, {
      revalidate: 300,
      tags: ['products', 'products-featured'],
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[getFeaturedProducts] Fetch failed:', err);
    return [];
  }
});

/**
 * Fetch models list with optional productId filter.
 */
export const getModels = cache(
  async (
    params?: ModelListParams
  ): Promise<{
    items: ProductModelItem[];
    total: number;
    page: number;
    limit: number;
  }> => {
    try {
      const searchParams: Record<string, string | number | boolean | undefined> = {};
      if (params?.productId) searchParams.productId = params.productId;
      if (params?.search) searchParams.search = params.search;
      if (params?.page) searchParams.page = params.page;
      if (params?.limit) searchParams.limit = params.limit;

      const data = await apiClient.get<{
        items: ProductModelItem[];
        total: number;
        page: number;
        limit: number;
      }>('/models', {
        params: searchParams,
        revalidate: 300,
        tags: ['models'],
      });

      return data || { items: [], total: 0, page: 1, limit: 12 };
    } catch (err) {
      console.warn('[getModels] Fetch failed:', err);
      return { items: [], total: 0, page: 1, limit: 12 };
    }
  }
);

/**
 * Fetch a single model by slug with parent product, ancestry breadcrumbs, and full path.
 */
export const getModelBySlug = cache(async (slug: string): Promise<ModelDetailResponse | null> => {
  const cleanSlug = (slug || '').toLowerCase().trim();
  try {
    const data = await apiClient.get<ModelDetailResponse>(`/models/slug/${cleanSlug}`, {
      revalidate: 300,
      tags: ['models', `model-${cleanSlug}`],
    });
    return data && data.model ? data : null;
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) {
      return null;
    }
    console.warn(`[getModelBySlug] Fetch failed for "${cleanSlug}":`, err);
    return null;
  }
});

export type CatalogResolution =
  | { type: 'model'; data: ModelDetailResponse }
  | { type: 'product'; data: ProductDetailResponse }
  | { type: 'category'; data: CategoryDetailResponse };

/**
 * Polymorphic resolver for catch-all dynamic routes /products/[...slug].
 * Given the final slug in the route array, determines whether it represents:
 * 1. A Model
 * 2. A Product
 * 3. A Category or Subcategory
 */
export const resolveCatalogEntityBySlug = cache(
  async (slug: string): Promise<CatalogResolution | null> => {
    const cleanSlug = (slug || '').toLowerCase().trim();

    // Try Model first (models have specific variant slugs like hbc-200, scb-500)
    const modelData = await getModelBySlug(cleanSlug);
    if (modelData) {
      return { type: 'model', data: modelData };
    }

    // Try Product
    const productData = await getProductBySlug(cleanSlug);
    if (productData) {
      return { type: 'product', data: productData };
    }

    // Try Category / Subcategory
    const categoryData = await getCategoryBySlug(cleanSlug);
    if (categoryData) {
      return { type: 'category', data: categoryData };
    }

    return null;
  }
);
