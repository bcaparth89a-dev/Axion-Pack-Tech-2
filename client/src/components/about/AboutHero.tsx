import React from 'react';
import { CmsImage } from '@/components/common/CmsImage';
import Link from 'next/link';
import { AboutPageData } from '@/lib/api/pages';
import AboutMediaSlider from './AboutMediaSlider';

interface AboutHeroProps {
  hero?: AboutPageData['hero'];
  mediaSlider?: AboutPageData['mediaSlider'];
  showMediaSlider?: boolean;
}

export default function AboutHero({
  hero,
  mediaSlider,
  showMediaSlider = true,
}: AboutHeroProps) {
  const eyebrow = hero?.eyebrow || 'Corporate Profile & Engineering Pedigree';
  const title = hero?.title || 'Engineering Innovation.';
  const highlightedTitle = hero?.highlightedTitle || 'Building Tomorrow.';
  const description =
    hero?.description ||
    hero?.subtitle ||
    'AXION PackTech delivers innovative packaging, bagging, processing, and industrial automation solutions engineered for the future.';
  const bgImage = hero?.image || '/images/about_hero_building.jpg';
  const showCta = hero?.showCta && hero?.ctaText && hero?.ctaUrl;

  const hasSlider =
    showMediaSlider &&
    mediaSlider?.enabled !== false &&
    mediaSlider?.items &&
    mediaSlider.items.filter((i) => i.enabled !== false).length > 0;

  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] w-full flex items-center overflow-hidden bg-[#061527] text-white">
      {/* Background Building Image */}
      <div className="absolute inset-0 z-0">
        <CmsImage
          src={bgImage}
          alt="AXION PackTech Engineering Headquarters & Advanced Manufacturing Facility"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Deep Navy Gradient Overlay for optimal readability & brand atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061527]/95 via-[#0B1E36]/90 to-[#061527]/92" />
        {/* Bottom Fade to smoothly blend into the next section */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#061527] to-transparent" />
      </div>

      {/* Subtle Engineering Grid Line Watermark */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-5"
        style={{
          backgroundImage:
            'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Hero Content Grid */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-20 sm:py-28 w-full">
        <div className={`grid grid-cols-1 ${hasSlider ? 'lg:grid-cols-12' : ''} items-center gap-12 lg:gap-14`}>
          {/* Left Column: Heading & Narrative */}
          <div className={`${hasSlider ? 'lg:col-span-7' : 'max-w-3xl'} space-y-6 text-left`}>
            {/* Subtle Orange Accent Tag */}
            {eyebrow && (
              <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                {eyebrow}
              </div>
            )}

            {/* Main Hero Quote / Statement */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {title}{' '}
              {highlightedTitle && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white block sm:inline">
                  {highlightedTitle}
                </span>
              )}
            </h1>

            {/* Subtle Orange Accent Line */}
            <div className="h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

            {/* Supporting Statement */}
            {description && (
              <p className="text-base sm:text-lg lg:text-xl font-normal text-slate-300 leading-relaxed max-w-2xl">
                {description}
              </p>
            )}

            {/* Configurable CTA Button */}
            {showCta && (
              <div className="pt-2">
                <Link
                  href={hero.ctaUrl!}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-sky-950/50 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  <span>{hero.ctaText}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Apple-Style Interactive Media Slider */}
          {hasSlider && (
            <div className="lg:col-span-5 w-full">
              <AboutMediaSlider items={mediaSlider?.items} heading={mediaSlider?.heading} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
