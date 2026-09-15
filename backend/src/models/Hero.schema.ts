import { Schema } from 'mongoose';

export interface IHeroMediaItem {
  _id?: string;
  url: string;
  type: 'image' | 'video';
  posterUrl?: string;
  title?: string;
  caption?: string;
  order: number;
}

export interface IEntityHero {
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  mediaItems: IHeroMediaItem[];
}

export const HeroMediaItemSchema = new Schema<IHeroMediaItem>(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    posterUrl: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    caption: { type: String, default: '', trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

export const EntityHeroSchema = new Schema<IEntityHero>(
  {
    enabled: { type: Boolean, default: true },
    eyebrow: { type: String, default: '', trim: true },
    title: { type: String, default: '', trim: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    ctaText: { type: String, default: '', trim: true },
    ctaLink: { type: String, default: '', trim: true },
    backgroundImage: { type: String, default: '', trim: true },
    overlayOpacity: { type: Number, default: 0.7, min: 0, max: 1 },
    mediaItems: { type: [HeroMediaItemSchema], default: [] },
  },
  { _id: false }
);
