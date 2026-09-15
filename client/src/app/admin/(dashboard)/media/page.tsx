'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  getMediaListAdmin,
  registerExternalMediaAdmin,
  saveMediaMetadataAdmin,
  deleteMediaAdmin,
  checkMediaUsageAdmin,
  getMediaConfigAdmin,
  AdminMedia,
  MediaConfig,
  MediaUsageCheckResult,
} from '@/lib/api/admin';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { useToast } from '@/context/ToastContext';
import { VideoPlayer } from '@/components/common/VideoPlayer';
import { parseVideoUrl } from '@/lib/utils/video';
import { isAllowedImageSrc, resolveMediaUrl, isPdfUrl } from '@/lib/utils/mediaUrl';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<AdminMedia[]>([]);
  const [mediaConfig, setMediaConfig] = useState<MediaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<'all' | 'r2' | 'external'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<AdminMedia | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Deletion & Safety Check
  const [deletingItem, setDeletingItem] = useState<AdminMedia | null>(null);
  const [usageInfo, setUsageInfo] = useState<MediaUsageCheckResult | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);
  const [forceDelete, setForceDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { showToast } = useToast();

  const [registerForm, setRegisterForm] = useState({
    name: '',
    url: '',
    type: 'image' as 'image' | 'video',
    folder: 'general',
    posterUrl: '',
    altText: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [res, cfg] = await Promise.all([
        getMediaListAdmin({
          limit: 100,
          type: selectedType !== 'all' ? selectedType : undefined,
          folder: selectedFolder !== 'all' ? selectedFolder : undefined,
          search: searchQuery.trim() || undefined,
        }),
        getMediaConfigAdmin().catch(() => null),
      ]);
      setMediaList(res.items || []);
      if (cfg) setMediaConfig(cfg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load media assets';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedFolder, searchQuery, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle External Registration
  const handleRegisterSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim() || !registerForm.url.trim()) {
      showToast('Asset name and URL are required', 'warning');
      return;
    }

    const cleanUrl = registerForm.url.trim();
    if (!cleanUrl.startsWith('https://')) {
      showToast('Security policy: External media URL must strictly use HTTPS scheme (https://).', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      await registerExternalMediaAdmin({
        name: registerForm.name.trim(),
        url: registerForm.url.trim(),
        type: registerForm.type,
        folder: registerForm.folder.trim() || 'general',
        posterUrl: registerForm.posterUrl.trim() || undefined,
        altText: registerForm.altText.trim() || undefined,
      });

      showToast('External media source registered successfully', 'success');
      setRegisterModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register media';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Delete with Reference Check
  const handleOpenDelete = async (item: AdminMedia) => {
    setDeletingItem(item);
    setForceDelete(false);
    setUsageInfo(null);
    setIsCheckingUsage(true);

    try {
      const usage = await checkMediaUsageAdmin(item._id);
      setUsageInfo(usage);
    } catch {
      // Proceed without blocking dialog
      setUsageInfo({ isReferenced: false, count: 0, references: [] });
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      setIsDeleting(true);
      const res = await deleteMediaAdmin(deletingItem._id, forceDelete);
      showToast(res.message || 'Media asset deleted successfully', 'success');
      setDeletingItem(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete media';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast('Asset URL copied to clipboard', 'info');
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalBytes = useMemo(() => {
    return mediaList.reduce((acc, curr) => acc + (curr.size || curr.fileSize || 0), 0);
  }, [mediaList]);

  const isR2Item = useCallback((item: AdminMedia): boolean => {
    if (item.provider === 'r2') return true;
    if (item.provider === 'external' || item.sourceType === 'url') return false;
    const url = item.url || item.fileUrl || '';
    return url.includes('media.axionpacktech.com') || (Boolean(item.key) && !item.key.startsWith('external/'));
  }, []);

  const r2Count = useMemo(() => mediaList.filter(isR2Item).length, [mediaList, isR2Item]);
  const externalCount = useMemo(() => mediaList.filter((m) => !isR2Item(m)).length, [mediaList, isR2Item]);

  const displayedMediaList = useMemo(() => {
    if (selectedSource === 'r2') return mediaList.filter(isR2Item);
    if (selectedSource === 'external') return mediaList.filter((m) => !isR2Item(m));
    return mediaList;
  }, [mediaList, selectedSource, isR2Item]);

  const uniqueFolders = useMemo(() => {
    const folders = new Set<string>();
    mediaList.forEach((m) => {
      if (m.folder) folders.add(m.folder);
    });
    return Array.from(folders);
  }, [mediaList]);

  return (
    <div className="space-y-6">
      {/* Top Banner: Central Media System Status */}
      <div className="p-5 bg-gradient-to-r from-sky-950 via-slate-900 to-slate-900 border border-sky-800/40 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Active Universal Media Pipeline
              </span>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                {mediaConfig?.providerName || 'Cloudflare R2 Engine'}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Universal Asset Storage &amp; Optimization Hub
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload high-resolution images (auto-converted to WebP with up to 85% compression) and video clips (auto-encoded to web MP4 with synchronized WebP poster frames) stored securely on Cloudflare R2 and mapped to MongoDB.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-stretch lg:self-auto justify-end">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload from Local PC
            </button>

            <button
              onClick={() => {
                setRegisterForm({
                  name: '',
                  url: '',
                  type: 'image',
                  folder: 'general',
                  posterUrl: '',
                  altText: '',
                });
                setRegisterModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 shadow transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Paste Public URL
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Header: Centralized Storage Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs font-medium text-slate-400">Total Assets Managed</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-bold text-white">{mediaList.length}</h3>
            <span className="text-xs text-slate-500">items</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Cloudflare R2</p>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              Primary CDN
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-bold text-emerald-400">{r2Count}</h3>
            <span className="text-xs text-slate-500 font-mono">media.axionpacktech.com</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">External URLs</p>
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">
              Public HTTPS
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-bold text-sky-400">{externalCount}</h3>
            <span className="text-xs text-slate-500">Unsplash / Embeds</span>
          </div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs font-medium text-slate-400">Storage Optimization</p>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-bold text-white">{formatFileSize(totalBytes)}</h3>
            <span className="text-xs text-emerald-400">WebP / MP4</span>
          </div>
        </div>
      </div>

      {/* Media Catalog Explorer */}
      <AdminTable
        title="Media Repository"
        description="Search, view, copy URLs, and manage all images and videos used across the AXION PackTech website."
        totalCount={displayedMediaList.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by name, filename, folder, or URL..."
        actionButton={
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <button
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              title="Refresh repository"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        }
        filterComponent={
          <div className="flex flex-wrap items-center gap-2">
            {/* Storage Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as 'all' | 'r2' | 'external')}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Storage Sources ({mediaList.length})</option>
              <option value="r2">Cloudflare R2 Only ({r2Count})</option>
              <option value="external">External URLs Only ({externalCount})</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Media Types</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>

            {/* Folder Filter */}
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Folders</option>
              {uniqueFolders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        }
        isLoading={isLoading}
      >
        {displayedMediaList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-300">No media assets found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? 'No media matches your filter criteria. Try clearing search keywords.'
                : 'Upload an image/video from your local PC or register an external asset URL above.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
            {displayedMediaList.map((item) => {
              const assetName = item.name || item.originalFileName || item.fileName || 'Asset';
              const assetUrl = item.url || item.fileUrl || '';
              const isDoc = isPdfUrl(assetUrl) || item.type === 'document' || item.mimeType === 'application/pdf';
              const isVideo = !isDoc && (item.type === 'video' || item.mimeType?.startsWith('video/'));
              const parsedVideo = isVideo ? parseVideoUrl(assetUrl) : null;
              const thumbnail = item.posterUrl ? resolveMediaUrl(item.posterUrl) : parsedVideo?.thumbnailUrl;
              const isR2 = isR2Item(item);
              const resolvedAssetUrl = resolveMediaUrl(assetUrl);

              return (
                <div
                  key={item._id}
                  className="group relative bg-slate-950 border border-slate-800 hover:border-sky-500/60 rounded-2xl overflow-hidden shadow-md flex flex-col transition-all hover:shadow-sky-950/40"
                >
                  {/* Thumbnail / Video / PDF Preview */}
                  <div
                    onClick={() => setPreviewMedia(item)}
                    className="relative aspect-square bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center"
                  >
                    {isDoc ? (
                      <div className="w-full h-full relative flex flex-col items-center justify-center p-3 text-center bg-slate-900 overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 backdrop-blur-sm text-rose-400 border border-rose-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="relative z-10 text-[10px] text-rose-300 font-bold uppercase tracking-wider mt-2 drop-shadow">
                          PDF Document
                        </p>
                      </div>
                    ) : isVideo ? (
                      <div className="w-full h-full relative flex flex-col items-center justify-center p-3 text-center bg-slate-900 overflow-hidden">
                        {thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnail}
                            alt={assetName}
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-300"
                          />
                        )}
                        <div className="relative z-10 w-12 h-12 rounded-2xl bg-amber-500/20 backdrop-blur-sm text-amber-400 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="relative z-10 text-[10px] text-white font-semibold mt-2 drop-shadow">
                          {parsedVideo?.providerName || 'Play Video'}
                        </p>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolvedAssetUrl}
                        alt={assetName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}

                    {/* Format / Type Tag & Storage Source */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                      <div className="flex items-center gap-1">
                        <AdminBadge variant={isDoc ? 'neutral' : isVideo ? 'warning' : 'info'} size="sm">
                          {item.format || (isDoc ? 'pdf' : isVideo ? 'mp4' : 'webp')}
                        </AdminBadge>
                        {isR2 ? (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded shadow-sm backdrop-blur-sm">
                            R2
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-sky-950/80 text-sky-300 border border-sky-500/40 rounded shadow-sm backdrop-blur-sm">
                            External
                          </span>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Info & Actions */}
                  <div className="p-3 bg-slate-900/90 flex-1 flex flex-col justify-between space-y-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate" title={assetName}>
                        {assetName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-slate-400">
                          {formatFileSize(item.size || item.optimizedSize)}
                        </span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {item.folder || 'general'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleCopyUrl(item._id, assetUrl)}
                        className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors flex items-center gap-1"
                        title="Copy Public URL"
                      >
                        {copiedId === item._id ? (
                          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                        <span className="text-[10px]">Copy</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <a
                          href={assetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Open in new tab"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <button
                          onClick={() => handleOpenDelete(item)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/50 rounded-lg transition-colors"
                          title="Delete asset"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Asset Details</th>
                  <th className="py-3 px-4">Folder &amp; Format</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {displayedMediaList.map((item) => {
                  const assetName = item.name || item.originalFileName || item.fileName || 'Asset';
                  const assetUrl = item.url || item.fileUrl || '';
                  const isDoc = isPdfUrl(assetUrl) || item.type === 'document' || item.mimeType === 'application/pdf';
                  const isVideo = !isDoc && (item.type === 'video' || item.mimeType?.startsWith('video/'));
                  const resolvedAssetUrl = resolveMediaUrl(assetUrl);
                  const isR2 = isR2Item(item);

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 w-20">
                        <div
                          onClick={() => setPreviewMedia(item)}
                          className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center cursor-pointer"
                        >
                          {isDoc ? (
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          ) : isVideo ? (
                            <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolvedAssetUrl}
                              alt={assetName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-white truncate" title={assetName}>
                          {assetName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={assetUrl}>
                          {assetUrl}
                        </p>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <AdminBadge variant={isVideo ? 'warning' : 'neutral'}>
                              {item.folder || 'general'}
                            </AdminBadge>
                            {isR2 ? (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                                Cloudflare R2
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded">
                                External URL
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {item.format || (isVideo ? 'mp4' : 'webp')}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-400">
                        {formatFileSize(item.size || item.optimizedSize)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyUrl(item._id, assetUrl)}
                            className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] transition-colors flex items-center gap-1"
                          >
                            {copiedId === item._id ? (
                              <span className="text-emerald-400 font-medium">Copied</span>
                            ) : (
                              <span>Copy URL</span>
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-slate-800 hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Delete record"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminTable>

      {/* Upload from Local PC Modal */}
      <AdminModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Asset to Media Library"
        description="Choose a local image or video to automatically optimize and upload to Cloudflare R2"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <AdminMediaPicker
            label="Upload Asset"
            description="Images are optimized to WebP; Videos are encoded to web MP4 with WebP poster"
            type="both"
            folder="library"
            onChange={async () => {
              setUploadModalOpen(false);
              await loadData();
            }}
          />
        </div>
      </AdminModal>

      {/* Register External URL Modal */}
      <AdminModal
        isOpen={registerModalOpen}
        onClose={() => !isSaving && setRegisterModalOpen(false)}
        title="Register External Media URL"
        description="Register an existing image, video, or embed link into the central media database"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterSave} className="space-y-4">
          <div className="p-3 bg-sky-950/50 border border-sky-800/60 rounded-xl text-[11px] text-sky-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-300">
              <span>ℹ️</span>
              <span>Central R2 Media Architecture Notice</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              For primary packaging catalogs, machinery models, and heroes, use <strong>&quot;Upload from Local PC&quot;</strong> to store media directly on <strong>media.axionpacktech.com</strong> with automatic WebP optimization. Use External Registration strictly for verified public HTTPS CDNs (such as Unsplash, Pixabay) or YouTube/Vimeo video embeds.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name *</label>
            <input
              type="text"
              required
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              placeholder="e.g. Turnkey Robotic Packaging Line"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Asset URL *</label>
            <input
              type="url"
              required
              value={registerForm.url}
              onChange={(e) => setRegisterForm({ ...registerForm, url: e.target.value })}
              placeholder="https://cdn.example.com/asset.webp or YouTube embed link"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={registerForm.type}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    type: e.target.value as 'image' | 'video',
                  })
                }
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Folder</label>
              <input
                type="text"
                value={registerForm.folder}
                onChange={(e) => setRegisterForm({ ...registerForm, folder: e.target.value })}
                placeholder="products, services, general"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {registerForm.type === 'video' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={registerForm.posterUrl}
                onChange={(e) => setRegisterForm({ ...registerForm, posterUrl: e.target.value })}
                placeholder="https://cdn.example.com/poster.webp"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alt Text (Optional)</label>
            <input
              type="text"
              value={registerForm.altText}
              onChange={(e) => setRegisterForm({ ...registerForm, altText: e.target.value })}
              placeholder="Descriptive accessibility label"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setRegisterModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {isSaving ? 'Registering...' : 'Register Asset'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Preview Modal */}
      <AdminModal
        isOpen={!!previewMedia}
        onClose={() => setPreviewMedia(null)}
        title={previewMedia?.name || 'Media Asset Preview'}
        description={previewMedia?.url}
        maxWidth="2xl"
      >
        {previewMedia && (
          <div className="space-y-4">
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              {isPdfUrl(previewMedia.url) || previewMedia.type === 'document' || previewMedia.mimeType === 'application/pdf' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-900/95 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      PDF Document
                    </span>
                    <p className="text-sm font-semibold text-white mt-1 max-w-md truncate">
                      {previewMedia.name}
                    </p>
                  </div>
                  <a
                    href={resolveMediaUrl(previewMedia.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Open / Download PDF Document</span>
                  </a>
                </div>
              ) : previewMedia.type === 'video' || previewMedia.mimeType?.startsWith('video/') ? (
                <VideoPlayer
                  url={resolveMediaUrl(previewMedia.url)}
                  poster={previewMedia.posterUrl ? resolveMediaUrl(previewMedia.posterUrl) : undefined}
                  autoPlay={false}
                  controls={true}
                  className="w-full h-full object-contain"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(previewMedia.url)}
                  alt={previewMedia.name}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-500 text-[11px]">Format</p>
                <p className="font-mono text-white font-bold">{previewMedia.format || previewMedia.mimeType}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">File Size</p>
                <p className="font-mono text-white font-bold">{formatFileSize(previewMedia.size)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Folder</p>
                <p className="font-mono text-emerald-400 font-bold">{previewMedia.folder || 'general'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[11px]">Storage Provider</p>
                <p className={`font-mono font-bold ${isR2Item(previewMedia) ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {isR2Item(previewMedia) ? 'Cloudflare R2 (media.axionpacktech.com)' : 'External Public Source'}
                </p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Safe Deletion Modal with Usage Safety Checks */}
      <AdminModal
        isOpen={!!deletingItem}
        onClose={() => !isDeleting && setDeletingItem(null)}
        title="Delete Media Asset"
        description="Verify active CMS references before permanently deleting this asset"
        maxWidth="md"
      >
        <div className="space-y-4">
          {isCheckingUsage ? (
            <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Checking active references across CMS...</p>
            </div>
          ) : usageInfo?.isReferenced ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="text-amber-400 text-base shrink-0">⚠️</span>
                <div>
                  <p className="font-bold text-amber-300">Active Reference Warning!</p>
                  <p className="text-slate-300 mt-1">
                    This media item is actively referenced in{' '}
                    <strong className="text-white">{usageInfo.count}</strong> CMS location(s):
                  </p>
                </div>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1.5 pl-6">
                {usageInfo.references.map((ref, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="font-semibold text-amber-300">{ref.model}:</span>
                    <span className="truncate">{ref.title || ref.id}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-amber-500/30">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-rose-500 focus:ring-rose-500"
                  />
                  <span className="text-xs font-semibold text-rose-300">
                    Force Delete (I understand this may create broken images)
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No active references found. Are you sure you want to permanently delete{' '}
              <strong className="text-white">{deletingItem?.name}</strong> from Cloudflare R2 storage and the database?
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeletingItem(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting || (usageInfo?.isReferenced && !forceDelete)}
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              {isDeleting ? 'Deleting...' : forceDelete ? 'Force Delete Asset' : 'Delete Asset'}
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
