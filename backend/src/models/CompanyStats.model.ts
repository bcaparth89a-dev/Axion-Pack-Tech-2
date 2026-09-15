import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyStatItem {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  sortOrder: number;
}

export interface ICompanyStats extends Document {
  stats: ICompanyStatItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StatItemSchema = new Schema<ICompanyStatItem>(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    description: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const CompanyStatsSchema = new Schema<ICompanyStats>(
  {
    stats: {
      type: [StatItemSchema],
      default: [
        { label: 'Installed Machines Globally', value: '1500', suffix: '+', sortOrder: 1 },
        { label: 'Countries Served', value: '35', suffix: '+', sortOrder: 2 },
        { label: 'Customer Retention Rate', value: '98', suffix: '%', sortOrder: 3 },
        { label: 'Years of Engineering Pedigree', value: '14', suffix: '+', sortOrder: 4 },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CompanyStats = mongoose.model<ICompanyStats>('CompanyStats', CompanyStatsSchema);
