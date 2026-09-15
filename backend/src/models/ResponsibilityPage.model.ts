import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IResponsibilitySection {
  title: string;
  description: string;
  points: string[];
}

export interface IResponsibilityPage extends Document {
  hero: {
    title: string;
    subtitle: string;
    image: string;
  };
  ecological: IResponsibilitySection;
  market: IResponsibilitySection;
  social: IResponsibilitySection;
  quality: IResponsibilitySection;
  leadershipQuote: {
    quote: string;
    author: string;
    designation: string;
  };
  videos: string[];
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<IResponsibilitySection>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    points: { type: [String], default: [] },
  },
  { _id: false }
);

const ResponsibilityPageSchema = new Schema<IResponsibilityPage>(
  {
    hero: {
      title: { type: String, default: 'Corporate & Environmental Responsibility' },
      subtitle: {
        type: String,
        default: 'Committed to sustainable engineering, ethical business practices, and community welfare.',
      },
      image: { type: String, default: '/images/about_sustainability.jpg' },
    },
    ecological: {
      type: SectionSchema,
      default: {
        title: 'Ecological Responsibility',
        description:
          'Engineering energy-efficient drives, zero-spillage bagging chutes, and recyclable material compatibility to reduce industry carbon footprint.',
        points: [
          'High-efficiency IE3/IE4 motors and intelligent VFD controls',
          'Dust-tight sealing minimizing atmospheric powder loss',
          'Machinery optimized for mono-material and biodegradable pouches',
        ],
      },
    },
    market: {
      type: SectionSchema,
      default: {
        title: 'Market & Customer Responsibility',
        description:
          'Honest technical consultations, transparent pricing, guaranteed spare availability, and lifetime support commitments.',
        points: [
          'Strict adherence to CE and international machinery directives',
          'Complete Factory Acceptance Testing (FAT) before dispatch',
          'Guaranteed spare parts availability for at least 10 years',
        ],
      },
    },
    social: {
      type: SectionSchema,
      default: {
        title: 'Social & Workforce Responsibility',
        description:
          'Safe workplace standards, gender equality, skill development through our technical apprenticeship initiatives, and community upliftment.',
        points: [
          'Comprehensive safety interlocks on all moving machinery parts',
          'Structured vocational training for local polytechnic graduates',
          'Ethical sourcing and zero tolerance for unfair labor practices',
        ],
      },
    },
    quality: {
      type: SectionSchema,
      default: {
        title: 'Quality Standards & ISO Compliance',
        description:
          'Rigorous quality control protocols certified under ISO 9001:2015 ensuring mechanical perfection in every delivered component.',
        points: [
          'CMM inspection for precision machined parts',
          'Continuous 48-hour endurance testing of packaging heads',
          'Traceable material test certificates (MTC) for all steel grades',
        ],
      },
    },
    leadershipQuote: {
      quote: {
        type: String,
        default:
          'Engineering excellence is measured not only by the speed of our machines, but by the safety of the operators and the sustainability of the solutions we deploy.',
      },
      author: { type: String, default: 'Management Board' },
      designation: { type: String, default: 'AXION PackTech Leadership' },
    },
    videos: {
      type: [String],
      default: ['/public/videos/news/packaging-line-motion.mp4'],
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

export const ResponsibilityPage = mongoose.model<IResponsibilityPage>(
  'ResponsibilityPage',
  ResponsibilityPageSchema
);
