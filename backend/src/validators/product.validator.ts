import { z } from 'zod';
import { entityHeroSchema } from './hero.validator.js';

const mediaSchema = z
  .object({
    image: z.string().optional().default(''),
    heroImage: z.string().optional().default(''),
    videoUrl: z.string().optional().default(''),
    gallery: z.array(z.string()).optional().default([]),
  })
  .optional()
  .default({});

const specificationItemSchema = z.object({
  key: z.string().optional(),
  label: z.string().optional(),
  value: z.string().min(1, 'Specification value is required'),
  group: z.string().optional(),
});



const galleryMediaItemSchema = z.object({
  _id: z.string().optional(),
  url: z.string().min(1, 'Media URL is required'),
  type: z.enum(['image', 'video']).optional().default('image'),
  posterUrl: z.string().optional().default(''),
  title: z.string().optional().default(''),
  caption: z.string().optional().default(''),
  altText: z.string().optional().default(''),
  order: z.number().optional().default(0),
});

const catalogPdfSchema = z
  .object({
    url: z.string().optional().default(''),
    name: z.string().optional().default(''),
    size: z.number().optional().default(0),
    key: z.string().optional().default(''),
  })
  .optional();

const productBodySchema = z.object({
  name: z.string().min(1, 'Product name is required').trim(),
  slug: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  categoryId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === '' || val === 'null' || val === undefined ? null : val)),
  parentId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === '' || val === 'null' || val === undefined ? null : val)),
  catalogProductId: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === '' || val === 'null' || val === undefined ? null : val)),
  parentType: z.enum(['category', 'product', 'model', 'catalogProduct']).nullable().optional(),
  shortDescription: z.string().optional().default(''),
  description: z.string().optional().default(''),
  media: mediaSchema,
  galleryMedia: z.array(galleryMediaItemSchema).optional().default([]),
  catalogPdf: catalogPdfSchema,
  features: z.array(z.string()).optional().default([]),
  infoPoints: z.array(z.string()).optional().default([]),
  specifications: z.array(specificationItemSchema).optional().default([]),
  applications: z.array(z.string()).optional().default([]),
  benefits: z.array(z.string()).optional().default([]),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  hero: entityHeroSchema.optional(),
});

export const createProductSchema = z.object({
  body: productBodySchema,
});

export const updateProductSchema = z.object({
  body: productBodySchema.partial(),
});

export const reorderProductsSchema = z.object({
  body: z.object({
    orders: z
      .array(
        z.object({
          id: z.string().min(1, 'Product ID is required'),
          displayOrder: z.number().int(),
        })
      )
      .min(1, 'At least one order item is required'),
  }),
});
