'use client';

import React, { useState, useRef } from 'react';
import { EntityHero, HeroMediaItem } from '@/types/products';
import { uploadFileDirectToR2 } from '@/lib/api/admin/media';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import DynamicHero from '@/components/common/DynamicHero';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import { useToast } from '@/context/ToastContext';

export interface AdminHeroEditorProps {
  entityType: 'category' | 'product' | 'model';
  entityName: string;
  hero: EntityHero;
  onChange: (updatedHero: EntityHero) => void;
}

export const AdminHeroEditor: React.FC<AdminHeroEditorProps> = ({
  entityType,
  entityName,
  hero,
  onChange,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Field updater
  const updateField = <K extends keyof EntityHero>(key: K, value: EntityHero[K]) => {
    onChange({
      ...hero,
      [key]: value,
    });
  };

  // -------------------------------------------------------------
  // Multi-File Direct R2 Upload
  // -------------------------------------------------------------
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setIsUploadingFiles(true);
    setUploadProgressText(`Uploading 0 of ${fileArray.length}...`);

    const newItems: HeroMediaItem[] = [];
    let completedCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgressText(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`);

      try {
        const uploaded = await uploadFileDirectToR2(file, {
          category: 'hero',
          title: file.name.replace(/\.[^/.]+$/, ''),
        });

        const isVid =
          uploaded.type === 'video' ||
          file.type.startsWith('video/') ||
          file.name.endsWith('.mp4') ||
          file.name.endsWith('.webm');

        newItems.push({
          url: uploaded.url,
          type: isVid ? 'video' : 'image',
          title: file.name.replace(/\.[^/.]+$/, ''),
          order: (hero.mediaItems?.length || 0) + completedCount,
        });

        completedCount++;
      } catch (err: unknown) {
        showToast(`Failed to upload ${file.name}: ${(err as Error)?.message || 'Error'}`, 'error');
      }
    }

    if (newItems.length > 0) {
      const merged = [...(hero.mediaItems || []), ...newItems].map((item, idx) => ({
        ...item,
        order: idx,
      }));
      updateField('mediaItems', merged);
      showToast(`Successfully uploaded ${newItems.length} media item(s) directly to R2!`, 'success');
    }

    setIsUploadingFiles(false);
    setUploadProgressText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // -------------------------------------------------------------
  // Media Reordering (Move Up / Down & Drag & Drop)
  // -------------------------------------------------------------
  const moveMedia = (fromIndex: number, toIndex: number) => {
    const items = [...(hero.mediaItems || [])];
    if (toIndex < 0 || toIndex >= items.length) return;
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    updateField('mediaItems', updated);
  };

  const removeMedia = (index: number) => {
    const items = [...(hero.mediaItems || [])];
    items.splice(index, 1);
    const updated = items.map((item, idx) => ({ ...item, order: idx }));
    updateField('mediaItems', updated);
  };

  const updateMediaItem = (index: number, updates: Partial<HeroMediaItem>) => {
    const items = [...(hero.mediaItems || [])];
    items[index] = { ...items[index], ...updates };
    updateField('mediaItems', items);
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;
    moveMedia(draggedIndex, idx);
    setDraggedIndex(idx);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const currentBgResolved = resolveMediaUrl(hero.backgroundImage);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner & Live Preview Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {entityType.toUpperCase()} HERO CMS
            </span>
            <span className="text-xs font-mono text-slate-400">Target: {entityName}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure independent cinematic hero, custom background, and Apple-style media carousel.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Live Preview Button */}
          <button
            type="button"
            onClick={() => setPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-bold text-xs border border-slate-700 transition-all shadow-sm"
          >
            <span>👁 Preview Hero</span>
          </button>

          {/* Enabled Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={hero.enabled !== false}
              onChange={(e) => updateField('enabled', e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-sky-500"
            />
            <span>Enabled</span>
          </label>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: BASIC CONTENT FIELDS                               */}
      {/* ============================================================= */}
      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
        <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          1. Hero Content & Copy
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Eyebrow */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Hero Eyebrow (Category / Series Tag)
            </label>
            <input
              type="text"
              value={hero.eyebrow || ''}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              placeholder="e.g. INNOVATION IN PACKAGING"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Hero Title <span className="text-slate-500 font-normal">(Falls back to {entityName})</span>
            </label>
            <input
              type="text"
              value={hero.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder={entityName}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Hero Subtitle / Tagline
          </label>
          <input
            type="text"
            value={hero.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="e.g. Reliable. Efficient. Future-Ready."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Hero Description
          </label>
          <textarea
            rows={2}
            value={hero.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Explore our advanced range of packaging machines designed to increase productivity and deliver consistent quality."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-sky-500 focus:outline-none leading-relaxed"
          />
        </div>

        {/* CTA Text & Link */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Call-to-Action (CTA) Button Text
            </label>
            <input
              type="text"
              value={hero.ctaText || ''}
              onChange={(e) => updateField('ctaText', e.target.value)}
              placeholder="e.g. Explore Equipment →"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              CTA Link / Target URL
            </label>
            <input
              type="text"
              value={hero.ctaLink || ''}
              onChange={(e) => updateField('ctaLink', e.target.value)}
              placeholder="e.g. #products or /contact"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-sky-400 focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 2: BACKGROUND IMAGE (INDEPENDENT FROM CAROUSEL)       */}
      {/* ============================================================= */}
      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            2. Hero Background Image
          </h4>
          <span className="text-[11px] text-slate-400">Full-width atmospheric background</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Current Background Preview Card */}
          <div className="md:col-span-5">
            <div className="relative aspect-[16/6] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner group">
              {currentBgResolved ? (
                <>
                  <CmsImage
                    src={currentBgResolved}
                    alt="Background Preview"
                    fill
                    sizes="300px"
                    className="object-cover brightness-75"
                  />
                  <div
                    className="absolute inset-0 bg-[#06101e]"
                    style={{ opacity: hero.overlayOpacity ?? 0.78 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center pointer-events-none">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {hero.title || entityName}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                  <span>No background image set</span>
                  <span className="text-[10px] text-slate-500 mt-1">(Using default theme overlay)</span>
                </div>
              )}
            </div>
          </div>

          {/* Background Image Controls */}
          <div className="md:col-span-7 space-y-3">
            <AdminMediaPicker
              label="Select or Upload Background Image"
              type="image"
              value={hero.backgroundImage || ''}
              onChange={(url) => updateField('backgroundImage', url)}
            />

            {hero.backgroundImage && (
              <div className="flex items-center justify-between pt-2">
                {/* Overlay Opacity Slider */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Overlay:</span>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={hero.overlayOpacity ?? 0.78}
                    onChange={(e) => updateField('overlayOpacity', parseFloat(e.target.value))}
                    className="w-24 accent-sky-500 cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    {Math.round((hero.overlayOpacity ?? 0.78) * 100)}%
                  </span>
                </div>

                {/* Remove Background Button */}
                <button
                  type="button"
                  onClick={() => updateField('backgroundImage', '')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  ✕ Remove Background
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 3: HERO MEDIA CAROUSEL (IMAGES & VIDEOS)              */}
      {/* ============================================================= */}
      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              3. Carousel Media Assets ({hero.mediaItems?.length || 0})
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports unlimited images & MP4/WebM videos. Drag cards or use arrows to set public display order.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-File Upload Input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm"
              onChange={handleFilesSelected}
              className="hidden"
            />

            {/* Direct Multi-Upload Button */}
            <button
              type="button"
              disabled={isUploadingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <span>{isUploadingFiles ? '⏳ Uploading...' : '＋ Upload Images / Videos'}</span>
            </button>
          </div>
        </div>

        {/* Upload Progress Status */}
        {isUploadingFiles && (
          <div className="p-3 bg-sky-950/50 border border-sky-800/60 rounded-xl text-xs text-sky-300 font-medium animate-pulse">
            {uploadProgressText}
          </div>
        )}

        {/* Empty State */}
        {(!hero.mediaItems || hero.mediaItems.length === 0) && (
          <div className="py-10 border-2 border-dashed border-slate-800 rounded-xl text-center space-y-3 bg-slate-900/30">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-lg">
              🖼
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-300">No Carousel Media Uploaded Yet</p>
              <p className="text-xs text-slate-500">
                Click &quot;Upload Images / Videos&quot; above to select multiple files directly from your computer.
              </p>
            </div>
          </div>
        )}

        {/* Media Cards Grid with Drag & Drop */}
        {hero.mediaItems && hero.mediaItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
            {hero.mediaItems.map((item, idx) => {
              const isVid =
                item.type === 'video' ||
                item.url.endsWith('.mp4') ||
                item.url.endsWith('.webm');
              const resolvedUrl = resolveMediaUrl(item.url);

              return (
                <div
                  key={item._id || `${item.url}-${idx}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`group relative flex flex-col rounded-xl overflow-hidden bg-slate-900 border transition-all ${
                    draggedIndex === idx
                      ? 'border-sky-400 opacity-50 scale-95'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'
                  }`}
                >
                  {/* Thumbnail Stage */}
                  <div className="aspect-[4/3] relative w-full bg-slate-950 overflow-hidden">
                    {isVid ? (
                      <div className="relative w-full h-full">
                        <video
                          src={resolvedUrl}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-xs">
                            ▶
                          </span>
                        </div>
                      </div>
                    ) : (
                      <CmsImage
                        src={resolvedUrl}
                        alt={item.title || `Media ${idx + 1}`}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    )}

                    {/* Order Badge */}
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-white/10">
                      #{idx + 1}
                    </div>

                    {/* Format Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono uppercase text-slate-300 border border-white/10">
                      {isVid ? 'Video' : 'Image'}
                    </div>
                  </div>

                  {/* Item Metadata / Caption */}
                  <div className="p-2 space-y-1.5 bg-slate-900/90 flex-1 flex flex-col justify-between">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => updateMediaItem(idx, { title: e.target.value })}
                      placeholder="Title / Caption"
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-200 focus:border-sky-500 focus:outline-none"
                    />

                    {/* Controls Toolbar: Move Left/Up, Move Right/Down, Delete */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveMedia(idx, idx - 1)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                          title="Move earlier"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={idx === (hero.mediaItems?.length || 1) - 1}
                          onClick={() => moveMedia(idx, idx + 1)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-20"
                          title="Move later"
                        >
                          ▶
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="px-2 py-0.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-[11px] font-semibold transition-colors"
                        title="Delete media item"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* LIVE PREVIEW MODAL                                            */}
      {/* ============================================================= */}
      <AdminModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={`HERO LIVE PREVIEW: ${entityName}`}
        description="Interactive preview of the exact hero layout, 3D carousel transitions, and video playback."
        maxWidth="4xl"
      >
        <div className="p-0 overflow-hidden bg-[#040911]">
          <DynamicHero
            type={entityType}
            hero={hero}
            fallbackData={{
              title: hero.title || entityName,
              subtitle: hero.subtitle || 'Reliable. Efficient. Future-Ready.',
              description: hero.description || 'Explore our advanced range of automated packaging systems.',
              eyebrow: hero.eyebrow || 'Precision Engineering',
              ctaText: hero.ctaText || 'Explore Equipment ↓',
              ctaLink: hero.ctaLink || '#catalog',
              backgroundImage: hero.backgroundImage,
              mediaItems: hero.mediaItems,
            }}
          />
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
