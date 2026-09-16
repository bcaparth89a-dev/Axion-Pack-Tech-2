import { cache } from 'react';
import { apiClient } from './client';

export interface SiteSettingsData {
  siteName: string;
  siteTitle: string;
  logoUrl: string;
  faviconUrl: string;
  metaDescription: string;
  copyrightText: string;
  footerTagline: string;
  maintenanceMode: boolean;
  [key: string]: unknown;
}

export interface CompanyStatItem {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  sortOrder: number;
}

export interface CompanyStatsData {
  stats: CompanyStatItem[];
  isActive: boolean;
}

const defaultSiteSettings: SiteSettingsData = {
  siteName: 'AXION PackTech',
  siteTitle: 'AXION PackTech — Industrial Packaging, Bagging & Automation Solutions',
  logoUrl: '/logo.jpeg',
  faviconUrl: '/favicon.ico',
  metaDescription:
    'Next-generation industrial packaging, high-speed bagging systems, robotic automation, and turnkey engineering solutions.',
  copyrightText: '© 2026 AXION PackTech. All Rights Reserved.',
  footerTagline: 'Engineering for a Better Tomorrow.',
  maintenanceMode: false,
};

export const getSiteSettings = cache(async (): Promise<SiteSettingsData> => {
  try {
    const data = await apiClient.get<SiteSettingsData>('/settings', {
      revalidate: 300,
      tags: ['settings', 'site-settings'],
    });
    if (data && data.siteName) return data;
    return defaultSiteSettings;
  } catch {
    return defaultSiteSettings;
  }
});

export const getCompanyStats = cache(async (): Promise<CompanyStatsData> => {
  try {
    // Try /pages/stats first (standard CMS route for company stats)
    let data: CompanyStatsData | null = null;
    try {
      data = await apiClient.get<CompanyStatsData>('/pages/stats', {
        revalidate: 300,
        tags: ['settings', 'company-stats', 'pages'],
      });
    } catch {
      // Fallback to /settings/stats alias
      data = await apiClient.get<CompanyStatsData>('/settings/stats', {
        revalidate: 300,
        tags: ['settings', 'company-stats'],
      });
    }

    if (data && Array.isArray(data.stats)) {
      return {
        stats: data.stats.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
        isActive: data.isActive !== false,
      };
    }
    return { stats: [], isActive: false };
  } catch {
    return { stats: [], isActive: false };
  }
});
