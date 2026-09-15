import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryHero extends Document {
  page: string;
  categoryId?: mongoose.Types.ObjectId | null;
  enabled: boolean;
  status: 'draft' | 'published';
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
    type: 'image' | 'gradient' | 'solid';
    image?: string;
    color?: string;
    gradient?: string;
    overlayOpacity: number;
  };
  visual: {
    type: 'image' | 'video';
    image?: string;
    video?: string;
    videoPoster?: string;
    altText?: string;
  };
  alignment: 'left' | 'center';
  animation: 'none' | 'fade' | 'slide' | 'scale';
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CategoryHeroSchema = new Schema<ICategoryHero>(
  {
    page: {
      type: String,
      default: 'main-categories',
      unique: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
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
        enum: ['image', 'gradient', 'solid'],
        default: 'gradient',
      },
      image: { type: String, default: '' },
      color: { type: String, default: '#061527' },
      gradient: {
        type: String,
        default: 'linear-gradient(135deg, #051324 0%, #091D38 50%, #061527 100%)',
      },
      overlayOpacity: { type: Number, default: 75, min: 0, max: 100 },
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
    alignment: {
      type: String,
      enum: ['left', 'center'],
      default: 'left',
    },
    animation: {
      type: String,
      enum: ['none', 'fade', 'slide', 'scale'],
      default: 'fade',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CategoryHero = mongoose.model<ICategoryHero>('CategoryHero', CategoryHeroSchema);
