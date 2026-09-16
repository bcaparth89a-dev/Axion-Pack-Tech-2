import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';
import { loginThrottleService } from '../services/loginThrottle.service.js';
import { logger } from '../utils/logger.js';

async function main() {
  await connectDB();
  logger.info('Checking admin accounts in database...');

  const emails = [
    {
      name: 'AXION SuperAdmin',
      email: (process.env.INITIAL_ADMIN_EMAIL || 'admin@axionpacktech.com').toLowerCase().trim(),
      password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!',
    },
    {
      name: 'Parth Pawar',
      email: (process.env.ADMIN_EMAIL || 'bcaparth89a@gmail.com').toLowerCase().trim(),
      password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!',
    },
  ];

  for (const item of emails) {
    let user = await User.findOne({ email: item.email });
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(item.password, salt);

    if (!user) {
      user = await User.create({
        name: item.name,
        email: item.email,
        passwordHash,
        role: ROLES.ADMIN,
        isActive: true,
      });
      logger.info(`Created admin user: ${item.email}`);
    } else {
      user.passwordHash = passwordHash;
      user.role = ROLES.ADMIN;
      user.isActive = true;
      await user.save();
      logger.info(`Updated existing user to active admin with valid password: ${item.email}`);
    }

    // Reset throttle for these accounts
    await loginThrottleService.resetAccountThrottle(item.email);
  }

  await loginThrottleService.clearAllThrottle();
  logger.info('Cleared all throttle states. Admin accounts are ready.');

  await disconnectDB();
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to ensure admin accounts:', err);
  process.exit(1);
});
