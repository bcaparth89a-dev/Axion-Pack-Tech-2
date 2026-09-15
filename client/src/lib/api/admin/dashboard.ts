import { adminApiClient } from './adminClient';
import { DashboardStats } from './types';

export async function getDashboardStats(): Promise<DashboardStats> {
  return adminApiClient.get<DashboardStats>('/admin/dashboard');
}

export async function flushPublicCache(): Promise<{ message: string }> {
  return adminApiClient.post<{ message: string }>('/admin/cache/flush');
}
