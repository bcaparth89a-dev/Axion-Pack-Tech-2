import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IArticleSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface INewsContent {
  lead?: string;
  sections: IArticleSection[];
  quote?: {
    text: string;
    author: string;
    role: string;
  };
}

export interface INewsVideo {
  type: 'local' | 'embed';
  url: string;
}

export interface INews extends Document {
  title: string;
  slug: string;
  categorySlug: string;
  categoryName?: string;
  category?: mongoose.Types.ObjectId;
  excerpt: string;
  content: INewsContent | string;
  image?: string;
  featuredImage: string;
  video?: INewsVideo;
  videoUrl?: string;
  author: string;
  readTime: string;
  tags: string[];
  published: boolean;
  publishedAt: Date;
  featured: boolean;
  sortOrder: number;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
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
      ref: 'NewsCategory',
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
    },
    image: {
      type: String,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    video: {
      type: {
        type: String,
        enum: ['local', 'embed'],
      },
      url: { type: String },
    },
    videoUrl: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'AXION PackTech Engineering Team',
      trim: true,
    },
    readTime: {
      type: String,
      default: '4 min read',
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

NewsSchema.index({ slug: 1, published: 1 });
NewsSchema.index({ categorySlug: 1, published: 1, publishedAt: -1 });
NewsSchema.index({ published: 1, publishedAt: -1 });
NewsSchema.index({ featured: 1, published: 1 });
NewsSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export const News = mongoose.model<INews>('News', NewsSchema);
