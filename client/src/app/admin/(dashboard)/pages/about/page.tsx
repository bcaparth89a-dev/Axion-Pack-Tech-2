'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { CmsImage } from '@/components/common/CmsImage';
import {
  getAboutPageAdmin,
  updateAboutPageAdmin,
  getMediaConfigAdmin,
  uploadAndOptimizeImageAdmin,
  uploadAndOptimizeVideoAdmin,
  deleteMediaAdmin,
  MediaConfig,
} from '@/lib/api/admin';


import {
  AboutPageData,
  AboutMediaSliderItem,
  AboutStatItem,
  WhyChooseUsItem,
  CoreValueItem,
  staticAboutPageData,
} from '@/lib/api/pages';
import { renderCoreValueIcon } from '@/components/about/VisionMission';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { useToast } from '@/context/ToastContext';

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function renderStatIcon(icon?: string) {
  switch (icon) {
    case 'wrench':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      );
    case 'factory':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'award':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'globe':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'cpu':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'trending':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

const STAT_ICONS = [
  { id: 'wrench', label: 'Wrench (Machinery)' },
  { id: 'factory', label: 'Factory (Production)' },
  { id: 'award', label: 'Award (Pedigree)' },
  { id: 'shield', label: 'Shield (Reliability)' },
  { id: 'users', label: 'Users (Network)' },
  { id: 'globe', label: 'Globe (Worldwide)' },
  { id: 'cpu', label: 'CPU (Automation)' },
  { id: 'check', label: 'Check (Certified)' },
  { id: 'star', label: 'Star (Excellence)' },
  { id: 'trending', label: 'Trending (Performance)' },
  { id: '', label: 'None (No Icon)' },
];

function renderFeatureIcon(icon?: string) {
  const key = typeof icon === 'string' ? icon.toLowerCase().trim() : '';
  switch (key) {
    case 'compass':
    case 'engineering':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="5" r="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.93 19 4.24-10.2M14.83 8.8 19.07 19M14.83 14.8H9.17" />
        </svg>
      );
    case 'sliders':
    case 'custom':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="21" x2="14" y1="4" y2="4" strokeLinecap="round" />
          <line x1="10" x2="3" y1="4" y2="4" strokeLinecap="round" />
          <line x1="21" x2="12" y1="12" y2="12" strokeLinecap="round" />
          <line x1="8" x2="3" y1="12" y2="12" strokeLinecap="round" />
          <line x1="21" x2="16" y1="20" y2="20" strokeLinecap="round" />
          <line x1="12" x2="3" y1="20" y2="20" strokeLinecap="round" />
          <line x1="14" x2="14" y1="2" y2="6" strokeLinecap="round" />
          <line x1="8" x2="8" y1="10" y2="14" strokeLinecap="round" />
          <line x1="16" x2="16" y1="18" y2="22" strokeLinecap="round" />
        </svg>
      );
    case 'badge-check':
    case 'quality':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'headset':
    case 'support':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    case 'layers':
    case 'integration':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case 'globe':
    case 'standards':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'check-circle':
    case 'testing':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'award':
    case 'track-record':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'wrench':
    case 'turnkey':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'shield':
    case 'safety':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'cpu':
    case 'automation':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'clock':
    case 'sla':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'leaf':
    case 'sustainability':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 12" />
        </svg>
      );
    case 'users':
    case 'team':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
}

const FEATURE_CARD_ICONS = [
  { id: 'compass', label: 'Compass (Engineering)' },
  { id: 'sliders', label: 'Sliders (Customized)' },
  { id: 'badge-check', label: 'Badge Check (Quality)' },
  { id: 'headset', label: 'Headset (Support)' },
  { id: 'layers', label: 'Layers (Integration)' },
  { id: 'globe', label: 'Globe (Standards)' },
  { id: 'check-circle', label: 'Check Circle (Testing)' },
  { id: 'award', label: 'Award (Track Record)' },
  { id: 'wrench', label: 'Wrench (Turnkey)' },
  { id: 'shield', label: 'Shield (Safety)' },
  { id: 'cpu', label: 'CPU (Automation)' },
  { id: 'clock', label: 'Clock (SLA)' },
  { id: 'leaf', label: 'Leaf (Sustainability)' },
  { id: 'users', label: 'Users (Team)' },
];

const CORE_VALUE_ICONS = [
  { id: 'star', label: 'Star (Quality / Standards)' },
  { id: 'lightbulb', label: 'Lightbulb (Innovation / Tech)' },
  { id: 'handshake', label: 'Handshake (Integrity / Trust)' },
  { id: 'users', label: 'Users (Customer Focus / Team)' },
  { id: 'shield-check', label: 'Shield Check (Safety / Compliance)' },
  { id: 'leaf', label: 'Leaf (Sustainability / Eco)' },
  { id: 'award', label: 'Award (Excellence / Pedigree)' },
  { id: 'heart', label: 'Heart (Passion / Care)' },
  { id: 'target', label: 'Target (Focus / Accuracy)' },
  { id: 'zap', label: 'Zap (Speed / Efficiency)' },
  { id: 'globe', label: 'Globe (Global Reach)' },
  { id: 'scale', label: 'Scale (Ethics / Balance)' },
  { id: 'badge-check', label: 'Badge Check (Certified)' },
  { id: 'compass', label: 'Compass (Guiding Mission)' },
];

