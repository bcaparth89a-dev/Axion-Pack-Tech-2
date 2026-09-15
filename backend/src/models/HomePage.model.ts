import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IHomePage extends Document {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    videoLandscapeUrl?: string;
    videoPortraitUrl?: string;
  };
  intro: {
    tagline: string;
    title: string;
    subtitle: string;
    description: string;
    points: string[];
  };
  previews: {
    productsTitle: string;
    productsSubtitle: string;
    industriesTitle: string;
    industriesSubtitle: string;
    servicesTitle: string;
    servicesSubtitle: string;
    careersTitle: string;
    careersSubtitle: string;
    blogTitle: string;
    blogSubtitle: string;
    newsTitle: string;
    newsSubtitle: string;
  };
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const HomePageSchema = new Schema<IHomePage>(
  {
    hero: {
      badge: { type: String, default: 'Engineering Packaging Excellence' },
      title: { type: String, default: 'Industrial Packaging & Bagging Automation Solutions' },
      subtitle: {
        type: String,
        default:
          'Turnkey engineering systems, high-speed baggers, robotic palletizers, and end-of-line packaging machinery designed for global manufacturing scale.',
      },
      primaryButtonText: { type: String, default: 'Explore Machinery' },
      primaryButtonLink: { type: String, default: '/products' },
      secondaryButtonText: { type: String, default: 'Request RFQ' },
      secondaryButtonLink: { type: String, default: '/contact' },
      videoLandscapeUrl: { type: String, default: '/landscape splash screen.mp4' },
      videoPortraitUrl: { type: String, default: '/portrait splash screen.mp4' },
    },
    intro: {
      tagline: { type: String, default: 'Engineering For A Better Tomorrow' },
      title: { type: String, default: 'Pioneering Packaging Technology Since 2012' },
      subtitle: {
        type: String,
        default: 'Turnkey industrial solutions with German-grade engineering precision.',
      },
      description: {
        type: String,
        default:
          'AXION PackTech is an industry leader in manufacturing high-precision automated filling systems, robust bag closers, carton formers, and integrated conveyors.',
      },
      points: {
        type: [String],
        default: [
          'Turnkey plant layout and customized 3D machinery integration',
          'Heavy-duty industrial build for 24/7 continuous operation',
          'Global parts availability and 24-hour service SLA support',
        ],
      },
    },
    previews: {
      productsTitle: { type: String, default: 'Industrial Packaging Divisions' },
      productsSubtitle: {
        type: String,
        default: 'High-speed automated machinery engineered for demanding production environments.',
      },
      industriesTitle: { type: String, default: 'Key Sectors We Serve' },
      industriesSubtitle: {
        type: String,
        default: 'Specialized material handling solutions conforming to strict industrial standards.',
      },
      servicesTitle: { type: String, default: 'Comprehensive Lifecycle Services' },
      servicesSubtitle: {
        type: String,
        default: 'From plant design and installation to long-term AMC and OEM retrofits.',
      },
      careersTitle: { type: String, default: 'Build Your Engineering Career' },
      careersSubtitle: {
        type: String,
        default: 'Join a world-class team innovating in mechatronics, assembly, and automation.',
      },
      blogTitle: { type: String, default: 'Engineering & Technical Insights' },
      blogSubtitle: {
        type: String,
        default: 'Industry articles, maintenance advice, and modern packaging automation guides.',
      },
      newsTitle: { type: String, default: 'Latest News & Corporate Updates' },
      newsSubtitle: {
        type: String,
        default: 'Company announcements, exhibition showcases, and technology breakthroughs.',
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      canonicalUrl: String,
      ogImage: String,
    },
  },
  {
    timestamps: true,
  }
);

export const HomePage = mongoose.model<IHomePage>('HomePage', HomePageSchema);
