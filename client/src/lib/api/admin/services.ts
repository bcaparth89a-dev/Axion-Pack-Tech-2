import { adminApiClient } from './adminClient';
import { Service } from '@/data/services';

export interface ServiceReorderPayload {
  slug: string;
  sortOrder: number;
}

export async function getAllServicesAdmin(): Promise<Service[]> {
  return adminApiClient.get<Service[]>('/services?all=true');
}

export async function getServiceBySlugAdmin(slug: string): Promise<Service> {
  return adminApiClient.get<Service>(`/services/${slug}?all=true`);
}

export async function createServiceAdmin(data: Partial<Service>): Promise<Service> {
  return adminApiClient.post<Service>('/services', data);
}

export async function updateServiceAdmin(slug: string, data: Partial<Service>): Promise<Service> {
  return adminApiClient.put<Service>(`/services/${slug}`, data);
}

export async function reorderServicesAdmin(orders: ServiceReorderPayload[]): Promise<Service[]> {
  return adminApiClient.patch<Service[]>('/services/reorder', { orders });
}

export async function deleteServiceAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/services/${slug}`);
}

