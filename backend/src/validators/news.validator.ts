import { z } from 'zod';

export const newsCategorySchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Category title is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
    description: z.string().optional(),
    badge: z.string().optional(),
    icon: z.string().optional(),
    sortOrder: z.number().int().optional(),
  }),
});

export const newsSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'News title is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
    categorySlug: z.string().min(2, 'Category slug is required').optional(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    excerpt: z.string().min(5, 'Excerpt must be at least 5 characters'),
    content: z
      .union([
        z.string(),
        z.object({
          lead: z.string().optional(),
          sections: z.array(z.any()).optional().default([]),
          quote: z
            .object({
              text: z.string(),
              author: z.string(),
              role: z.string(),
            })
            .optional(),
        }),
        z.record(z.any()),
      ])
      .optional()
      .default(''),
    image: z.string().optional(),
    featuredImage: z.string().optional(),
    video: z
      .object({
        type: z.enum(['local', 'embed']),
        url: z.string(),
      })
      .optional(),
    videoUrl: z.string().optional(),
    author: z.string().optional().default('AXION PackTech Engineering Team'),
    readTime: z.string().optional().default('4 min read'),
    readingTime: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    published: z.boolean().optional().default(true),
    publishedAt: z.union([z.string(), z.date()]).optional(),
    featured: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
    seo: z
      .object({
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        canonicalUrl: z.string().optional(),
        ogImage: z.string().optional(),
      })
      .optional(),
  }),
});

export const updateNewsSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    categorySlug: z.string().optional(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    excerpt: z.string().optional(),
    content: z
      .union([
        z.string(),
        z.object({
          lead: z.string().optional(),
          sections: z.array(z.any()).optional(),
          quote: z
            .object({
              text: z.string(),
              author: z.string(),
              role: z.string(),
            })
            .optional(),
        }),
        z.record(z.any()),
      ])
      .optional(),
    image: z.string().optional(),
    featuredImage: z.string().optional(),
    video: z
      .object({
        type: z.enum(['local', 'embed']),
        url: z.string(),
      })
      .optional(),
    videoUrl: z.string().optional(),
    author: z.string().optional(),
    readTime: z.string().optional(),
    readingTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    publishedAt: z.union([z.string(), z.date()]).optional(),
    featured: z.boolean().optional(),
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
  }),
});

export const reorderNewsSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        slug: z.string().min(1, 'Slug is required'),
        sortOrder: z.number().int(),
      })
    ).min(1, 'At least one order item is required'),
  }),
});
