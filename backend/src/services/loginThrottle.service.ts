import { getRedisClient, isRedisReady } from '../config/redis.js';
import { logger } from '../utils/logger.js';

export interface ThrottleStatus {
  isThrottled: boolean;
  remainingSeconds: number;
  reason?: 'account';
}

interface InMemoryEntry {
  count: number;
  expiresAt: number;
}

class LoginThrottleService {
  private readonly accountPrefix = 'axion:throttle:login:account:';

  // In-memory fallback if Redis is temporarily offline
  private inMemoryAccountStore = new Map<string, InMemoryEntry>();

  /**
   * Maximum failed attempts before temporary account lockout.
   * Defaults: 5 in production, 15 in development.
   */
  getMaxFailedAttempts(): number {
    const isProduction = process.env.NODE_ENV === 'production';
    const envVal = process.env.AUTH_MAX_FAILED_ATTEMPTS || process.env.AUTH_RATE_LIMIT_MAX_REQUESTS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return isProduction ? 5 : 15;
  }

  /**
   * Lockout duration in seconds.
   * Default: 900 seconds (15 minutes).
   */
  getLockoutDurationSeconds(): number {
    const envVal = process.env.AUTH_LOCKOUT_DURATION_SECONDS;
    if (envVal) {
      const parsed = parseInt(envVal, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 15 * 60; // 900 seconds
  }

  normalizeEmail(email: string): string {
    return (email || '').trim().toLowerCase();
  }

  /**
   * Checks if an individual account is currently throttled due to excessive failed attempts.
   * Does NOT throttle shared IP addresses, allowing multiple users on the same Wi-Fi to operate normally.
   */
  async isThrottled(email: string, _clientIp?: string): Promise<ThrottleStatus> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      return { isThrottled: false, remainingSeconds: 0 };
    }

    const maxAttempts = this.getMaxFailedAttempts();

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const accountKey = `${this.accountPrefix}${normalizedEmail}`;

        const accountCountStr = await client.get(accountKey);
        const accountCount = accountCountStr ? parseInt(accountCountStr, 10) : 0;

        if (accountCount >= maxAttempts) {
          const ttl = await client.ttl(accountKey);
          return {
            isThrottled: true,
            remainingSeconds: ttl > 0 ? ttl : this.getLockoutDurationSeconds(),
            reason: 'account',
          };
        }

        return { isThrottled: false, remainingSeconds: 0 };
      } catch (error) {
        logger.warn('Redis error during isThrottled check, using in-memory fallback:', error);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const entry = this.inMemoryAccountStore.get(normalizedEmail);
    if (entry && entry.expiresAt > now && entry.count >= maxAttempts) {
      const remainingSeconds = Math.ceil((entry.expiresAt - now) / 1000);
      return { isThrottled: true, remainingSeconds, reason: 'account' };
    }

    return { isThrottled: false, remainingSeconds: 0 };
  }

  /**
   * Records a failed login attempt for a specific account. Increments failure counter with TTL.
   */
  async recordFailedAttempt(email: string, _clientIp?: string): Promise<number> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return 0;

    const duration = this.getLockoutDurationSeconds();
    let newAccountCount = 1;

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const accountKey = `${this.accountPrefix}${normalizedEmail}`;
        newAccountCount = await client.incr(accountKey);
        if (newAccountCount === 1) {
          await client.expire(accountKey, duration);
        }
        return newAccountCount;
      } catch (error) {
        logger.warn('Redis error during recordFailedAttempt, using in-memory fallback:', error);
      }
    }

    // In-memory fallback
    const now = Date.now();
    const expiresAt = now + duration * 1000;
    const entry = this.inMemoryAccountStore.get(normalizedEmail);

    if (!entry || entry.expiresAt <= now) {
      this.inMemoryAccountStore.set(normalizedEmail, { count: 1, expiresAt });
      newAccountCount = 1;
    } else {
      entry.count += 1;
      newAccountCount = entry.count;
    }

    return newAccountCount;
  }

  /**
   * Resets the failed attempt and throttle state for an individual account.
   * Called automatically upon successful authentication.
   */
  async resetThrottle(email: string, _clientIp?: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return;

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const accountKey = `${this.accountPrefix}${normalizedEmail}`;
        await client.del(accountKey);
      } catch (error) {
        logger.warn('Redis error during resetThrottle:', error);
      }
    }

    // In-memory cleanup
    this.inMemoryAccountStore.delete(normalizedEmail);
  }

  /**
   * Specifically resets an individual account's throttle state without touching other accounts.
   */
  async resetAccountThrottle(email: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return false;
    let deletedCount = 0;

    if (isRedisReady()) {
      try {
        const client = getRedisClient();
        const key = `${this.accountPrefix}${normalizedEmail}`;
        deletedCount = await client.del(key);
      } catch (error) {
        logger.warn(`Redis error resetting account throttle for "${email}":`, error);
      }
    }

    this.inMemoryAccountStore.delete(normalizedEmail);
    return deletedCount > 0;
  }

  /**
   * Cleans up local development throttle keys.
   */
  async resetDevIpThrottle(): Promise<void> {
    this.inMemoryAccountStore.clear();
  }
}

export const loginThrottleService = new LoginThrottleService();
