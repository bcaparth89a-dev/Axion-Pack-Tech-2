import { Request } from 'express';
import { UserRole } from '../constants/roles.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface SpecificationItem {
  key?: string;
  label?: string;
  value: string;
  group?: string;
}
