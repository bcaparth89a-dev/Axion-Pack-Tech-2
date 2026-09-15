import { z } from 'zod';

const solutionItemSchema = z.union([
  z.object({
    title: z.string().min(1, 'Solution title is required'),
    description: z.string().default(''),
  }),
  z.string().transform((title) => ({ title, description: '' })),
]);

const statItemSchema = z.object({
  label: z.string().min(1, 'Stat label is required'),
  value: z.string().min(1, 'Stat value is required'),
});

const serviceBodySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
  shortDescription: z.string().optional(),
  heroTitle: z.string().optional(),
  heroDescription: z.string().optional(),
  heroImage: z.string().optional(),
  heroVideo: z.string().optional(),
  overview: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  capabilities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  process: z.array(z.string()).optional(),
  solutions: z.array(solutionItemSchema).optional(),
  relatedProducts: z.array(z.string()).optional(),
  relatedIndustries: z.array(z.string()).optional(),
  stats: z.array(statItemSchema).optional(),
  cta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      buttonText: z.string().optional(),
      buttonLink: z.string().optional(),
    })
    .optional(),
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

export const serviceSchema = z.object({
  body: serviceBodySchema,
});

export const updateServiceSchema = z.object({
  body: serviceBodySchema.partial(),
});

export const reorderServicesSchema = z.object({
  body: z.object({
    orders: z
      .array(
        z.object({
          slug: z.string().min(1, 'Slug is required'),
          sortOrder: z.number().int(),
        })
      )
      .min(1, 'At least one order item is required'),
  }),
});

