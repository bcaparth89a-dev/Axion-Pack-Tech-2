import { adminApiClient } from './adminClient';
import { Industry } from '@/data/industries';

export interface IndustryReorderItem {
  slug: string;
  sortOrder: number;
}

export async function getAllIndustriesAdmin(): Promise<Industry[]> {
  return adminApiClient.get<Industry[]>('/industries?all=true');
}

export async function getIndustryBySlugAdmin(slug: string): Promise<Industry> {
  return adminApiClient.get<Industry>(`/industries/${slug}?all=true`);
}

export async function createIndustryAdmin(data: Partial<Industry> & Record<string, unknown>): Promise<Industry> {
  return adminApiClient.post<Industry>('/industries', data);
}

export async function updateIndustryAdmin(
  slug: string,
  data: Partial<Industry> & Record<string, unknown>
): Promise<Industry> {
  return adminApiClient.put<Industry>(`/industries/${slug}`, data);
}

export async function reorderIndustriesAdmin(orders: IndustryReorderItem[]): Promise<Industry[]> {
  return adminApiClient.patch<Industry[]>('/industries/reorder', { orders });
}

export async function deleteIndustryAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/industries/${slug}`);
}

