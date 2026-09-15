import mongoose, { Document, Schema } from 'mongoose';

export interface IBlogCategory extends Document {
  title: string;
  slug: string;
  description?: string;
  badge?: string;
  icon?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
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
    description: {
      type: String,
      default: '',
      trim: true,
    },
    badge: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: '📝',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const BlogCategory = mongoose.model<IBlogCategory>(
  'BlogCategory',
  BlogCategorySchema
);
