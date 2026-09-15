import { z } from 'zod';

export const submitContactInquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().or(z.literal('')),
    company: z.string().optional(),
    inquiryGroup: z.string().optional(),
    inquiryType: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
    turnstileToken: z.string().optional(),
    hp_website: z.string().optional(),
  }),
});

export const updateContactSettingsSchema = z.object({
  body: z.object({
    companyName: z.string().optional(),
    tagline: z.string().optional(),
    slogan: z.string().optional(),
    email: z.string().email().optional(),
    phones: z.array(z.string()).optional(),
    website: z.string().optional(),
    address: z
      .object({
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        display: z.string().optional(),
        fullStreet: z.string().optional(),
        postalCode: z.string().optional(),
      })
      .optional(),
    social: z
      .object({
        whatsapp: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    businessHours: z
      .object({
        weekdays: z.string().optional(),
        saturday: z.string().optional(),
        sunday: z.string().optional(),
      })
      .optional(),
  }),
});