type TabKey =
  | 'hero'
  | 'slider'
  | 'narrative'
  | 'why-us'
  | 'vision-mission'
  | 'responsibilities'
  | 'visibility'
  | 'seo'
  | 'preview';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'hero', label: 'Hero & Intro', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
  { key: 'slider', label: 'Media Slider', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { key: 'narrative', label: 'Narrative & Stats', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'why-us', label: 'Why AXION', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'vision-mission', label: 'Vision, Mission & Values', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'responsibilities', label: 'Responsibilities', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'visibility', label: 'Section Visibility', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  { key: 'seo', label: 'SEO & Meta', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { key: 'preview', label: 'Inspection', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

export default function AdminAboutPageCMS() {
  const [data, setData] = useState<AboutPageData>(staticAboutPageData);
  const [initialData, setInitialData] = useState<AboutPageData>(staticAboutPageData);
  const [activeTab, setActiveTab] = useState<TabKey>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  // Media Config & Storage state
  const [mediaConfig, setMediaConfig] = useState<MediaConfig | null>(null);

  // Slide Modal State
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [slideFormData, setSlideFormData] = useState<AboutMediaSliderItem>({
    type: 'image',
    title: '',
    caption: '',
    url: '',
    posterUrl: '',
    alt: '',
    enabled: true,
    order: 1,
    autoplay: false,
    provider: 'external',
    sourceType: 'url',
  });

  // Modal upload & optimization state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceMode, setSourceMode] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'uploading' | 'optimizing' | 'success' | 'error'>('idle');
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [optimizationStats, setOptimizationStats] = useState<{
    originalSize?: number;
    optimizedSize?: number;
    reductionPercent?: number;
    format?: string;
  } | null>(null);

  // Dynamic Key Track Record Stats Modal State
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [editingStatIndex, setEditingStatIndex] = useState<number | null>(null);
  const [statFormData, setStatFormData] = useState<AboutStatItem>({
    value: '',
    label: '',
    highlight: '',
    icon: 'wrench',
    order: 1,
    enabled: true,
  });

  // Dynamic Why Choose Us (Feature Cards) Modal State
  const [featureCardModalOpen, setFeatureCardModalOpen] = useState(false);
  const [editingFeatureCardIndex, setEditingFeatureCardIndex] = useState<number | null>(null);
  const [featureCardFormData, setFeatureCardFormData] = useState<WhyChooseUsItem>({
    title: '',
    description: '',
    icon: 'compass',
    enabled: true,
    order: 1,
  });

  // Dynamic Core Values Modal State
  const [coreValueModalOpen, setCoreValueModalOpen] = useState(false);
  const [editingCoreValueIndex, setEditingCoreValueIndex] = useState<number | null>(null);
  const [coreValueFormData, setCoreValueFormData] = useState<CoreValueItem>({
    title: '',
    description: '',
    icon: 'star',
    enabled: true,
    order: 1,
  });

  const validateUrl = (urlStr: string): boolean => {
    if (!urlStr) return false;
    return /^https?:\/\/.+/i.test(urlStr) || /^\/.+/i.test(urlStr);
  };

  // Track unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // Load from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [res, cfg] = await Promise.all([
        getAboutPageAdmin<AboutPageData>(),
        getMediaConfigAdmin().catch(() => null),
      ]);

      if (cfg) {
        setMediaConfig(cfg);
      }

      if (res && Object.keys(res).length > 0) {
        // Deep merge with static fallback to ensure every key exists
        const merged: AboutPageData = {
          ...staticAboutPageData,
          ...res,
          hero: { ...staticAboutPageData.hero, ...res.hero },
          mediaSlider: {
            ...staticAboutPageData.mediaSlider,
            ...res.mediaSlider,
            items: res.mediaSlider?.items || staticAboutPageData.mediaSlider?.items || [],
          },
          aboutInfo: {
            ...staticAboutPageData.aboutInfo,
            ...res.aboutInfo,
            paragraphs: res.aboutInfo?.paragraphs || staticAboutPageData.aboutInfo?.paragraphs || [],
            stats: res.aboutInfo?.stats || staticAboutPageData.aboutInfo?.stats || [],
            capabilities: res.aboutInfo?.capabilities || staticAboutPageData.aboutInfo?.capabilities || [],
          },
          whyChooseUsSection: {
            ...staticAboutPageData.whyChooseUsSection,
            ...res.whyChooseUsSection,
            items: res.whyChooseUsSection?.items || staticAboutPageData.whyChooseUsSection?.items || [],
          },
          visionMission: {
            ...staticAboutPageData.visionMission,
            ...res.visionMission,
            coreValues:
              res.visionMission?.coreValues !== undefined
                ? res.visionMission.coreValues
                : (staticAboutPageData.visionMission?.coreValues || []),
          },
          responsibilitiesSection: {
            ...staticAboutPageData.responsibilitiesSection,
            ...res.responsibilitiesSection,
            points: res.responsibilitiesSection?.points || staticAboutPageData.responsibilitiesSection?.points || [],
          },
          sections: { ...staticAboutPageData.sections, ...res.sections },
          seo: { ...staticAboutPageData.seo, ...res.seo },
        };
        setData(merged);
        setInitialData(merged);
      } else {
        setData(staticAboutPageData);
        setInitialData(staticAboutPageData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load About page data';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      // 1. Update MongoDB document and invalidate Redis cache (handled by backend PUT /pages/about)
      await updateAboutPageAdmin(data);

      // 2. Immediately trigger Next.js on-demand revalidation for public pages
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/about-us', tag: 'about-page' }),
      }).catch(() => null);

      setInitialData(JSON.parse(JSON.stringify(data)));
      showToast('About Us page updated and live cache purged successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  }, [data, showToast]);

  // Ctrl+S / Cmd+S save hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && !isSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isSaving, handleSave]);

  const handleDiscard = () => {
    if (confirm('Discard all unsaved edits and revert to the last saved database state?')) {
      setData(JSON.parse(JSON.stringify(initialData)));
      showToast('Changes discarded', 'info');
    }
  };

  // Slide modal handlers
  const handleOpenAddSlide = () => {
    const currentItems = data.mediaSlider?.items || [];
    setEditingSlideIndex(null);
    setSlideFormData({
      type: 'image',
      title: '',
      caption: '',
      url: '',
      posterUrl: '',
      alt: 'AXION PackTech Industrial Facility',
      enabled: true,
      order: currentItems.length + 1,
      autoplay: false,
      provider: 'external',
      sourceType: 'url',
    });
    setSourceMode(mediaConfig?.r2Configured ? 'upload' : 'url');
    setSelectedFile(null);
    setFilePreview(null);
    setIsUploading(false);
    setUploadPhase('idle');
    setUploadProgressText('');
    setUrlError(null);
    setOptimizationStats(null);
    setSlideModalOpen(true);
  };

  const handleOpenEditSlide = (index: number) => {
    const slide = data.mediaSlider?.items?.[index];
    if (!slide) return;
    setEditingSlideIndex(index);
    setSlideFormData({ ...slide });
    setSourceMode(slide.sourceType || (slide.provider === 'r2' ? 'upload' : 'url'));
    setSelectedFile(null);
    setFilePreview(null);
    setIsUploading(false);
    setUploadPhase('idle');
    setUploadProgressText('');
    setUrlError(null);
    if (slide.originalSize && slide.optimizedSize) {
      const reduction = Math.round(
        ((slide.originalSize - slide.optimizedSize) / slide.originalSize) * 100
      );
      setOptimizationStats({
        originalSize: slide.originalSize,
        optimizedSize: slide.optimizedSize,
        reductionPercent: reduction > 0 ? reduction : 0,
        format: slide.format,
      });
    } else {
      setOptimizationStats(null);
    }
    setSlideModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file extensions strictly:
    // Image uploads: JPG, JPEG, PNG, WEBP, AVIF.
    // Video uploads: MP4, WEBM, MOV.
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (slideFormData.type === 'image') {
      const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
      if (!ext || !allowedExts.includes(ext)) {
        showToast('Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP, AVIF', 'error');
        return;
      }
      const maxImg = mediaConfig?.maxImageSize || 10 * 1024 * 1024;
      if (file.size > maxImg) {
        showToast(`Image size exceeds max allowed of ${formatBytes(maxImg)}`, 'error');
        return;
      }
    } else {
      const allowedExts = ['mp4', 'webm', 'mov'];
      if (!ext || !allowedExts.includes(ext)) {
        showToast('Invalid video format. Allowed formats: MP4, WEBM, MOV', 'error');
        return;
      }
      const maxVid = mediaConfig?.maxVideoSize || 100 * 1024 * 1024;
      if (file.size > maxVid) {
        showToast(`Video size exceeds max allowed of ${formatBytes(maxVid)}`, 'error');
        return;
      }
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setUploadPhase('idle');
    setOptimizationStats(null);
  };

  const handleRunUploadAndOptimization = async () => {
    if (!selectedFile) {
      showToast('Please select a file from your device first', 'error');
      return;
    }

    // Do NOT fake successful uploads when R2 is not configured
    if (!mediaConfig?.r2Configured) {
      showToast(
        'Cloudflare R2 is not configured on the backend. Local file upload is disabled. Please configure R2 in backend/.env or use Paste Public URL.',
        'error'
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadPhase('uploading');
      setUploadProgressText('Uploading media payload to AXION backend API...');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', slideFormData.title || selectedFile.name);

      if (slideFormData.type === 'image') {
        setTimeout(() => {
          setUploadPhase('optimizing');
          setUploadProgressText('Executing Sharp WebP compression & metadata sanitization...');
        }, 600);

        const res = await uploadAndOptimizeImageAdmin(formData);
        setSlideFormData((prev) => ({
          ...prev,
          url: res.url,
          mediaId: res.mediaId,
          provider: 'r2',
          sourceType: 'upload',
          format: res.format,
          width: res.width,
          height: res.height,
          originalSize: res.originalSize,
          optimizedSize: res.optimizedSize,
          originalFileName: res.originalFileName,
        }));

        setOptimizationStats({
          originalSize: res.originalSize,
          optimizedSize: res.optimizedSize,
          reductionPercent: res.reductionPercent,
          format: res.format,
        });
      } else {
        setTimeout(() => {
          setUploadPhase('optimizing');
          setUploadProgressText('Transcoding video (H.264 MP4) & extracting WebP poster frame...');
        }, 800);

        const res = await uploadAndOptimizeVideoAdmin(formData);
        setSlideFormData((prev) => ({
          ...prev,
          url: res.url,
          posterUrl: res.posterUrl || prev.posterUrl,
          mediaId: res.mediaId,
          provider: 'r2',
          sourceType: 'upload',
          format: res.format,
          width: res.width,
          height: res.height,
          duration: res.duration,
          originalSize: res.originalSize,
          optimizedSize: res.optimizedSize,
          originalFileName: res.originalFileName,
        }));

        setOptimizationStats({
          originalSize: res.originalSize,
          optimizedSize: res.optimizedSize,
          reductionPercent: res.reductionPercent,
          format: res.format,
        });
      }

      setUploadPhase('success');
      setUploadProgressText('Optimization and Cloudflare R2 storage upload complete!');
      showToast('Media optimized and uploaded successfully!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Media upload and optimization failed';
      setUploadPhase('error');
      setUploadProgressText(msg);
      showToast(msg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideFormData.title.trim()) {
      showToast('Slide Title is required', 'error');
      return;
    }

    if (sourceMode === 'url') {
      if (!slideFormData.url.trim()) {
        showToast('Please enter a Public URL', 'error');
        return;
      }
      if (!validateUrl(slideFormData.url.trim())) {
        showToast('Public URL must start with http://, https://, or /', 'error');
        return;
      }
    } else {
      if (!slideFormData.url.trim()) {
        if (selectedFile && !optimizationStats) {
          showToast('Please click "Upload & Optimize" before saving this slide', 'error');
        } else {
          showToast('Please select and upload a media file from your device, or choose "Paste Public URL"', 'error');
        }
        return;
      }
    }

    const currentItems = [...(data.mediaSlider?.items || [])];
    if (editingSlideIndex !== null) {
      currentItems[editingSlideIndex] = slideFormData;
    } else {
      currentItems.push(slideFormData);
    }

    setData((prev) => ({
      ...prev,
      mediaSlider: {
        ...prev.mediaSlider,
        items: currentItems,
      },
    }));

    setSlideModalOpen(false);
    showToast(
      editingSlideIndex !== null ? 'Slide updated' : 'New slide added to slider',
      'success'
    );
  };

  const handleDeleteSlide = async (index: number) => {
    if (!confirm('Are you sure you want to remove this slide?')) return;
    const slide = data.mediaSlider?.items?.[index];
    if (slide?.mediaId) {
      try {
        await deleteMediaAdmin(slide.mediaId);
      } catch {
        // Safe delete: if reference was shared or server error, continue gracefully
      }
    }
    const currentItems = [...(data.mediaSlider?.items || [])];
    currentItems.splice(index, 1);
    setData((prev) => ({
      ...prev,
      mediaSlider: {
        ...prev.mediaSlider,
        items: currentItems,
      },
    }));
    showToast('Slide removed', 'info');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const items = [...(data.mediaSlider?.items || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // Reassign order
    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      mediaSlider: {
        ...prev.mediaSlider,
        items,
      },
    }));
  };

  const handleToggleSlideEnabled = (index: number) => {
    const items = [...(data.mediaSlider?.items || [])];
    items[index] = { ...items[index], enabled: !items[index].enabled };
    setData((prev) => ({
      ...prev,
      mediaSlider: {
        ...prev.mediaSlider,
        items,
      },
    }));
  };

  // Dynamic Key Track Record Stats Handlers
  const handleOpenAddStat = () => {
    const currentStats = data.aboutInfo?.stats || [];
    setEditingStatIndex(null);
    setStatFormData({
      value: '',
      label: '',
      highlight: '',
      icon: 'wrench',
      order: currentStats.length + 1,
      enabled: true,
    });
    setStatModalOpen(true);
  };

  const handleOpenEditStat = (index: number) => {
    const stat = data.aboutInfo?.stats?.[index];
    if (!stat) return;
    setEditingStatIndex(index);
    setStatFormData({
      value: stat.value || '',
      label: stat.label || '',
      highlight: stat.highlight || '',
      icon: stat.icon || '',
      order: stat.order ?? (index + 1),
      enabled: stat.enabled !== false,
    });
    setStatModalOpen(true);
  };

  const handleSaveStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statFormData.value.trim()) {
      showToast('Metric Value is required (e.g. 25+, 4,000+, Est. 2000)', 'error');
      return;
    }
    if (!statFormData.label.trim()) {
      showToast('Metric Label is required (e.g. Machine Products)', 'error');
      return;
    }

    const currentStats = [...(data.aboutInfo?.stats || [])];
    if (editingStatIndex !== null) {
      currentStats[editingStatIndex] = { ...statFormData };
    } else {
      currentStats.push({ ...statFormData });
    }

    setData((prev) => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        stats: currentStats,
      },
    }));

    setStatModalOpen(false);
    showToast(
      editingStatIndex !== null ? 'Statistic updated successfully' : 'New statistic card added',
      'success'
    );
  };

  const handleDeleteStat = (index: number) => {
    const stat = data.aboutInfo?.stats?.[index];
    const name = stat?.label ? `"${stat.label}"` : 'this statistic card';
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    const currentStats = [...(data.aboutInfo?.stats || [])];
    currentStats.splice(index, 1);
    // Re-assign display order
    currentStats.forEach((st, idx) => {
      st.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        stats: currentStats,
      },
    }));
    showToast('Statistic card removed', 'info');
  };

  const handleMoveStat = (index: number, direction: 'up' | 'down') => {
    const stats = [...(data.aboutInfo?.stats || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stats.length) return;

    const temp = stats[index];
    stats[index] = stats[targetIdx];
    stats[targetIdx] = temp;

    stats.forEach((st, idx) => {
      st.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        stats,
      },
    }));
  };

  const handleToggleStatEnabled = (index: number) => {
    const stats = [...(data.aboutInfo?.stats || [])];
    const current = stats[index].enabled !== false;
    stats[index] = { ...stats[index], enabled: !current };
    setData((prev) => ({
      ...prev,
      aboutInfo: {
        ...prev.aboutInfo,
        stats,
      },
    }));
    showToast(
      `Statistic ${!current ? 'enabled' : 'disabled'}`,
      !current ? 'success' : 'info'
    );
  };

  // Dynamic Why Choose Us (Feature Cards) Handlers
  const handleOpenAddFeatureCard = () => {
    const currentCards = data.whyChooseUsSection?.items || [];
    setEditingFeatureCardIndex(null);
    setFeatureCardFormData({
      title: '',
      description: '',
      icon: 'compass',
      enabled: true,
      order: currentCards.length + 1,
    });
    setFeatureCardModalOpen(true);
  };

  const handleOpenEditFeatureCard = (index: number) => {
    const card = data.whyChooseUsSection?.items?.[index];
    if (!card) return;
    setEditingFeatureCardIndex(index);
    setFeatureCardFormData({
      title: card.title || '',
      description: card.description || '',
      icon: card.icon || 'compass',
      enabled: card.enabled !== false,
      order: card.order ?? (index + 1),
    });
    setFeatureCardModalOpen(true);
  };

  const handleSaveFeatureCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureCardFormData.title.trim()) {
      showToast('Card Title is required', 'error');
      return;
    }
    if (!featureCardFormData.description.trim()) {
      showToast('Card Description is required', 'error');
      return;
    }

    const currentItems = [...(data.whyChooseUsSection?.items || [])];
    if (editingFeatureCardIndex !== null) {
      currentItems[editingFeatureCardIndex] = { ...featureCardFormData };
    } else {
      currentItems.push({ ...featureCardFormData });
    }

    setData((prev) => ({
      ...prev,
      whyChooseUsSection: {
        ...prev.whyChooseUsSection,
        items: currentItems,
      },
    }));

    setFeatureCardModalOpen(false);
    showToast(
      editingFeatureCardIndex !== null
        ? 'Feature card updated successfully'
        : 'New feature card added',
      'success'
    );
  };

  const handleDeleteFeatureCard = (index: number) => {
    const card = data.whyChooseUsSection?.items?.[index];
    const name = card?.title ? `"${card.title}"` : 'this feature card';
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const currentItems = [...(data.whyChooseUsSection?.items || [])];
    currentItems.splice(index, 1);
    currentItems.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      whyChooseUsSection: {
        ...prev.whyChooseUsSection,
        items: currentItems,
      },
    }));
    showToast('Feature card deleted', 'info');
  };

  const handleMoveFeatureCard = (index: number, direction: 'up' | 'down') => {
    const items = [...(data.whyChooseUsSection?.items || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    items.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      whyChooseUsSection: {
        ...prev.whyChooseUsSection,
        items,
      },
    }));
  };

  const handleToggleFeatureCardEnabled = (index: number) => {
    const items = [...(data.whyChooseUsSection?.items || [])];
    const current = items[index].enabled !== false;
    items[index] = { ...items[index], enabled: !current };
    setData((prev) => ({
      ...prev,
      whyChooseUsSection: {
        ...prev.whyChooseUsSection,
        items,
      },
    }));
    showToast(
      `Feature card ${!current ? 'enabled' : 'disabled'}`,
      !current ? 'success' : 'info'
    );
  };

  // Dynamic Vision, Mission & Core Values Handlers
  const handleOpenAddCoreValue = () => {
    const currentValues = data.visionMission?.coreValues || [];
    setEditingCoreValueIndex(null);
    setCoreValueFormData({
      title: '',
      description: '',
      icon: 'star',
      enabled: true,
      order: currentValues.length + 1,
    });
    setCoreValueModalOpen(true);
  };

  const handleOpenEditCoreValue = (index: number) => {
    const val = data.visionMission?.coreValues?.[index];
    if (!val) return;
    setEditingCoreValueIndex(index);
    setCoreValueFormData({
      title: val.title || '',
      description: val.description || '',
      icon: val.icon || 'star',
      enabled: val.enabled !== false,
      order: val.order ?? (index + 1),
    });
    setCoreValueModalOpen(true);
  };

  const handleSaveCoreValue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coreValueFormData.title.trim()) {
      showToast('Core Value Title is required', 'error');
      return;
    }
    if (!coreValueFormData.description.trim()) {
      showToast('Core Value Description is required', 'error');
      return;
    }

    const currentValues = [...(data.visionMission?.coreValues || [])];
    if (editingCoreValueIndex !== null) {
      currentValues[editingCoreValueIndex] = { ...coreValueFormData };
    } else {
      currentValues.push({ ...coreValueFormData });
    }

    setData((prev) => ({
      ...prev,
      visionMission: {
        ...prev.visionMission,
        coreValues: currentValues,
      },
    }));

    setCoreValueModalOpen(false);
    showToast(
      editingCoreValueIndex !== null
        ? 'Core value updated successfully'
        : 'New core value added',
      'success'
    );
  };

  const handleDeleteCoreValue = (index: number) => {
    const val = data.visionMission?.coreValues?.[index];
    const name = val?.title ? `"${val.title}"` : 'this core value';
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    const currentValues = [...(data.visionMission?.coreValues || [])];
    currentValues.splice(index, 1);
    currentValues.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      visionMission: {
        ...prev.visionMission,
        coreValues: currentValues,
      },
    }));
    showToast('Core value deleted', 'info');
  };

  const handleMoveCoreValue = (index: number, direction: 'up' | 'down') => {
    const values = [...(data.visionMission?.coreValues || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= values.length) return;

    const temp = values[index];
    values[index] = values[targetIdx];
    values[targetIdx] = temp;

    values.forEach((item, idx) => {
      item.order = idx + 1;
    });

    setData((prev) => ({
      ...prev,
      visionMission: {
        ...prev.visionMission,
        coreValues: values,
      },
    }));
  };

  const handleToggleCoreValueEnabled = (index: number) => {
    const values = [...(data.visionMission?.coreValues || [])];
    const current = values[index].enabled !== false;
    values[index] = { ...values[index], enabled: !current };
    setData((prev) => ({
      ...prev,
      visionMission: {
        ...prev.visionMission,
        coreValues: values,
      },
    }));
    showToast(
      `Core value ${!current ? 'enabled' : 'disabled'}`,
      !current ? 'success' : 'info'
    );
  };

  if (isLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Loading About Us CMS Engine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-500">Pages</span>
            <span>/</span>
            <span className="text-sky-400 font-medium">About Us</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            About Us Page Management
            {isDirty ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Unsaved Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Synced &amp; Saved
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage public About Us content, corporate narrative, industrial pedigree, and the interactive Apple-style right-side media slider without editing source code.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={!isDirty || isSaving}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Discard
          </button>

          <Link
            href="/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-sky-300 text-xs font-semibold rounded-xl border border-sky-500/30 transition-all flex items-center gap-2 group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Preview Live Page</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-950 transition-all flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving CMS...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB STRIP */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
              {tab.key === 'slider' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-300'
                }`}>
                  {data.mediaSlider?.items?.length || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT PANELS */}
      <div className="space-y-6">
        {/* =========================================================
            TAB 1: HERO & INTRO
        ========================================================= */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                    Hero Banner Configuration
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls the left-side text narrative and background imagery of the public hero section.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400 font-medium">Show Hero Section</span>
                  <input
                    type="checkbox"
                    checked={data.sections?.hero !== false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, hero: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Eyebrow / Small Badge Text
                  </label>
                  <input
                    type="text"
                    value={data.hero?.eyebrow || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, eyebrow: e.target.value },
                      }))
                    }
                    placeholder="Corporate Profile & Engineering Pedigree"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Background Image Path / URL
                  </label>
                  <input
                    type="text"
                    value={data.hero?.image || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, image: e.target.value },
                      }))
                    }
                    placeholder="/images/about_hero_building.jpg"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Hero Primary Heading
                  </label>
                  <input
                    type="text"
                    value={data.hero?.title || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value },
                      }))
                    }
                    placeholder="Engineering Innovation."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Highlighted Title (Gradient Accent)
                  </label>
                  <input
                    type="text"
                    value={data.hero?.highlightedTitle || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, highlightedTitle: e.target.value },
                      }))
                    }
                    placeholder="Building Tomorrow."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-sky-400 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Hero Narrative / Description
                </label>
                <textarea
                  rows={3}
                  value={data.hero?.description || data.hero?.subtitle || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      hero: {
                        ...prev.hero,
                        description: e.target.value,
                        subtitle: e.target.value,
                      },
                    }))
                  }
                  placeholder="AXION PackTech delivers innovative packaging, bagging, processing, and industrial automation solutions engineered for the future."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              {/* Call-to-Action (CTA) Config */}
              <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.hero?.showCta === true}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          hero: { ...prev.hero, showCta: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Show Hero Action Button (CTA)
                    </span>
                  </label>
                </div>

                {data.hero?.showCta && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Button Label</label>
                      <input
                        type="text"
                        value={data.hero?.ctaText || ''}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, ctaText: e.target.value },
                          }))
                        }
                        placeholder="Explore Engineering Solutions"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Target Destination URL</label>
                      <input
                        type="text"
                        value={data.hero?.ctaUrl || ''}
                        onChange={(e) =>
                          setData((prev) => ({
                            ...prev,
                            hero: { ...prev.hero, ctaUrl: e.target.value },
                          }))
                        }
                        placeholder="/products"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: RIGHT-SIDE MEDIA SLIDER (APPLE-STYLE)
        ========================================================= */}
        {activeTab === 'slider' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              {/* Slider Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    Apple-Style Interactive Media Slider
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Positioned prominently on the right side of the About Hero. Supports high-res photography, MP4 video loops, autoplay, captions, and micro-animations.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={data.mediaSlider?.enabled !== false}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          mediaSlider: { ...prev.mediaSlider, enabled: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-sky-500"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      Enable Slider
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={handleOpenAddSlide}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add New Slide</span>
                  </button>
                </div>
              </div>

              {/* R2 Storage & Optimization Status Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                  mediaConfig?.r2Configured
                    ? 'bg-sky-950/20 border-sky-500/20 text-sky-200'
                    : 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      mediaConfig?.r2Configured
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {mediaConfig?.r2Configured
                          ? 'Cloudflare R2 Storage Active'
                          : 'Public URL Fallback Mode'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          mediaConfig?.r2Configured
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {mediaConfig?.r2Configured ? 'READY' : 'STANDBY'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {mediaConfig?.r2Configured
                        ? 'Direct upload enabled with automated Sharp WebP compression (max 1920px) and FFmpeg MP4 video transcoding with poster extraction.'
                        : 'Cloudflare R2 is unconfigured in backend/.env. Slides can be linked via direct public URLs or static local assets without crashing.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    Max Image: {formatBytes(mediaConfig?.maxImageSize || 10 * 1024 * 1024)} | Max Video: {formatBytes(mediaConfig?.maxVideoSize || 100 * 1024 * 1024)}
                  </span>
                </div>
              </div>

              {/* Slider Section Heading */}
              <div className="max-w-md space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Slider Header Badge / Label
                </label>
                <input
                  type="text"
                  value={data.mediaSlider?.heading || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      mediaSlider: { ...prev.mediaSlider, heading: e.target.value },
                    }))
                  }
                  placeholder="Engineering in Motion"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Slider Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Configured Slides ({(data.mediaSlider?.items || []).length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Use Up/Down arrows to reorder slide sequence
                  </span>
                </div>

                {(!data.mediaSlider?.items || data.mediaSlider.items.length === 0) ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-slate-500">No slides configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddSlide}
                      className="px-4 py-2 bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600/30 rounded-xl text-xs font-semibold"
                    >
                      Add First Slide
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {data.mediaSlider.items.map((slide, idx) => {
                      const isImage = slide.type === 'image';
                      const isR2 = slide.provider === 'r2' || slide.sourceType === 'upload';
                      return (
                        <div
                          key={idx}
                          className={`p-4 bg-slate-950 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                            slide.enabled
                              ? 'border-slate-800 hover:border-slate-700'
                              : 'border-slate-900 opacity-60'
                          }`}
                        >
                          {/* Slide Preview & Details */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                              {isImage ? (
                                <CmsImage
                                  src={slide.url}
                                  alt={slide.alt || slide.title}
                                  fill
                                  sizes="112px"
                                  className="object-cover"
                                  fallbackSrc="/images/about_hero_building.jpg"
                                />
                              ) : slide.posterUrl ? (
                                <div className="relative w-full h-full">
                                  <CmsImage
                                    src={slide.posterUrl}
                                    alt={slide.alt || slide.title}
                                    fill
                                    sizes="112px"
                                    className="object-cover brightness-75"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center text-white/90">
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 3l6 3-6 3V7z" />
                                    </svg>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-sky-400">
                                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 3l6 3-6 3V7z" />
                                  </svg>
                                </div>
                              )}
                              <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-black/80 text-white uppercase tracking-wider">
                                {slide.type}
                              </span>
                            </div>

                            <div className="min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500">#{idx + 1}</span>
                                <h4 className="text-xs font-bold text-white truncate max-w-sm">
                                  {slide.title}
                                </h4>

                                {slide.enabled ? (
                                  <AdminBadge variant="success" size="sm">Active</AdminBadge>
                                ) : (
                                  <AdminBadge variant="neutral" size="sm">Disabled</AdminBadge>
                                )}

                                {/* Storage Source Badge */}
                                {isR2 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                                    </svg>
                                    Cloudflare R2
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                    </svg>
                                    External / Static
                                  </span>
                                )}

                                {/* Format Badge */}
                                {slide.format && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                    {slide.format.toUpperCase()}
                                  </span>
                                )}

                                {/* File Size / Savings */}
                                {slide.optimizedSize ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <span>{formatBytes(slide.optimizedSize)}</span>
                                    {slide.originalSize && slide.originalSize > slide.optimizedSize && (
                                      <span className="text-[10px] font-bold text-emerald-400">
                                        (-{Math.round(((slide.originalSize - slide.optimizedSize) / slide.originalSize) * 100)}%)
                                      </span>
                                    )}
                                  </span>
                                ) : null}
                              </div>

                              <p className="text-[11px] text-slate-400 truncate max-w-md">
                                {slide.caption || 'No caption provided'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                                {slide.url}
                              </p>
                            </div>
                          </div>

                          {/* Slide Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Move Up / Down */}
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'up')}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSlide(idx, 'down')}
                              disabled={idx === data.mediaSlider!.items!.length - 1}
                              title="Move Down"
                              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleSlideEnabled(idx)}
                              title={slide.enabled ? 'Deactivate Slide' : 'Activate Slide'}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
                                slide.enabled
                                  ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60'
                              }`}
                            >
                              {slide.enabled ? 'Disable' : 'Enable'}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditSlide(idx)}
                              className="px-3 py-1.5 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-xs font-semibold"
                            >
                              Edit
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSlide(idx)}
                              className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30"
                              title="Delete Slide"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: COMPANY NARRATIVE & STATS
        ========================================================= */}
        {activeTab === 'narrative' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Company Narrative &amp; Pedigree
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls brand badge, corporate title, tagline, facility location, multi-paragraph story, and stats.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400 font-medium">Show Section</span>
                  <input
                    type="checkbox"
                    checked={data.sections?.aboutInfo !== false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, aboutInfo: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Badge Label</label>
                  <input
                    type="text"
                    value={data.aboutInfo?.badge || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        aboutInfo: { ...prev.aboutInfo, badge: e.target.value },
                      }))
                    }
                    placeholder="About Us"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Section Heading</label>
                  <input
                    type="text"
                    value={data.aboutInfo?.heading || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        aboutInfo: { ...prev.aboutInfo, heading: e.target.value },
                      }))
                    }
                    placeholder="About AXION PackTech"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tagline</label>
                  <input
                    type="text"
                    value={data.aboutInfo?.tagline || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        aboutInfo: { ...prev.aboutInfo, tagline: e.target.value },
                      }))
                    }
                    placeholder="Engineering Packaging Excellence"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Plant / Corporate Location</label>
                  <input
                    type="text"
                    value={data.aboutInfo?.location || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        aboutInfo: { ...prev.aboutInfo, location: e.target.value },
                      }))
                    }
                    placeholder="Vadodara, Gujarat, India"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Story Paragraphs */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Narrative Paragraphs
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const paragraphs = [...(data.aboutInfo?.paragraphs || [])];
                      paragraphs.push('');
                      setData((prev) => ({
                        ...prev,
                        aboutInfo: { ...prev.aboutInfo, paragraphs },
                      }));
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + Add Paragraph
                  </button>
                </div>

                {(data.aboutInfo?.paragraphs || []).map((p, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const paragraphs = [...(data.aboutInfo?.paragraphs || [])];
                        paragraphs[idx] = e.target.value;
                        setData((prev) => ({
                          ...prev,
                          aboutInfo: { ...prev.aboutInfo, paragraphs },
                        }));
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const paragraphs = [...(data.aboutInfo?.paragraphs || [])];
                        paragraphs.splice(idx, 1);
                        setData((prev) => ({
                          ...prev,
                          aboutInfo: { ...prev.aboutInfo, paragraphs },
                        }));
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30 mt-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Dynamic Stats Highlights */}
              <div className="space-y-4 pt-5 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      Key Track Record Stats
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {(data.aboutInfo?.stats || []).length} configured
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dynamic track record badges displayed inside the official dark navy brand card on the public /about-us page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddStat}
                    className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>+ Add Statistic</span>
                  </button>
                </div>

                {(!data.aboutInfo?.stats || data.aboutInfo.stats.length === 0) ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-slate-500">No statistics configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddStat}
                      className="px-4 py-2 bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600/30 rounded-xl text-xs font-semibold"
                    >
                      + Add First Statistic
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {data.aboutInfo.stats.map((st, idx) => {
                      const isEnabled = st.enabled !== false;
                      const statIcon = renderStatIcon(st.icon);
                      return (
                        <div
                          key={idx}
                          className={`p-4 bg-slate-950 border rounded-2xl space-y-3.5 transition-all flex flex-col justify-between ${
                            isEnabled
                              ? 'border-slate-800 hover:border-slate-700'
                              : 'border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="space-y-2.5">
                            {/* Card Top: Order + Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-slate-500">
                                  #{idx + 1}
                                </span>
                                {isEnabled ? (
                                  <AdminBadge variant="success" size="sm">Active</AdminBadge>
                                ) : (
                                  <AdminBadge variant="neutral" size="sm">Disabled</AdminBadge>
                                )}
                              </div>

                              {st.highlight && (
                                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                                  {st.highlight}
                                </span>
                              )}
                            </div>

                            {/* Card Body: Icon + Value + Label */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 shrink-0">
                                {statIcon || (
                                  <span className="text-[10px] font-mono text-slate-600">N/A</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xl font-mono font-black text-white block leading-tight">
                                  {st.value}
                                </span>
                                <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
                                  {st.label}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Controls */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-900 gap-1.5">
                            {/* Move Up/Down */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveStat(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Earlier"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveStat(idx, 'down')}
                                disabled={idx === data.aboutInfo!.stats!.length - 1}
                                title="Move Later"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Enable/Disable + Edit + Delete */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStatEnabled(idx)}
                                title={isEnabled ? 'Disable Statistic' : 'Enable Statistic'}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                                  isEnabled
                                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60'
                                }`}
                              >
                                {isEnabled ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditStat(idx)}
                                className="px-2.5 py-1 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-[11px] font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteStat(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30"
                                title="Delete Statistic"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: WHY CHOOSE AXION
        ========================================================= */}
        {activeTab === 'why-us' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    Why Choose AXION PackTech (Feature Cards)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage the 8 distinct engineering advantage cards displayed on the public site.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400 font-medium">Show Section</span>
                  <input
                    type="checkbox"
                    checked={data.sections?.whyChooseUs !== false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, whyChooseUs: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Section Eyebrow</label>
                  <input
                    type="text"
                    value={data.whyChooseUsSection?.badge || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        whyChooseUsSection: { ...prev.whyChooseUsSection, badge: e.target.value },
                      }))
                    }
                    placeholder="WHY US"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Main Heading</label>
                  <input
                    type="text"
                    value={data.whyChooseUsSection?.heading || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        whyChooseUsSection: { ...prev.whyChooseUsSection, heading: e.target.value },
                      }))
                    }
                    placeholder="Why Choose Axion PackTech"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Feature Cards Header & CRUD Grid */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                      Configured Feature Cards
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {(data.whyChooseUsSection?.items || []).length} cards
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dynamic engineering advantage cards displayed on the public /about-us page in 4-column desktop grid.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddFeatureCard}
                    className="px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 border border-teal-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>+ Add Feature Card</span>
                  </button>
                </div>

                {(!data.whyChooseUsSection?.items || data.whyChooseUsSection.items.length === 0) ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-slate-500">No feature cards configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddFeatureCard}
                      className="px-4 py-2 bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600/30 rounded-xl text-xs font-semibold"
                    >
                      + Add First Feature Card
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.whyChooseUsSection.items.map((item, idx) => {
                      const isEnabled = item.enabled !== false;
                      return (
                        <div
                          key={idx}
                          className={`p-4 bg-slate-950 border rounded-2xl space-y-3.5 transition-all flex flex-col justify-between ${
                            isEnabled
                              ? 'border-slate-800 hover:border-slate-700'
                              : 'border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Top: Order + Badge */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-slate-500">
                                  #{idx + 1}
                                </span>
                                {isEnabled ? (
                                  <AdminBadge variant="success" size="sm">Active</AdminBadge>
                                ) : (
                                  <AdminBadge variant="neutral" size="sm">Disabled</AdminBadge>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                Icon: {item.icon || 'compass'}
                              </span>
                            </div>

                            {/* Card Body: Icon & Content */}
                            <div className="flex items-start gap-3.5">
                              <div className="w-11 h-11 rounded-xl bg-[#16395F] text-white flex items-center justify-center shrink-0 border border-white/10 shadow-sm">
                                {renderFeatureIcon(item.icon)}
                              </div>
                              <div className="min-w-0 space-y-1">
                                <h4 className="text-xs font-bold text-white tracking-tight truncate">
                                  {item.title}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Controls */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 gap-2">
                            {/* Up / Down Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveFeatureCard(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Earlier"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveFeatureCard(idx, 'down')}
                                disabled={idx === data.whyChooseUsSection!.items!.length - 1}
                                title="Move Later"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Enable/Disable + Edit + Delete Controls */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatureCardEnabled(idx)}
                                title={isEnabled ? 'Disable Feature Card' : 'Enable Feature Card'}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                                  isEnabled
                                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60'
                                }`}
                              >
                                {isEnabled ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditFeatureCard(idx)}
                                className="px-2.5 py-1 bg-teal-600/20 text-teal-400 hover:bg-teal-600/30 border border-teal-500/30 rounded-lg text-[11px] font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteFeatureCard(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30"
                                title="Delete Feature Card"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: VISION, MISSION & VALUES
        ========================================================= */}
        {activeTab === 'vision-mission' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Vision, Mission &amp; Core Values
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls corporate charter statements and the 6 organizational core values.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400 font-medium">Show Section</span>
                  <input
                    type="checkbox"
                    checked={data.sections?.visionMission !== false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, visionMission: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                  />
                </label>
              </div>

              {/* Vision Card */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase">
                  <span>Corporate Vision Card</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Badge</label>
                    <input
                      type="text"
                      value={data.visionMission?.visionBadge || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          visionMission: { ...prev.visionMission, visionBadge: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Title</label>
                    <input
                      type="text"
                      value={data.visionMission?.visionTitle || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          visionMission: { ...prev.visionMission, visionTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Statement</label>
                  <textarea
                    rows={3}
                    value={data.visionMission?.visionText || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        visionMission: { ...prev.visionMission, visionText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Mission Card */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase">
                  <span>Corporate Mission Card</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Badge</label>
                    <input
                      type="text"
                      value={data.visionMission?.missionBadge || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          visionMission: { ...prev.visionMission, missionBadge: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Title</label>
                    <input
                      type="text"
                      value={data.visionMission?.missionTitle || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          visionMission: { ...prev.visionMission, missionTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Statement</label>
                  <textarea
                    rows={3}
                    value={data.visionMission?.missionText || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        visionMission: { ...prev.visionMission, missionText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Dynamic Core Values Section */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                      Configured Core Values
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {(data.visionMission?.coreValues || []).length} values
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Corporate foundation and cultural pillars displayed on the public /about-us page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddCoreValue}
                    className="px-3.5 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>+ Add Core Value</span>
                  </button>
                </div>

                {(!data.visionMission?.coreValues || data.visionMission.coreValues.length === 0) ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                    <p className="text-xs text-slate-500">No core values configured yet.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddCoreValue}
                      className="px-4 py-2 bg-sky-600/20 text-sky-400 border border-sky-500/30 hover:bg-sky-600/30 rounded-xl text-xs font-semibold"
                    >
                      + Add First Core Value
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.visionMission.coreValues.map((val, idx) => {
                      const isEnabled = val.enabled !== false;
                      return (
                        <div
                          key={idx}
                          className={`p-4 bg-slate-950 border rounded-2xl space-y-3.5 transition-all flex flex-col justify-between ${
                            isEnabled
                              ? 'border-slate-800 hover:border-slate-700'
                              : 'border-slate-900 opacity-60'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Top: Order + Status */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-bold text-slate-500">
                                  #{idx + 1}
                                </span>
                                {isEnabled ? (
                                  <AdminBadge variant="success" size="sm">Active</AdminBadge>
                                ) : (
                                  <AdminBadge variant="neutral" size="sm">Disabled</AdminBadge>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                Icon: {val.icon || 'star'}
                              </span>
                            </div>

                            {/* Card Body: Icon & Content */}
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-sky-950/80 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/20 shadow-sm">
                                {renderCoreValueIcon(val.icon)}
                              </div>
                              <div className="min-w-0 space-y-1">
                                <h4 className="text-xs font-bold text-white tracking-tight truncate">
                                  {val.title}
                                </h4>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                  {val.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Controls */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 gap-2">
                            {/* Up / Down Controls */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveCoreValue(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Earlier"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCoreValue(idx, 'down')}
                                disabled={idx === data.visionMission!.coreValues!.length - 1}
                                title="Move Later"
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 rounded-lg text-slate-400 hover:text-white border border-slate-800"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            {/* Enable/Disable + Edit + Delete Controls */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleCoreValueEnabled(idx)}
                                title={isEnabled ? 'Disable Core Value' : 'Enable Core Value'}
                                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                                  isEnabled
                                    ? 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                                    : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60'
                                }`}
                              >
                                {isEnabled ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditCoreValue(idx)}
                                className="px-2.5 py-1 bg-sky-600/20 text-sky-400 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg text-[11px] font-semibold"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteCoreValue(idx)}
                                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-500/30"
                                title="Delete Core Value"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: RESPONSIBILITIES
        ========================================================= */}
        {activeTab === 'responsibilities' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Our Responsibilities (Sustainability Section)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Green engineering commitments, sustainability image, eco-pledge badge, and key sustainability points.
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-slate-400 font-medium">Show Section</span>
                  <input
                    type="checkbox"
                    checked={data.sections?.responsibilities !== false}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        sections: { ...prev.sections, responsibilities: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Badge</label>
                  <input
                    type="text"
                    value={data.responsibilitiesSection?.badge || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: {
                          ...prev.responsibilitiesSection,
                          badge: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Heading</label>
                  <input
                    type="text"
                    value={data.responsibilitiesSection?.heading || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: {
                          ...prev.responsibilitiesSection,
                          heading: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Narrative Description</label>
                <textarea
                  rows={3}
                  value={data.responsibilitiesSection?.description || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      responsibilitiesSection: {
                        ...prev.responsibilitiesSection,
                        description: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sustainability Image</label>
                  <input
                    type="text"
                    value={data.responsibilitiesSection?.image || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: {
                          ...prev.responsibilitiesSection,
                          image: e.target.value,
                        },
                      }))
                    }
                    placeholder="/images/about_sustainability.jpg"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Eco-Pledge Title</label>
                  <input
                    type="text"
                    value={data.responsibilitiesSection?.badgeTitle || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: {
                          ...prev.responsibilitiesSection,
                          badgeTitle: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Eco-Pledge Subtitle</label>
                  <input
                    type="text"
                    value={data.responsibilitiesSection?.badgeSubtitle || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: {
                          ...prev.responsibilitiesSection,
                          badgeSubtitle: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Bullet Points */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Key Sustainability Points
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const points = [...(data.responsibilitiesSection?.points || [])];
                      points.push('');
                      setData((prev) => ({
                        ...prev,
                        responsibilitiesSection: { ...prev.responsibilitiesSection, points },
                      }));
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + Add Point
                  </button>
                </div>

                {(data.responsibilitiesSection?.points || []).map((pt, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-xs text-slate-500 font-mono">#{idx + 1}</span>
                    <input
                      type="text"
                      value={pt}
                      onChange={(e) => {
                        const points = [...(data.responsibilitiesSection?.points || [])];
                        points[idx] = e.target.value;
                        setData((prev) => ({
                          ...prev,
                          responsibilitiesSection: { ...prev.responsibilitiesSection, points },
                        }));
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const points = [...(data.responsibilitiesSection?.points || [])];
                        points.splice(idx, 1);
                        setData((prev) => ({
                          ...prev,
                          responsibilitiesSection: { ...prev.responsibilitiesSection, points },
                        }));
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 7: SECTION VISIBILITY TOGGLES
        ========================================================= */}
        {activeTab === 'visibility' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  Section Visibility Controls
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Easily toggle entire blocks of the public /about page on or off without code deployment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'hero', title: 'About Hero Banner', desc: 'Displays corporate profile eyebrow, title, and background architecture.' },
                  { key: 'mediaSlider', title: 'Apple-Style Media Slider', desc: 'Interactive high-definition image & video carousel on right side of hero.' },
                  { key: 'aboutInfo', title: 'Company Narrative & Capabilities', desc: 'Detailed corporate background, machine stats, and core capabilities.' },
                  { key: 'whyChooseUs', title: 'Why Choose AXION', desc: '8 engineering advantage feature cards grid.' },
                  { key: 'visionMission', title: 'Vision, Mission & Values', desc: 'Charter statements and 6 corporate values cards.' },
                  { key: 'responsibilities', title: 'Our Responsibilities', desc: 'Sustainability narrative, eco-pledge badge, and green points.' },
                ].map((sec) => {
                  const isChecked = data.sections?.[sec.key as keyof typeof data.sections] !== false;
                  return (
                    <div
                      key={sec.key}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{sec.title}</h4>
                          {isChecked ? (
                            <AdminBadge variant="success" size="sm">Visible</AdminBadge>
                          ) : (
                            <AdminBadge variant="neutral" size="sm">Hidden</AdminBadge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{sec.desc}</p>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            setData((prev) => ({
                              ...prev,
                              sections: {
                                ...prev.sections,
                                [sec.key]: e.target.checked,
                              },
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 8: SEO & OPENGRAPH
        ========================================================= */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  SEO &amp; OpenGraph Metadata
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Optimize search engine indexing, social media link shares, canonical links, and preview snippets.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Meta Title</label>
                    <span className="text-[11px] text-slate-500">
                      {(data.seo?.metaTitle || '').length} / 60 chars recommended
                    </span>
                  </div>
                  <input
                    type="text"
                    value={data.seo?.metaTitle || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaTitle: e.target.value },
                      }))
                    }
                    placeholder="About Us | AXION PackTech — Engineering Packaging Excellence"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">Meta Description</label>
                    <span className="text-[11px] text-slate-500">
                      {(data.seo?.metaDescription || '').length} / 160 chars recommended
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={data.seo?.metaDescription || ''}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaDescription: e.target.value },
                      }))
                    }
                    placeholder="Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Canonical URL</label>
                    <input
                      type="text"
                      value={data.seo?.canonicalUrl || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, canonicalUrl: e.target.value },
                        }))
                      }
                      placeholder="https://axionpacktech.com/about-us"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">OpenGraph Share Image URL</label>
                    <input
                      type="text"
                      value={data.seo?.ogImage || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, ogImage: e.target.value },
                        }))
                      }
                      placeholder="/images/about_hero_building.jpg"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">OpenGraph Title</label>
                    <input
                      type="text"
                      value={data.seo?.ogTitle || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, ogTitle: e.target.value },
                        }))
                      }
                      placeholder="About Us | AXION PackTech"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">OpenGraph Description</label>
                    <input
                      type="text"
                      value={data.seo?.ogDescription || ''}
                      onChange={(e) =>
                        setData((prev) => ({
                          ...prev,
                          seo: { ...prev.seo, ogDescription: e.target.value },
                        }))
                      }
                      placeholder="Engineering Packaging Excellence Since Inception."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 9: INSPECTION & SUMMARY
        ========================================================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  CMS Health &amp; Integrity Summary
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Rapid overview of active configuration parameters and live links.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Media Slides</span>
                  <p className="text-2xl font-black text-sky-400">
                    {(data.mediaSlider?.items || []).filter((s) => s.enabled).length} / {(data.mediaSlider?.items || []).length}
                  </p>
                  <p className="text-[11px] text-slate-400">Active slides in carousel</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Visible Sections</span>
                  <p className="text-2xl font-black text-emerald-400">
                    {Object.values(data.sections || {}).filter(Boolean).length} / 6
                  </p>
                  <p className="text-[11px] text-slate-400">Public sections turned ON</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Advantage Cards</span>
                  <p className="text-2xl font-black text-amber-400">
                    {(data.whyChooseUsSection?.items || []).filter((i) => i.enabled !== false).length} / {(data.whyChooseUsSection?.items || []).length}
                  </p>
                  <p className="text-[11px] text-slate-400">Why AXION features</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Core Values</span>
                  <p className="text-2xl font-black text-sky-400">
                    {(data.visionMission?.coreValues || []).filter((v) => v.enabled !== false).length} / {(data.visionMission?.coreValues || []).length}
                  </p>
                  <p className="text-[11px] text-slate-400">Principles configured</p>
                </div>
              </div>

              <div className="p-5 bg-sky-950/20 border border-sky-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-sky-300">Ready to test live public rendering?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Save your updates and open the public About page in a new window.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/about-us"
                    target="_blank"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>View Public Page</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD / EDIT MEDIA SLIDER ITEM */}
      <AdminModal
        isOpen={slideModalOpen}
        onClose={() => setSlideModalOpen(false)}
        title={editingSlideIndex !== null ? 'Edit Media Slide' : 'Add New Media Slide'}
        description="Configure high-performance visual slide with automated Sharp WebP / FFmpeg MP4 optimization and Cloudflare R2 storage."
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveSlide} className="space-y-4">
          {/* 1. Slide Media Type (Image vs Video) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Slide Media Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSlideFormData((prev) => ({ ...prev, type: 'image' }));
                  setSelectedFile(null);
                  setFilePreview(null);
                  setOptimizationStats(null);
                  setUrlError(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  slideFormData.type === 'image'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Image Slide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSlideFormData((prev) => ({ ...prev, type: 'video' }));
                  setSelectedFile(null);
                  setFilePreview(null);
                  setOptimizationStats(null);
                  setUrlError(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  slideFormData.type === 'video'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Video Slide</span>
              </button>
            </div>
          </div>

          {/* 2. Media Source Selector (Requested Format with Folder Explorer trigger) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-300">
              Media Source <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Upload from Local Device */}
              <button
                type="button"
                onClick={() => {
                  setSourceMode('upload');
                  fileInputRef.current?.click();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                  sourceMode === 'upload'
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center pt-0.5 shrink-0">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      sourceMode === 'upload'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {sourceMode === 'upload' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    Upload from Local Device
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {slideFormData.type === 'image'
                      ? 'Opens folder explorer for JPG, PNG, WebP, AVIF'
                      : 'Opens folder explorer for MP4, WebM, MOV'}
                  </p>
                </div>
              </button>

              {/* Option 2: Paste Public URL */}
              <button
                type="button"
                onClick={() => setSourceMode('url')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                  sourceMode === 'url'
                    ? 'bg-sky-950/40 border-sky-500 shadow-md shadow-sky-950/50'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center pt-0.5 shrink-0">
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      sourceMode === 'url'
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-600 bg-slate-900'
                    }`}
                  >
                    {sourceMode === 'url' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">
                    {slideFormData.type === 'image'
                      ? 'Paste Public Image URL'
                      : 'Paste Public Video URL'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Direct HTTP / HTTPS link or static site asset
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 3A. UPLOAD MODE: File Picker / Dropzone & Optimization Pipeline */}
          {sourceMode === 'upload' && (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              {/* Hidden File Input (Triggered on Click) */}
              <input
                ref={fileInputRef}
                type="file"
                accept={
                  slideFormData.type === 'image'
                    ? 'image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif'
                    : 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                }
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />

              {/* Dropzone Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all ${
                  selectedFile
                    ? 'border-sky-500/50 bg-sky-950/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 bg-slate-900/30'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {selectedFile ? 'Click to choose a different file' : 'Click here to open folder explorer'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {slideFormData.type === 'image'
                      ? 'Supported formats: JPG, JPEG, PNG, WEBP, AVIF (Max: 10MB)'
                      : 'Supported formats: MP4, WEBM, MOV (Max: 100MB)'}
                  </p>
                </div>
              </div>

              {/* Selected File Details & Processing Controls */}
              {selectedFile && (
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-xs">{selectedFile.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {formatBytes(selectedFile.size)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {mediaConfig?.r2Configured
                          ? 'Ready for automated server-side compression & Cloudflare R2 upload'
                          : 'Cloudflare R2 is unconfigured: Local file cannot be uploaded directly.'}
                      </p>
                    </div>

                    {/* Upload / Optimization Action */}
                    {mediaConfig?.r2Configured ? (
                      <button
                        type="button"
                        onClick={handleRunUploadAndOptimization}
                        disabled={isUploading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                      >
                        {isUploading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Upload &amp; Optimize Now</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 bg-slate-800 text-slate-500 cursor-not-allowed text-xs font-semibold rounded-xl border border-slate-700 shrink-0"
                      >
                        R2 Storage Unconfigured
                      </button>
                    )}
                  </div>

                  {/* Warning if R2 is NOT configured - Do NOT fake uploads! */}
                  {!mediaConfig?.r2Configured && (
                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs text-amber-200 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Cloudflare R2 Storage is Unconfigured</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        To upload files directly with automated Sharp WebP compression and FFmpeg video transcoding, provide R2 credentials in <code className="text-amber-300">backend/.env</code>. To proceed immediately without R2, select <strong>&quot;Paste Public {slideFormData.type === 'image' ? 'Image' : 'Video'} URL&quot;</strong> above.
                      </p>
                    </div>
                  )}

                  {/* Upload & Optimization Multi-Stage Progress */}
                  {isUploading && (
                    <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs text-sky-300">
                        <span className="flex items-center gap-2 font-medium">
                          <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                          {uploadProgressText}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider">{uploadPhase}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ${
                            uploadPhase === 'uploading' ? 'w-1/2' : 'w-5/6'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Post-Optimization Metrics Banner */}
                  {optimizationStats && (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Media Uploaded &amp; Optimized Successfully!
                        </span>
                        {optimizationStats.format && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-900/60 border border-emerald-500/40">
                            {optimizationStats.format.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Original: <span className="font-mono text-white">{formatBytes(optimizationStats.originalSize)}</span> &rarr; Optimized:{' '}
                        <span className="font-mono text-emerald-400 font-bold">{formatBytes(optimizationStats.optimizedSize)}</span>
                        {optimizationStats.reductionPercent ? (
                          <span className="ml-1.5 text-emerald-400 font-extrabold">(-{optimizationStats.reductionPercent}% saved)</span>
                        ) : null}
                      </p>
                      {slideFormData.type === 'video' && slideFormData.posterUrl && (
                        <p className="text-[10px] text-slate-400">WebP poster frame extracted and saved to Cloudflare R2.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3B. PUBLIC URL MODE: Direct URL Input with Validation */}
          {sourceMode === 'url' && (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {slideFormData.type === 'image' ? 'Public Image URL' : 'Public Video URL'} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slideFormData.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSlideFormData((prev) => ({
                      ...prev,
                      url: val,
                      provider: 'external',
                      sourceType: 'url',
                    }));
                    if (!val.trim()) {
                      setUrlError(null);
                    } else if (!validateUrl(val.trim())) {
                      setUrlError('Public URL should begin with http://, https://, or /');
                    } else {
                      setUrlError(null);
                    }
                  }}
                  placeholder={
                    slideFormData.type === 'image'
                      ? 'https://example.com/photo.webp or /images/about_hero_building.jpg'
                      : 'https://example.com/video.mp4 or /videos/about_reel.mp4'
                  }
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none font-mono text-[11px] ${
                    urlError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-sky-500'
                  }`}
                />
                {urlError && (
                  <p className="text-[11px] text-rose-400 font-medium">{urlError}</p>
                )}
              </div>

              {slideFormData.type === 'video' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Poster Preview Image URL (Optional for Video)
                  </label>
                  <input
                    type="text"
                    value={slideFormData.posterUrl || ''}
                    onChange={(e) =>
                      setSlideFormData((prev) => ({ ...prev, posterUrl: e.target.value }))
                    }
                    placeholder="https://example.com/poster.webp or /images/about_hero_building.jpg"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  />
                </div>
              )}
            </div>
          )}

          {/* 4. Slide Metadata Fields (Preserved) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Slide Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={slideFormData.title}
              onChange={(e) =>
                setSlideFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. High-Precision Automated Bagging Systems"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Caption / Subtitle</label>
            <textarea
              rows={2}
              value={slideFormData.caption || ''}
              onChange={(e) =>
                setSlideFormData((prev) => ({ ...prev, caption: e.target.value }))
              }
              placeholder="Engineered for continuous heavy industrial duty cycles and rapid size changeovers."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Alt Text (Accessibility &amp; SEO)</label>
              <input
                type="text"
                value={slideFormData.alt || ''}
                onChange={(e) =>
                  setSlideFormData((prev) => ({ ...prev, alt: e.target.value }))
                }
                placeholder="AXION Packaging Facility"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Order</label>
              <input
                type="number"
                min={1}
                value={slideFormData.order || 1}
                onChange={(e) =>
                  setSlideFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Checkbox Controls */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={slideFormData.enabled}
                onChange={(e) =>
                  setSlideFormData((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700"
              />
              <span className="text-xs font-semibold text-slate-300">Slide is Active / Visible</span>
            </label>

            {slideFormData.type === 'video' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={slideFormData.autoplay === true}
                  onChange={(e) =>
                    setSlideFormData((prev) => ({ ...prev, autoplay: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700"
                />
                <span className="text-xs font-semibold text-slate-300">Autoplay Muted Video</span>
              </label>
            )}
          </div>

          {/* 5. Live Media Preview */}
          {(filePreview || slideFormData.url) && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {filePreview && !slideFormData.url ? 'Local Device File Preview' : 'Configured Media Preview'}
              </span>
              <div className="relative w-full h-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                {slideFormData.type === 'image' ? (
                  <CmsImage
                    src={filePreview || slideFormData.url}
                    alt={slideFormData.alt || slideFormData.title || 'Preview'}
                    fill
                    className="object-cover"
                    fallbackSrc="/images/about_hero_building.jpg"
                  />
                ) : (
                  <video
                    src={filePreview || slideFormData.url}
                    poster={slideFormData.posterUrl}
                    controls
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setSlideModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (sourceMode === 'url' && !slideFormData.url.trim())}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{editingSlideIndex !== null ? 'Update Slide' : 'Add Slide'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 5. MODAL: ADD / EDIT TRACK RECORD STATISTIC */}
      <AdminModal
        isOpen={statModalOpen}
        onClose={() => setStatModalOpen(false)}
        title={editingStatIndex !== null ? 'Edit Track Record Statistic' : 'Add New Track Record Statistic'}
        description="Configure metric value, label, highlight badge, optional icon, and display sequence for the public /about-us page."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStat} className="space-y-4">
          {/* Metric Value & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Metric Value <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={statFormData.value}
                onChange={(e) => setStatFormData((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="e.g. 25+, 4,000+, Est. 2000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Metric Label <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={statFormData.label}
                onChange={(e) => setStatFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Machine Products"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Highlight Pill & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Highlight Pill <span className="text-[11px] text-slate-500">(Optional badge)</span>
              </label>
              <input
                type="text"
                value={statFormData.highlight || ''}
                onChange={(e) => setStatFormData((prev) => ({ ...prev, highlight: e.target.value }))}
                placeholder="e.g. Engineered, Served, Proven"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-brand-orange placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={statFormData.order ?? 1}
                onChange={(e) =>
                  setStatFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Optional Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Optional Icon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              {STAT_ICONS.map((ic) => {
                const isSelected = (statFormData.icon || '') === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setStatFormData((prev) => ({ ...prev, icon: ic.id }))}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-950 flex items-center justify-center text-sky-400 shrink-0">
                      {renderStatIcon(ic.id) || (
                        <span className="text-[9px] text-slate-600 font-mono">-</span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium truncate">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enabled / Active Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={statFormData.enabled !== false}
                onChange={(e) =>
                  setStatFormData((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
              />
              <span className="text-xs font-semibold text-slate-300">
                Enable Statistic (Visible on public /about-us page)
              </span>
            </label>
          </div>

          {/* Live Preview Inside Brand Style */}
          <div className="p-3.5 bg-gradient-to-b from-[#0B1E36] to-[#061527] border border-sky-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                Live Public Card Preview
              </span>
              <span className="text-[10px] text-slate-400">
                {statFormData.enabled !== false ? 'Will be visible' : 'Hidden from public'}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-sky-950/60 p-3.5 border border-sky-800/40">
              <div className="flex items-center gap-3 min-w-0">
                {renderStatIcon(statFormData.icon) && (
                  <div className="w-9 h-9 rounded-xl bg-sky-900/70 border border-sky-700/50 flex items-center justify-center text-sky-400 shrink-0">
                    {renderStatIcon(statFormData.icon)}
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-mono text-xl font-extrabold text-white block leading-tight">
                    {statFormData.value || '25+'}
                  </span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">
                    {statFormData.label || 'Machine Products'}
                  </p>
                </div>
              </div>
              {statFormData.highlight && (
                <span className="text-[10px] font-semibold text-brand-orange uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                  {statFormData.highlight}
                </span>
              )}
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStatModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{editingStatIndex !== null ? 'Update Statistic' : 'Add Statistic'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 6. MODAL: ADD / EDIT FEATURE CARD */}
      <AdminModal
        isOpen={featureCardModalOpen}
        onClose={() => setFeatureCardModalOpen(false)}
        title={editingFeatureCardIndex !== null ? 'Edit Feature Card' : 'Add New Feature Card'}
        description="Configure engineering advantage card title, description, optional icon, and display sequence for the public /about-us page."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFeatureCard} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Card Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={featureCardFormData.title}
              onChange={(e) => setFeatureCardFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Engineering Expertise"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Card Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={featureCardFormData.description}
              onChange={(e) => setFeatureCardFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Experienced in packaging, bagging, conveying, processing..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-teal-500 leading-relaxed"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Card Icon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              {FEATURE_CARD_ICONS.map((ic) => {
                const isSelected = (featureCardFormData.icon || 'compass') === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setFeatureCardFormData((prev) => ({ ...prev, icon: ic.id }))}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-teal-950/80 border-teal-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-[#16395F] text-white flex items-center justify-center shrink-0 border border-white/10">
                      {renderFeatureIcon(ic.id)}
                    </div>
                    <span className="text-[11px] font-medium truncate">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Order & Enabled Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={featureCardFormData.order ?? 1}
                onChange={(e) =>
                  setFeatureCardFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="space-y-1.5 flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={featureCardFormData.enabled !== false}
                  onChange={(e) =>
                    setFeatureCardFormData((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-700 focus:ring-teal-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Enable Card (Public)
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Inside Public Card Appearance */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Live Public Card Preview
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {featureCardFormData.enabled !== false ? 'Visible on /about-us' : 'Hidden from public'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center flex flex-col items-center shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16395F] text-white shadow-md border border-white/10">
                {renderFeatureIcon(featureCardFormData.icon || 'compass')}
              </div>
              <h4 className="mt-3 text-sm font-bold text-[#0B192C]">
                {featureCardFormData.title || 'Engineering Expertise'}
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 line-clamp-3">
                {featureCardFormData.description || 'Experienced in packaging, bagging, conveying, processing, and automation technologies.'}
              </p>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFeatureCardModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{editingFeatureCardIndex !== null ? 'Update Card' : 'Add Card'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* 7. MODAL: ADD / EDIT CORE VALUE */}
      <AdminModal
        isOpen={coreValueModalOpen}
        onClose={() => setCoreValueModalOpen(false)}
        title={editingCoreValueIndex !== null ? 'Edit Core Value' : 'Add New Core Value'}
        description="Configure corporate foundation pillar title, description, icon, and display sequence for the public /about-us page."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCoreValue} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Core Value Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={coreValueFormData.title}
              onChange={(e) => setCoreValueFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Quality, Innovation, Integrity"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Core Value Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={coreValueFormData.description}
              onChange={(e) => setCoreValueFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Zero-compromise engineering standards, high-tolerance components..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Value Icon
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              {CORE_VALUE_ICONS.map((ic) => {
                const isSelected = (coreValueFormData.icon || 'star') === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setCoreValueFormData((prev) => ({ ...prev, icon: ic.id }))}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-950 text-sky-400 flex items-center justify-center shrink-0 border border-sky-500/30">
                      {renderCoreValueIcon(ic.id)}
                    </div>
                    <span className="text-[11px] font-medium truncate">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Order & Enabled Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={coreValueFormData.order ?? 1}
                onChange={(e) =>
                  setCoreValueFormData((prev) => ({ ...prev, order: parseInt(e.target.value, 10) || 1 }))
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5 flex items-end">
              <label className="flex items-center gap-2.5 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={coreValueFormData.enabled !== false}
                  onChange={(e) =>
                    setCoreValueFormData((prev) => ({ ...prev, enabled: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500"
                />
                <span className="text-xs font-semibold text-slate-300">
                  Enable Value (Public)
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Inside Public Card Appearance */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Live Public Card Preview
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {coreValueFormData.enabled !== false ? 'Visible on /about-us' : 'Hidden from public'}
              </span>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
                {renderCoreValueIcon(coreValueFormData.icon || 'star')}
              </div>
              <h4 className="mt-4 text-base font-bold text-[#0B192C]">
                {coreValueFormData.title || 'Quality'}
              </h4>
              <p className="mt-1 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {coreValueFormData.description || 'Zero-compromise engineering standards, high-tolerance components, and certified manufacturing excellence.'}
              </p>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCoreValueModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>{editingCoreValueIndex !== null ? 'Update Value' : 'Add Value'}</span>
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
