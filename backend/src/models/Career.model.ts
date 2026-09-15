import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface ICareer extends Document {
  title: string;
  slug: string;
  type: 'job' | 'internship' | 'apprenticeship';
  department: string;
  location: string;
  employmentType?: string;
  experience: string;
  shortDescription?: string;
  description: string;
  image?: string;
  postedDate?: string;
  applicationDeadline?: string;
  eligibility?: string[];
  responsibilities: string[];
  qualifications: string[];
  requirements?: string[];
  skills?: string[];
  selectionProcess?: string[];
  duration?: string;
  stipendOrBenefits?: string;
  mentorSupport?: string;
  certification?: string;
  published: boolean;
  status: 'active' | 'closed';
  sortOrder: number;
  seo?: SeoMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const CareerSchema = new Schema<ICareer>(
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
    type: {
      type: String,
      enum: ['job', 'internship', 'apprenticeship'],
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: 'Vadodara, Gujarat, India',
      trim: true,
    },
    employmentType: {
      type: String,
      default: 'Full-Time',
      trim: true,
    },
    experience: {
      type: String,
      default: 'Not specified',
      trim: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    postedDate: {
      type: String,
      default: '',
    },
    applicationDeadline: {
      type: String,
      default: '',
    },
    eligibility: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    selectionProcess: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
    },
    stipendOrBenefits: {
      type: String,
    },
    mentorSupport: {
      type: String,
    },
    certification: {
      type: String,
    },
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
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

CareerSchema.index({ slug: 1, published: 1 });
CareerSchema.index({ type: 1, published: 1, sortOrder: 1 });

export const Career = mongoose.model<ICareer>('Career', CareerSchema);
