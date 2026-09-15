/**
 * Centralized Media URL & Hostname Security Helper
 * Aligned with Next.js remotePatterns and AXION PackTech R2 Media Architecture.
 */

export const ALLOWED_IMAGE_HOSTS = [
  'media.axionpacktech.com',
  'images.unsplash.com',
  'cdn.pixabay.com',
  'i.ytimg.com',
  'img.youtube.com',
  'localhost',
  '127.0.0.1',
] as const;

/**
 * Resolves a media URL safely for the current environment.
 * In production: Returns canonical https://media.axionpacktech.com/... or https://pub-*.r2.dev/... directly.
 * In local development: If media.axionpacktech.com is configured but unresolvable in local DNS,
 * routes through the zero-proxy backend resolver endpoint (http://localhost:5000/api/v1/media/file/*)
 * which issues an HTTP 302 redirect directly to Cloudflare R2 presigned GET URL,
 * preventing ENOTFOUND crashes on Next.js <Image /> and browser rendering.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Security: Reject dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }

  // Local relative paths starting with / (e.g. /images/about_hero_building.jpg, /logo.jpeg)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Cloudflare R2 canonical public URL or R2 dev subdomain: return directly unchanged
  if (
    lower.startsWith('https://media.axionpacktech.com') ||
    lower.startsWith('http://media.axionpacktech.com') ||
    lower.includes('.r2.dev') ||
    lower.includes('.r2.cloudflarestorage.com')
  ) {
    return trimmed;
  }

  // Raw R2 storage key provided directly (e.g. "images/2026/...", "videos/2026/...", "documents/2026/...", "media/...")
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    (trimmed.startsWith('images/') ||
      trimmed.startsWith('videos/') ||
      trimmed.startsWith('documents/') ||
      trimmed.startsWith('media/'))
  ) {
    const rawKey = trimmed.replace(/^\/+/, '');
    const publicBase = (
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
      'https://pub-a756b10839b346b68dabea7852d66a44.r2.dev'
    ).replace(/\/+$/, '');
    return `${publicBase}/${rawKey}`;
  }

  // Already valid external HTTPS URL (e.g., Unsplash, YouTube, Pixabay)
  return trimmed;
}

/**
 * Checks whether an asset URL is a PDF document.
 */
export function isPdfUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.split('?')[0].toLowerCase();
  return clean.endsWith('.pdf') || clean.includes('/documents/') || clean.includes('format=pdf');
}

/**
 * Checks whether an image source URL is safe and configured in Next.js remotePatterns.
 */
export function isAllowedImageSrc(src: string | undefined | null): boolean {
  if (!src || typeof src !== 'string') return false;
  const trimmed = src.trim();
  if (!trimmed) return false;

  // Local relative paths starting with /
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Absolute URLs
  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    return (
      ALLOWED_IMAGE_HOSTS.some((h) => hostname === h) ||
      hostname.endsWith('.axionpacktech.com') ||
      hostname.endsWith('.r2.dev') ||
      hostname.endsWith('.r2.cloudflarestorage.com') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1'
    );
  } catch {
    return false;
  }
}

/**
 * Resolves a safe image source for Next.js <Image /> components.
 * If the source is missing, invalid, or an unconfigured external host, returns fallback.
 */
export function getSafeImageSrc(
  src: string | undefined | null,
  fallback: string = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
): string {
  if (!src) return fallback;
  const resolved = resolveMediaUrl(src);
  if (isAllowedImageSrc(resolved)) {
    return resolved;
  }
  return fallback;
}

/**
 * Classifies media origin: Cloudflare R2 vs External URL vs Local
 */
export function getMediaOrigin(url: string | undefined | null): 'r2' | 'external' | 'local' {
  if (!url || typeof url !== 'string') return 'local';
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return 'local';

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'media.axionpacktech.com' ||
      hostname.endsWith('.axionpacktech.com') ||
      hostname.endsWith('.r2.dev') ||
      hostname.endsWith('.r2.cloudflarestorage.com')
    ) {
      return 'r2';
    }
    if (hostname === 'localhost' && parsed.pathname.includes('/media/file/')) {
      return 'r2';
    }
    return 'external';
  } catch {
    return 'external';
  }
}
