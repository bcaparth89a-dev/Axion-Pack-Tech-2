import { cache } from 'react';
import { apiClient } from './client';

export interface HomePageData {
  heroTitle?: string;
  heroSubtitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  [key: string]: unknown;
}

export interface AboutMediaSliderItem {
  mediaId?: string;
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

export interface WhyChooseUsItem {
  title: string;
  description: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface CoreValueItem {
  title: string;
  description: string;
  icon: string;
  enabled?: boolean;
  order?: number;
}

export interface AboutStatItem {
  value: string;
  label: string;
  highlight?: string;
  icon?: string;
  order?: number;
  enabled?: boolean;
}

export interface AboutCapabilityItem {
  title: string;
  description: string;
  icon: string;
}

export interface AboutPageData {
  _id?: string;
  hero?: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    ctaText?: string;
    ctaUrl?: string;
    showCta?: boolean;
  };
  mediaSlider?: {
    enabled?: boolean;
    heading?: string;
    items?: AboutMediaSliderItem[];
  };
  aboutInfo?: {
    badge?: string;
    heading?: string;
    tagline?: string;
    location?: string;
    paragraphs?: string[];
    stats?: AboutStatItem[];
    capabilities?: AboutCapabilityItem[];
  };
  companyDescription?: string;
  history?: string;
  vision?: string;
  mission?: string;
  visionMission?: {
    badge?: string;
    heading?: string;
    visionTitle?: string;
    visionText?: string;
    visionBadge?: string;
    missionTitle?: string;
    missionText?: string;
    missionBadge?: string;
    coreValues?: CoreValueItem[];
  };
  coreValues?: CoreValueItem[];
  whyChooseUs?: WhyChooseUsItem[];
  whyChooseUsSection?: {
    badge?: string;
    heading?: string;
    items?: WhyChooseUsItem[];
  };
  responsibilitiesSection?: {
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
  sections?: {
    hero?: boolean;
    mediaSlider?: boolean;
    aboutInfo?: boolean;
    whyChooseUs?: boolean;
    visionMission?: boolean;
    responsibilities?: boolean;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
  };
  [key: string]: unknown;
}

export const staticAboutPageData: AboutPageData = {
  hero: {
    eyebrow: 'Corporate Profile & Engineering Pedigree',
    title: 'Engineering Innovation.',
    highlightedTitle: 'Building Tomorrow.',
    subtitle: 'Dedicated to building high-performance packaging systems and industrial automation that redefine factory productivity.',
    description: 'AXION PackTech delivers innovative packaging, bagging, processing, and industrial automation solutions engineered for the future.',
    image: '/images/about_hero_building.jpg',
    ctaText: 'Explore Engineering Solutions',
    ctaUrl: '/products',
    showCta: false,
  },
  mediaSlider: {
    enabled: true,
    heading: 'Engineering in Motion',
    items: [
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
  aboutInfo: {
    badge: 'About Us',
    heading: 'About AXION PackTech',
    tagline: 'Engineering Packaging Excellence',
    location: 'Vadodara, Gujarat, India',
    paragraphs: [
      'AXION PackTech is an engineering-driven company specializing in packaging, bagging, material handling, processing, inspection, and end-of-line automation solutions.',
      'We are committed to delivering reliable, efficient, and innovative systems that help manufacturers improve productivity, product quality, and operational performance.',
      'At AXION PackTech, we combine practical engineering expertise with a customer-focused approach to develop solutions that meet the specific requirements of every application. Our systems are designed to deliver accuracy, reliability, safety, and long-term operational value.',
    ],
    stats: [
      { value: '25+', label: 'Machine Products', highlight: 'Engineered', icon: 'wrench', order: 0, enabled: true },
      { value: '4,000+', label: 'Industries & Lines', highlight: 'Served', icon: 'factory', order: 1, enabled: true },
      { value: 'Est. 2000', label: 'Founded Excellence', highlight: 'Proven', icon: 'award', order: 2, enabled: true },
    ],
    capabilities: [
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
  visionMission: {
    badge: 'Our Direction',
    heading: 'Vision & Mission',
    visionTitle: 'Global Packaging Partner',
    visionText: 'To become a trusted global partner for packaging, processing, and automation solutions by delivering innovative technologies, engineering excellence, and exceptional customer value.',
    visionBadge: 'Our Vision',
    missionTitle: 'Engineered for Impact',
    missionText: 'Deliver state-of-the-art engineering solutions with uncompromised quality, exceptional customer support, and continuous mechanical innovation.',
    missionBadge: 'Our Mission',
    coreValues: [
      { title: 'Quality', description: 'Zero-compromise engineering standards, high-tolerance components, and certified manufacturing excellence.', icon: 'star', enabled: true, order: 1 },
      { title: 'Innovation', description: 'Pioneering intelligent automation algorithms, high-speed bagging controls, and forward-looking robotics.', icon: 'lightbulb', enabled: true, order: 2 },
      { title: 'Integrity', description: 'Transparent partnerships, honest technical specifications, and steadfast commitments to our global clients.', icon: 'handshake', enabled: true, order: 3 },
      { title: 'Customer Focus', description: 'Tailoring every machine architecture to client throughput goals, space constraints, and material chemistry.', icon: 'users', enabled: true, order: 4 },
      { title: 'Safety', description: 'Multi-layered operator safety interlocks, ISO/CE regulatory compliance, and emergency fail-safe designs.', icon: 'shield-check', enabled: true, order: 5 },
      { title: 'Sustainability', description: 'Energy-efficient high-torque servo drives, reduced pneumatic air waste, and eco-friendly recyclable bag handling.', icon: 'leaf', enabled: true, order: 6 },
    ],
  },
  whyChooseUsSection: {
    badge: 'Engineering Advantage',
    heading: 'Why Choose AXION PackTech',
    items: [
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
  responsibilitiesSection: {
    badge: 'Our Responsibility',
    heading: 'Our Responsibilities',
    description: 'At AXION PackTech, we believe engineering progress must go hand in hand with responsibility. We are committed to developing solutions that support efficient operations, responsible resource use, operator safety, and long-term sustainable growth.',
    image: '/images/about_sustainability.jpg',
    badgeTitle: 'Eco-Conscious Packaging Engineering',
    badgeSubtitle: 'Minimizing power consumption & eliminating packaging waste.',
    points: [
      'Energy-efficient drives engineered for reduced carbon footprint',
      'Sustainable, recyclable, and biodegradable bagging material support',
      'Uncompromising plant safety and ergonomically certified operator workflows',
    ],
    ctaText: 'Learn More',
    ctaUrl: '/responsibilities',
  },
  sections: {
    hero: true,
    mediaSlider: true,
    aboutInfo: true,
    whyChooseUs: true,
    visionMission: true,
    responsibilities: true,
  },
  seo: {
    metaTitle: 'About Us | AXION PackTech — Engineering Packaging Excellence',
    metaDescription: "Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities.",
    keywords: ['packaging machinery', 'bagging automation', 'about axion packtech', 'industrial packaging'],
    canonicalUrl: '/about-us',
    ogTitle: 'About Us | AXION PackTech',
    ogDescription: "Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities.",
    ogImage: '/images/about_hero_building.jpg',
  },
};

export interface ResponsibilityPageData {
  title?: string;
  subtitle?: string;
  sustainability?: string;
  community?: string;
  [key: string]: unknown;
}

export const getHomePage = cache(async (): Promise<HomePageData | null> => {
  try {
    return await apiClient.get<HomePageData>('/pages/home', {
      revalidate: 300,
      tags: ['home-page', 'pages'],
    });
  } catch {
    return null;
  }
});

export const getAboutPage = cache(async (): Promise<AboutPageData> => {
  try {
    const data = await apiClient.get<AboutPageData>('/pages/about', {
      revalidate: 300,
      tags: ['about-page', 'pages'],
    });
    if (data && typeof data === 'object') {
      return {
        ...staticAboutPageData,
        ...data,
        hero: { ...staticAboutPageData.hero, ...data.hero },
        mediaSlider: {
          ...staticAboutPageData.mediaSlider,
          ...data.mediaSlider,
          items: Array.isArray(data.mediaSlider?.items)
            ? data.mediaSlider.items
            : staticAboutPageData.mediaSlider?.items || [],
        },
        aboutInfo: {
          ...staticAboutPageData.aboutInfo,
          ...data.aboutInfo,
          paragraphs: Array.isArray(data.aboutInfo?.paragraphs)
            ? data.aboutInfo.paragraphs
            : staticAboutPageData.aboutInfo?.paragraphs || [],
          stats: Array.isArray(data.aboutInfo?.stats)
            ? data.aboutInfo.stats
            : staticAboutPageData.aboutInfo?.stats || [],
          capabilities: Array.isArray(data.aboutInfo?.capabilities)
            ? data.aboutInfo.capabilities
            : staticAboutPageData.aboutInfo?.capabilities || [],
        },
        whyChooseUsSection: {
          ...staticAboutPageData.whyChooseUsSection,
          ...data.whyChooseUsSection,
          items: Array.isArray(data.whyChooseUsSection?.items)
            ? data.whyChooseUsSection.items
            : staticAboutPageData.whyChooseUsSection?.items || [],
        },
        visionMission: {
          ...staticAboutPageData.visionMission,
          ...data.visionMission,
          coreValues: Array.isArray(data.visionMission?.coreValues)
            ? data.visionMission.coreValues
            : staticAboutPageData.visionMission?.coreValues || [],
        },
        responsibilitiesSection: {
          ...staticAboutPageData.responsibilitiesSection,
          ...data.responsibilitiesSection,
          points: Array.isArray(data.responsibilitiesSection?.points)
            ? data.responsibilitiesSection.points
            : staticAboutPageData.responsibilitiesSection?.points || [],
        },
        sections: { ...staticAboutPageData.sections, ...(data.sections || {}) },
        seo: { ...staticAboutPageData.seo, ...(data.seo || {}) },
      };
    }
    return staticAboutPageData;
  } catch {
    return staticAboutPageData;
  }
});

export const getResponsibilityPage = cache(async (): Promise<ResponsibilityPageData | null> => {
  try {
    return await apiClient.get<ResponsibilityPageData>('/pages/responsibility', {
      revalidate: 300,
      tags: ['responsibility-page', 'pages'],
    });
  } catch {
    return null;
  }
});

export interface CategoryHeroData {
  _id?: string;
  page?: string;
  categoryId?: string | null;
  enabled: boolean;
  status: 'draft' | 'published';
  eyebrow?: string;
  title: string;
  description: string;
  primaryButton: {
    text: string;
    link: string;
  };
  secondaryButton: {
    enabled: boolean;
    text: string;
    link: string;
  };
  background: {
    type: 'image' | 'gradient' | 'solid';
    image?: string;
    color?: string;
    gradient?: string;
    overlayOpacity: number;
  };
  visual: {
    type: 'image' | 'video';
    image?: string;
    video?: string;
    videoPoster?: string;
    altText?: string;
  };
  alignment: 'left' | 'center';
  animation: 'none' | 'fade' | 'slide' | 'scale';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const defaultCategoryHero: CategoryHeroData = {
  enabled: true,
  status: 'published',
  eyebrow: 'Industrial Machinery Catalog',
  title: 'Packaging & Material Handling Equipment Portfolio',
  description:
    'Explore our comprehensive range of high-throughput automated machinery, sanitary conveying systems, and flexible standalone packaging solutions.',
  primaryButton: {
    text: 'Explore Equipment',
    link: '#categories',
  },
  secondaryButton: {
    enabled: true,
    text: 'Request Engineering Quote',
    link: '/contact',
  },
  background: {
    type: 'gradient',
    image: '',
    color: '#061527',
    gradient: 'linear-gradient(135deg, #051324 0%, #091D38 50%, #061527 100%)',
    overlayOpacity: 75,
  },
  visual: {
    type: 'image',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    video: '',
    videoPoster: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    altText: 'AXION PackTech Advanced Machinery and Packaging Systems',
  },
  alignment: 'left',
  animation: 'fade',
};

export const getCategoryHero = cache(async function getCategoryHero(): Promise<CategoryHeroData> {
  try {
    const data = await apiClient.get<CategoryHeroData>('/pages/category-hero', {
      revalidate: 300,
      tags: ['pages', 'category-hero'],
    });
    if (data && data.title) {
      return {
        ...defaultCategoryHero,
        ...data,
        primaryButton: { ...defaultCategoryHero.primaryButton, ...(data.primaryButton || {}) },
        secondaryButton: { ...defaultCategoryHero.secondaryButton, ...(data.secondaryButton || {}) },
        background: { ...defaultCategoryHero.background, ...(data.background || {}) },
        visual: { ...defaultCategoryHero.visual, ...(data.visual || {}) },
      };
    }
    return defaultCategoryHero;
  } catch {
    return defaultCategoryHero;
  }
});
