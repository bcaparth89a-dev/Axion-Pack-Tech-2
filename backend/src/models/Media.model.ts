import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  name: string;
  key: string;
  url: string;
  publicUrl?: string;
  status: 'uploading' | 'ready' | 'failed' | 'archived' | 'deleted';
  type: 'image' | 'document' | 'video' | 'other';
  mimeType: string;
  size: number;
  folder: string;
  category?: string;
  title?: string;
  caption?: string;
  altText?: string;
  entityType?: string;
  entityId?: string;
  provider: 'r2' | 'external' | 'youtube' | 'vimeo' | 'local';
  sourceType: 'upload' | 'url';
  embedUrl?: string;
  posterUrl?: string;
  posterKey?: string;
  originalFileName?: string;
  originalMimeType?: string;
  originalSize?: number;
  optimizedSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  referenceCount: number;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['uploading', 'ready', 'failed', 'archived', 'deleted'],
      default: 'ready',
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      default: 'image',
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    folder: {
      type: String,
      default: 'general',
      trim: true,
      index: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    entityType: {
      type: String,
      default: '',
      trim: true,
    },
    entityId: {
      type: String,
      default: '',
      trim: true,
    },
    altText: {
      type: String,
      default: '',
      trim: true,
    },
    provider: {
      type: String,
      enum: ['r2', 'external', 'youtube', 'vimeo', 'local'],
      default: 'r2',
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['upload', 'url'],
      default: 'upload',
      index: true,
    },
    embedUrl: {
      type: String,
      default: '',
      trim: true,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    posterKey: {
      type: String,
      default: '',
    },
    originalFileName: {
      type: String,
      default: '',
    },
    originalMimeType: {
      type: String,
      default: '',
    },
    originalSize: {
      type: Number,
      default: 0,
    },
    optimizedSize: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    duration: {
      type: Number,
    },
    format: {
      type: String,
      default: '',
    },
    referenceCount: {
      type: Number,
      default: 1,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

MediaSchema.index({ folder: 1, type: 1 });
MediaSchema.index({ category: 1, status: 1 });
MediaSchema.index({ status: 1, type: 1, createdAt: -1 });
MediaSchema.index({ provider: 1, sourceType: 1 });
MediaSchema.index({ createdAt: -1 });

export const Media = mongoose.model<IMedia>('Media', MediaSchema);
