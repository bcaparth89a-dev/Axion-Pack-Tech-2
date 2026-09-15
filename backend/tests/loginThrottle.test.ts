import { loginThrottleService } from '../src/services/loginThrottle.service.js';
import { resetLoginThrottle } from '../src/scripts/resetLoginThrottle.js';
import { AuthService } from '../src/services/auth.service.js';
import { User } from '../src/models/User.model.js';
import bcrypt from 'bcryptjs';
import { ROLES } from '../src/constants/roles.js';
import { requireAdmin } from '../src/middleware/authorization.middleware.js';
import { AuthenticatedRequest } from '../src/types/index.js';
import { Response, NextFunction } from 'express';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/User.model.js');
jest.mock('../src/models/Session.model.js', () => ({
  Session: {
    create: jest.fn().mockResolvedValue({
      _id: '65f123456789abcdef012345',
      isValid: true,
    }),
  },
}));
jest.mock('../src/config/redis.js', () => {
  const store = new Map<string, string>();
  return {
    getRedisClient: jest.fn(() => ({
      get: jest.fn(async (key: string) => store.get(key) || null),
      set: jest.fn(async (key: string, val: string) => store.set(key, val)),
      incr: jest.fn(async (key: string) => {
        const cur = parseInt(store.get(key) || '0', 10) + 1;
        store.set(key, String(cur));
        return cur;
      }),
      expire: jest.fn(async () => 1),
      ttl: jest.fn(async () => 900),
      del: jest.fn(async (...keys: string[]) => {
        let count = 0;
        for (const k of keys) {
          if (store.delete(k)) count++;
        }
        return count;
      }),
    })),
    isRedisReady: jest.fn(() => true),
    disconnectRedis: jest.fn(async () => {}),
  };
});

describe('Login Throttling & Brute-Force Protection', () => {
  const originalEnv = process.env;
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: 'development', AUTH_MAX_FAILED_ATTEMPTS: '3' };
    authService = new AuthService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Throttle Counter & Threshold Enforcement', () => {
    const email = 'throttle.test@axionpacktech.com';
    const ip = '192.168.1.100';

    beforeEach(async () => {
      await loginThrottleService.resetThrottle(email, ip);
    });

    it('should increment failed attempts and trigger throttling once max threshold is reached', async () => {
      // 1st failed attempt
      let count = await loginThrottleService.recordFailedAttempt(email, ip);
      expect(count).toBe(1);
      let status = await loginThrottleService.isThrottled(email, ip);
      expect(status.isThrottled).toBe(false);

      // 2nd failed attempt
      count = await loginThrottleService.recordFailedAttempt(email, ip);
      expect(count).toBe(2);
      status = await loginThrottleService.isThrottled(email, ip);
      expect(status.isThrottled).toBe(false);

      // 3rd failed attempt (reaches threshold of 3)
      count = await loginThrottleService.recordFailedAttempt(email, ip);
      expect(count).toBe(3);
      status = await loginThrottleService.isThrottled(email, ip);
      expect(status.isThrottled).toBe(true);
      expect(status.reason).toBe('account');
      expect(status.remainingSeconds).toBeGreaterThan(0);
    });

    it('should block login attempts when an account is throttled', async () => {
      // Force throttle state
      await loginThrottleService.recordFailedAttempt(email, ip);
      await loginThrottleService.recordFailedAttempt(email, ip);
      await loginThrottleService.recordFailedAttempt(email, ip);

      await expect(authService.login(email, 'SomePassword123!', ip)).rejects.toThrow(
        'Too many login attempts. Account temporarily throttled for 15 minutes.'
      );
    });

    it('should clear throttle state immediately upon successful login', async () => {
      const validPassword = 'AdminCorrectPassword123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(validPassword, salt);

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '65f123456789abcdef012345',
          name: 'Valid Admin',
          email,
          passwordHash,
          role: ROLES.ADMIN,
          isActive: true,
          save: jest.fn().mockResolvedValue(true),
        }),
      });

      // 2 failed attempts (under threshold of 3)
      await loginThrottleService.recordFailedAttempt(email, ip);
      await loginThrottleService.recordFailedAttempt(email, ip);
      expect((await loginThrottleService.isThrottled(email, ip)).isThrottled).toBe(false);

      // Now perform successful login
      const result = await authService.login(email, validPassword, ip);
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);

      // Verify throttle counter is cleared
      const statusAfter = await loginThrottleService.isThrottled(email, ip);
      expect(statusAfter.isThrottled).toBe(false);
    });
  });

  describe('Development Reset CLI (resetLoginThrottle)', () => {
    const adminEmail = 'locked.admin@axionpacktech.com';
    const otherEmail = 'other.admin@axionpacktech.com';
    const ip = '127.0.0.1';

    beforeEach(async () => {
      await loginThrottleService.resetThrottle(adminEmail);
      await loginThrottleService.resetThrottle(otherEmail);
    });

    it('should reset only the target account and not affect other accounts', async () => {
      // Lock out both accounts
      for (let i = 0; i < 3; i++) {
        await loginThrottleService.recordFailedAttempt(adminEmail, ip);
        await loginThrottleService.recordFailedAttempt(otherEmail, ip);
      }

      expect((await loginThrottleService.isThrottled(adminEmail)).isThrottled).toBe(true);
      expect((await loginThrottleService.isThrottled(otherEmail)).isThrottled).toBe(true);

      // Reset adminEmail only
      const resetResult = await resetLoginThrottle(adminEmail);
      expect(resetResult.success).toBe(true);
      expect(resetResult.email).toBe(adminEmail);

      // adminEmail is unblocked
      expect((await loginThrottleService.isThrottled(adminEmail)).isThrottled).toBe(false);

      // otherEmail remains locked out
      expect((await loginThrottleService.isThrottled(otherEmail)).isThrottled).toBe(true);
    });

    it('should strictly refuse to execute in production environment', async () => {
      process.env.NODE_ENV = 'production';

      await expect(resetLoginThrottle(adminEmail)).rejects.toThrow(
        'reset-login-throttle is disabled in production environments.'
      );
    });
  });

  describe('Admin-Specific Security & RBAC Protection', () => {
    it('should reject inactive accounts with 401 and increment failed attempts', async () => {
      const deactEmail = 'deactivated@axionpacktech.com';
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'mock-deact-id',
          name: 'Deactivated User',
          email: deactEmail,
          passwordHash: 'somehash',
          role: ROLES.ADMIN,
          isActive: false, // Inactive
        }),
      });

      await expect(authService.login(deactEmail, 'AnyPassword123!', '127.0.0.1')).rejects.toThrow(
        'This account has been deactivated. Please contact an administrator.'
      );
    });

    it('should reject non-admin users from accessing protected Admin APIs via requireAdmin', async () => {
      const req = {
        user: {
          id: '65f123456789abcdef012399',
          email: 'editor@axionpacktech.com',
          role: ROLES.EDITOR, // Not admin
        },
      } as unknown as AuthenticatedRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const err = (next as jest.Mock).mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(403);
    });
  });
});
