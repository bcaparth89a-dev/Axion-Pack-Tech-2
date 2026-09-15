export interface ServiceSolution {
  title: string;
  description: string;
}

export interface ServiceStat {
  label: string;
  value: string;
}

export interface ServiceCTA {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface ServiceSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface Service {
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  heroTitle?: string;
  heroDescription?: string;
  heroImage?: string;
  heroVideo?: string;
  overview?: string;
  description: string;
  image: string;
  icon?: string;
  capabilities?: string[];
  features: string[];
  benefits?: string[];
  process?: string[];
  solutions?: ServiceSolution[];
  relatedProducts?: string[];
  relatedIndustries?: string[];
  stats?: ServiceStat[];
  cta?: ServiceCTA;
  featured?: boolean;
  published?: boolean;
  sortOrder?: number;
  seo?: ServiceSEO;
  createdAt?: string;
  updatedAt?: string;
}

export const servicesData: Service[] = [
  {
    title: "Engineering & Design",
    slug: "engineering-design",
    shortDescription:
      "Customized system design and plant integration tailored to your specific production requirements and layout constraints.",
    description: `AXION PackTech provides customized engineering and design solutions for industrial packaging and processing operations.

Our engineering team works closely with customers to understand:
• Production capacity requirements
• Available plant space
• Product characteristics
• Material handling requirements
• Packaging requirements
• Automation requirements
• Safety considerations
• Future expansion requirements

We design practical and efficient solutions that integrate seamlessly into your production environment.`,
    image: "/images/services/engineering-design.webp",
    icon: "🔧",
    features: [
      "Custom machine design",
      "Plant layout planning",
      "Production line integration",
      "Packaging system engineering",
      "Automation planning",
      "Technical consultation",
      "Capacity optimization",
      "Future expansion planning",
    ],
  },
  {
    title: "Installation & Commissioning",
    slug: "installation-commissioning",
    shortDescription:
      "Professional onsite installation and commissioning by experienced engineers to ensure optimal machine performance from day one.",
    description: `AXION PackTech provides professional installation and commissioning services to ensure equipment is correctly installed, configured, tested, and ready for production.

Our technical team supports customers throughout the installation process.

The service includes:
• Machine positioning
• Mechanical installation
• Electrical connection guidance
• System integration
• Initial testing
• Performance verification
• Production trials
• Operator guidance

Our goal is to ensure a smooth transition from installation to reliable production.`,
    image: "/images/services/installation-commissioning.webp",
    icon: "🛠️",
    features: [
      "Professional onsite installation",
      "Machine commissioning",
      "Production line integration",
      "Performance testing",
      "Initial production trials",
      "Operator guidance",
      "Technical verification",
      "Startup support",
    ],
  },
  {
    title: "After-Sales Service",
    slug: "after-sales-service",
    shortDescription:
      "Ongoing maintenance, technical assistance, and troubleshooting support to maximize uptime and equipment longevity.",
    description: `Reliable equipment support is essential for continuous industrial production.

AXION PackTech provides ongoing after-sales service to help customers maintain reliable machine performance and minimize production interruptions.

Our technical support focuses on:
• Machine maintenance
• Operational support
• Troubleshooting
• Performance optimization
• Technical guidance
• Preventive maintenance

We aim to help customers achieve maximum equipment availability and long-term operational reliability.`,
    image: "/images/services/after-sales-service.webp",
    icon: "🎧",
    features: [
      "Technical assistance",
      "Machine troubleshooting",
      "Preventive maintenance",
      "Performance optimization",
      "Operational support",
      "Maintenance guidance",
      "Equipment reliability support",
      "Reduced production downtime",
    ],
  },
  {
    title: "Spare Parts Support",
    slug: "spare-parts-support",
    shortDescription:
      "Quick supply of critical components and spare parts to minimize production downtime and keep your lines running.",
    description: `AXION PackTech provides spare parts support for maintaining the performance and reliability of industrial packaging and processing equipment.

Access to critical components helps reduce unnecessary production interruptions.

Our spare parts support includes assistance with:
• Identification of required components
• Replacement parts
• Critical machine components
• Wear parts
• Maintenance parts
• Technical guidance for replacement

Our objective is to help customers maintain continuous production and minimize equipment downtime.`,
    image: "/images/services/spare-parts-support.webp",
    icon: "⚙️",
    features: [
      "Critical spare parts",
      "Replacement components",
      "Wear parts support",
      "Maintenance components",
      "Technical parts identification",
      "Fast support coordination",
      "Reduced machine downtime",
      "Long-term equipment support",
    ],
  },
  {
    title: "Upgrades & Retrofits",
    slug: "upgrades-retrofits",
    shortDescription:
      "Modernization of existing equipment with the latest technology to improve performance, safety, and efficiency.",
    description: `Industrial technology continues to evolve, and existing production equipment can often be improved through upgrades and retrofit solutions.

AXION PackTech supports customers in modernizing suitable equipment to improve operational performance.

Upgrade and retrofit solutions can focus on:
• Automation improvements
• Control system modernization
• Safety improvements
• Productivity enhancement
• Performance optimization
• Equipment integration

The objective is to help customers improve production efficiency while extending the useful operational life of existing equipment.`,
    image: "/images/services/upgrades-retrofits.webp",
    icon: "🔄",
    features: [
      "Automation upgrades",
      "Control system modernization",
      "Safety improvements",
      "Performance enhancement",
      "Productivity optimization",
      "Equipment modernization",
      "Retrofit engineering",
      "Production line integration",
    ],
  },
];

export function getAllServices(): Service[] {
  return servicesData;
}

export function getServiceBySlug(slug: string): Service | undefined {
  return servicesData.find((service) => service.slug === slug);
}
