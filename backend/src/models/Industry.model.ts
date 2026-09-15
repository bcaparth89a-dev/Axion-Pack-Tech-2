import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IIndustrySolution {
  title: string;
  description: string;
}

export interface IIndustryRecommendedProduct {
  title: string;
  slug: string;
  categorySlug: string;
  description: string;
  image: string;
}

export interface IIndustry extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  heroSubtitle?: string;
  icon?: string;
  challenges: string[];
  solutions: IIndustrySolution[];
  benefits: string[];
  compliance: string[];
  applications: string[];
  relatedCategories: string[];
  recommendedProducts: IIndustryRecommendedProduct[];
  image: string;
  heroImage?: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const SolutionSchema = new Schema<IIndustrySolution>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const RecommendedProductSchema = new Schema<IIndustryRecommendedProduct>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    categorySlug: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, required: true },
  },
  { _id: false }
);

const IndustrySchema = new Schema<IIndustry>(
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: '',
      trim: true,
    },
    challenges: {
      type: [String],
      default: [],
    },
    solutions: {
      type: [SolutionSchema],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    compliance: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    relatedCategories: {
      type: [String],
      default: [],
    },
    recommendedProducts: {
      type: [RecommendedProductSchema],
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    heroImage: {
      type: String,
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

IndustrySchema.index({ slug: 1, published: 1 });
IndustrySchema.index({ published: 1, sortOrder: 1 });
IndustrySchema.index({ featured: 1, published: 1 });

export const Industry = mongoose.model<IIndustry>('Industry', IndustrySchema);
