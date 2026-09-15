import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogLead extends Document {
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement?: string;
  catalogName: string;
  entityType?: 'category' | 'product' | 'model' | 'general';
  entitySlug?: string;
  pdfUrl?: string;
  status: 'unread' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogLeadSchema = new Schema<ICatalogLead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    requirement: {
      type: String,
      default: '',
      trim: true,
    },
    catalogName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ['category', 'product', 'model', 'general'],
      default: 'general',
    },
    entitySlug: {
      type: String,
      default: '',
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['unread', 'contacted', 'resolved', 'archived'],
      default: 'unread',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

CatalogLeadSchema.index({ status: 1, createdAt: -1 });
CatalogLeadSchema.index({ catalogName: 1, createdAt: -1 });

export const CatalogLead = mongoose.model<ICatalogLead>(
  'CatalogLead',
  CatalogLeadSchema
);
