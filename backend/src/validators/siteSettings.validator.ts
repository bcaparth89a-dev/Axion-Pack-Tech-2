import { z } from 'zod';

export const updateSiteSettingsSchema = z.object({
  body: z.object({
    siteName: z.string().optional(),
    siteTitle: z.string().optional(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    metaDescription: z.string().optional(),
    defaultSeo: z
      .object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
    copyrightText: z.string().optional(),
    footerTagline: z.string().optional(),
    maintenanceMode: z.boolean().optional(),
  }),
});
