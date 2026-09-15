import { getRedisClient, isRedisReady } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { CACHE_KEYS, CACHE_PATTERNS } from '../constants/cacheKeys.js';

class CacheService {
  /**
   * Retrieves parsed JSON data from Redis cache.
   * Gracefully returns null if Redis is offline or key does not exist.
   */
  async getCached<T>(key: string): Promise<T | null> {
    if (!isRedisReady()) {
      return null;
    }

    try {
      const client = getRedisClient();
      const raw = await client.get(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch (error) {
      logger.warn(`Redis getCached failed for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Sets JSON serialized data into Redis cache with specified TTL in seconds.
   * Silently skips if Redis is offline.
   */
  async setCached<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    if (!isRedisReady()) {
      return;
    }

    try {
      const client = getRedisClient();
      const serialized = JSON.stringify(data);
      await client.setex(key, ttlSeconds, serialized);
    } catch (error) {
      logger.warn(`Redis setCached failed for key "${key}":`, error);
    }
  }

  /**
   * Deletes a specific cache key.
   */
  async deleteCached(key: string): Promise<void> {
    if (!isRedisReady()) {
      return;
    }

    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      logger.warn(`Redis deleteCached failed for key "${key}":`, error);
    }
  }

  /**
   * Reliable non-blocking deletion of keys matching a glob pattern using scanStream.
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!isRedisReady()) {
      return;
    }

    try {
      const client = getRedisClient();
      const stream = client.scanStream({
        match: pattern,
        count: 100,
      });

      const keysToDelete: string[] = [];

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (resultKeys: string[]) => {
          if (Array.isArray(resultKeys) && resultKeys.length > 0) {
            keysToDelete.push(...resultKeys);
          }
        });

        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      if (keysToDelete.length > 0) {
        // Deduplicate keys
        const uniqueKeys = Array.from(new Set(keysToDelete));
        for (let i = 0; i < uniqueKeys.length; i += 100) {
          const batch = uniqueKeys.slice(i, i + 100);
          await client.del(...batch);
        }
        logger.info(`Invalidated ${uniqueKeys.length} cache keys matching pattern "${pattern}"`);
      }
    } catch (error) {
      logger.warn(`deleteByPattern failed for "${pattern}":`, error);
    }
  }

  /**
   * Complete, canonical invalidation of all catalog-related Redis caches.
   */
  async invalidateAllCatalogCaches(): Promise<void> {
    if (!isRedisReady()) return;

    try {
      await Promise.all([
        this.deleteByPattern(CACHE_PATTERNS.ALL_CATEGORIES),
        this.deleteByPattern(CACHE_PATTERNS.ALL_PRODUCTS),
        this.deleteByPattern(CACHE_PATTERNS.ALL_MODELS),
        this.deleteByPattern('catalog:*'),
        this.deleteByPattern('category:*'),
        this.deleteByPattern('product:*'),
        this.deleteByPattern('model:*'),
        this.deleteCached(CACHE_KEYS.CATEGORY_TREE),
        this.deleteCached(CACHE_KEYS.PRODUCT_CATEGORIES),
        this.deleteCached(CACHE_KEYS.PRODUCTS_FEATURED),
        this.deleteCached(CACHE_KEYS.HOME_DATA),
        this.deleteCached(CACHE_KEYS.CATEGORY_HERO_DATA),
      ]);
      logger.info('All catalog Redis caches successfully invalidated');
    } catch (error) {
      logger.warn('invalidateAllCatalogCaches warning:', error);
    }
  }

  /**
   * Clear all public cache keys (useful during deployment or complete content refreshes).
   */
  async flushPublicCache(): Promise<void> {
    await this.deleteByPattern('axion:public:*');
  }
}

export const cacheService = new CacheService();
