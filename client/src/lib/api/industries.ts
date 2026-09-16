import { cache } from 'react';
import { apiClient } from './client';
export type { Industry, IndustrySolution } from '@/data/industries';
import { Industry } from '@/data/industries';

function normalizeIndustry(ind: Partial<Industry>): Industry {
  return {
    title: ind.title || ind.name || 'Industry Sector',
    name: ind.name || ind.title || 'Industry Sector',
    slug: ind.slug || '',
    shortDescription: ind.shortDescription || '',
    description: ind.description || '',
    heroSubtitle: ind.heroSubtitle || ind.shortDescription || '',
    image: ind.image || '/images/industries/food-beverage.webp',
    heroImage: ind.heroImage || ind.image || '/images/industries/food-beverage-hero.webp',
    icon: ind.icon || '🏭',
    challenges: Array.isArray(ind.challenges) ? ind.challenges : [],
    solutions: Array.isArray(ind.solutions)
      ? ind.solutions.map((s) => (typeof s === 'string' ? { title: s, description: '' } : s))
      : [],
    benefits: Array.isArray(ind.benefits) ? ind.benefits : [],
    relatedCategories: Array.isArray(ind.relatedCategories) ? ind.relatedCategories : [],
    applications: Array.isArray((ind as unknown as Record<string, unknown>).applications)
      ? ((ind as unknown as Record<string, unknown>).applications as string[])
      : [],
    sortOrder: typeof (ind as unknown as Record<string, unknown>).sortOrder === 'number'
      ? ((ind as unknown as Record<string, unknown>).sortOrder as number)
      : 0,
    published: (ind as unknown as Record<string, unknown>).published !== false,
  };
}

/**
 * Fetch all published industries with live API data from MongoDB.
 */
export const getIndustries = cache(async (): Promise<Industry[]> => {
  try {
    const data = await apiClient.get<Industry[]>('/industries', {
      revalidate: 300,
      tags: ['industries', 'navbar'],
    });
    if (data && Array.isArray(data)) {
      return data.map(normalizeIndustry);
    }
    return [];
  } catch {
    return [];
  }
});

/**
 * Alias for getIndustries to match static naming.
 */
export const getAllIndustries = getIndustries;

/**
 * Fetch a single industry by slug from MongoDB.
 */
export const getIndustryBySlug = cache(async (slug: string): Promise<Industry | undefined> => {
  try {
    const data = await apiClient.get<Industry>(`/industries/${slug}`, {
      revalidate: 300,
      tags: ['industries', `industry-${slug}`],
    });
    if (data && data.slug) {
      return normalizeIndustry(data);
    }
    return undefined;
  } catch {
    return undefined;
  }
});

