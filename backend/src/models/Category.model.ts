import mongoose, { Document, Schema } from 'mongoose';
import { IEntityHero, EntityHeroSchema } from './Hero.schema.js';

export interface ICategoryMedia {
  image?: string;
  heroImage?: string;
  videoUrl?: string;
  gallery?: string[];
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  catalogProductId?: mongoose.Types.ObjectId | null;
  parentCategoryId?: mongoose.Types.ObjectId | null;
  parentId?: mongoose.Types.ObjectId | null;
  parentType?: 'category' | 'product' | 'model' | 'catalogProduct' | null;
  shortDescription?: string;
  description?: string;
  media: ICategoryMedia;
  galleryMedia?: Array<{
    _id?: string;
    url: string;
    type: 'image' | 'video';
    posterUrl?: string;
    title?: string;
    caption?: string;
    altText?: string;
    order: number;
  }>;
  catalogPdf?: {
    url: string;
    name?: string;
    size?: number;
    key?: string;
  };
  features: string[];
  applications: string[];
  benefits: string[];
  displayOrder: number;
  isActive: boolean;
  hero?: IEntityHero;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryMediaItemSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    posterUrl: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    caption: { type: String, default: '', trim: true },
    altText: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const CatalogPdfSchema = new Schema(
  {
    url: { type: String, default: '', trim: true },
    name: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
    key: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const CategoryMediaSchema = new Schema<ICategoryMedia>(
  {
    image: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    gallery: { type: [String], default: [] },
  },
  { _id: false }
);



const CategorySchema = new Schema<ICategory>(
  {
    name: {
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
    catalogProductId: {
      type: Schema.Types.ObjectId,
      ref: 'CatalogProduct',
      default: null,
      index: true,
    },
    parentCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    parentType: {
      type: String,
      enum: ['category', 'product', 'model', 'catalogProduct', null],
      default: null,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    media: {
      type: CategoryMediaSchema,
      default: () => ({}),
    },
    galleryMedia: {
      type: [GalleryMediaItemSchema],
      default: [],
    },
    catalogPdf: {
      type: CatalogPdfSchema,
      default: () => ({}),
    },
    features: {
      type: [String],
      default: [],
    },
    applications: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    hero: {
      type: EntityHeroSchema,
      default: () => ({
        enabled: true,
        eyebrow: '',
        title: '',
        subtitle: '',
        description: '',
        ctaText: '',
        ctaLink: '',
        backgroundImage: '',
        overlayOpacity: 0.7,
        mediaItems: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes
CategorySchema.index({ parentCategoryId: 1, isActive: 1, displayOrder: 1 });
CategorySchema.index({ catalogProductId: 1, parentCategoryId: 1, displayOrder: 1 });
CategorySchema.index({ slug: 1, isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
