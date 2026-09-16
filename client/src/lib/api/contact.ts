import { cache } from 'react';
import { apiClient } from './client';
import {
  ContactInfo,
  contactInfo as staticContactInfo,
  getInquiryOptionGroups as getStaticInquiryOptionGroups,
} from '@/data/contact';

export type { ContactInfo } from '@/data/contact';
export const getInquiryOptionGroups = getStaticInquiryOptionGroups;

/**
 * Fetch contact settings from the database (deduplicated per render).
 */
export const getContactInfo = cache(async function getContactInfo(): Promise<ContactInfo> {
  try {
    const data = await apiClient.get<Partial<ContactInfo>>('/contact/settings', {
      revalidate: 300,
      tags: ['contact', 'settings'],
    });
    if (data && data.companyName) {
      return {
        companyName: data.companyName,
        tagline: data.tagline || '',
        slogan: data.slogan || '',
        email: data.email || 'info@axionpacktech.com',
        phones: Array.isArray(data.phones) && data.phones.length > 0 ? data.phones : ['+91 98765 43210'],
        website: data.website || 'https://axionpacktech.com',
        address: {
          city: data.address?.city || 'Vadodara',
          state: data.address?.state || 'Gujarat',
          country: data.address?.country || 'India',
          display: data.address?.display || 'Vadodara, Gujarat, India',
        },
        social: {
          whatsapp: data.social?.whatsapp || '',
          facebook: data.social?.facebook || '',
          instagram: data.social?.instagram || '',
          email: data.social?.email || data.email || 'info@axionpacktech.com',
        },
      };
    }
    return staticContactInfo;
  } catch {
    return staticContactInfo;
  }
});

export const contactInfo = staticContactInfo;

export interface ContactSubmissionPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  subject?: string;
  message: string;
  inquiryType?: string;
  selectedProductOrService?: string;
  turnstileToken?: string;
  hp_website?: string;
}

/**
 * Submit contact inquiry to the Express backend.
 */
export async function submitContactInquiry(payload: ContactSubmissionPayload): Promise<{
  success: boolean;
  message: string;
}> {
  const body = {
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone || '',
    company: payload.company || '',
    inquiryType: payload.inquiryType || payload.subject || 'General Inquiry',
    inquiryGroup: payload.selectedProductOrService || payload.country || 'Website Inquiry',
    message: payload.message,
    turnstileToken: payload.turnstileToken,
    hp_website: payload.hp_website,
  };
  return apiClient.post('/contact', body);
}

