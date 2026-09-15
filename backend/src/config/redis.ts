import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export const initRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  redisClient = new Redis(redisUrl, {
    family: 4,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    lazyConnect: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    logger.info('Redis connection established successfully.');
  });

  redisClient.on('ready', () => {
    isRedisAvailable = true;
    logger.info('Redis client ready to handle cache operations.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Log as warning rather than crashing server: MongoDB remains source of truth
    logger.warn(`Redis connection error (cache degraded to direct DB): ${err.message}`);
  });

  redisClient.on('close', () => {
    isRedisAvailable = false;
    logger.warn('Redis connection closed.');
  });

  redisClient.on('reconnecting', () => {
    logger.info('Redis attempting to reconnect...');
  });



  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initRedis();
  }
  return redisClient;
};

export const isRedisReady = (): boolean => {
  return isRedisAvailable && redisClient?.status === 'ready';
};

export const disconnectRedis = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }
  try {
    await redisClient.quit();
    redisClient = null;
    isRedisAvailable = false;
    logger.info('Redis connection cleanly terminated.');
  } catch (error) {
    logger.error('Error disconnecting Redis client:', error);
  }
};

export const getRedisStatus = (): 'connected' | 'disconnected' | 'connecting' => {
  if (!redisClient) {
    return 'disconnected';
  }
  switch (redisClient.status) {
    case 'ready':
    case 'connect':
      return 'connected';
    case 'reconnecting':
    case 'connecting':
      return 'connecting';
    default:
      return 'disconnected';
  }
};
