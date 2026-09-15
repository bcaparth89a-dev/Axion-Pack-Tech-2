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

const defaultCompanyStats: CompanyStatsData = {
  stats: [
    { label: 'ESTABLISHED', value: '2000', sortOrder: 1 },
    { label: 'PRODUCTS', value: '25+', sortOrder: 2 },
    { label: 'INDUSTRIES SERVED', value: '4000+', sortOrder: 3 },
    { label: 'PROJECTS EXECUTED', value: '2500+', sortOrder: 4 },
  ],
  isActive: true,
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
    const data = await apiClient.get<CompanyStatsData>('/settings/stats', {
      revalidate: 300,
      tags: ['settings', 'company-stats'],
    });
    if (data && data.stats && data.stats.length > 0) return data;
    return defaultCompanyStats;
  } catch {
    return defaultCompanyStats;
  }
});
