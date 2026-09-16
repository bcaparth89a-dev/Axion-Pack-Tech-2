import { cache } from 'react';
import { apiClient, ApiError } from './client';
export type { NewsArticle, NewsCategory, ArticleSection } from '@/data/news';
import { NewsArticle, NewsCategory } from '@/data/news';

function normalizeNewsArticle(raw: Record<string, unknown>): NewsArticle {
  const categorySlug =
    (raw.categorySlug as string) ||
    ((raw.category as string) ? (raw.category as string).toLowerCase().replace(/\s+/g, '-') : '') ||
    'company-news';

  const categoryName =
    (raw.categoryName as string) ||
    (typeof raw.category === 'string' && !raw.category.includes('-')
      ? (raw.category as string)
      : 'Company News');

  const image =
    (raw.image as string) ||
    (raw.featuredImage as string) ||
    '/images/news/news-default.jpg';

  let contentObj: NewsArticle['content'];
  if (typeof raw.content === 'object' && raw.content !== null) {
    const rawContent = raw.content as Record<string, unknown>;
    contentObj = {
      lead: (rawContent.lead as string) || (raw.excerpt as string) || '',
      sections: Array.isArray(rawContent.sections) ? (rawContent.sections as NewsArticle['content']['sections']) : [],
      quote: rawContent.quote as NewsArticle['content']['quote'],
    };
  } else if (typeof raw.content === 'string' && raw.content) {
    contentObj = {
      lead: (raw.excerpt as string) || raw.content,
      sections: [
        {
          paragraphs: [raw.content],
        },
      ],
    };
  } else {
    contentObj = {
      lead: (raw.excerpt as string) || '',
      sections: [],
    };
  }

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

  return {
    title: (raw.title as string) || '',
    slug: (raw.slug as string) || '',
    category: categoryName,
    categorySlug,
    excerpt: (raw.excerpt as string) || '',
    content: contentObj,
    image,
    featuredImage: image,
    video: raw.video as NewsArticle['video'],
    videoUrl: (raw.videoUrl as string) || ((raw.video as { url?: string })?.url || undefined),
    publishedDate,
    published: raw.published !== false,
    author: (raw.author as string) || 'AXION PackTech Engineering Team',
    featured: Boolean(raw.featured),
    readTime: (raw.readTime as string) || (raw.readingTime as string) || '4 min read',
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
  };
}

/**
 * Fetch all news categories from MongoDB.
 */
export const getNewsCategories = cache(async (): Promise<NewsCategory[]> => {
  try {
    const data = await apiClient.get<NewsCategory[]>('/news/categories', {
      revalidate: 300,
      tags: ['news', 'news-categories'],
    });
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch {
    return [];
  }
});

export const getAllCategories = getNewsCategories;

/**
 * Fetch news category by slug.
 */
export async function getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined> {
  try {
    const cats = await getNewsCategories();
    return cats.find((c) => c.slug.toLowerCase() === (slug || '').toLowerCase());
  } catch {
    return undefined;
  }
}

/**
 * Fetch all news articles from MongoDB.
 */
export const getAllNewsArticles = cache(
  async (params?: {
    categorySlug?: string;
    featured?: boolean;
    limit?: number;
    search?: string;
  }): Promise<NewsArticle[]> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params?.limit || 50,
      };
      if (params?.categorySlug) queryParams.category = params.categorySlug;
      if (params?.featured !== undefined) queryParams.featured = params.featured;
      if (params?.search) queryParams.search = params.search;

      const res = await apiClient.get<{ items: Record<string, unknown>[] }>('/news', {
        params: queryParams,
        revalidate: 300,
        tags: ['news'],
      });
      if (res && Array.isArray(res.items)) {
        return res.items.map(normalizeNewsArticle);
      }
      return [];
    } catch {
      return [];
    }
  }
);

export const getAllNews = getAllNewsArticles;

export const getNewsBySlug = cache(
  async (slug: string): Promise<NewsArticle | undefined> => {
    try {
      const data = await apiClient.get<Record<string, unknown>>(`/news/${slug}`, {
        revalidate: 300,
        tags: ['news', `news-${slug}`],
      });
      if (data && data.title) {
        return normalizeNewsArticle(data);
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

/**
 * Fetch news articles by category slug.
 */
export async function getNewsByCategory(categorySlug: string): Promise<NewsArticle[]> {
  try {
    const all = await getAllNewsArticles({ categorySlug });
    return all.filter((a) => a.categorySlug.toLowerCase() === (categorySlug || '').toLowerCase());
  } catch {
    return [];
  }
}

/**
 * Fetch featured news articles.
 */
export async function getFeaturedNews(limit: number = 3): Promise<NewsArticle[]> {
  try {
    const all = await getAllNewsArticles({ featured: true, limit });
    const featured = all.filter((a) => a.featured).slice(0, limit);
    if (featured.length > 0) return featured;
    const allRecent = await getAllNewsArticles({ limit });
    return allRecent.slice(0, limit);
  } catch {
    return [];
  }
}

export const getFeaturedArticles = getFeaturedNews;

/**
 * Fetch related news articles.
 */
export async function getRelatedArticles(
  currentSlug: string,
  categorySlug: string,
  limit: number = 3
): Promise<NewsArticle[]> {
  try {
    const categoryArticles = await getNewsByCategory(categorySlug);
    return categoryArticles.filter((a) => a.slug !== currentSlug).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Fetch related news prioritizing same category, with slug and count.
 */
export async function getRelatedNews(currentSlug: string, count: number = 3): Promise<NewsArticle[]> {
  try {
    const all = await getAllNewsArticles();
    const current = all.find((a) => a.slug === currentSlug);
    if (!current) {
      return all.filter((a) => a.slug !== currentSlug).slice(0, count);
    }
    const sameCategory = all.filter(
      (a) => a.slug !== currentSlug && a.categorySlug === current.categorySlug
    );
    const otherCategory = all.filter(
      (a) => a.slug !== currentSlug && a.categorySlug !== current.categorySlug
    );
    return [...sameCategory, ...otherCategory].slice(0, count);
  } catch {
    return [];
  }
}
