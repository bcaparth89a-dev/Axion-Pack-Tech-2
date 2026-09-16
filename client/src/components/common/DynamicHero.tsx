'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { EntityHero, HeroMediaItem } from '@/types/products';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

export interface DynamicHeroProps {
  type: 'category' | 'product' | 'model';
  hero?: EntityHero | null;
  fallbackData: {
    title: string;
    subtitle?: string;
    description?: string;
    eyebrow?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
    mediaItems?: Array<{
      url: string;
      type?: 'image' | 'video';
      title?: string;
      posterUrl?: string;
    }>;
  };
  className?: string;
}

export default function DynamicHero({
  type,
  hero,
  fallbackData,
  className = '',
}: DynamicHeroProps) {
  // 1. Resolve Effective Content with Fallbacks
  const isEnabled = hero?.enabled !== false;

  const eyebrow = hero?.eyebrow?.trim() || fallbackData.eyebrow || (
    type === 'category'
      ? 'Product Category Portfolio'
      : type === 'product'
      ? 'Equipment Engineering Series'
      : 'Model Specification Variant'
  );

  const title = hero?.title?.trim() || fallbackData.title || 'AXION PackTech Machinery';
  const subtitle = hero?.subtitle?.trim() || fallbackData.subtitle || '';
  const description = hero?.description?.trim() || fallbackData.description || '';

  const ctaText = hero?.ctaText?.trim() || fallbackData.ctaText || (
    type === 'category'
      ? 'Explore Equipment ↓'
      : type === 'product'
      ? 'View Models & Specs ↓'
      : 'Technical Specifications ↓'
  );

  const ctaLink = hero?.ctaLink?.trim() || fallbackData.ctaLink || (
    type === 'category'
      ? '#subcategories'
      : type === 'product'
      ? '#models'
      : '#specifications'
  );

  const rawBg = hero?.backgroundImage?.trim() || fallbackData.backgroundImage || '';
  const bgImage = resolveMediaUrl(rawBg);
  const overlayOpacity = typeof hero?.overlayOpacity === 'number' ? hero.overlayOpacity : 0.78;

  // 2. Assemble Carousel Media Items
  let mediaList: HeroMediaItem[] = [];
  if (Array.isArray(hero?.mediaItems) && hero.mediaItems.length > 0) {
    mediaList = [...hero.mediaItems]
      .filter((m) => m && m.url && m.url.trim())
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  if (mediaList.length === 0 && Array.isArray(fallbackData.mediaItems) && fallbackData.mediaItems.length > 0) {
    mediaList = fallbackData.mediaItems
      .filter((m) => m && m.url && m.url.trim())
      .map((m, idx) => ({
        url: m.url,
        type: m.type || 'image',
        title: m.title || `${title} item ${idx + 1}`,
        posterUrl: m.posterUrl || '',
        order: idx,
      }));
  }

  // Fallback single item if completely empty
  if (mediaList.length === 0 && (bgImage || rawBg)) {
    mediaList = [
      {
        url: bgImage || rawBg,
        type: 'image',
        title,
        order: 0,
      },
    ];
  }

  const itemCount = mediaList.length;

  // 3. Carousel State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) => (prev + 1) % itemCount);
  }, [itemCount]);

  const handlePrev = useCallback(() => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) => (prev - 1 + itemCount) % itemCount);
  }, [itemCount]);

  const handleGoTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // 4. Tab Visibility Listener
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  // 5. Autoplay Timer with Reset
  useEffect(() => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    if (itemCount > 1 && !isHovered && isTabVisible) {
      autoplayTimerRef.current = setInterval(() => {
        handleNext();
      }, 5500);
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [itemCount, isHovered, isTabVisible, handleNext, activeIndex]);

  // 6. Video Playback Management: Active video plays, inactive pauses
  useEffect(() => {
    videoRefs.current.forEach((vidEl, idx) => {
      if (!vidEl) return;
      if (idx === activeIndex && isTabVisible) {
        vidEl.play().catch(() => {
          // Autoplay policy prevented playback, muted fallback handles this
        });
      } else {
        vidEl.pause();
      }
    });
  }, [activeIndex, isTabVisible]);

  // 7. Touch / Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartXRef.current - touchEndX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Type accent colors
  const accentBadgeClass =
    type === 'category'
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      : type === 'product'
      ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  const accentPulseClass =
    type === 'category'
      ? 'bg-amber-400'
      : type === 'product'
      ? 'bg-sky-400'
      : 'bg-emerald-400';

  const accentCtaClass =
    type === 'category'
      ? 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
      : type === 'product'
      ? 'from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
      : 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20';

  if (!isEnabled) {
    return null;
  }

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#040911] text-slate-100 border-b border-slate-800/80 ${className}`}
      aria-label={`${title} Hero Section`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ------------------------------------------------------------- */}
      {/* BACKGROUND IMAGE WITH CINEMATIC NAVY OVERLAY & BLUR           */}
      {/* ------------------------------------------------------------- */}
      {bgImage && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <CmsImage
            src={bgImage}
            alt={`${title} Background`}
            fill
            sizes="100vw"
            priority
            className="object-cover scale-105 filter blur-[2px] brightness-75 transition-transform duration-1000"
          />
          {/* Configurable dark navy gradient overlay */}
          <div
            className="absolute inset-0 bg-[#06101e]"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-transparent to-[#040911]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#040911]/90 via-[#040911]/40 to-transparent" />
        </div>
      )}

      {/* Ambient decorative glow */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-sky-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* HERO CONTAINER (94% WIDE CONTAINER)                           */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 container-wide py-12 sm:py-16 lg:py-20 xl:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center min-h-[420px] lg:min-h-[480px]">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: TEXT CONTENT & ACTIONS                       */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 xl:col-span-6 space-y-5 lg:space-y-6">
            {/* Eyebrow Badge */}
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase backdrop-blur-md transition-all shadow-sm">
                <span className={`w-2 h-2 rounded-full ${accentPulseClass} animate-pulse`} />
                <span className={accentBadgeClass.split(' ').pop()}>{eyebrow}</span>
              </div>
            )}

            {/* Large Cinematic Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08] drop-shadow-md">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-200/90 tracking-wide">
                {subtitle}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-sm sm:text-base text-slate-300/80 leading-relaxed font-normal max-w-xl">
                {description}
              </p>
            )}

            {/* CTA & Trust Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r ${accentCtaClass} shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0`}
                >
                  <span>{ctaText}</span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>
              )}

              {/* Secondary Action */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all backdrop-blur-md"
              >
                <span>Request Quotation</span>
              </Link>
            </div>

            {/* Trust Features Bar */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>ISO 9001:2015</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-sky-400 font-bold">✓</span>
                <span>SS304 / SS316 Grade</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-amber-400 font-bold">✓</span>
                <span>Full PLC Automation</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: APPLE-STYLE 3D MEDIA CAROUSEL               */}
          {/* ========================================================= */}
          <div
            className="lg:col-span-6 xl:col-span-6 relative w-full flex flex-col items-center justify-center select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 3D Perspective Stage */}
            <div
              className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] lg:h-[420px] flex items-center justify-center"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d',
              }}
            >
              {mediaList.map((item, idx) => {
                // Calculate distance in circular array
                let diff = idx - activeIndex;
                if (diff < -Math.floor(itemCount / 2)) {
                  diff += itemCount;
                } else if (diff > Math.floor(itemCount / 2)) {
                  diff -= itemCount;
                }

                // If itemCount is 2, normalize -1 and 1
                if (itemCount === 2) {
                  diff = idx === activeIndex ? 0 : 1;
                }

                const isActive = diff === 0;
                const isVisible = Math.abs(diff) <= 2;

                if (!isVisible) {
                  return null;
                }

                // Smooth transform parameters
                let translateX = '0%';
                let scale = 1;
                let rotateY = '0deg';
                let zIndex = 30;
                let opacity = 1;

                if (diff === 1) {
                  translateX = '52%';
                  scale = 0.82;
                  rotateY = '-16deg';
                  zIndex = 20;
                  opacity = 0.7;
                } else if (diff === -1) {
                  translateX = '-52%';
                  scale = 0.82;
                  rotateY = '16deg';
                  zIndex = 20;
                  opacity = 0.7;
                } else if (diff === 2) {
                  translateX = '92%';
                  scale = 0.66;
                  rotateY = '-26deg';
                  zIndex = 10;
                  opacity = 0.35;
                } else if (diff === -2) {
                  translateX = '-92%';
                  scale = 0.66;
                  rotateY = '26deg';
                  zIndex = 10;
                  opacity = 0.35;
                }

                const resolvedItemUrl = resolveMediaUrl(item.url);
                const isVideo =
                  item.type === 'video' ||
                  item.url.endsWith('.mp4') ||
                  item.url.endsWith('.webm') ||
                  item.url.endsWith('.mov');

                return (
                  <div
                    key={item._id || `${item.url}-${idx}`}
                    onClick={() => {
                      if (!isActive) handleGoTo(idx);
                    }}
                    className={`absolute top-0 bottom-0 my-auto w-[82%] sm:w-[76%] md:w-[72%] aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      isActive
                        ? 'border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10'
                        : 'border border-slate-700/60 shadow-xl pointer-events-auto'
                    }`}
                    style={{
                      transform: `translateX(${translateX}) scale(${scale}) rotateY(${rotateY})`,
                      zIndex,
                      opacity,
                    }}
                  >
                    {/* Media Card Container */}
                    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
                      {isVideo ? (
                        <div className="relative w-full h-full">
                          <video
                            ref={(el) => {
                              if (el) {
                                videoRefs.current.set(idx, el);
                              } else {
                                videoRefs.current.delete(idx);
                              }
                            }}
                            src={resolvedItemUrl}
                            poster={item.posterUrl ? resolveMediaUrl(item.posterUrl) : undefined}
                            muted={isVideoMuted}
                            playsInline
                            loop
                            preload={isActive ? 'metadata' : 'none'}
                            className="w-full h-full object-cover"
                          />
                          {/* Video Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wider uppercase text-white">
                            <span>▶ VIDEO</span>
                          </div>

                          {/* Sound Toggle (Only on Center Active Slide) */}
                          {isActive && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsVideoMuted((prev) => !prev);
                              }}
                              className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs transition-colors z-30"
                              title={isVideoMuted ? 'Unmute Video' : 'Mute Video'}
                            >
                              {isVideoMuted ? '🔇' : '🔊'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <CmsImage
                          src={resolvedItemUrl}
                          alt={item.title || `${title} showcase ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 85vw, 45vw"
                          priority={isActive}
                          className="object-cover"
                        />
                      )}

                      {/* Glass Card Caption / Title Bar */}
                      {item.title && (
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200 truncate max-w-[80%]">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">
                            {idx + 1}/{itemCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ------------------------------------------------------- */}
            {/* CAROUSEL CONTROLS: PREV / NEXT BUTTONS & PAGINATION     */}
            {/* ------------------------------------------------------- */}
            {itemCount > 1 && (
              <div className="mt-4 w-full flex items-center justify-between px-4 max-w-[85%] z-30">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-lg backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
                  aria-label="Previous Slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Pagination Dots with Active Pill Expansion */}
                <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-950/70 border border-slate-800 backdrop-blur-md">
                  {mediaList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => handleGoTo(dotIdx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIdx === activeIndex
                          ? 'w-6 bg-white shadow-sm'
                          : 'w-2 bg-slate-600 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-lg backdrop-blur-md transition-all transform hover:scale-105 active:scale-95"
                  aria-label="Next Slide"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
