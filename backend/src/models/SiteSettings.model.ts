import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface ISiteSettings extends Document {
  siteName: string;
  siteTitle: string;
  logoUrl: string;
  faviconUrl: string;
  metaDescription: string;
  defaultSeo: SeoMetadata;
  copyrightText: string;
  footerTagline: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: 'AXION PackTech' },
    siteTitle: {
      type: String,
      default: 'AXION PackTech — Industrial Packaging, Bagging & Automation Solutions',
    },
    logoUrl: { type: String, default: '/logo.jpeg' },
    faviconUrl: { type: String, default: '/favicon.ico' },
    metaDescription: {
      type: String,
      default:
        'Next-generation industrial packaging, high-speed bagging systems, robotic automation, and turnkey engineering solutions.',
    },
    defaultSeo: {
      metaTitle: {
        type: String,
        default: 'AXION PackTech — Industrial Packaging, Bagging & Automation Solutions',
      },
      metaDescription: {
        type: String,
        default:
          'Next-generation industrial packaging, high-speed bagging systems, robotic automation, and turnkey engineering solutions.',
      },
      keywords: {
        type: [String],
        default: [
          'Packaging Machinery',
          'Bagging Machine',
          'VFFS Machine',
          'Open Mouth Bagger',
          'Industrial Automation',
          'Vadodara Gujarat India',
        ],
      },
      canonicalUrl: { type: String, default: 'https://www.axionpacktech.com' },
      ogImage: { type: String, default: '/logo.jpeg' },
    },
    copyrightText: {
      type: String,
      default: '© 2026 AXION PackTech. All Rights Reserved.',
    },
    footerTagline: {
      type: String,
      default: 'Engineering for a Better Tomorrow.',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const SiteSettings = mongoose.model<ISiteSettings>(
  'SiteSettings',
  SiteSettingsSchema
);
