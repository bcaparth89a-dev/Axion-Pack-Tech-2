import { productCategories } from "./products";
import { servicesData } from "./services";
import { industriesData } from "./industries";

export interface ContactInfo {
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
  };
  social: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    email: string;
  };
}

export const contactInfo: ContactInfo = {
  companyName: "AXION PackTech",
  tagline: "Engineering Packaging Excellence",
  slogan: "Engineering for a Better Tomorrow",
  email: "sales@axionpacktech.com",
  phones: ["+91 8511856636", "+91 8511856637"],
  website: "www.axionpacktech.com",
  address: {
    city: "Vadodara",
    state: "Gujarat",
    country: "India",
    display: "Vadodara, Gujarat, India",
  },
  social: {
    whatsapp: "https://wa.me/918511856636",
    facebook: "https://www.facebook.com/axionpacktech",
    instagram: "https://www.instagram.com/axionpacktech",
    email: "mailto:sales@axionpacktech.com",
  },
};

export interface InquiryOptionGroup {
  group: string;
  options: string[];
}

export function getInquiryOptionGroups(
  customServices?: { title: string }[],
  customIndustries?: { title: string }[],
  customCategories?: { name?: string; title?: string }[]
): InquiryOptionGroup[] {
  const serviceList = customServices !== undefined ? customServices : servicesData;
  const industryList = customIndustries !== undefined ? customIndustries : industriesData;
  const categoryOptions =
    customCategories !== undefined
      ? customCategories.map((c) => c.name || c.title || '').filter(Boolean)
      : productCategories.map((p) => p.title).filter(Boolean);

  const groups: InquiryOptionGroup[] = [
    {
      group: "General",
      options: ["General Inquiry"],
    },
  ];

  if (categoryOptions.length > 0) {
    groups.push({
      group: "Product Divisions",
      options: categoryOptions,
    });
  }

  groups.push({
    group: "Engineering Services",
    options: serviceList.map((s) => s.title),
  });

  groups.push({
    group: "Target Industries",
    options: industryList.map((i) => i.title),
  });

  return groups;
}
