import { adminApiClient } from './adminClient';
import { CareerOpportunity } from '@/data/careers';
import { AdminApplication } from './types';

export async function getAllCareersAdmin(params?: {
  type?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: CareerOpportunity[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/careers', {
    params: {
      ...params,
      all: 'true',
    },
  });
}

export async function getCareerBySlugAdmin(slug: string): Promise<CareerOpportunity> {
  return adminApiClient.get<CareerOpportunity>(`/careers/${slug}?all=true`);
}

export async function createCareerAdmin(data: Partial<CareerOpportunity>): Promise<CareerOpportunity> {
  return adminApiClient.post<CareerOpportunity>('/careers', data);
}

export async function updateCareerAdmin(slug: string, data: Partial<CareerOpportunity>): Promise<CareerOpportunity> {
  return adminApiClient.put<CareerOpportunity>(`/careers/${slug}`, data);
}

export async function deleteCareerAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/careers/${slug}`);
}

import { getApiBaseUrl } from '../client';

export async function getAllApplicationsAdmin(params?: {
  careerSlug?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: AdminApplication[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/careers/admin/applications', { params });
}

export async function updateApplicationStatusAdmin(
  id: string,
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | 'pending' | 'reviewed',
  notes?: string
): Promise<AdminApplication> {
  return adminApiClient.patch<AdminApplication>(`/careers/admin/applications/${id}`, {
    status,
    notes,
  });
}

export async function deleteApplicationAdmin(id: string): Promise<void> {
  return adminApiClient.delete(`/careers/admin/applications/${id}`);
}

export function getResumeDownloadUrl(id: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/careers/admin/applications/${id}/resume`;
}

export async function downloadResumeFileAdmin(id: string, fallbackFileName = 'resume.pdf'): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('axion_admin_token') : null;
  const url = getResumeDownloadUrl(id);
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to download resume (${res.status}: ${res.statusText || 'Unauthorized or Not Found'})`);
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fallbackFileName;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
}

