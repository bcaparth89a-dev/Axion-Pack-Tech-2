import mongoose, { Document, Schema } from 'mongoose';

export type CareerApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired'
  | 'pending'
  | 'reviewed';

export interface ICareerApplication extends Document {
  careerId?: mongoose.Types.ObjectId;
  careerSlug: string;
  careerTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  coverMessage?: string;
  resumeUrl: string;
  resumeKey: string;
  resumeFileName?: string;
  resumeMimeType?: string;
  resumeSize?: number;
  status: CareerApplicationStatus;
  notes?: string;
  address?: string;
  education?: string;
  experience?: string;
  portfolioUrl?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CareerApplicationSchema = new Schema<ICareerApplication>(
  {
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      index: true,
    },
    careerSlug: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    careerTitle: {
      type: String,
      required: true,
      trim: true,
    },
    candidateName: {
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
    coverMessage: {
      type: String,
      default: '',
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    resumeKey: {
      type: String,
      required: true,
      trim: true,
    },
    resumeFileName: {
      type: String,
      default: 'resume.pdf',
      trim: true,
    },
    resumeMimeType: {
      type: String,
      default: 'application/pdf',
      trim: true,
    },
    resumeSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired', 'pending', 'reviewed'],
      default: 'new',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    education: {
      type: String,
      default: '',
      trim: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    portfolioUrl: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CareerApplicationSchema.index({ careerSlug: 1, submittedAt: -1 });
CareerApplicationSchema.index({ status: 1, submittedAt: -1 });
CareerApplicationSchema.index({ email: 1, careerSlug: 1, submittedAt: -1 });

export const CareerApplication = mongoose.model<ICareerApplication>(
  'CareerApplication',
  CareerApplicationSchema
);
