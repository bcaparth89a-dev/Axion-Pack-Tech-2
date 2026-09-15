import { adminApiClient } from './adminClient';
import { AdminCatalogLead, AdminCatalogLeadStats } from './types';

export interface GetCatalogLeadsAdminParams {
  status?: string;
  search?: string;
  catalogName?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

export async function getAllCatalogLeadsAdmin(
  params?: GetCatalogLeadsAdminParams
): Promise<{
  items: AdminCatalogLead[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> {
  return adminApiClient.get('/catalog-leads', { params });
}

export async function getCatalogLeadStatsAdmin(): Promise<AdminCatalogLeadStats> {
  return adminApiClient.get('/catalog-leads/stats');
}

export async function updateCatalogLeadStatusAdmin(
  id: string,
  status: 'unread' | 'contacted' | 'resolved' | 'archived',
  notes?: string
): Promise<AdminCatalogLead> {
  return adminApiClient.patch<AdminCatalogLead>(`/catalog-leads/${id}`, {
    status,
    notes,
  });
}

export async function deleteCatalogLeadAdmin(id: string): Promise<void> {
  return adminApiClient.delete(`/catalog-leads/${id}`);
}
