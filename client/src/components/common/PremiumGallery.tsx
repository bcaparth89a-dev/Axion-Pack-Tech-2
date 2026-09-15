'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GalleryMediaItem } from '@/types/products';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

export interface PremiumGalleryProps {
  media?: GalleryMediaItem[];
  legacyGallery?: string[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function PremiumGallery({
  media,
  legacyGallery,
  title = 'Media Gallery',
  subtitle = 'High-resolution industrial photography & machinery operation footage',
  className = '',
}: PremiumGalleryProps) {
  // Normalize media items
  const normalizedItems = useMemo(() => {
    const items: GalleryMediaItem[] = [];

    if (Array.isArray(media) && media.length > 0) {
      media.forEach((item, idx) => {
        if (item && item.url && item.url.trim()) {
          items.push({
            ...item,
            order: item.order ?? idx,
          });
        }
      });
    } else if (Array.isArray(legacyGallery) && legacyGallery.length > 0) {
      legacyGallery.forEach((url, idx) => {
        if (url && url.trim()) {
          const isVid = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
          items.push({
            url,
            type: isVid ? 'video' : 'image',
            title: `${title} - View ${idx + 1}`,
            order: idx,
          });
        }
      });
    }

    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [media, legacyGallery, title]);

  // Lightbox State
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const isOpen = activeLightboxIndex !== null;
  const activeItem = isOpen ? normalizedItems[activeLightboxIndex] : null;

  const handleNext = useCallback(() => {
    if (normalizedItems.length <= 1) return;
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % normalizedItems.length : 0
    );
  }, [normalizedItems.length]);

  const handlePrev = useCallback(() => {
    if (normalizedItems.length <= 1) return;
    setActiveLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + normalizedItems.length) % normalizedItems.length : 0
    );
  }, [normalizedItems.length]);

  const handleClose = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleClose, handleNext, handlePrev]);

  // Prevent background scrolling when lightbox is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Touch swipe support in lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className={`py-16 border-b border-slate-800/80 bg-[#060e18] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Industrial Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            {subtitle}
          </p>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {normalizedItems.map((item, idx) => {
            const itemUrl = resolveMediaUrl(item.url);
            const isVideo =
              item.type === 'video' ||
              item.url.endsWith('.mp4') ||
              item.url.endsWith('.webm') ||
              item.url.endsWith('.mov');

            // Span 2 columns for 1st item if multiple items exist for editorial masonry feel
            const isFeatured = idx === 0 && normalizedItems.length >= 4;

            return (
              <div
                key={item._id || `${item.url}-${idx}`}
                onClick={() => setActiveLightboxIndex(idx)}
                className={`group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all duration-300 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:-translate-y-1 ${
                  isFeatured ? 'sm:col-span-2 sm:row-span-2 aspect-[16/11]' : 'aspect-[4/3]'
                }`}
              >
                {isVideo ? (
                  <div className="relative w-full h-full bg-slate-950">
                    <video
                      src={itemUrl}
                      poster={item.posterUrl ? resolveMediaUrl(item.posterUrl) : undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase text-white tracking-wider border border-white/10">
                      Video
                    </div>
                  </div>
                ) : (
                  <CmsImage
                    src={itemUrl}
                    alt={item.altText || item.title || `${title} photo ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Overlay Caption on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white text-xs font-semibold truncate w-full">
                    {item.title || `${title} (${idx + 1}/${normalizedItems.length})`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* CINEMATIC FULLSCREEN LIGHTBOX VIEWER                          */}
      {/* ============================================================= */}
      {isOpen && activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in select-none"
          onClick={handleClose}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Title, Counter & Close Button */}
          <div
            className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                {activeLightboxIndex + 1} / {normalizedItems.length}
              </span>
              <span className="text-sm font-semibold text-slate-200 hidden sm:inline truncate max-w-md">
                {activeItem.title || title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
              aria-label="Close Fullscreen Viewer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Controls: Previous */}
          {normalizedItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-50"
              aria-label="Previous Media"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Navigation Controls: Next */}
          {normalizedItems.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 shadow-2xl transition-all transform hover:scale-110 active:scale-95 z-50"
              aria-label="Next Media"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Center Stage Media Container */}
          <div
            className="relative max-w-5xl max-h-[82vh] w-[92vw] h-[78vh] flex items-center justify-center p-2 sm:p-4 z-40"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.type === 'video' ||
            activeItem.url.endsWith('.mp4') ||
            activeItem.url.endsWith('.webm') ? (
              <video
                ref={lightboxVideoRef}
                src={resolveMediaUrl(activeItem.url)}
                poster={activeItem.posterUrl ? resolveMediaUrl(activeItem.posterUrl) : undefined}
                controls
                autoPlay
                playsInline
                className="max-h-full max-w-full rounded-xl shadow-2xl object-contain border border-white/10"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <CmsImage
                  src={resolveMediaUrl(activeItem.url)}
                  alt={activeItem.altText || activeItem.title || title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain rounded-xl drop-shadow-2xl"
                />
              </div>
            )}
          </div>

          {/* Bottom Caption Bar */}
          {activeItem.caption && (
            <div
              className="absolute bottom-4 inset-x-0 max-w-2xl mx-auto px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-300 z-50 backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.caption}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
