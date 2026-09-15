import { cache } from 'react';
import { apiClient } from './client';
import {
  CareerOpportunity,
  CareerType,
  CareerCategorySlug,
  CareerCategoryInfo,
  careerOpportunities as staticCareers,
  careerCategories as staticCareerCategories,
  getCareerBySlug as getStaticCareerBySlug,
  getCareersByType as getStaticCareersByType,
  getCategoryBySlug as getStaticCategoryBySlug,
  getCareerCounts as getStaticCareerCounts,
  typeToCategorySlug,
  categorySlugToType,
} from '@/data/careers';

export type { CareerOpportunity, CareerType, CareerCategorySlug, CareerCategoryInfo };
export { typeToCategorySlug, categorySlugToType };

export const careerCategories = staticCareerCategories;
export const careers = staticCareers;
export const careerOpportunities = staticCareers;

function normalizeCareer(raw: Record<string, unknown>): CareerOpportunity {
  return {
    id: ((raw._id || raw.id || raw.slug) as string) || '',
    slug: (raw.slug as string) || '',
    title: (raw.title as string) || '',
    type: (raw.type as CareerType) || 'job',
    department: (raw.department as string) || '',
    location: (raw.location as string) || 'Vadodara, Gujarat, India',
    employmentType: (raw.employmentType as string) || 'Full-Time',
    experience: (raw.experience as string) || 'Not specified',
    shortDescription: (raw.shortDescription as string) || '',
    description: (raw.description as string) || '',
    image: (raw.image as string) || '',
    postedDate: (raw.postedDate as string) || '',
    applicationDeadline: (raw.applicationDeadline as string) || 'Open Until Filled',
    eligibility: Array.isArray(raw.eligibility) ? (raw.eligibility as string[]) : [],
    responsibilities: Array.isArray(raw.responsibilities) ? (raw.responsibilities as string[]) : [],
    requirements: Array.isArray(raw.requirements || raw.qualifications)
      ? ((raw.requirements || raw.qualifications) as string[])
      : [],
    skills: Array.isArray(raw.skills) ? (raw.skills as string[]) : [],
    selectionProcess: Array.isArray(raw.selectionProcess) ? (raw.selectionProcess as string[]) : [],
    isActive:
      raw.isActive !== undefined
        ? Boolean(raw.isActive)
        : raw.published !== false && raw.status === 'active',
    duration: raw.duration as string | undefined,
    stipendOrBenefits: raw.stipendOrBenefits as string | undefined,
    mentorSupport: raw.mentorSupport as string | undefined,
    certification: raw.certification as string | undefined,
  };
}

/**
 * Fetch all careers with live API data.
 */
export const getAllCareers = cache(
  async (params?: {
    type?: CareerType;
    department?: string;
    limit?: number;
  }): Promise<CareerOpportunity[]> => {
    try {
      const queryParams: Record<string, string | number | boolean | undefined> = {
        limit: params?.limit || 50,
      };
      if (params?.type) queryParams.type = params.type;
      if (params?.department) queryParams.department = params.department;

      const res = await apiClient.get<{ items: Record<string, unknown>[] }>('/careers', {
        params: queryParams,
        revalidate: 300,
        tags: ['careers'],
      });
      if (res && Array.isArray(res.items)) {
        return res.items.map(normalizeCareer);
      }
      return staticCareers;
    } catch {
      return staticCareers;
    }
  }
);

export interface CareerApplicationSubmissionResult {
  _id: string;
  candidateName: string;
  email: string;
  phone: string;
  careerTitle: string;
  careerSlug: string;
  status: string;
}

/**
 * Submit candidate career application with resume file.
 */
export async function submitCareerApplication(
  formData: FormData,
  slug?: string
): Promise<CareerApplicationSubmissionResult> {
  const targetUrl = slug ? `/careers/${slug}/apply` : '/careers/apply';
  return apiClient.upload<CareerApplicationSubmissionResult>(targetUrl, formData);
}

/**
 * Fetch a single career by slug (supports both single slug and type + slug).
 */
export const getCareerBySlug = cache(
  async (
    typeOrSlug: string,
    opportunitySlug?: string
  ): Promise<CareerOpportunity | undefined> => {
    const actualSlug = opportunitySlug ? opportunitySlug : typeOrSlug;
    try {
      const data = await apiClient.get<Record<string, unknown>>(`/careers/${actualSlug}`, {
        revalidate: 300,
        tags: ['careers', `career-${actualSlug}`],
      });
      if (data && data.title) {
        return normalizeCareer(data);
      }
      return undefined;
    } catch {
      const fallback = opportunitySlug
        ? getStaticCareerBySlug(typeOrSlug, opportunitySlug)
        : staticCareers.find((c) => c.slug === actualSlug);
      return fallback ? normalizeCareer(fallback as unknown as Record<string, unknown>) : undefined;
    }
  }
);

/**
 * Fetch careers filtered by type ('job', 'internship', 'apprenticeship').
 */
export async function getCareersByType(type: CareerType): Promise<CareerOpportunity[]> {
  try {
    const all = await getAllCareers({ type });
    const filtered = all.filter((c) => c.type === type && c.isActive);
    if (filtered.length > 0) return filtered;
    return getStaticCareersByType(type);
  } catch {
    return getStaticCareersByType(type);
  }
}

/**
 * Get category info by category slug ('jobs', 'internships', 'apprenticeships').
 */
export function getCategoryBySlug(categorySlug: CareerCategorySlug | string): CareerCategoryInfo | undefined {
  return getStaticCategoryBySlug(categorySlug as CareerCategorySlug);
}

export const getCareerCategoryInfo = getCategoryBySlug;

/**
 * Get live career counts across jobs, internships, apprenticeships.
 */
export const getCareerCounts = cache(
  async (): Promise<{
    all: number;
    jobs: number;
    internships: number;
    apprenticeships: number;
  }> => {
    try {
      const all = await getAllCareers();
      const active = all.filter((c) => c.isActive);
      return {
        all: active.length,
        jobs: active.filter((c) => c.type === 'job').length,
        internships: active.filter((c) => c.type === 'internship').length,
        apprenticeships: active.filter((c) => c.type === 'apprenticeship').length,
      };
    } catch {
      const sc = getStaticCareerCounts();
      return {
        all: sc.total,
        jobs: sc.jobs,
        internships: sc.internships,
        apprenticeships: sc.apprenticeships,
      };
    }
  }
);
