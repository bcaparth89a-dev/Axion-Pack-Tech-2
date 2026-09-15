export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  title: string;
  slug: string;
  categorySlug: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  applications: string[];
  specifications: ProductSpecification[];
  videoUrl?: string;
  shortDescription?: string;
  featured?: boolean;
  sortOrder?: number;
}

export interface ProductCategory {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: string;
  heroImage?: string;
  products: Product[];
  subcategories?: string[];
  sortOrder?: number;
}

// Clean empty array - mock data removed
export const productCategories: ProductCategory[] = [];
