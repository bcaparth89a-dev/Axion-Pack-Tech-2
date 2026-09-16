import { cache } from 'react';
import { apiClient } from './client';
import { CatalogItem } from '@/types/products';

/**
 * Fetch all published catalogs and technical brochures dynamically from MongoDB.
 * Cached with Next.js revalidation.
 */
export const getAllCatalogs = cache(async (): Promise<CatalogItem[]> => {
  try {
    const data = await apiClient.get<CatalogItem[]>('/products/catalogs', {
      revalidate: 300,
      tags: ['categories', 'products', 'models', 'catalog-nav', 'catalog-tree'],
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[getAllCatalogs] Fetch failed:', err);
    return [];
  }
});
