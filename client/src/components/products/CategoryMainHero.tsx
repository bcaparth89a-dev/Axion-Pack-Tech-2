'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { CategoryHeroData } from '@/lib/api/pages';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

interface CategoryMainHeroProps {
  data: CategoryHeroData;
  isPreview?: boolean;
}

export default function CategoryMainHero({ data, isPreview = false }: CategoryMainHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // If disabled and not in preview mode, do not render
  if (!data.enabled && !isPreview) {
    return null;
  }

  const {
    eyebrow,
    title,
    description,
    primaryButton,
    secondaryButton,
    background,
    visual,
    alignment = 'left',
    animation = 'fade',
  } = data;

  const isCentered = alignment === 'center';

  // Animation CSS classes based on selected animation type
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
        return 'animate-in fade-in duration-700';
      case 'slide':
        return 'animate-in fade-in slide-in-from-bottom-6 duration-700';
      case 'scale':
        return 'animate-in fade-in zoom-in-95 duration-700';
      case 'none':
      default:
        return '';
    }
  };

  // Background inline styling
  const getBackgroundStyle = () => {
    if (background.type === 'image' && background.image) {
      return {
        backgroundImage: `url(${resolveMediaUrl(background.image)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (background.type === 'gradient' && background.gradient) {
      return { background: background.gradient };
    }
    if (background.type === 'solid' && background.color) {
      return { backgroundColor: background.color };
    }
    return {
      background: 'linear-gradient(135deg, #051324 0%, #091D38 50%, #061527 100%)',
    };
  };

  const overlayOpacityValue = Math.min(Math.max((background.overlayOpacity ?? 75) / 100, 0), 1);

  return (
    <section
      className="relative w-full overflow-hidden text-white border-b border-slate-800 transition-colors duration-300"
      style={getBackgroundStyle()}
      aria-label="Category Catalog Hero"
    >
      {/* 1. Configurable Dark/Light Overlay for image backgrounds */}
      {background.type === 'image' && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundColor: '#051324',
            opacity: overlayOpacityValue,
          }}
        />
      )}

      {/* 2. Soft Ambient Lighting & Grid Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute -top-24 left-1/4 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

      {/* 3. Main Hero Content Container */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 ${getAnimationClass()}`}
      >
        <div
          className={`grid items-center gap-12 lg:gap-16 ${
            isCentered ? 'grid-cols-1 text-center max-w-4xl mx-auto' : 'grid-cols-1 lg:grid-cols-12 text-left'
          }`}
        >
          {/* ==================== LEFT COLUMN: Text & CTAs ==================== */}
          <div className={`${isCentered ? 'w-full' : 'lg:col-span-7 space-y-6'}`}>
            {/* Optional Eyebrow Badge */}
            {eyebrow && eyebrow.trim() !== '' && (
              <div
                className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-sky-400/30 bg-sky-950/70 shadow-sm backdrop-blur-md text-xs font-semibold tracking-wider text-sky-200 uppercase mb-4 ${
                  isCentered ? 'mx-auto' : ''
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                <span>{eyebrow}</span>
              </div>
            )}

            {/* Large Single H1 Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              {title}
            </h1>

            {/* Divider Accent Line */}
            <div
              className={`h-1 w-20 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] my-4 ${
                isCentered ? 'mx-auto' : ''
              }`}
            />

            {/* Short Hero Description */}
            {description && description.trim() !== '' && (
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-light leading-relaxed max-w-2xl">
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            <div
              className={`pt-3 flex flex-wrap items-center gap-4 ${
                isCentered ? 'justify-center' : 'justify-start'
              }`}
            >
              {/* Primary Button */}
              {primaryButton?.text && (
                <Link
                  href={primaryButton.link || '#'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3.5 text-sm sm:text-base shadow-lg shadow-amber-950/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 group"
                >
                  <span>{primaryButton.text}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              )}

              {/* Optional Secondary Button */}
              {secondaryButton?.enabled && secondaryButton?.text && (
                <Link
                  href={secondaryButton.link || '#'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/40 bg-white/5 hover:bg-sky-500/10 text-white font-semibold px-6 py-3.5 text-sm sm:text-base backdrop-blur-md transition-all duration-200 hover:border-sky-300 active:scale-95"
                >
                  <span>{secondaryButton.text}</span>
                </Link>
              )}
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: Visual Area (Image or Video) ==================== */}
          <div className={`${isCentered ? 'w-full mt-6 max-w-2xl mx-auto' : 'lg:col-span-5'}`}>
            <div className="relative group">
              {/* Ambient Glow Aura Behind Visual Card */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-sky-500/30 via-amber-500/20 to-sky-400/30 blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />

              {/* Visual Container */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-700/80 bg-[#081B33] shadow-[0_20px_50px_rgba(0,0,0,0.7)] aspect-[4/3] w-full">
                {visual.type === 'video' ? (
                  // Video Mode
                  <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                    {visual.video ? (
                      <video
                        ref={videoRef}
                        src={resolveMediaUrl(visual.video)}
                        poster={resolveMediaUrl(visual.videoPoster || visual.image)}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="none"
                        onLoadedData={() => setVideoLoaded(true)}
                        onError={() => setVideoError(true)}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${
                          videoLoaded && !videoError ? 'opacity-100' : 'opacity-90'
                        }`}
                      />
                    ) : (
                      // Video Fallback Poster
                      <div className="relative w-full h-full">
                        <CmsImage
                          src={visual.videoPoster || visual.image}
                          alt={visual.altText || title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Industrial Video Badge Overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Video Demonstration</span>
                    </div>
                  </div>
                ) : (
                  // Image Mode
                  <div className="relative w-full h-full bg-slate-950">
                    <CmsImage
                      src={visual.image}
                      alt={visual.altText || title}
                      fill
                      priority={!isPreview}
                      sizes="(max-width: 1024px) 100vw, 45vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Subtle Gradient Shadow Inside Card */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    {/* Floating Quality Badge */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-mono text-slate-300">
                        <span>ENGINEERING EXCELLENCE</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 text-xs font-black">
                        <span>AXION</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
