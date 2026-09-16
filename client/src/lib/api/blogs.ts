import { cache } from 'react';
import { apiClient, ApiError } from './client';
export type { BlogPost, BlogCategory, BlogContentSection } from '@/data/blogs';
import { BlogPost, BlogCategory } from '@/data/blogs';
import { getSafeImageSrc } from '@/lib/utils/mediaUrl';

function normalizeBlogPost(raw: Record<string, unknown>): BlogPost {
  const categorySlug =
    (raw.categorySlug as string) ||
    ((raw.category as string) ? (raw.category as string).toLowerCase().replace(/\s+/g, '-') : '') ||
    'general';

  const slug = (raw.slug as string) || '';
  const rawImage =
    (raw.image as string) ||
    (raw.featuredImage as string) ||
    '';

  const defaultBlogFallback =
    slug.includes('smart-warehouse') || slug.includes('ai')
      ? '/images/blog/ai-smart-warehouse.jpg'
      : '/images/blog/blog-default.jpg';

  const image = getSafeImageSrc(rawImage, defaultBlogFallback);

  let publishedDate = (raw.publishedDate as string) || '';
  if (!publishedDate && raw.publishedAt) {
    try {
      publishedDate = new Date(raw.publishedAt as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      publishedDate = String(raw.publishedAt).split('T')[0];
    }
  }

  const introduction =
    (raw.introduction as string) ||
    (typeof raw.content === 'string' ? raw.content : '') ||
    (raw.excerpt as string) ||
    '';

  const sections = Array.isArray(raw.sections)
    ? (raw.sections as BlogPost['sections'])
    : [];

  return {
    title: (raw.title as string) || '',
    slug: (raw.slug as string) || '',
    excerpt: (raw.excerpt as string) || '',
    category: categorySlug,
    categorySlug,
    categoryName: (raw.categoryName as string) || undefined,
    author: (raw.author as string) || 'AXION PackTech Team',
    authorRole: (raw.authorRole as string) || 'Packaging Machinery Specialist',
    publishedDate,
    published: raw.published !== false,
    readingTime: ((raw.readingTime || raw.readTime) as string) || '5 min read',
    image,
    featuredImage: image,
    featured: Boolean(raw.featured),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    introduction,
    sections,
    conclusion: (raw.conclusion as string) || '',
  };
}

/**
 * Fetch all blog categories from MongoDB.
 */
export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  try {
    const data = await apiClient.get<BlogCategory[]>('/blogs/categories', {
      revalidate: 300,
      tags: ['blogs', 'blog-categories'],
    });
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
});

/**
 * Fetch blog category by slug.
 */
export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategory | undefined> {
  try {
    const cats = await getBlogCategories();
    return cats.find((c) => c.slug.toLowerCase() === (slug || '').toLowerCase());
  } catch {
    return undefined;
  }
}

/**
 * Fetch all blog posts from MongoDB.
 */
export const getAllBlogPosts = cache(
  async (params?: {
    categorySlug?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
  }): Promise<BlogPost[]> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params?.limit || 50,
      };
      if (params?.categorySlug) queryParams.category = params.categorySlug;
      if (params?.featured !== undefined) queryParams.featured = params.featured;
      if (params?.search) queryParams.search = params.search;

      const res = await apiClient.get<{ items: Record<string, unknown>[] }>('/blogs', {
        params: queryParams,
        revalidate: 300,
        tags: ['blogs'],
      });
      if (res && Array.isArray(res.items)) {
        return res.items.map(normalizeBlogPost);
      }
      return [];
    } catch {
      return [];
    }
  }
);

export const getAllBlogs = getAllBlogPosts;

/**
 * Fetch a single blog post by slug from MongoDB.
 */
export const getBlogPostBySlug = cache(
  async (slug: string): Promise<BlogPost | undefined> => {
    try {
      const data = await apiClient.get<Record<string, unknown>>(`/blogs/${slug}`, {
        revalidate: 300,
        tags: ['blogs', `blog-${slug}`],
      });
      if (data && data.title) {
        return normalizeBlogPost(data);
      }
      return undefined;
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return undefined;
      }
      return undefined;
    }
  }
);

export const getBlogBySlug = getBlogPostBySlug;

/**
 * Fetch blog posts by category slug.
 */
export async function getBlogPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  try {
    const all = await getAllBlogPosts({ categorySlug });
    return all.filter((b) => b.category.toLowerCase() === (categorySlug || '').toLowerCase());
  } catch {
    return [];
  }
}

/**
 * Fetch featured blog posts.
 */
export async function getFeaturedBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  try {
    const all = await getAllBlogPosts({ featured: true, limit });
    const featured = all.filter((b) => b.featured).slice(0, limit);
    if (featured.length > 0) return featured;
    const recent = await getAllBlogPosts({ limit });
    return recent.slice(0, limit);
  } catch {
    return [];
  }
}

export const getFeaturedBlogs = getFeaturedBlogPosts;

/**
 * Fetch related blog posts.
 */
export async function getRelatedBlogPosts(
  currentSlug: string,
  categorySlug: string,
  limit: number = 3
): Promise<BlogPost[]> {
  try {
    const categoryPosts = await getBlogPostsByCategory(categorySlug);
    return categoryPosts.filter((b) => b.slug !== currentSlug).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Fetch related blog posts with slug and limit.
 */
export async function getRelatedBlogs(currentSlug: string, limit: number = 3): Promise<BlogPost[]> {
  try {
    const all = await getAllBlogPosts();
    const current = all.find((b) => b.slug === currentSlug);
    if (!current) {
      return all.filter((b) => b.slug !== currentSlug).slice(0, limit);
    }
    const sameCategory = all.filter(
      (b) => b.slug !== currentSlug && b.category === current.category
    );
    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit);
    }
    const remaining = all.filter(
      (b) =>
        b.slug !== currentSlug &&
        b.category !== current.category &&
        b.tags.some((t) => current.tags.includes(t))
    );
    return [...sameCategory, ...remaining].slice(0, limit);
  } catch {
    return [];
  }
}

export const getAllBlogCategories = getBlogCategories;
