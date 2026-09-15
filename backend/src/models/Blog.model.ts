import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IBlogContentSection {
  heading: string;
  body: string;
  bulletPoints?: string[];
  callout?: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName?: string;
  category?: mongoose.Types.ObjectId;
  excerpt: string;
  content: string;
  introduction?: string;
  sections?: IBlogContentSection[];
  conclusion?: string;
  image?: string;
  featuredImage: string;
  author: string;
  authorRole?: string;
  readTime: string;
  readingTime?: string;
  publishedDate?: string;
  tags: string[];
  published: boolean;
  publishedAt: Date;
  featured: boolean;
  sortOrder: number;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const BlogContentSectionSchema = new Schema<IBlogContentSection>(
  {
    heading: { type: String, default: '' },
    body: { type: String, default: '' },
    bulletPoints: { type: [String], default: [] },
    callout: { type: String, default: '' },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
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
    categorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    introduction: {
      type: String,
      default: '',
    },
    sections: {
      type: [BlogContentSectionSchema],
      default: [],
    },
    conclusion: {
      type: String,
      default: '',
    },
    image: {
      type: String,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      default: 'AXION PackTech Technical Editorial',
      trim: true,
    },
    authorRole: {
      type: String,
      default: 'Technical Editorial',
      trim: true,
    },
    readTime: {
      type: String,
      default: '5 min read',
      trim: true,
    },
    readingTime: {
      type: String,
      default: '5 min read',
      trim: true,
    },
    publishedDate: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
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

BlogSchema.index({ slug: 1, published: 1 });
BlogSchema.index({ categorySlug: 1, published: 1, publishedAt: -1 });
BlogSchema.index({ published: 1, publishedAt: -1 });
BlogSchema.index({ featured: 1, published: 1 });
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
