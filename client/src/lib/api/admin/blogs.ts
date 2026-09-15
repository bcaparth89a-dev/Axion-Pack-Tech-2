import { adminApiClient } from './adminClient';
import { BlogPost, BlogCategory } from '@/data/blogs';

export async function getAllBlogCategoriesAdmin(): Promise<BlogCategory[]> {
  return adminApiClient.get<BlogCategory[]>('/blogs/categories');
}

export async function createBlogCategoryAdmin(data: Partial<BlogCategory>): Promise<BlogCategory> {
  return adminApiClient.post<BlogCategory>('/blogs/categories', data);
}

export async function updateBlogCategoryAdmin(slug: string, data: Partial<BlogCategory>): Promise<BlogCategory> {
  return adminApiClient.put<BlogCategory>(`/blogs/categories/${slug}`, data);
}

export async function deleteBlogCategoryAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/blogs/categories/${slug}`);
}

export async function getAllBlogsAdmin(params?: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: BlogPost[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/blogs', {
    params: {
      ...params,
      all: 'true',
    },
  });
}

export async function getBlogPostAdmin(slug: string): Promise<BlogPost> {
  return adminApiClient.get<BlogPost>(`/blogs/${slug}?all=true`);
}

export async function createBlogAdmin(data: Partial<BlogPost>): Promise<BlogPost> {
  return adminApiClient.post<BlogPost>('/blogs', data);
}

export async function updateBlogAdmin(slug: string, data: Partial<BlogPost>): Promise<BlogPost> {
  return adminApiClient.put<BlogPost>(`/blogs/${slug}`, data);
}

export async function deleteBlogAdmin(slug: string): Promise<void> {
  return adminApiClient.delete(`/blogs/${slug}`);
}

export async function reorderBlogsAdmin(orders: Array<{ slug: string; sortOrder: number }>): Promise<BlogPost[]> {
  return adminApiClient.put<BlogPost[]>('/blogs/reorder', { orders });
}

