import { z } from 'zod';

const solutionItemSchema = z.union([
  z.object({
    title: z.string().min(1, 'Solution title is required'),
    description: z.string().default(''),
  }),
  z.string().transform((title) => ({ title, description: '' })),
]);

const industryBodySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
  shortDescription: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  heroSubtitle: z.string().optional(),
  icon: z.string().optional(),
  challenges: z.array(z.string()).optional(),
  solutions: z.array(solutionItemSchema).optional(),
  benefits: z.array(z.string()).optional(),
  compliance: z.array(z.string()).optional(),
  applications: z.array(z.string()).optional(),
  relatedCategories: z.array(z.string()).optional(),
  recommendedProducts: z
    .array(
      z.object({
        title: z.string(),
        slug: z.string(),
        categorySlug: z.string(),
        description: z.string().optional(),
        image: z.string(),
      })
    )
    .optional(),
  image: z.string().min(1, 'Image is required'),
  heroImage: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      canonicalUrl: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
});

export const industrySchema = z.object({
  body: industryBodySchema,
});

export const updateIndustrySchema = z.object({
  body: industryBodySchema.partial(),
});

export const reorderIndustriesSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        slug: z.string().min(1, 'Slug is required'),
        sortOrder: z.number().int(),
      })
    ).min(1, 'At least one order item is required'),
  }),
});

