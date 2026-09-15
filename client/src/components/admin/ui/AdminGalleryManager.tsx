'use client';

import React, { useState, useRef } from 'react';
import { GalleryMediaItem } from '@/types/products';
import { uploadFileDirectToR2 } from '@/lib/api/admin/media';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import { useToast } from '@/context/ToastContext';

export interface AdminGalleryManagerProps {
  entityType: 'category' | 'product' | 'model';
  entityName: string;
  galleryMedia?: GalleryMediaItem[];
  onChange: (updatedMedia: GalleryMediaItem[]) => void;
}

export const AdminGalleryManager: React.FC<AdminGalleryManagerProps> = ({
  entityType: _entityType,
  entityName,
  galleryMedia = [],
  onChange,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryMediaItem | null>(null);

  // Multi-file R2 upload
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);
    setUploadStatus(`Uploading 0 of ${fileList.length}...`);

    const newItems: GalleryMediaItem[] = [];
    let completed = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setUploadStatus(`Uploading ${i + 1} of ${fileList.length}: ${file.name}...`);

      try {
        const uploaded = await uploadFileDirectToR2(file, {
          category: 'gallery',
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
          caption: '',
          altText: `${entityName} ${file.name.replace(/\.[^/.]+$/, '')}`,
          order: galleryMedia.length + completed,
        });

        completed++;
      } catch (err: unknown) {
        showToast(`Failed to upload ${file.name}: ${(err as Error)?.message || 'Error'}`, 'error');
      }
    }

    if (newItems.length > 0) {
      const merged = [...galleryMedia, ...newItems].map((item, idx) => ({
        ...item,
        order: idx,
      }));
      onChange(merged);
      showToast(`Uploaded ${newItems.length} media item(s) directly to R2!`, 'success');
    }

    setIsUploading(false);
    setUploadStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reorder via drag & drop
  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) return;

    const updated = [...galleryMedia];
    const draggedItem = updated[draggedIdx];
    updated.splice(draggedIdx, 1);
    updated.splice(targetIndex, 0, draggedItem);

    const reordered = updated.map((m, i) => ({ ...m, order: i }));
    setDraggedIdx(targetIndex);
    onChange(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // Field change
  const handleItemFieldChange = (
    index: number,
    field: 'title' | 'caption' | 'altText',
    val: string
  ) => {
    const updated = [...galleryMedia];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    onChange(updated);
  };

  // Delete
  const handleDeleteItem = (index: number) => {
    const updated = galleryMedia.filter((_, i) => i !== index).map((m, idx) => ({
      ...m,
      order: idx,
    }));
    onChange(updated);
    showToast('Gallery item removed', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Media Gallery Manager (Unlimited Images & Videos)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload high-resolution photography and operation videos. Files are stored directly in Cloudflare R2.
          </p>
        </div>

        {/* Upload Trigger */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm"
            onChange={handleFilesSelected}
            className="hidden"
            id="gallery-multi-upload"
          />
          <label
            htmlFor="gallery-multi-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md ${
              isUploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Upload Media to R2</span>
          </label>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="text-xs font-semibold text-amber-300 truncate">
            {uploadStatus || 'Processing R2 upload...'}
          </div>
        </div>
      )}

      {/* Media Items Grid */}
      {galleryMedia.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-sm font-bold text-slate-300">No Gallery Media Uploaded</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Upload high-resolution images or machinery demonstration videos. Drag and drop cards to reorder.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryMedia.map((item, idx) => {
            const isVid = item.type === 'video' || item.url.endsWith('.mp4') || item.url.endsWith('.webm');
            const resolvedUrl = resolveMediaUrl(item.url);

            return (
              <div
                key={item._id || `${item.url}-${idx}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl border bg-slate-950/80 p-3 space-y-3 transition-all duration-200 cursor-move ${
                  draggedIdx === idx
                    ? 'border-amber-400 bg-amber-500/5 shadow-2xl scale-105 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                  {isVid ? (
                    <div className="relative w-full h-full">
                      <video
                        src={resolvedUrl}
                        poster={item.posterUrl ? resolveMediaUrl(item.posterUrl) : undefined}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase border border-white/10">
                        ▶ Video
                      </div>
                    </div>
                  ) : (
                    <CmsImage
                      src={resolvedUrl}
                      alt={item.title || `${entityName} gallery ${idx + 1}`}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  )}

                  {/* Order Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold text-amber-400 border border-slate-700">
                    #{idx + 1}
                  </div>

                  {/* Quick Action Overlay */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-[11px] text-white backdrop-blur-md border border-slate-700 transition-colors"
                      title="Preview Media"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="px-2 py-1 rounded bg-red-500/80 hover:bg-red-600 text-[11px] text-white backdrop-blur-md transition-colors"
                      title="Delete Media"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Inline Metadata Form */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleItemFieldChange(idx, 'title', e.target.value)}
                      placeholder="Title / Heading"
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={item.caption || ''}
                      onChange={(e) => handleItemFieldChange(idx, 'caption', e.target.value)}
                      placeholder="Supporting caption text"
                      className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <AdminModal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={`Gallery Preview: ${previewItem.title || 'Media Item'}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center relative">
              {previewItem.type === 'video' ||
              previewItem.url.endsWith('.mp4') ||
              previewItem.url.endsWith('.webm') ? (
                <video
                  src={resolveMediaUrl(previewItem.url)}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <CmsImage
                  src={resolveMediaUrl(previewItem.url)}
                  alt={previewItem.title || 'Preview'}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              )}
            </div>
            {previewItem.caption && (
              <p className="text-xs text-slate-400 text-center italic">
                {previewItem.caption}
              </p>
            )}
          </div>
        </AdminModal>
      )}
    </div>
  );
};
