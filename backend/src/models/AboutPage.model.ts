import mongoose, { Document, Schema } from 'mongoose';
import { SeoMetadata } from '../types/index.js';

export interface IAboutMediaSliderItem {
  mediaId?: mongoose.Types.ObjectId;
  type: 'image' | 'video';
  provider?: 'r2' | 'external';
  sourceType?: 'upload' | 'url';
  title: string;
  caption?: string;
  url: string;
  posterUrl?: string;
  alt?: string;
  enabled: boolean;
  order: number;
  autoplay?: boolean;
  originalFileName?: string;
  originalSize?: number;
  optimizedSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
}

export interface IWhyChooseUsItem {
  title: string;
  description: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface ICoreValueItem {
  title: string;
  description: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface IAboutStatItem {
  value: string;
  label: string;
  highlight?: string;
  icon?: string;
  order?: number;
  enabled?: boolean;
}

export interface IAboutCapabilityItem {
  title: string;
  description: string;
  icon: string;
}

export interface IAboutPage extends Document {
  hero: {
    eyebrow?: string;
    title: string;
    highlightedTitle?: string;
    subtitle?: string;
    description?: string;
    image: string;
    ctaText?: string;
    ctaUrl?: string;
    showCta?: boolean;
  };
  mediaSlider: {
    enabled: boolean;
    heading?: string;
    items: IAboutMediaSliderItem[];
  };
  aboutInfo: {
    badge?: string;
    heading?: string;
    tagline?: string;
    location?: string;
    paragraphs?: string[];
    stats?: IAboutStatItem[];
    capabilities?: IAboutCapabilityItem[];
  };
  companyDescription: string;
  history: string;
  vision: string;
  mission: string;
  visionMission: {
    badge?: string;
    heading?: string;
    visionTitle?: string;
    visionText?: string;
    visionBadge?: string;
    missionTitle?: string;
    missionText?: string;
    missionBadge?: string;
    coreValues?: ICoreValueItem[];
  };
  coreValues: ICoreValueItem[];
  whyChooseUs: IWhyChooseUsItem[];
  whyChooseUsSection: {
    badge?: string;
    heading?: string;
    items?: IWhyChooseUsItem[];
  };
  responsibilitiesSection: {
    badge?: string;
    heading?: string;
    description?: string;
    image?: string;
    badgeTitle?: string;
    badgeSubtitle?: string;
    points?: string[];
    ctaText?: string;
    ctaUrl?: string;
  };
  sections: {
    hero: boolean;
    mediaSlider: boolean;
    aboutInfo: boolean;
    whyChooseUs: boolean;
    visionMission: boolean;
    responsibilities: boolean;
  };
  seo?: SeoMetadata & {
    ogTitle?: string;
    ogDescription?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MediaSliderItemSchema = new Schema<IAboutMediaSliderItem>(
  {
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media' },
    type: { type: String, enum: ['image', 'video'], default: 'image' },
    provider: { type: String, enum: ['r2', 'external'], default: 'external' },
    sourceType: { type: String, enum: ['upload', 'url'], default: 'url' },
    title: { type: String, required: true },
    caption: { type: String, default: '' },
    url: { type: String, required: true },
    posterUrl: { type: String, default: '' },
    alt: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    autoplay: { type: Boolean, default: false },
    originalFileName: { type: String, default: '' },
    originalSize: { type: Number, default: 0 },
    optimizedSize: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    format: { type: String, default: '' },
  },
  { _id: false }
);

const ValueItemSchema = new Schema<ICoreValueItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'check' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const StatItemSchema = new Schema<IAboutStatItem>(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
    highlight: { type: String, default: '' },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const CapabilityItemSchema = new Schema<IAboutCapabilityItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'cog' },
  },
  { _id: false }
);

const AboutPageSchema = new Schema<IAboutPage>(
  {
    hero: {
      eyebrow: { type: String, default: 'Corporate Profile & Engineering Pedigree' },
      title: { type: String, default: 'Engineering Innovation.' },
      highlightedTitle: { type: String, default: 'Building Tomorrow.' },
      subtitle: {
        type: String,
        default:
          'Dedicated to building high-performance packaging systems and industrial automation that redefine factory productivity.',
      },
      description: {
        type: String,
        default:
          'AXION PackTech delivers innovative packaging, bagging, processing, and industrial automation solutions engineered for the future.',
      },
      image: { type: String, default: '/images/about_hero_building.jpg' },
      ctaText: { type: String, default: 'Explore Engineering Solutions' },
      ctaUrl: { type: String, default: '/products' },
      showCta: { type: Boolean, default: false },
    },
    mediaSlider: {
      enabled: { type: Boolean, default: true },
      heading: { type: String, default: 'Engineering in Motion' },
      items: {
        type: [MediaSliderItemSchema],
        default: [
          {
            type: 'image',
            title: 'High-Precision Automated Bagging Systems',
            caption: 'Engineered for continuous heavy industrial duty cycles and rapid size changeovers.',
            url: '/images/about_hero_building.jpg',
            posterUrl: '',
            alt: 'AXION PackTech Industrial Packaging Facility',
            enabled: true,
            order: 1,
            autoplay: false,
          },
          {
            type: 'image',
            title: 'Turnkey Line Integration & Robotics',
            caption: 'Synchronized material handling, inline checkweighing, and robotic palletizing cells.',
            url: '/images/about_sustainability.jpg',
            posterUrl: '',
            alt: 'Automated Line Integration Plant',
            enabled: true,
            order: 2,
            autoplay: false,
          },
        ],
      },
    },
    aboutInfo: {
      badge: { type: String, default: 'About Us' },
      heading: { type: String, default: 'About AXION PackTech' },
      tagline: { type: String, default: 'Engineering Packaging Excellence' },
      location: { type: String, default: 'Vadodara, Gujarat, India' },
      paragraphs: {
        type: [String],
        default: [
          'AXION PackTech is an engineering-driven company specializing in packaging, bagging, material handling, processing, inspection, and end-of-line automation solutions.',
          'We are committed to delivering reliable, efficient, and innovative systems that help manufacturers improve productivity, product quality, and operational performance.',
          'At AXION PackTech, we combine practical engineering expertise with a customer-focused approach to develop solutions that meet the specific requirements of every application. Our systems are designed to deliver accuracy, reliability, safety, and long-term operational value.',
        ],
      },
      stats: {
        type: [StatItemSchema],
        default: [
          { value: '25+', label: 'Machine Products', highlight: 'Engineered', icon: 'wrench', order: 0, enabled: true },
          { value: '4,000+', label: 'Industries & Lines', highlight: 'Served', icon: 'factory', order: 1, enabled: true },
          { value: 'Est. 2000', label: 'Founded Excellence', highlight: 'Proven', icon: 'award', order: 2, enabled: true },
        ],
      },
      capabilities: {
        type: [CapabilityItemSchema],
        default: [
          {
            title: 'Bagging & Stitching Systems',
            description: 'Complete range from portable to fully automated high-speed bagging solutions.',
            icon: 'bag',
          },
          {
            title: 'Processing Solutions',
            description: 'Dosing, batching, mixing, sifting, and pneumatic conveying systems.',
            icon: 'processing',
          },
          {
            title: 'Inspection Systems',
            description: 'Industrial inspection, metal detection, checkweighing, and quality monitoring.',
            icon: 'shield',
          },
          {
            title: 'Complete Line Integration',
            description: 'Integrated turnkey lines from raw material handling to robotic palletizing.',
            icon: 'integration',
          },
        ],
      },
    },
    companyDescription: {
      type: String,
      default:
        'AXION PackTech is an advanced engineering enterprise providing turnkey packaging lines, bag filling systems, and automated material handling equipment across the globe.',
    },
    history: {
      type: String,
      default:
        'Established with a core focus on precision manufacturing, AXION PackTech has grown from a specialized machinery supplier into an international turnkey automation provider.',
    },
    vision: {
      type: String,
      default:
        'To be the premier global provider of intelligent, reliable, and sustainable industrial packaging systems.',
    },
    mission: {
      type: String,
      default:
        'Deliver state-of-the-art engineering solutions with uncompromised quality, exceptional customer support, and continuous mechanical innovation.',
    },
    visionMission: {
      badge: { type: String, default: 'Our Direction' },
      heading: { type: String, default: 'Vision & Mission' },
      visionTitle: { type: String, default: 'Global Packaging Partner' },
      visionText: {
        type: String,
        default:
          'To become a trusted global partner for packaging, processing, and automation solutions by delivering innovative technologies, engineering excellence, and exceptional customer value.',
      },
      visionBadge: { type: String, default: 'Our Vision' },
      missionTitle: { type: String, default: 'Engineered for Impact' },
      missionText: {
        type: String,
        default:
          'Deliver state-of-the-art engineering solutions with uncompromised quality, exceptional customer support, and continuous mechanical innovation.',
      },
      missionBadge: { type: String, default: 'Our Mission' },
      coreValues: {
        type: [ValueItemSchema],
        default: [
          { title: 'Quality', description: 'Zero-compromise engineering standards, high-tolerance components, and certified manufacturing excellence.', icon: 'star', enabled: true, order: 1 },
          { title: 'Innovation', description: 'Pioneering intelligent automation algorithms, high-speed bagging controls, and forward-looking robotics.', icon: 'lightbulb', enabled: true, order: 2 },
          { title: 'Integrity', description: 'Transparent partnerships, honest technical specifications, and steadfast commitments to our global clients.', icon: 'handshake', enabled: true, order: 3 },
          { title: 'Customer Focus', description: 'Tailoring every machine architecture to client throughput goals, space constraints, and material chemistry.', icon: 'users', enabled: true, order: 4 },
          { title: 'Safety', description: 'Multi-layered operator safety interlocks, ISO/CE regulatory compliance, and emergency fail-safe designs.', icon: 'shield-check', enabled: true, order: 5 },
          { title: 'Sustainability', description: 'Energy-efficient high-torque servo drives, reduced pneumatic air waste, and eco-friendly recyclable bag handling.', icon: 'leaf', enabled: true, order: 6 },
        ],
      },
    },
    coreValues: {
      type: [ValueItemSchema],
      default: [
        { title: 'Engineering Precision', description: 'Zero compromise on component tolerance and materials.', icon: 'cog', enabled: true, order: 1 },
        { title: 'Reliability Under Pressure', description: 'Built for 24/7 continuous industrial duty cycles.', icon: 'shield', enabled: true, order: 2 },
        { title: 'Customer First Commitment', description: 'Proactive support and rapid spare parts dispatch.', icon: 'heart', enabled: true, order: 3 },
        { title: 'Sustainable Innovation', description: 'Energy-saving drives and reduced packaging material waste.', icon: 'leaf', enabled: true, order: 4 },
      ],
    },
    whyChooseUs: {
      type: [ValueItemSchema],
      default: [
        { title: 'Turnkey Expertise', description: 'Complete lines from bulk intake to robotic palletizing.', icon: 'wrench', enabled: true, order: 1 },
        { title: 'Custom Engineering', description: 'Tailored dimensions and integrations for existing plants.', icon: 'layout', enabled: true, order: 2 },
        { title: 'Robust Components', description: 'Premium electricals from Siemens, Schneider, and Festo.', icon: 'cpu', enabled: true, order: 3 },
        { title: 'Global Service SLA', description: 'Rapid field response and nationwide engineering presence.', icon: 'clock', enabled: true, order: 4 },
      ],
    },
    whyChooseUsSection: {
      badge: { type: String, default: 'Engineering Advantage' },
      heading: { type: String, default: 'Why Choose AXION PackTech' },
      items: {
        type: [ValueItemSchema],
        default: [
          { title: 'Engineering Expertise', description: 'Experienced in packaging, bagging, conveying, processing, and automation technologies for industrial applications.', icon: 'compass', enabled: true, order: 1 },
          { title: 'Customized Solutions', description: 'Equipment tailored to customer-specific requirements and plant layouts for optimal efficiency.', icon: 'sliders', enabled: true, order: 2 },
          { title: 'Quality & Reliability', description: 'Robust systems built for long-term industrial operation with consistent performance and minimal downtime.', icon: 'badge-check', enabled: true, order: 3 },
          { title: 'Technical Support', description: 'Professional installation, commissioning, and dedicated after-sales service to keep your production lines running.', icon: 'headset', enabled: true, order: 4 },
          { title: 'Comprehensive Systems', description: 'Complete turnkey integration from raw material handling and bulk feeding to finished palletized packages.', icon: 'layers', enabled: true, order: 5 },
          { title: 'Global Standards', description: 'Built in compliance with international industrial, electrical, and mechanical safety standards.', icon: 'globe', enabled: true, order: 6 },
          { title: 'Dedicated Testing', description: 'Extensive pre-shipment factory testing and material trials ensure rapid startup at your facility.', icon: 'check-circle', enabled: true, order: 7 },
          { title: 'Proven Track Record', description: 'Trusted by manufacturers across multiple industries for demanding production requirements.', icon: 'award', enabled: true, order: 8 },
        ],
      },
    },
    responsibilitiesSection: {
      badge: { type: String, default: 'Our Responsibility' },
      heading: { type: String, default: 'Our Responsibilities' },
      description: {
        type: String,
        default:
          'At AXION PackTech, we believe engineering progress must go hand in hand with responsibility. We are committed to developing solutions that support efficient operations, responsible resource use, operator safety, and long-term sustainable growth.',
      },
      image: { type: String, default: '/images/about_sustainability.jpg' },
      badgeTitle: { type: String, default: 'Eco-Conscious Packaging Engineering' },
      badgeSubtitle: { type: String, default: 'Minimizing power consumption & eliminating packaging waste.' },
      points: {
        type: [String],
        default: [
          'Energy-efficient drives engineered for reduced carbon footprint',
          'Sustainable, recyclable, and biodegradable bagging material support',
          'Uncompromising plant safety and ergonomically certified operator workflows',
        ],
      },
      ctaText: { type: String, default: 'Learn More' },
      ctaUrl: { type: String, default: '/responsibilities' },
    },
    sections: {
      hero: { type: Boolean, default: true },
      mediaSlider: { type: Boolean, default: true },
      aboutInfo: { type: Boolean, default: true },
      whyChooseUs: { type: Boolean, default: true },
      visionMission: { type: Boolean, default: true },
      responsibilities: { type: Boolean, default: true },
    },
    seo: {
      metaTitle: { type: String, default: 'About Us | AXION PackTech — Engineering Packaging Excellence' },
      metaDescription: {
        type: String,
        default:
          "Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities.",
      },
      keywords: { type: [String], default: ['packaging machinery', 'bagging automation', 'about axion packtech', 'industrial packaging'] },
      canonicalUrl: { type: String, default: '/about-us' },
      ogTitle: { type: String, default: 'About Us | AXION PackTech' },
      ogDescription: {
        type: String,
        default:
          "Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities.",
      },
      ogImage: { type: String, default: '/images/about_hero_building.jpg' },
    },
  },
  {
    timestamps: true,
  }
);

export const AboutPage = mongoose.model<IAboutPage>('AboutPage', AboutPageSchema);
