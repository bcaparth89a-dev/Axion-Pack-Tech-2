import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogProductHero {
  eyebrow?: string;
  title: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton: {
    enabled: boolean;
    text: string;
    link: string;
  };
  background: {
    type: 'image' | 'solid' | 'gradient';
    image?: string;
    color?: string;
    gradient?: string;
  };
  visual: {
    type: 'image' | 'video';
    image?: string;
    video?: string;
    videoPoster?: string;
    altText?: string;
  };
}

export interface ICatalogProduct extends Document {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  status: 'active' | 'draft' | 'archived';
  hero: ICatalogProductHero;
  displayOrder: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogProductHeroSchema = new Schema<ICatalogProductHero>(
  {
    eyebrow: {
      type: String,
      default: 'Industrial Machinery Catalog',
      trim: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Packaging & Material Handling Equipment Portfolio',
      trim: true,
    },
    description: {
      type: String,
      default:
        'Explore our comprehensive range of high-throughput automated machinery, sanitary conveying systems, and flexible standalone packaging solutions.',
      trim: true,
    },
    primaryButton: {
      text: { type: String, default: 'Explore Equipment' },
      link: { type: String, default: '#categories' },
    },
    secondaryButton: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'Request Engineering Quote' },
      link: { type: String, default: '/contact' },
    },
    background: {
      type: {
        type: String,
        enum: ['image', 'solid', 'gradient'],
        default: 'gradient',
      },
      image: { type: String, default: '' },
      color: { type: String, default: '#061527' },
      gradient: {
        type: String,
        default: 'linear-gradient(135deg, #051324 0%, #091D38 50%, #061527 100%)',
      },
    },
    visual: {
      type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image',
      },
      image: {
        type: String,
        default:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      },
      video: { type: String, default: '' },
      videoPoster: {
        type: String,
        default:
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      },
      altText: {
        type: String,
        default: 'AXION PackTech Advanced Machinery and Packaging Systems',
      },
    },
  },
  { _id: false }
);

const CatalogProductSchema = new Schema<ICatalogProduct>(
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
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active',
      index: true,
    },
    hero: {
      type: CatalogProductHeroSchema,
      default: () => ({}),
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CatalogProductSchema.index({ status: 1, displayOrder: 1 });
CatalogProductSchema.index({ slug: 1, status: 1 });

export const CatalogProduct = mongoose.model<ICatalogProduct>(
  'CatalogProduct',
  CatalogProductSchema
);
