import { adminApiClient } from './adminClient';

export interface CatalogProductHero {
  eyebrow?: string;
  title: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton: {
    enabled: boolean;
    text: string;
    link: string;
  };
  background: {
    type: 'image' | 'solid' | 'gradient';
    image?: string;
    color?: string;
    gradient?: string;
  };
  visual: {
    type: 'image' | 'video';
    image?: string;
    video?: string;
    videoPoster?: string;
    altText?: string;
  };
}

export interface CatalogProductItem {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  status: 'active' | 'draft' | 'archived';
  hero: CatalogProductHero;
  displayOrder: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    mainCategoriesCount: number;
    subCategoriesCount: number;
    productsCount: number;
    modelsCount: number;
  };
}

import { EntityHero, GalleryMediaItem, CatalogPdf, SpecificationTable, SeoMetadata } from '@/types/products';

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
  specificationsTable?: SpecificationTable;
  features?: string[];
  infoPoints?: string[];
  applications?: string[];
  benefits?: string[];
  documents?: string[];
  catalogPdf?: CatalogPdf;
  galleryMedia?: GalleryMediaItem[];
  hero?: EntityHero;
}

export async function getCatalogProductsAdmin(all: boolean = true): Promise<CatalogProductItem[]> {
  return adminApiClient.get<CatalogProductItem[]>(`/catalog-products?all=${all}`);
}

export async function getCatalogProductByIdAdmin(id: string): Promise<CatalogProductItem> {
  return adminApiClient.get<CatalogProductItem>(`/catalog-products/${id}`);
}

export async function getCatalogProductTreeAdmin(
  id: string,
  all: boolean = true
): Promise<CatalogHierarchyNode[]> {
  return adminApiClient.get<CatalogHierarchyNode[]>(`/catalog-products/${id}/tree?all=${all}`);
}

export async function getCatalogProductStatsAdmin(id: string): Promise<{
  mainCategoriesCount: number;
  subCategoriesCount: number;
  productsCount: number;
  modelsCount: number;
}> {
  return adminApiClient.get(`/catalog-products/${id}/stats`);
}

export async function createCatalogProductAdmin(
  data: Partial<CatalogProductItem>
): Promise<CatalogProductItem> {
  return adminApiClient.post<CatalogProductItem>('/catalog-products', data);
}

export async function updateCatalogProductAdmin(
  id: string,
  data: Partial<CatalogProductItem>
): Promise<CatalogProductItem> {
  return adminApiClient.put<CatalogProductItem>(`/catalog-products/${id}`, data);
}

export async function duplicateCatalogProductAdmin(id: string): Promise<CatalogProductItem> {
  return adminApiClient.post<CatalogProductItem>(`/catalog-products/${id}/duplicate`);
}

export async function reorderCatalogProductsAdmin(
  orders: Array<{ id: string; displayOrder: number }>
): Promise<unknown> {
  return adminApiClient.patch('/catalog-products/reorder', { orders });
}

export async function deleteCatalogProductAdmin(
  id: string,
  force: boolean = false
): Promise<void> {
  return adminApiClient.delete(`/catalog-products/${id}?force=${force}`);
}
