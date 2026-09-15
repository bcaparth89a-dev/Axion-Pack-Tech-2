'use client';

import React, { useState, useRef, useEffect } from 'react';
import { parseVideoUrl } from '@/lib/utils/video';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CmsImage from '@/components/common/CmsImage';

export interface VideoPlayerProps {
  url?: string;
  src?: string;
  embedUrl?: string;
  poster?: string;
  title?: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto' | string;
  autoPlay?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  loop?: boolean;
  muted?: boolean;
  allowFullScreen?: boolean;
  lazy?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  src,
  embedUrl,
  poster,
  title = 'Axion PackTech Video',
  className = '',
  containerClassName = '',
  aspectRatio = '16/9',
  autoPlay = false,
  controls = true,
  playsInline = true,
  preload = 'none',
  loop = false,
  muted = false,
  allowFullScreen = true,
  lazy = true,
  onPlay,
  onPause,
  onEnded,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isInViewport, setIsInViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const targetUrl = (url || src || '').trim();

  // Viewport intersection observer for lazy loading / autoplay when visible
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          if (autoPlay) {
            setIsPlaying(true);
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [autoPlay]);

  if (!targetUrl && !embedUrl) {
    return (
      <div
        className={`w-full aspect-video bg-neutral-900/90 rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-6 border border-neutral-800 ${containerClassName}`}
      >
        <svg className="w-12 h-12 text-neutral-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        <p className="text-sm font-medium">No video source provided</p>
      </div>
    );
  }

  const parsed = parseVideoUrl(targetUrl || embedUrl);
  const rawPoster =
    poster ||
    parsed.thumbnailUrl ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const effectivePoster = resolveMediaUrl(rawPoster);

  // Aspect ratio helper
  const getAspectClass = () => {
    if (aspectRatio === '16/9') return 'aspect-video';
    if (aspectRatio === '4/3') return 'aspect-[4/3]';
    if (aspectRatio === '1/1') return 'aspect-square';
    if (aspectRatio === 'auto') return '';
    return 'aspect-video';
  };

  if (hasError) {
    return (
      <div
        className={`w-full ${getAspectClass()} bg-neutral-900 rounded-2xl flex flex-col items-center justify-center text-neutral-400 p-6 border border-red-500/20 ${containerClassName}`}
      >
        <svg className="w-10 h-10 text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-medium text-neutral-300">Unable to load video</p>
        <p className="text-xs text-neutral-500 mt-1 max-w-md text-center break-all">{targetUrl}</p>
      </div>
    );
  }

  const handleStartPlay = () => {
    setIsPlaying(true);
    onPlay?.();
  };

  // Lightweight Poster Facade (Loads 0 external iframe JS until user clicks Play)
  const renderPosterFacade = () => (
    <div
      onClick={handleStartPlay}
      className="absolute inset-0 z-20 cursor-pointer group flex items-center justify-center overflow-hidden bg-slate-950"
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartPlay();
        }
      }}
    >
      {/* Background Poster Image */}
      {effectivePoster && (
        <CmsImage
          src={effectivePoster}
          alt={title}
          fill
          sizes="(max-width: 1024px) 100vw, 80vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
        />
      )}

      {/* Atmospheric Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

      {/* Title Badge on Top */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs font-semibold text-slate-200">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          {title}
        </span>
      </div>

      {/* Pulsing Industrial Play Button */}
      <div className="relative z-30 flex items-center justify-center">
        <div className="absolute -inset-3 rounded-full bg-amber-400/20 blur-md group-hover:bg-amber-400/30 transition-all duration-300 animate-pulse" />
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 group-hover:scale-110 active:scale-95">
          <svg
            className="h-7 w-7 sm:h-8 sm:w-8 ml-1 fill-current transition-transform group-hover:scale-105"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
        <span className="text-xs font-mono tracking-wider uppercase text-slate-300/80 bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-sm">
          Click to Play Video
        </span>
      </div>
    </div>
  );

  // 1. Iframe Embed (YouTube, Vimeo, Custom Embed)
  if (parsed.isEmbed || embedUrl) {
    let finalEmbedUrl = embedUrl || parsed.embedUrl || targetUrl;

    // When playing, add autoplay parameter so the user doesn't have to click twice
    if (parsed.provider === 'youtube') {
      finalEmbedUrl += finalEmbedUrl.includes('?')
        ? `&autoplay=1&mute=${muted ? 1 : 0}`
        : `?autoplay=1&mute=${muted ? 1 : 0}`;
    } else if (parsed.provider === 'vimeo') {
      finalEmbedUrl += finalEmbedUrl.includes('?')
        ? `&autoplay=1&muted=${muted ? 1 : 0}`
        : `?autoplay=1&muted=${muted ? 1 : 0}`;
    }

    return (
      <div
        ref={containerRef}
        className={`relative w-full ${getAspectClass()} bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 ${containerClassName}`}
        style={aspectRatio && !['16/9', '4/3', '1/1', 'auto'].includes(aspectRatio) ? { aspectRatio } : undefined}
      >
        {(!isPlaying && lazy) ? (
          renderPosterFacade()
        ) : (
          <iframe
            src={finalEmbedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={allowFullScreen}
            loading={lazy ? 'lazy' : 'eager'}
            className={`absolute inset-0 w-full h-full border-0 ${className}`}
            onError={() => setHasError(true)}
          />
        )}
      </div>
    );
  }

  // 2. Direct HTML5 Video (MP4, WebM, MOV, R2 storage, local video files)
  const rawVideoSrc = parsed.directUrl || targetUrl;
  const videoSrc = resolveMediaUrl(rawVideoSrc);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${getAspectClass()} bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 group ${containerClassName}`}
      style={aspectRatio && !['16/9', '4/3', '1/1', 'auto'].includes(aspectRatio) ? { aspectRatio } : undefined}
    >
      {(!isPlaying && lazy && !autoPlay) ? (
        renderPosterFacade()
      ) : (
        <video
          src={videoSrc}
          poster={effectivePoster}
          controls={controls}
          autoPlay={isPlaying || autoPlay}
          muted={muted || autoPlay}
          playsInline={playsInline}
          preload={isInViewport ? 'metadata' : preload}
          loop={loop}
          className={`w-full h-full object-cover ${className}`}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={() => setHasError(true)}
        >
          <source src={videoSrc} type={videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

export default VideoPlayer;
