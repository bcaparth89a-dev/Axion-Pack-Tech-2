import mongoose, { Document, Schema } from 'mongoose';

export interface IContactSettings extends Document {
  companyName: string;
  tagline: string;
  slogan: string;
  email: string;
  phones: string[];
  website: string;
  address: {
    city: string;
    state: string;
    country: string;
    display: string;
    fullStreet?: string;
    postalCode?: string;
  };
  social: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    linkedin: string;
    email: string;
  };
  businessHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContactSettingsSchema = new Schema<IContactSettings>(
  {
    companyName: { type: String, default: 'AXION PackTech' },
    tagline: { type: String, default: 'Engineering Packaging Excellence' },
    slogan: { type: String, default: 'Engineering for a Better Tomorrow' },
    email: { type: String, default: 'sales@axionpacktech.com' },
    phones: { type: [String], default: ['+91 8511856636', '+91 8511856637'] },
    website: { type: String, default: 'www.axionpacktech.com' },
    address: {
      city: { type: String, default: 'Vadodara' },
      state: { type: String, default: 'Gujarat' },
      country: { type: String, default: 'India' },
      display: { type: String, default: 'Vadodara, Gujarat, India' },
      fullStreet: { type: String, default: 'GIDC Industrial Area, Makarpura' },
      postalCode: { type: String, default: '390010' },
    },
    social: {
      whatsapp: { type: String, default: 'https://wa.me/918511856636' },
      facebook: { type: String, default: 'https://www.facebook.com/axionpacktech' },
      instagram: { type: String, default: 'https://www.instagram.com/axionpacktech' },
      linkedin: { type: String, default: 'https://www.linkedin.com/company/axionpacktech' },
      email: { type: String, default: 'mailto:sales@axionpacktech.com' },
    },
    businessHours: {
      weekdays: { type: String, default: '9:00 AM – 6:30 PM (IST)' },
      saturday: { type: String, default: '9:00 AM – 2:00 PM (IST)' },
      sunday: { type: String, default: 'Closed (Emergency Support Active)' },
    },
  },
  {
    timestamps: true,
  }
);

export const ContactSettings = mongoose.model<IContactSettings>(
  'ContactSettings',
  ContactSettingsSchema
);
