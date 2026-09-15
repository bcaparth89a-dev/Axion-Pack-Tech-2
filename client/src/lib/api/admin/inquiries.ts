import { adminApiClient } from './adminClient';
import { AdminInquiry } from './types';

export async function getAllInquiriesAdmin(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: AdminInquiry[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/contact/inquiries', { params });
}

export async function updateInquiryStatusAdmin(
  id: string,
  status: 'unread' | 'contacted' | 'resolved' | 'archived',
  notes?: string
): Promise<AdminInquiry> {
  return adminApiClient.patch<AdminInquiry>(`/contact/inquiries/${id}`, {
    status,
    notes,
  });
}

export async function deleteInquiryAdmin(id: string): Promise<void> {
  return adminApiClient.delete(`/contact/inquiries/${id}`);
}
