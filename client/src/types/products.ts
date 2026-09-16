export interface ProductMedia {
  image?: string;
  heroImage?: string;
  videoUrl?: string;
  gallery?: string[];
}

export interface HeroMediaItem {
  _id?: string;
  url: string;
  type: 'image' | 'video';
  posterUrl?: string;
  title?: string;
  caption?: string;
  order: number;
}

export interface GalleryMediaItem {
  _id?: string;
  url: string;
  type: 'image' | 'video';
  posterUrl?: string;
  title?: string;
  caption?: string;
  altText?: string;
  order: number;
}

export interface CatalogPdf {
  url: string;
  name?: string;
  size?: number;
  key?: string;
}

export interface EntityHero {
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  mediaItems: HeroMediaItem[];
}

export interface SpecificationItem {
  key?: string;
  label?: string;
  value: string;
  group?: string;
}

export interface SpecificationColumn {
  key: string;
  label: string;
  value: string;
  order?: number;
}

export interface SpecificationTable {
  columns: SpecificationColumn[];
}

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface BreadcrumbItem {
  name: string;
  slug: string;
  path: string;
  type: 'root' | 'category' | 'product' | 'model';
}

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  type?: 'category' | 'product' | 'model';
  catalogProductId?: string | null;
  parentCategoryId?: string | null;
  parentId?: string | null;
  parentType?: string | null;
  shortDescription?: string;
  description?: string;
  media?: ProductMedia;
  galleryMedia?: GalleryMediaItem[];
  catalogPdf?: CatalogPdf;
  features?: string[];
  applications?: string[];
  benefits?: string[];
  displayOrder: number;
  isActive: boolean;
  hero?: EntityHero;
  children: CategoryTreeNode[];
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    media?: {
      image?: string;
      heroImage?: string;
    };
    displayOrder: number;
    modelCount?: number;
    models?: Array<{
      _id: string;
      name: string;
      slug: string;
      modelNumber?: string;
      shortDescription?: string;
      media?: {
        image?: string;
        heroImage?: string;
      };
      displayOrder?: number;
    }>;
  }>;
  modelCount?: number;
  models?: Array<{
    _id: string;
    name: string;
    slug: string;
    modelNumber?: string;
    shortDescription?: string;
    media?: {
      image?: string;
      heroImage?: string;
    };
    displayOrder?: number;
  }>;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  catalogProductId?: string | null;
  parentCategoryId?: string | CategoryItem | null;
  parentId?: string | null;
  parentType?: string | null;
  shortDescription?: string;
  description?: string;
  media?: ProductMedia;
  galleryMedia?: GalleryMediaItem[];
  catalogPdf?: CatalogPdf;
  features?: string[];
  applications?: string[];
  benefits?: string[];
  displayOrder: number;
  isActive: boolean;
  hero?: EntityHero;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  catalogProductId?: string | null;
  categoryId?: string | CategoryItem | null;
  parentId?: string | null;
  parentType?: string | null;
  shortDescription?: string;
  description?: string;
  media?: ProductMedia;
  galleryMedia?: GalleryMediaItem[];
  catalogPdf?: CatalogPdf;
  features?: string[];
  infoPoints?: string[];
  specifications?: SpecificationItem[];
  applications?: string[];
  benefits?: string[];
  displayOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  hero?: EntityHero;
  models?: ProductModelItem[];
  modelCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductModelItem {
  _id: string;
  name: string;
  modelNumber: string;
  slug: string;
  productId?: string | ProductItem | null;
  catalogProductId?: string | null;
  parentId?: string | null;
  parentType?: string | null;
  shortDescription?: string;
  description?: string;
  specifications?: SpecificationItem[];
  specificationsTable?: SpecificationTable;
  media?: ProductMedia;
  galleryMedia?: GalleryMediaItem[];
  catalogPdf?: CatalogPdf;
  features?: string[];
  displayOrder: number;
  isActive: boolean;
  hero?: EntityHero;
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogChildItem {
  _id: string;
  name: string;
  slug: string;
  type: 'category' | 'product' | 'model';
  modelNumber?: string;
  shortDescription?: string;
  description?: string;
  media?: ProductMedia;
  displayOrder?: number;
  isActive?: boolean;
  modelCount?: number;
  isFeatured?: boolean;
}

export interface CategoryDetailResponse {
  category: CategoryItem;
  children: CategoryItem[];
  products: ProductItem[];
  directChildren?: CatalogChildItem[];
  breadcrumbs: BreadcrumbItem[];
}

export interface ProductDetailResponse {
  product: ProductItem;
  models: ProductModelItem[];
  directChildren?: CatalogChildItem[];
  breadcrumbs: BreadcrumbItem[];
  fullPath: string;
}

export interface ModelDetailResponse {
  model: ProductModelItem;
  product: ProductItem;
  directChildren?: CatalogChildItem[];
  breadcrumbs: BreadcrumbItem[];
  fullPath: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  slug: string;
  entityType: 'category' | 'product' | 'model';
  modelNumber?: string;
  categoryName?: string;
  productName?: string;
  categorySlug?: string;
  productSlug?: string;
  thumbnail: string;
  shortDescription?: string;
  description?: string;
  catalogPdf: CatalogPdf;
  displayOrder: number;
}
