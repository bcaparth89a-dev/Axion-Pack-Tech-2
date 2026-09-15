import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { getRedisClient, isRedisReady, disconnectRedis } from '../config/redis.js';
import { loginThrottleService } from '../services/loginThrottle.service.js';
import { logger } from '../utils/logger.js';

export const parseEmailArg = (): string | undefined => {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--email=')) {
      return arg.split('=')[1];
    }
    if (arg === '--email' && i + 1 < args.length) {
      return args[++i];
    }
  }
  return undefined;
};

const promptQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

export const resetLoginThrottle = async (
  email: string
): Promise<{ email: string; success: boolean }> => {
  if (process.env.NODE_ENV?.trim() === 'production') {
    throw new Error('reset-login-throttle is disabled in production environments.');
  }

  const normalizedEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    throw new Error(`Invalid email address format: "${email}".`);
  }

  // Ensure Redis client is connected
  getRedisClient();

  // Wait a moment if Redis is connecting
  let retries = 5;
  while (!isRedisReady() && retries > 0) {
    await new Promise((r) => setTimeout(r, 200));
    retries--;
  }

  // Reset target account throttle
  await loginThrottleService.resetAccountThrottle(normalizedEmail);

  // In local development, also clear loopback IP throttle so developer testing is unblocked
  await loginThrottleService.resetDevIpThrottle();

  return {
    email: normalizedEmail,
    success: true,
  };
};

const run = async (): Promise<void> => {
  try {
    if (process.env.NODE_ENV?.trim() === 'production') {
      console.error('\n❌ ERROR: reset-login-throttle is disabled in production environments.\n');
      process.exit(1);
    }

    let email = parseEmailArg();

    if (!email) {
      email = await promptQuestion('Enter Admin Email to reset throttle: ');
    }

    const result = await resetLoginThrottle(email);

    console.log('\n====================================================');
    console.log('  AXION PackTech - Login Throttle Reset');
    console.log('====================================================');
    console.log(`Account: ${result.email}`);
    console.log('Status:  Login throttle reset successfully for this account.');
    console.log('====================================================\n');

    await disconnectRedis().catch(() => {});
    process.exit(0);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`\n❌ Reset throttle failed: ${errorMsg}\n`);
    await disconnectRedis().catch(() => {});
    process.exit(1);
  }
};

if (process.argv[1]?.includes('resetLoginThrottle')) {
  void run();
}
