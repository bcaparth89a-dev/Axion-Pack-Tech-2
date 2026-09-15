import { adminApiClient } from './adminClient';
import {
  CategoryItem,
  CategoryTreeNode,
  ProductItem,
  ProductModelItem,
} from '@/types/products';

// ----------------------------------------------------
// Category Admin Endpoints
// ----------------------------------------------------

export async function getAllCategoriesAdmin(): Promise<CategoryItem[]> {
  return adminApiClient.get<CategoryItem[]>('/categories?all=true');
}

export async function getCategoryTreeAdmin(): Promise<CategoryTreeNode[]> {
  return adminApiClient.get<CategoryTreeNode[]>('/categories/tree?all=true');
}

export async function getCategoryByIdAdmin(id: string): Promise<CategoryItem> {
  return adminApiClient.get<CategoryItem>(`/categories/${id}`);
}

export async function createCategoryAdmin(data: Partial<CategoryItem>): Promise<CategoryItem> {
  return adminApiClient.post<CategoryItem>('/categories', data);
}

export async function updateCategoryAdmin(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
  return adminApiClient.put<CategoryItem>(`/categories/${id}`, data);
}

export async function moveCategoryAdmin(id: string, parentCategoryId: string | null): Promise<CategoryItem> {
  return adminApiClient.patch<CategoryItem>(`/categories/${id}/move`, { parentCategoryId });
}

export async function reorderCategoriesAdmin(orders: Array<{ id: string; displayOrder: number }>): Promise<unknown> {
  return adminApiClient.patch('/categories/reorder', { orders });
}

export async function deleteCategoryAdmin(id: string, cascade: boolean = false): Promise<void> {
  return adminApiClient.delete(`/categories/${id}?cascade=${cascade}`);
}

// ----------------------------------------------------
// Product Admin Endpoints
// ----------------------------------------------------

export async function getProductsAdmin(params?: {
  categoryId?: string;
  standalone?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: ProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const searchParams: Record<string, string | number | boolean | undefined> = { all: 'true' };
  if (params?.categoryId) searchParams.categoryId = params.categoryId;
  if (params?.standalone) searchParams.standalone = true;
  if (params?.search) searchParams.search = params.search;
  if (params?.page) searchParams.page = params.page;
  if (params?.limit) searchParams.limit = params.limit;

  return adminApiClient.get('/products', { params: searchParams });
}

export async function getProductByIdAdmin(id: string): Promise<ProductItem> {
  return adminApiClient.get<ProductItem>(`/products/${id}`);
}

export async function createProductAdmin(data: Partial<ProductItem>): Promise<ProductItem> {
  return adminApiClient.post<ProductItem>('/products', data);
}

export async function updateProductAdmin(id: string, data: Partial<ProductItem>): Promise<ProductItem> {
  return adminApiClient.put<ProductItem>(`/products/${id}`, data);
}

export async function reorderProductsAdmin(orders: Array<{ id: string; displayOrder: number }>): Promise<unknown> {
  return adminApiClient.patch('/products/reorder', { orders });
}

export async function deleteProductAdmin(id: string, cascade: boolean = false): Promise<void> {
  return adminApiClient.delete(`/products/${id}?cascade=${cascade}`);
}

// ----------------------------------------------------
// Model Admin Endpoints
// ----------------------------------------------------

export async function getModelsAdmin(params?: {
  productId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: ProductModelItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const searchParams: Record<string, string | number | boolean | undefined> = { all: 'true' };
  if (params?.productId) searchParams.productId = params.productId;
  if (params?.search) searchParams.search = params.search;
  if (params?.page) searchParams.page = params.page;
  if (params?.limit) searchParams.limit = params.limit;

  return adminApiClient.get('/models', { params: searchParams });
}

export async function getModelByIdAdmin(id: string): Promise<ProductModelItem> {
  return adminApiClient.get<ProductModelItem>(`/models/${id}`);
}

export async function createModelAdmin(data: Partial<ProductModelItem>): Promise<ProductModelItem> {
  return adminApiClient.post<ProductModelItem>('/models', data);
}

export async function updateModelAdmin(id: string, data: Partial<ProductModelItem>): Promise<ProductModelItem> {
  return adminApiClient.put<ProductModelItem>(`/models/${id}`, data);
}

export async function reorderModelsAdmin(orders: Array<{ id: string; displayOrder: number }>): Promise<unknown> {
  return adminApiClient.patch('/models/reorder', { orders });
}

export async function deleteModelAdmin(id: string): Promise<void> {
  return adminApiClient.delete(`/models/${id}`);
}
