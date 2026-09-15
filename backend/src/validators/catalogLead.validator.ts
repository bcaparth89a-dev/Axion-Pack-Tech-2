import { z } from 'zod';

export const submitCatalogLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(5, 'Phone number must be at least 5 digits').max(30, 'Phone number is too long'),
    company: z.string().max(150, 'Company name is too long').optional(),
    requirement: z.string().max(2000, 'Requirement description is too long').optional(),
    catalogName: z.string().min(1, 'Catalog name is required'),
    entityType: z.enum(['category', 'product', 'model', 'general']).optional(),
    entitySlug: z.string().optional(),
    pdfUrl: z.string().optional(),
    turnstileToken: z.string().optional(),
    hp_website: z.string().optional(),
  }),
});

export const updateCatalogLeadStatusSchema = z.object({
  body: z.object({
    status: z.enum(['unread', 'contacted', 'resolved', 'archived']),
    notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
  }),
});
