'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  uploadFileDirectToR2,
  registerExternalMediaAdmin,
  getMediaListAdmin,
  getMediaConfigAdmin,
  AdminMedia,
  MediaConfig,
  MediaUploadResponse,
} from '@/lib/api/admin';
import { AdminModal } from './AdminModal';
import { AdminBadge } from './AdminBadge';
import { useToast } from '@/context/ToastContext';
import { parseVideoUrl } from '@/lib/utils/video';
import { VideoPlayer } from '@/components/common/VideoPlayer';
import { resolveMediaUrl, isPdfUrl } from '@/lib/utils/mediaUrl';

export interface AdminMediaPickerProps {
  label?: string;
  description?: string;
  type?: 'image' | 'video' | 'both';
  value?: string;
  posterValue?: string;
  onChange: (
    url: string,
    metadata?: {
      posterUrl?: string;
      type?: 'image' | 'video' | 'document';
      mediaId?: string;
      format?: string;
      width?: number;
      height?: number;
    }
  ) => void;
  folder?: string;
  required?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const AdminMediaPicker: React.FC<AdminMediaPickerProps> = ({
  label = 'Media Asset',
  description,
  type = 'image',
  value = '',
  posterValue = '',
  onChange,
  folder = 'general',
  required = false,
  allowClear = true,
  disabled = false,
  className = '',
  helperText,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<MediaUploadResponse | null>(null);

  // URL input state
  const [urlInput, setUrlInput] = useState('');
  const [posterInput, setPosterInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>(type === 'video' ? 'video' : 'image');

  // Library state
  const [libraryItems, setLibraryItems] = useState<AdminMedia[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilterType, setLibraryFilterType] = useState<string>(
    type === 'both' ? 'all' : type
  );

  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const isPdf = isPdfUrl(value);
  const isVideo =
    !isPdf &&
    (type === 'video' ||
      (type === 'both' &&
        (value?.endsWith('.mp4') ||
          value?.endsWith('.webm') ||
          value?.endsWith('.mov') ||
          value?.includes('youtube') ||
          value?.includes('youtu.be') ||
          value?.includes('vimeo') ||
          parseVideoUrl(value || '').isValid)));

  const resolvedValueUrl = resolveMediaUrl(value);
  const parsedValueVideo = parseVideoUrl(value || '');
  const parsedInputVideo = parseVideoUrl(urlInput || '');

  // Fetch Library
  const fetchLibrary = useCallback(async () => {
    try {
      setIsLoadingLibrary(true);
      const res = await getMediaListAdmin({
        limit: 48,
        type: libraryFilterType !== 'all' ? libraryFilterType : undefined,
        search: librarySearch.trim() || undefined,
      });
      setLibraryItems(res.items || []);
    } catch {
      showToast('Failed to load media library', 'error');
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [libraryFilterType, librarySearch, showToast]);

  useEffect(() => {
    if (isModalOpen && activeTab === 'library') {
      fetchLibrary();
    }
  }, [isModalOpen, activeTab, fetchLibrary]);

  const handleOpenModal = (tab: 'upload' | 'url' | 'library' = 'upload') => {
    if (disabled) return;
    setActiveTab(tab);
    setUrlInput(value || '');
    setPosterInput(posterValue || '');
    setImageError(false);
    setUploadSuccessInfo(null);
    setIsModalOpen(true);
  };

  // Direct-to-R2 Upload handler (Zero VPS Proxying, 0-100% real-time progress)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size & type according to production constraints
    const isFileVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    const isFileDoc = file.type === 'application/pdf' || /\.(pdf|doc|docx|xls|xlsx|txt)$/i.test(file.name);
    const maxImgSize = 25 * 1024 * 1024; // 25MB
    const maxVidSize = 150 * 1024 * 1024; // 150MB
    const maxDocSize = 50 * 1024 * 1024; // 50MB

    if (isFileVideo && file.size > maxVidSize) {
      showToast('Video file size exceeds 150MB limit.', 'warning');
      return;
    }
    if (isFileDoc && file.size > maxDocSize) {
      showToast('Document file size exceeds 50MB limit.', 'warning');
      return;
    }
    if (!isFileVideo && !isFileDoc && file.size > maxImgSize) {
      showToast('Image file size exceeds 25MB limit.', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Direct Browser PUT Upload to Cloudflare R2
      const result = await uploadFileDirectToR2(file, {
        category: folder,
        title: file.name,
        altText: file.name,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      setUploadProgress(100);

      const resolvedType = isFileDoc
        ? 'document'
        : result.type === 'video' || result.mimeType?.startsWith('video/')
        ? 'video'
        : 'image';

      onChange(result.url, {
        posterUrl: result.posterUrl,
        type: resolvedType,
        mediaId: result._id,
        format: result.format,
        width: result.width,
        height: result.height,
      });

      showToast('Asset uploaded directly to Cloudflare R2 successfully!', 'success');
      setTimeout(() => {
        setIsModalOpen(false);
        setIsUploading(false);
        setUploadProgress(0);
      }, 750);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'File upload failed';
      showToast(msg, 'error');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // URL apply handler (Strict HTTPS enforcement, rejects javascript:, data:, file:, etc.)
  const handleApplyUrl = async () => {
    if (!urlInput.trim()) {
      showToast('Please enter a valid media URL', 'warning');
      return;
    }

    const cleanUrl = urlInput.trim();
    let parsed: URL;
    try {
      parsed = new URL(cleanUrl);
    } catch {
      showToast('Invalid URL format. Must be a well-formed absolute URL.', 'warning');
      return;
    }

    if (parsed.protocol !== 'https:') {
      showToast(
        'Security policy: Only secure HTTPS URLs (https://) are permitted. Insecure HTTP, javascript:, data:, and file: schemes are forbidden.',
        'warning'
      );
      return;
    }

    try {
      // Register in background if external HTTPS
      await registerExternalMediaAdmin({
        name: cleanUrl.split('/').pop()?.split('?')[0] || 'External Media',
        url: cleanUrl,
        type: urlType,
        folder,
        posterUrl: posterInput.trim() || undefined,
      }).catch(() => null);

      onChange(cleanUrl, {
        posterUrl: posterInput.trim() || undefined,
        type: urlType,
      });

      showToast('Media URL applied successfully', 'success');
      setIsModalOpen(false);
    } catch {
      onChange(cleanUrl, {
        posterUrl: posterInput.trim() || undefined,
        type: urlType,
      });
      setIsModalOpen(false);
    }
  };

  // Select from Library
  const handleSelectLibraryItem = (item: AdminMedia) => {
    const itemUrl = item.url || item.fileUrl || '';
    const itemIsPdf = isPdfUrl(itemUrl) || item.type === 'document' || item.mimeType === 'application/pdf';
    const itemType = itemIsPdf
      ? 'document'
      : item.type === 'video' || item.mimeType?.startsWith('video/')
      ? 'video'
      : 'image';

    onChange(itemUrl, {
      posterUrl: item.posterUrl,
      type: itemType,
      mediaId: item._id,
      format: item.format,
      width: item.width,
      height: item.height,
    });

    showToast('Asset selected from Media Library', 'info');
    setIsModalOpen(false);
  };

  // Copy URL
  const handleCopyUrl = () => {
    if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    showToast('Media URL copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Field Label & Description */}
      <div className="flex items-center justify-between">
        <div>
          {label && (
            <label className="block text-xs font-semibold text-slate-300">
              {label} {required && <span className="text-rose-400">*</span>}
            </label>
          )}
          {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
        </div>
        {value && (
          <div className="flex items-center gap-1">
            <AdminBadge variant={isPdf ? 'neutral' : isVideo ? 'warning' : 'info'} size="sm">
              {isPdf ? 'PDF' : isVideo ? 'Video' : 'Image'}
            </AdminBadge>
            <AdminBadge variant="neutral" size="sm">
              {folder}
            </AdminBadge>
          </div>
        )}

      </div>

      {/* Main Container / Preview Card */}
      {value ? (
        <div className="relative group bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-md">
          {/* Media Viewport */}
          <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-56 bg-slate-900 flex items-center justify-center overflow-hidden">
            {isPdf ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/90 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    PDF Document
                  </span>
                  <p className="text-xs font-semibold text-slate-300 mt-1 max-w-xs truncate font-mono">
                    {value.split('/').pop()?.split('?')[0] || 'Document.pdf'}
                  </p>
                </div>
                <a
                  href={resolvedValueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span>Open / Download PDF</span>
                </a>
              </div>
            ) : isVideo ? (
              <VideoPlayer
                url={resolvedValueUrl}
                poster={posterValue || parsedValueVideo.thumbnailUrl}
                controls={true}
                autoPlay={false}
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="relative w-full h-full">
                {!imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolvedValueUrl}
                    alt={label || 'Media preview'}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 space-y-1">
                    <svg className="w-8 h-8 text-amber-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-xs font-semibold text-slate-400">Failed to render image preview</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{value}</p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Action Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 shadow-lg">
              <button
                type="button"
                onClick={handleCopyUrl}
                disabled={disabled}
                className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenModal('upload')}
                disabled={disabled}
                className="px-2.5 py-1 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1"
                title="Replace Media"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Replace</span>
              </button>

              {allowClear && (
                <button
                  type="button"
                  onClick={() => onChange('', { posterUrl: '', type: 'image' })}
                  disabled={disabled}
                  className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/50 rounded-lg text-xs transition-colors"
                  title="Remove Media"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Asset Info Bar */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="font-mono text-slate-300 truncate text-[11px]" title={value}>
                {value}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenModal('upload')}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Trigger Buttons */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Upload Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleOpenModal('upload')}
            className="group flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-900/90 border border-dashed border-slate-800 hover:border-amber-500/50 rounded-2xl transition-all text-center space-y-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                Upload from Local PC
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {type === 'video' ? 'MP4, WebM, MOV' : type === 'both' ? 'Images & Videos' : 'JPG, PNG, WebP, AVIF'}
              </p>
            </div>
          </button>

          {/* Paste URL Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleOpenModal('url')}
            className="group flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-900/90 border border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl transition-all text-center space-y-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                Paste Public URL
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                CDN, YouTube, Vimeo
              </p>
            </div>
          </button>

          {/* Media Library Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleOpenModal('library')}
            className="group flex flex-col items-center justify-center p-4 bg-slate-950 hover:bg-slate-900/90 border border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all text-center space-y-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Media Library
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Browse stored assets
              </p>
            </div>
          </button>
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}

      {/* Media Picker Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => !isUploading && setIsModalOpen(false)}
        title={`Select / Upload ${label}`}
        description="Choose a local file to optimize & upload to Cloudflare R2, paste an external URL, or pick from Library"
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload from Local PC
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'url'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Paste Public URL
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'library'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Media Library
            </button>
          </div>

          {/* TAB 1: UPLOAD FROM LOCAL PC */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={
                  type === 'video'
                    ? 'video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov'
                    : type === 'both'
                    ? 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,video/mp4,video/webm,video/quicktime,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.mp4,.webm,.mov,.pdf'
                    : 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.svg,.avif,.pdf'
                }
                className="hidden"
              />

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all ${
                  isUploading
                    ? 'bg-amber-500/5 border-amber-500/50 cursor-not-allowed'
                    : 'bg-slate-950 hover:bg-slate-900/60 border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    {isUploading ? 'Uploading directly to Cloudflare R2...' : 'Click to select from your computer'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {type === 'video'
                      ? 'Supported: MP4, WebM, MOV (Max 150MB). Direct browser upload to R2.'
                      : type === 'both'
                      ? 'Images (Max 25MB; JPG, PNG, WebP, SVG, GIF), Videos (Max 150MB), PDFs (Max 50MB).'
                      : 'Supported: JPG, PNG, WEBP, GIF, SVG, AVIF (Max 25MB) or PDF (Max 50MB). Format preserved.'}
                  </p>
                </div>

                {isUploading && (
                  <div className="w-full max-w-xs space-y-1.5 pt-2">
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-mono text-amber-400">{uploadProgress}% Complete</p>
                  </div>
                )}
              </div>

              {uploadSuccessInfo && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="space-y-0.5">
                    <p className="font-bold">Optimization Complete!</p>
                    <p className="text-[11px] text-emerald-400/80">
                      {formatBytes(uploadSuccessInfo.originalSize)} → {formatBytes(uploadSuccessInfo.optimizedSize)} ({uploadSuccessInfo.reductionPercent}% saved)
                    </p>
                  </div>
                  <AdminBadge variant="success">Saved to R2</AdminBadge>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE PUBLIC URL */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Resource Public URL *
                  </label>
                  {parsedInputVideo.isValid && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                      <span>✓</span> {parsedInputVideo.providerName} Detected
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setUrlInput(newUrl);
                    const parsed = parseVideoUrl(newUrl);
                    if (parsed.isValid && (parsed.provider === 'youtube' || parsed.provider === 'vimeo' || parsed.provider === 'direct' || parsed.provider === 'embed')) {
                      if (type !== 'image') {
                        setUrlType('video');
                      }
                      if (!posterInput && parsed.thumbnailUrl) {
                        setPosterInput(parsed.thumbnailUrl);
                      }
                    }
                  }}
                  placeholder="https://cdn.example.com/assets/machine.webp or YouTube/Vimeo link"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Asset Type
                  </label>
                  <select
                    value={urlType}
                    onChange={(e) => setUrlType(e.target.value as 'image' | 'video')}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="image">Image (WebP/JPG/PNG)</option>
                    <option value="video">Video (MP4 / YouTube / Vimeo / Embed)</option>
                  </select>
                </div>

                {urlType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Poster Image URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={posterInput}
                      onChange={(e) => setPosterInput(e.target.value)}
                      placeholder="https://cdn.example.com/poster.webp"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* URL Preview */}
              {urlInput.trim() && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400">Live URL Preview:</p>
                  <div className="w-full max-h-56 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                    {urlType === 'video' ? (
                      <VideoPlayer
                        url={urlInput}
                        poster={posterInput || parsedInputVideo.thumbnailUrl}
                        controls={true}
                        autoPlay={false}
                        className="w-full max-h-52 object-contain"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urlInput}
                        alt="URL preview"
                        className="w-full max-h-44 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Apply URL
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Search library assets..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <select
                  value={libraryFilterType}
                  onChange={(e) => setLibraryFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>

                <button
                  type="button"
                  onClick={fetchLibrary}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  title="Refresh library"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>

              {/* Grid of items */}
              <div className="max-h-80 overflow-y-auto pr-1">
                {isLoadingLibrary ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Loading media assets...</p>
                  </div>
                ) : libraryItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-1">
                    <p className="text-xs font-semibold text-slate-400">No media assets found</p>
                    <p className="text-[11px]">Upload a local file or register a URL first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {libraryItems.map((item) => {
                      const assetUrl = item.url || item.fileUrl || '';
                      const isItemDoc = isPdfUrl(assetUrl) || item.type === 'document' || item.mimeType === 'application/pdf';
                      const isItemVideo = !isItemDoc && (item.type === 'video' || item.mimeType?.startsWith('video/'));
                      const resolvedAssetUrl = resolveMediaUrl(assetUrl);
                      const isSelected = value === assetUrl;

                      return (
                        <div
                          key={item._id}
                          onClick={() => handleSelectLibraryItem(item)}
                          className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all bg-slate-950 ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          {isItemDoc ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center">
                              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-[9px] font-bold uppercase text-rose-400">PDF</span>
                              <p className="text-[10px] text-slate-300 truncate w-full mt-0.5">{item.name}</p>
                            </div>
                          ) : isItemVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-2 text-center">
                              <svg className="w-8 h-8 text-amber-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-[10px] text-slate-400 truncate w-full">{item.name}</p>
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolvedAssetUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                            <p className="text-[9px] text-emerald-400 font-mono truncate">{item.folder || 'general'}</p>
                          </div>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
};

export default AdminMediaPicker;
