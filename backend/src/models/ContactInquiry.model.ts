import mongoose, { Document, Schema } from 'mongoose';

export interface IContactInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  company?: string;
  inquiryGroup?: string;
  inquiryType?: string;
  message: string;
  status: 'unread' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactInquirySchema = new Schema<IContactInquiry>(
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
      default: '',
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    inquiryGroup: {
      type: String,
      default: 'General',
      trim: true,
    },
    inquiryType: {
      type: String,
      default: 'General Inquiry',
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
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

ContactInquirySchema.index({ status: 1, createdAt: -1 });

export const ContactInquiry = mongoose.model<IContactInquiry>(
  'ContactInquiry',
  ContactInquirySchema
);
