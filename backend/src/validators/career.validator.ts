import { z } from 'zod';

export const careerSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Job title is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with dashes'),
    type: z.enum(['job', 'internship', 'apprenticeship']),
    department: z.string().min(2, 'Department is required'),
    location: z.string().default('Vadodara, Gujarat, India'),
    employmentType: z.string().optional(),
    experience: z.string().default('Not specified'),
    shortDescription: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    image: z.string().optional(),
    postedDate: z.string().optional(),
    applicationDeadline: z.string().optional(),
    eligibility: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    qualifications: z.array(z.string()).optional(),
    requirements: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    selectionProcess: z.array(z.string()).optional(),
    duration: z.string().optional(),
    stipendOrBenefits: z.string().optional(),
    mentorSupport: z.string().optional(),
    certification: z.string().optional(),
    published: z.boolean().optional(),
    status: z.enum(['active', 'closed']).default('active'),
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

export const careerApplicationSchema = z
  .object({
    params: z
      .object({
        slug: z.string().optional(),
      })
      .optional(),
    body: z.object({
      candidateName: z.string().min(2, 'Full name is required').optional(),
      fullName: z.string().min(2, 'Full name is required').optional(),
      email: z.string().email('Valid email is required'),
      phone: z.string().min(8, 'Valid contact number is required'),
      careerSlug: z.string().optional(),
      careerTitle: z.string().optional(),
      position: z.string().optional(),
      coverMessage: z.string().optional(),
      address: z.string().optional(),
      education: z.string().optional(),
      experience: z.string().optional(),
      portfolioUrl: z.string().optional(),
      resumeUrl: z.string().optional(),
      resumeKey: z.string().optional(),
      turnstileToken: z.string().optional(),
      hp_website: z.string().optional(),
    }),
  })
  .refine((data) => data.body.candidateName || data.body.fullName, {
    message: 'Full name is required',
    path: ['body', 'fullName'],
  })
  .refine(
    (data) =>
      data.body.careerSlug ||
      data.body.careerTitle ||
      data.body.position ||
      data.params?.slug,
    {
      message: 'Position / Job Opening is required',
      path: ['body', 'careerSlug'],
    }
  );

export const updateCareerApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'hired', 'pending', 'reviewed']),
    notes: z.string().optional(),
  }),
});
