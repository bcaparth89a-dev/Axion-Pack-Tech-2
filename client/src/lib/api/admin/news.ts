import { adminApiClient } from './adminClient';
import { NewsArticle, NewsCategory } from '@/data/news';

export async function getAllNewsCategoriesAdmin(): Promise<NewsCategory[]> {
  return adminApiClient.get<NewsCategory[]>('/news/categories');
}

export async function createNewsCategoryAdmin(data: Partial<NewsCategory>): Promise<NewsCategory> {
  return adminApiClient.post<NewsCategory>('/news/categories', data);
}

export async function updateNewsCategoryAdmin(slug: string, data: Partial<NewsCategory>): Promise<NewsCategory> {
  return adminApiClient.put<NewsCategory>(`/news/categories/${slug}`, data);
}

export async function deleteNewsCategoryAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/news/categories/${slug}`);
}

export async function getAllNewsAdmin(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: NewsArticle[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/news', {
    params: {
      ...params,
      all: 'true',
    },
  });
}

export async function getNewsArticleAdmin(category: string, slug: string): Promise<NewsArticle> {
  return adminApiClient.get<NewsArticle>(`/news/${category}/${slug}?all=true`);
}

export async function createNewsAdmin(data: Partial<NewsArticle>): Promise<NewsArticle> {
  return adminApiClient.post<NewsArticle>('/news', data);
}

export async function updateNewsAdmin(slug: string, data: Partial<NewsArticle>): Promise<NewsArticle> {
  return adminApiClient.put<NewsArticle>(`/news/${slug}`, data);
}

export async function deleteNewsAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/news/${slug}`);
}

export async function reorderNewsAdmin(orders: Array<{ slug: string; sortOrder: number }>): Promise<NewsArticle[]> {
  return adminApiClient.put<NewsArticle[]>('/news/reorder', { orders });
}

