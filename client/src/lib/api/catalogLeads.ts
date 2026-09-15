import { apiClient } from './client';

export interface CatalogLeadSubmissionPayload {
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement?: string;
  catalogName: string;
  entityType?: 'category' | 'product' | 'model' | 'general';
  entitySlug?: string;
  pdfUrl?: string;
  turnstileToken?: string;
  hp_website?: string;
}

export interface CatalogLeadResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement?: string;
  catalogName: string;
  entityType?: string;
  entitySlug?: string;
  pdfUrl?: string;
  status: string;
  createdAt: string;
}

/**
 * Submit verified catalog lead inquiry before initiating file download.
 */
export async function submitCatalogLead(
  payload: CatalogLeadSubmissionPayload
): Promise<CatalogLeadResponse> {
  return apiClient.post<CatalogLeadResponse>('/catalog-leads', payload);
}
