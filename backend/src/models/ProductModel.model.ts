import mongoose, { Document, Schema } from 'mongoose';
import { SpecificationItem } from '../types/index.js';
import { IEntityHero, EntityHeroSchema } from './Hero.schema.js';

export interface IProductModelMedia {
  image?: string;
  heroImage?: string;
  videoUrl?: string;
  gallery?: string[];
}

export interface ISpecificationColumn {
  key: string;
  label: string;
  value: string;
  order?: number;
}

export interface ISpecificationsTable {
  columns: ISpecificationColumn[];
}

export interface IProductModel extends Document {
  name: string;
  modelNumber: string;
  slug: string;
  productId?: mongoose.Types.ObjectId | null;
  parentId?: mongoose.Types.ObjectId | null;
  parentType?: 'category' | 'product' | 'model' | 'catalogProduct' | null;
  shortDescription?: string;
  description?: string;
  specifications: SpecificationItem[];
  specificationsTable?: ISpecificationsTable;
  media: IProductModelMedia;
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

const SpecificationColumnSchema = new Schema<ISpecificationColumn>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const SpecificationsTableSchema = new Schema<ISpecificationsTable>(
  {
    columns: { type: [SpecificationColumnSchema], default: [] },
  },
  { _id: false }
);

const ProductModelMediaSchema = new Schema<IProductModelMedia>(
  {
    image: { type: String, default: '' },
    heroImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    gallery: { type: [String], default: [] },
  },
  { _id: false }
);

const SpecificationItemSchema = new Schema<SpecificationItem>(
  {
    key: { type: String, trim: true },
    label: { type: String, trim: true },
    value: { type: String, required: true, trim: true },
    group: { type: String, trim: true },
  },
  { _id: false }
);



const ProductModelSchema = new Schema<IProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    modelNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
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
    specifications: {
      type: [SpecificationItemSchema],
      default: [],
    },
    specificationsTable: {
      type: SpecificationsTableSchema,
      default: () => ({ columns: [] }),
    },
    media: {
      type: ProductModelMediaSchema,
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
ProductModelSchema.index({ productId: 1, isActive: 1, displayOrder: 1 });
ProductModelSchema.index({ slug: 1, isActive: 1 });
ProductModelSchema.index({ modelNumber: 1, isActive: 1 });

export const ProductModel = mongoose.model<IProductModel>('ProductModel', ProductModelSchema);
