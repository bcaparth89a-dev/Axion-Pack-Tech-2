import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/appError.js';
import { logger } from './utils/logger.js';

export const createApp = (): Express => {
  const app = express();

  // 1. Trust proxy for rate limiting & IP tracking behind Cloudflare / Nginx
  app.set('trust proxy', 1);

  // 2. HTTP Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // 3. Strict CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://axionpacktech.com',
    'https://www.axionpacktech.com',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new AppError('CORS policy: Access denied for this origin', 403));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 4. Response compression (Brotli/Gzip)
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      threshold: 1024, // only compress responses larger than 1KB
    })
  );

  // 5. Body parsers with defensive size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET));

  // 7. Request timing & debug logging in non-production
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      logger.debug(`${req.method} ${req.originalUrl}`);
      next();
    });
  }

  // 8. Mount Versioned API Routes (/api/v1)
  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.use(apiPrefix, apiRouter);

  // 9. Root Welcome & API ping
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'AXION PackTech API',
      version: '1.0.0',
      status: 'active',
      documentation: `${apiPrefix}/health`,
    });
  });

  // 10. Handle undefined routes
  app.use('*', (req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Cannot find route ${req.method} ${req.originalUrl} on this server.`));
  });

  // 11. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
