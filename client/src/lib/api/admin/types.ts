export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface DashboardStats {
  counts: {
    products: number;
    publishedProducts?: number;
    draftProducts?: number;
    categories: number;
    publishedCategories?: number;
    draftCategories?: number;
    models?: number;
    publishedModels?: number;
    draftModels?: number;
    industries: number;
    services: number;
    news: number;
    blogs: number;
    careers: number;
    inquiries: number;
    catalogDownloads?: number;
    contactRequests?: number;
    applications: number;
    unreadInquiries: number;
    pendingApplications: number;
  };
  recentInquiries: Array<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    inquiryType?: string;
    status: 'unread' | 'contacted' | 'resolved' | 'archived';
    createdAt: string;
  }>;
  recentApplications: Array<{
    _id: string;
    candidateName: string;
    careerTitle: string;
    email: string;
    phone: string;
    status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | 'pending' | 'reviewed';
    submittedAt: string;
  }>;
}

export interface AdminInquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryGroup?: string;
  inquiryType?: string;
  message: string;
  status: 'unread' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminApplication {
  _id: string;
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
  status: 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired' | 'pending' | 'reviewed';
  notes?: string;
  address?: string;
  education?: string;
  experience?: string;
  portfolioUrl?: string;
  submittedAt: string;
  createdAt: string;
}

export interface MediaConfig {
  r2Configured: boolean;
  providerName: string;
  maxImageSize: number;
  maxVideoSize: number;
  acceptedImageFormats: string[];
  acceptedVideoFormats: string[];
}

export interface MediaUploadResponse {
  mediaId: string;
  url: string;
  posterUrl?: string;
  key: string;
  posterKey?: string;
  type: 'image' | 'video';
  provider: 'r2' | 'external';
  sourceType: 'upload' | 'url';
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  originalFileName: string;
}

export interface MediaReferenceItem {
  model: string;
  title: string;
  field: string;
  id: string;
}

export interface MediaUsageCheckResult {
  isReferenced: boolean;
  count: number;
  references: MediaReferenceItem[];
}

export interface AdminMedia {
  _id: string;
  name: string;
  key: string;
  url: string;
  publicUrl?: string;
  status?: string;
  type?: 'image' | 'document' | 'video' | 'other';
  mimeType: string;
  size: number;
  folder?: string;
  altText?: string;
  provider?: 'r2' | 'external';
  sourceType?: 'upload' | 'url';
  posterUrl?: string;
  posterKey?: string;
  originalFileName?: string;
  originalSize?: number;
  optimizedSize?: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
  referenceCount?: number;
  createdAt: string;
  updatedAt?: string;
  fileName?: string;
  originalName?: string;
  fileKey?: string;
  fileUrl?: string;
  fileSize?: number;
  caption?: string;
  tags?: string[];
}

export interface AdminCatalogLead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  requirement?: string;
  message?: string;
  inquiryType?: string;
  catalogName: string;
  entityType?: 'category' | 'product' | 'model' | 'general';
  entitySlug?: string;
  pdfUrl?: string;
  status: 'unread' | 'contacted' | 'resolved' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCatalogLeadStats {
  total: number;
  unread: number;
  contacted: number;
  resolved: number;
  archived: number;
  catalogsCount: number;
}
