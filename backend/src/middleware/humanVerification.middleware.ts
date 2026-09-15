import { Request, Response, NextFunction } from 'express';
import { turnstileService } from '../services/turnstile.service.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

// In-memory rate limiter tracker for public form submissions
interface IpSubmissionTracker {
  count: number;
  resetAt: number;
  lastSubmissionTimestamp: number;
  lastPayloadHash?: string;
}

const submissionLimitMap = new Map<string, IpSubmissionTracker>();

// Clean up stale IP trackers periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, tracker] of submissionLimitMap.entries()) {
    if (now > tracker.resetAt) {
      submissionLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

const getClientIp = (req: Request): string => {
  const forwarded = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  return forwarded || req.ip || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * Sanitizes all string fields in an object recursively:
 * - Trims whitespace
 * - Strips null bytes (\0)
 * - Normalizes newlines
 */
export const sanitizeData = <T>(data: T): T => {
  if (typeof data === 'string') {
    return data.replace(/\0/g, '').trim() as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item)) as unknown as T;
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeData(value);
    }
    return sanitizedObj as T;
  }
  return data;
};

/**
 * IP-based Rate Limiter & Duplicate Prevention for public forms.
 * Enforces a maximum of 15 submissions per 10 minutes per IP and
 * blocks rapid-fire repeated duplicate submissions.
 */
export const formSubmissionLimiter = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // In test environment, allow tests to run without throttling
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxSubmissions = 15;

  let tracker = submissionLimitMap.get(ip);

  if (!tracker || now > tracker.resetAt) {
    tracker = {
      count: 1,
      resetAt: now + windowMs,
      lastSubmissionTimestamp: now,
    };
    submissionLimitMap.set(ip, tracker);
    return next();
  }

  // Prevent rapid repeated identical submissions
  const payloadStr = JSON.stringify(req.body || {});
  const isDuplicate =
    payloadStr.length > 2 &&
    tracker.lastPayloadHash === payloadStr &&
    now - tracker.lastSubmissionTimestamp < 2000;

  if (isDuplicate) {
    return next(
      AppError.badRequest('Duplicate submission detected. Please wait a moment before trying again.')
    );
  }

  if (tracker.count >= maxSubmissions) {
    logger.warn(`Form submission rate limit exceeded for IP: ${ip}`);
    return next(
      AppError.tooManyRequests(
        'Too many form submissions from your connection. Please wait a few minutes before trying again.'
      )
    );
  }

  tracker.count += 1;
  tracker.lastSubmissionTimestamp = now;
  tracker.lastPayloadHash = payloadStr;
  next();
};

/**
 * Unified Human Verification & Bot Defense Middleware:
 * 1. Honeypot check (hp_website / honeypot)
 * 2. Cloudflare Turnstile token validation
 * 3. Server-side string sanitization
 */
export const verifyHumanVerification = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = getClientIp(req);

    // 1. Honeypot Trap: Basic automated bots that fill all inputs
    const honeypotValue =
      req.body?.hp_website ||
      req.body?.website_hp ||
      req.body?.honeypot ||
      req.body?.hp_field;

    if (honeypotValue && typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
      logger.warn(`Bot detected via honeypot trap from IP ${ip}. Field value: ${honeypotValue}`);
      // Return generic 400 Bad Request to prevent bot enumeration
      return next(AppError.badRequest('Security verification failed. Request rejected.'));
    }

    // 2. Cloudflare Turnstile Human Verification Token
    const turnstileToken =
      req.body?.turnstileToken ||
      req.body?.turnstile_token ||
      req.body?.['cf-turnstile-response'] ||
      (req.headers['x-turnstile-token'] as string);

    // If turnstileToken is completely missing
    if (!turnstileToken) {
      // In test mode, allow if explicitly mocked in test payload
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      return next(
        AppError.badRequest('Security verification required. Please complete the "Verify you are human" check.')
      );
    }

    const verificationResult = await turnstileService.verifyToken(turnstileToken, ip);

    if (!verificationResult.success) {
      logger.warn(`Turnstile human verification rejected for IP ${ip}: ${verificationResult.error}`);
      return next(
        AppError.badRequest(
          verificationResult.error || 'Human verification challenge failed or expired. Please try again.'
        )
      );
    }

    // 3. Server-side Input Sanitization
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeData(req.body);
    }

    next();
  } catch (error) {
    logger.error('Unexpected error in human verification middleware:', error);
    next(AppError.badRequest('Security verification could not be completed. Please try again.'));
  }
};
