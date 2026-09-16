import { cache } from 'react';
import { apiClient } from './client';
export type { Service, ServiceSolution, ServiceStat, ServiceCTA, ServiceSEO } from '@/data/services';
import { Service } from '@/data/services';

function normalizeService(srv: Partial<Service>): Service {
  return {
    _id: srv._id,
    title: srv.title || 'Engineering Service',
    slug: srv.slug || '',
    shortDescription: srv.shortDescription || '',
    heroTitle: srv.heroTitle || srv.title || 'Engineering Service',
    heroDescription: srv.heroDescription || srv.shortDescription || '',
    heroImage: srv.heroImage || srv.image || '/images/services/engineering-design.webp',
    heroVideo: srv.heroVideo || '',
    overview: srv.overview || '',
    description: srv.description || srv.shortDescription || '',
    image: srv.image || '/images/services/engineering-design.webp',
    icon: srv.icon || '🔧',
    capabilities: Array.isArray(srv.capabilities) ? srv.capabilities : [],
    features: Array.isArray(srv.features) ? srv.features : [],
    benefits: Array.isArray(srv.benefits) ? srv.benefits : [],
    process: Array.isArray(srv.process) ? srv.process : [],
    solutions: Array.isArray(srv.solutions)
      ? srv.solutions.map((s) => (typeof s === 'string' ? { title: s, description: '' } : s))
      : [],
    relatedProducts: Array.isArray(srv.relatedProducts) ? srv.relatedProducts : [],
    relatedIndustries: Array.isArray(srv.relatedIndustries) ? srv.relatedIndustries : [],
    stats: Array.isArray(srv.stats) ? srv.stats : [],
    cta: srv.cta || {
      title: 'Need Support for Your Production System?',
      description:
        'Talk to our engineering team to discuss your production requirements and discover the right solution for your operation.',
      buttonText: 'Request a Quote',
      buttonLink: '/contact',
    },
    published: srv.published !== false,
    featured: srv.featured || false,
    sortOrder: typeof srv.sortOrder === 'number' ? srv.sortOrder : 0,
    seo: srv.seo || {
      metaTitle: `${srv.title} | AXION PackTech Services`,
      metaDescription: srv.shortDescription,
      keywords: [],
    },
  };
}

/**
 * Fetch all published services from MongoDB with live API data.
 */
export const getServices = cache(async (): Promise<Service[]> => {
  try {
    const data = await apiClient.get<Service[]>('/services', {
      revalidate: 300,
      tags: ['services', 'navbar'],
    });
    if (data && Array.isArray(data)) {
      return data.map(normalizeService);
    }
    return [];
  } catch {
    return [];
  }
});

/**
 * Alias for getServices to match static naming.
 */
export const getAllServices = getServices;

/**
 * Fetch a single service by slug with live API data from MongoDB.
 */
export const getServiceBySlug = cache(async (slug: string): Promise<Service | undefined> => {
  const cleanSlug = (slug || '').toLowerCase().trim();
  try {
    const data = await apiClient.get<Service>(`/services/${cleanSlug}`, {
      revalidate: 300,
      tags: ['services', `service-${cleanSlug}`],
    });
    if (data && data.slug) {
      return normalizeService(data);
    }
    return undefined;
  } catch {
    return undefined;
  }
});
