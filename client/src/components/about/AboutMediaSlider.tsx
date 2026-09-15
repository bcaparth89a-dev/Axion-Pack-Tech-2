'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AboutMediaSliderItem } from '@/lib/api/pages';
import { parseVideoUrl } from '@/lib/utils/video';
import VideoPlayer from '@/components/common/VideoPlayer';
import CmsImage from '@/components/common/CmsImage';

interface AboutMediaSliderProps {
  items?: AboutMediaSliderItem[];
  heading?: string;
}

export default function AboutMediaSlider({ items = [], heading }: AboutMediaSliderProps) {
  const activeItems = (items || [])
    .filter((item) => item.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const total = activeItems.length;

  const nextSlide = useCallback(() => {
    setIsPlayingVideo(false);
    setCurrentIndex((prev) => (prev + 1) % (total || 1));
  }, [total]);

  const prevSlide = useCallback(() => {
    setIsPlayingVideo(false);
    setCurrentIndex((prev) => (prev - 1 + (total || 1)) % (total || 1));
  }, [total]);

  const goToSlide = (idx: number) => {
    setIsPlayingVideo(false);
    setCurrentIndex(idx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (total <= 1) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, total]);

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  const handleTogglePlayVideo = () => {
    if (!videoRef.current) return;
    if (isPlayingVideo) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlayingVideo(true);
      }).catch(() => {
        setIsPlayingVideo(false);
      });
    }
  };

  const currentItem = activeItems[currentIndex];
  const parsedVideo = currentItem?.url ? parseVideoUrl(currentItem.url) : null;
  const isVideo = currentItem ? (currentItem.type === 'video' || parsedVideo?.isValid) : false;

  // Reset and pause video on slide transition
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlayingVideo(false);
      if (currentItem && currentItem.type === 'video' && currentItem.autoplay) {
        videoRef.current
          .play()
          .then(() => setIsPlayingVideo(true))
          .catch(() => setIsPlayingVideo(false));
      }
    }
  }, [currentIndex, currentItem]);

  if (total === 0 || !currentItem) {
    return null;
  }

  return (
    <div className="w-full relative group">
      {/* Outer Glow & Glassmorphism Housing */}
      <div className="relative rounded-3xl p-2 sm:p-2.5 bg-gradient-to-b from-sky-500/20 via-slate-800/40 to-sky-950/30 border border-sky-400/25 shadow-2xl backdrop-blur-xl transition-all duration-500 group-hover:border-sky-400/40 group-hover:shadow-[0_0_35px_rgba(56,189,248,0.18)]">
        {/* Apple-style Media Container */}
        <div
          className="relative aspect-[16/10] sm:aspect-[16/10] lg:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-950 select-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Media Presentation */}
          {isVideo ? (
            <div className="relative w-full h-full">
              {parsedVideo?.isEmbed ? (
                <VideoPlayer
                  url={currentItem.url}
                  poster={currentItem.posterUrl || parsedVideo.thumbnailUrl}
                  title={currentItem.title || 'About AXION PackTech'}
                  autoPlay={Boolean(currentItem.autoplay)}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full rounded-2xl border-0 shadow-none"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={currentItem.url}
                    poster={currentItem.posterUrl || parsedVideo?.thumbnailUrl || undefined}
                    preload="none"
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    loop
                    onEnded={() => setIsPlayingVideo(false)}
                  />

                  {/* Video Play / Pause Overlay Button */}
                  {!isPlayingVideo && (
                    <div
                      onClick={handleTogglePlayVideo}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] transition-all hover:bg-slate-950/30"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white text-slate-950 shadow-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
              <CmsImage
                src={currentItem.url || '/images/about_hero_building.jpg'}
                alt={currentItem.alt || currentItem.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
            </div>
          )}

          {/* Deep Bottom Gradient Vignette for Text Contrast */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent pointer-events-none" />

          {/* Top Badge: Type Indicator */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950/70 border border-sky-400/30 text-[10px] font-bold uppercase tracking-widest text-sky-200 backdrop-blur-md shadow-md">
              {isVideo ? 'Industrial Video' : 'Technology Showcase'}
            </span>
            {heading && (
              <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-medium backdrop-blur-md">
                {heading}
              </span>
            )}
          </div>

          {/* Active Item Caption & Details */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 z-20 text-white space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight drop-shadow-md">
              {currentItem.title}
            </h3>
            {currentItem.caption && (
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal drop-shadow">
                {currentItem.caption}
              </p>
            )}
          </div>

          {/* Slide Navigation Arrows (Apple-style clean circles) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous Slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 -ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next Slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 opacity-80 group-hover:opacity-100 hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {total > 1 && (
          <div className="flex items-center justify-center gap-2 py-3">
            {activeItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx
                    ? 'w-7 h-2 bg-sky-400 shadow-[0_0_10px_#38bdf8]'
                    : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
