import { z } from 'zod';

export const heroMediaItemSchema = z.object({
  _id: z.string().optional(),
  url: z.string().min(1, 'Media URL is required'),
  type: z.enum(['image', 'video']).default('image'),
  posterUrl: z.string().optional().default(''),
  title: z.string().optional().default(''),
  caption: z.string().optional().default(''),
  order: z.number().optional().default(0),
});

export const entityHeroSchema = z.object({
  enabled: z.boolean().optional().default(true),
  eyebrow: z.string().optional().default(''),
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  description: z.string().optional().default(''),
  ctaText: z.string().optional().default(''),
  ctaLink: z.string().optional().default(''),
  backgroundImage: z.string().optional().default(''),
  overlayOpacity: z.number().min(0).max(1).optional().default(0.7),
  mediaItems: z.array(heroMediaItemSchema).optional().default([]),
});

export const updateEntityHeroSchema = z.object({
  body: entityHeroSchema.partial(),
});
