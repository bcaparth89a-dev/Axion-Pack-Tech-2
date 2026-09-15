import { logger } from './logger.js';

/**
 * Validates SVG content against XSS and malicious script vectors.
 * Returns true if SVG is clean and safe, false if suspicious patterns are detected.
 */
export function validateSvgContent(svgContent: string): { isValid: boolean; reason?: string } {
  if (!svgContent || typeof svgContent !== 'string') {
    return { isValid: false, reason: 'Empty or invalid SVG content.' };
  }

  // Quick check: must have <svg tag
  if (!/<svg[^>]*>/i.test(svgContent)) {
    return { isValid: false, reason: 'Invalid SVG format: missing <svg> root element.' };
  }

  // Dangerous element tags
  const dangerousTags = [
    /<script[^>]*>/i,
    /<\/script>/i,
    /<foreignObject[^>]*>/i,
    /<\/foreignObject>/i,
    /<iframe[^>]*>/i,
    /<embed[^>]*>/i,
    /<object[^>]*>/i,
    /<applet[^>]*>/i,
    /<meta[^>]*>/i,
    /<link[^>]*>/i,
    /<base[^>]*>/i,
  ];

  for (const pattern of dangerousTags) {
    if (pattern.test(svgContent)) {
      logger.warn(`[SvgSecurity] Disallowed element found in SVG: ${pattern}`);
      return {
        isValid: false,
        reason: 'SVG contains disallowed executable or embedded elements (<script>, <foreignObject>, <iframe>, etc.).',
      };
    }
  }

  // Inline event handlers: e.g. onload=, onerror=, onclick=, onmouseover=, etc.
  const eventHandlerPattern = /\son[a-zA-Z]+\s*=/i;
  if (eventHandlerPattern.test(svgContent)) {
    logger.warn('[SvgSecurity] Inline event handler found in SVG');
    return {
      isValid: false,
      reason: 'SVG contains inline event handlers (e.g. onload, onerror, onclick).',
    };
  }

  // Dangerous protocol URIs in attributes (href, xlink:href, etc.)
  const dangerousUriPattern = /(href|src|data|action)\s*=\s*['"]?\s*(javascript:|vbscript:|data:text\/html)/i;
  if (dangerousUriPattern.test(svgContent)) {
    logger.warn('[SvgSecurity] Dangerous URI scheme found in SVG');
    return {
      isValid: false,
      reason: 'SVG contains executable URI scheme (e.g. javascript:).',
    };
  }

  return { isValid: true };
}
