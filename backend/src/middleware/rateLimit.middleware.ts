import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { loginThrottleService } from '../services/loginThrottle.service.js';

/**
 * Global API Limiter
 * Disabled: Requests pass through without IP-based rate limiting
 * so normal website visitors and admin operations are never blocked.
 */
export const globalLimiter = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

/**
 * Account-specific Login Throttle Guard.
 * Protects against targeted brute-force password attacks on individual accounts
 * without blocking multiple legitimate devices/users sharing the same IP address.
 */
export const loginThrottleGuard = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.body?.email || '';
    const ip = req.ip || req.socket.remoteAddress;

    const throttleStatus = await loginThrottleService.isThrottled(email, ip);

    if (throttleStatus.isThrottled) {
      return next(
        AppError.tooManyRequests('Too many login attempts. Account temporarily throttled for 15 minutes.')
      );
    }

    next();
  } catch {
    // Graceful fallback: do not block login on unexpected guard error
    next();
  }
};

/**
 * Login Limiter: uses account-specific throttle guard.
 */
export const loginLimiter = loginThrottleGuard;

/**
 * Contact Form Submission Limiter (pass-through).
 */
export const contactLimiter = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

/**
 * Career Application Limiter (pass-through).
 * Duplicate protection is enforced at the database level per email + position within 24h.
 */
export const careerApplicationLimiter = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

/**
 * Media Upload URL Limiter (pass-through).
 */
export const uploadUrlLimiter = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
