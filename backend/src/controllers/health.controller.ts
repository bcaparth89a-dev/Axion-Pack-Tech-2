import { Request, Response } from 'express';
import { getDBStatus } from '../config/db.js';
import { getRedisStatus } from '../config/redis.js';

export const getHealth = (_req: Request, res: Response): Response => {
  const mongoStatus = getDBStatus();
  const redisStatus = getRedisStatus();

  // If MongoDB is disconnected, overall service is unhealthy (HTTP 503)
  const isHealthy = mongoStatus === 'connected';

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
};
