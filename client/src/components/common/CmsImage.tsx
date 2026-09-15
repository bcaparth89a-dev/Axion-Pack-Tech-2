'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

export interface CmsImageProps extends Omit<ImageProps, 'src'> {
  src: string | undefined | null;
  alt: string;
  fallbackSrc?: string;
  wrapperClassName?: string;
}

/**
 * Universal CMS Image Component
 * 
 * Production Media Architecture:
 * 1. Cloudflare R2 CMS Images (https://media.axionpacktech.com/...):
 *    Renders a native <img> tag directly in the browser so media is fetched directly
 *    from Cloudflare R2 edge without passing through Next.js server-side /_next/image optimizer.
 *    Eliminates ENOTFOUND and /_next/image 500 errors completely.
 * 2. Local Static Images (/images/..., /logo.jpeg):
 *    Renders Next.js <Image /> with appropriate sizes to preserve local static asset optimization.
 */
export const CmsImage: React.FC<CmsImageProps> = ({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  fill,
  sizes,
  className = '',
  priority = false,
  width,
  height,
  style,
  onError,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const rawResolved = resolveMediaUrl(src);
  const effectiveSrc = hasError || !rawResolved ? fallbackSrc : rawResolved;

  const isLocalStatic =
    effectiveSrc.startsWith('/') &&
    !effectiveSrc.startsWith('//') &&
    !effectiveSrc.startsWith('/api/');

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && effectiveSrc !== fallbackSrc) {
      setHasError(true);
    }
    if (onError) {
      onError(e);
    }
  };

  // 1. Local Static Images (/images/..., /logo.jpeg) -> Next.js <Image />
  if (isLocalStatic) {
    const effectiveSizes = sizes || (fill ? '100vw' : undefined);
    return (
      <Image
        src={effectiveSrc}
        alt={alt || 'AXION PackTech'}
        fill={fill}
        sizes={effectiveSizes}
        width={!fill ? width || 800 : undefined}
        height={!fill ? height || 600 : undefined}
        className={className}
        priority={priority}
        style={style}
        onError={handleError}
        {...props}
      />
    );
  }

  // 2. Cloudflare R2 & CMS Images -> Native <img> for direct Browser -> Cloudflare R2 delivery
  // Zero server-side /_next/image proxying, zero Express binary proxying
  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit: 'cover',
      }
    : {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={effectiveSrc}
      alt={alt || 'AXION PackTech'}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${fill ? 'absolute inset-0 w-full h-full' : ''} ${className}`.trim()}
      style={{
        ...fillStyle,
        ...style,
      }}
      {...(!fill && width ? { width } : {})}
      {...(!fill && height ? { height } : {})}
      onError={handleError}
    />
  );
};

export default CmsImage;
