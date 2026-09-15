import { adminApiClient } from './adminClient';

export async function getHomePageAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/pages/home');
}

export async function updateHomePageAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/pages/home', data);
}

export async function getAboutPageAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/pages/about');
}

export async function updateAboutPageAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/pages/about', data);
}

export async function getResponsibilityPageAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/pages/responsibilities');
}

export async function updateResponsibilityPageAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/pages/responsibilities', data);
}

export async function getCompanyStatsAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/pages/stats');
}

export async function updateCompanyStatsAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/pages/stats', data);
}

export async function getCategoryHeroAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.get<T>('/pages/category-hero/admin');
}

export async function updateCategoryHeroAdmin<T = Record<string, unknown>>(data: Partial<T>): Promise<T> {
  return adminApiClient.put<T>('/pages/category-hero', data);
}

export async function publishCategoryHeroAdmin<T = Record<string, unknown>>(): Promise<T> {
  return adminApiClient.post<T>('/pages/category-hero/publish');
}
