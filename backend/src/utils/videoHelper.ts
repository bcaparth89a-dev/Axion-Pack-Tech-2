export type VideoProvider = 'youtube' | 'vimeo' | 'direct' | 'embed' | 'unknown';

export interface ParsedVideoInfo {
  provider: VideoProvider;
  isEmbed: boolean;
  embedUrl?: string;
  directUrl?: string;
  videoId?: string;
  thumbnailUrl?: string;
  isValid: boolean;
  providerName: string;
}

export function parseVideoUrl(rawUrl?: string): ParsedVideoInfo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      provider: 'unknown',
      isEmbed: false,
      isValid: false,
      providerName: 'Unknown',
    };
  }

  const clean = rawUrl.trim();

  if (/^(javascript:|data:|vbscript:)/i.test(clean)) {
    return {
      provider: 'unknown',
      isEmbed: false,
      isValid: false,
      providerName: 'Blocked Protocol',
    };
  }

  // 1. YouTube Detection
  const ytMatch = clean.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/)|youtube-nocookie\.com\/embed\/)([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      provider: 'youtube',
      isEmbed: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&enablejsapi=1`,
      directUrl: clean,
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isValid: true,
      providerName: 'YouTube',
    };
  }

  // 2. Vimeo Detection
  const vimeoMatch = clean.match(
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|video\/|album\/(?:\d+)\/video\/|)(\d+)|player\.vimeo\.com\/video\/(\d+))/i
  );
  const vimeoId = vimeoMatch ? (vimeoMatch[1] || vimeoMatch[2]) : null;
  if (vimeoId) {
    return {
      provider: 'vimeo',
      isEmbed: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?dnt=1&app_id=122963`,
      directUrl: clean,
      videoId: vimeoId,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
      isValid: true,
      providerName: 'Vimeo',
    };
  }

  // 3. Direct Video Files
  const isDirectFile = /\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(clean) || clean.startsWith('/videos/') || clean.includes('/video/');
  if (isDirectFile) {
    return {
      provider: 'direct',
      isEmbed: false,
      directUrl: clean,
      isValid: true,
      providerName: 'Direct Video',
    };
  }

  // 4. Generic Iframe Embed URL
  if (clean.includes('/embed/') || clean.includes('player.')) {
    return {
      provider: 'embed',
      isEmbed: true,
      embedUrl: clean,
      directUrl: clean,
      isValid: true,
      providerName: 'Embedded Player',
    };
  }

  const isHttpOrLocal = clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/');
  if (isHttpOrLocal) {
    return {
      provider: 'direct',
      isEmbed: false,
      directUrl: clean,
      isValid: true,
      providerName: 'Direct Video',
    };
  }

  return {
    provider: 'unknown',
    isEmbed: false,
    isValid: false,
    providerName: 'Unknown Format',
  };
}
