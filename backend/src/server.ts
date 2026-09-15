import dotenv from 'dotenv';
import path from 'path';

import dns from 'dns';

// Ensure IPv4 DNS resolution priority for containerized environments
dns.setDefaultResultOrder('ipv4first');

// Load environment variables before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import http from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initRedis, disconnectRedis } from './config/redis.js';
import { storageService } from './services/storage/StorageService.js';
import { emailService } from './services/email.service.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '5000', 10);
const app = createApp();
const server = http.createServer(app);

let isShuttingDown = false;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB connection pool
    await connectDB();

    // 2. Initialize Redis client
    initRedis();

    // 3. Verify Brevo SMTP in background
    emailService.verifyConnection().catch(() => {});

    // 4. Check public domain resolution status in background
    storageService.checkPublicDomainResolves().then((resolves) => {
      if (resolves) {
        logger.info(`  Cloudflare R2 Public Domain: Resolved successfully (${process.env.R2_PUBLIC_URL || 'https://media.axionpacktech.com'})`);
      } else {
        logger.warn(`  Cloudflare R2 Public Domain: NOT resolving in DNS (${process.env.R2_PUBLIC_URL || 'https://media.axionpacktech.com'}). Development media fallback active.`);
      }
    }).catch(() => {
      logger.warn(`  Cloudflare R2 Public Domain: DNS check failed. Development fallback active.`);
    });

    // 4. Start listening on configured port
    server.listen(PORT, () => {
      logger.info(`===================================================`);
      logger.info(`  AXION PackTech Production API Running on port ${PORT}`);
      logger.info(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`  Health Check: http://localhost:${PORT}/api/v1/health`);
      logger.info(`  Cloudflare R2 Storage: ${storageService.isConfigured() ? 'Configured (Active)' : 'Not Configured (Public URLs enabled)'}`);
      logger.info(`===================================================`);
    });
  } catch (error) {
    logger.error('Fatal startup error:', error);
    process.exit(1);
  }
};

// Graceful Shutdown Lifecycle
const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn(`Received ${signal}. Initiating graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed. In-flight requests completed.');

    try {
      // Cleanly disconnect database and cache pools
      await disconnectDB();
      await disconnectRedis();
      logger.info('Graceful shutdown completed successfully. Exiting process.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown disconnects:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if connections hang
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded (10s). Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('CRITICAL: Uncaught Exception detected:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('CRITICAL: Unhandled Rejection detected:', reason);
  gracefulShutdown('unhandledRejection');
});

startServer();
