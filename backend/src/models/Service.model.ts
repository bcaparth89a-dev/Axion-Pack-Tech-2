import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IServiceSolution {
  title: string;
  description: string;
}

export interface IServiceStat {
  label: string;
  value: string;
}

export interface IServiceCTA {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface IService extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  heroVideo?: string;
  overview?: string;
  description: string;
  icon?: string;
  image: string;
  capabilities: string[];
  features: string[];
  benefits: string[];
  process: string[];
  solutions: IServiceSolution[];
  relatedProducts: string[];
  relatedIndustries: string[];
  stats: IServiceStat[];
  cta?: IServiceCTA;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    heroTitle: {
      type: String,
      default: '',
      trim: true,
    },
    heroDescription: {
      type: String,
      default: '',
      trim: true,
    },
    heroImage: {
      type: String,
      default: '',
      trim: true,
    },
    heroVideo: {
      type: String,
      default: '',
      trim: true,
    },
    overview: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      default: '🔧',
    },
    image: {
      type: String,
      required: true,
    },
    capabilities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    process: {
      type: [String],
      default: [],
    },
    solutions: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '', trim: true },
      },
    ],
    relatedProducts: {
      type: [String],
      default: [],
    },
    relatedIndustries: {
      type: [String],
      default: [],
    },
    stats: [
      {
        label: { type: String, required: true, trim: true },
        value: { type: String, required: true, trim: true },
      },
    ],
    cta: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      buttonText: { type: String, default: '' },
      buttonLink: { type: String, default: '' },
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
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

ServiceSchema.index({ slug: 1, published: 1 });
ServiceSchema.index({ published: 1, sortOrder: 1 });

export const Service = mongoose.model<IService>('Service', ServiceSchema);
