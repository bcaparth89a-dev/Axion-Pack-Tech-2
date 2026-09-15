import { z } from 'zod';

export const blogCategorySchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Category title is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
    description: z.string().optional().default(''),
    badge: z.string().optional().default(''),
    icon: z.string().optional().default('📝'),
    sortOrder: z.number().int().optional().default(0),
  }),
});

export const blogSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Blog title is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
    categorySlug: z.string().optional(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    excerpt: z.string().min(5, 'Excerpt must be at least 5 characters'),
    content: z.string().optional().default(''),
    introduction: z.string().optional().default(''),
    sections: z
      .array(
        z.object({
          heading: z.string().optional().default(''),
          body: z.string().optional().default(''),
          bulletPoints: z.array(z.string()).optional().default([]),
          callout: z.string().optional().default(''),
        })
      )
      .optional()
      .default([]),
    conclusion: z.string().optional().default(''),
    image: z.string().optional(),
    featuredImage: z.string().optional(),
    author: z.string().optional().default('AXION PackTech Technical Editorial'),
    authorRole: z.string().optional().default('Packaging Machinery Specialist'),
    readTime: z.string().optional().default('5 min read'),
    readingTime: z.string().optional().default('5 min read'),
    publishedDate: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    published: z.boolean().optional().default(true),
    publishedAt: z.union([z.string(), z.date()]).optional(),
    featured: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
    seo: z
      .object({
        metaTitle: z.string().optional().default(''),
        metaDescription: z.string().optional().default(''),
        keywords: z.array(z.string()).optional().default([]),
        canonicalUrl: z.string().optional().default(''),
        ogImage: z.string().optional().default(''),
      })
      .optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    categorySlug: z.string().optional(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    introduction: z.string().optional(),
    sections: z
      .array(
        z.object({
          heading: z.string().optional().default(''),
          body: z.string().optional().default(''),
          bulletPoints: z.array(z.string()).optional().default([]),
          callout: z.string().optional().default(''),
        })
      )
      .optional(),
    conclusion: z.string().optional(),
    image: z.string().optional(),
    featuredImage: z.string().optional(),
    author: z.string().optional(),
    authorRole: z.string().optional(),
    readTime: z.string().optional(),
    readingTime: z.string().optional(),
    publishedDate: z.string().optional(),
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

export const reorderBlogsSchema = z.object({
  body: z.object({
    orders: z.array(
      z.object({
        slug: z.string().min(1, 'Slug is required'),
        sortOrder: z.number().int(),
      })
    ).min(1, 'At least one order item is required'),
  }),
});
