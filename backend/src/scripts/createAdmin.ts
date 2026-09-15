import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { ROLES } from '../constants/roles.js';
import { logger } from '../utils/logger.js';

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Validates and creates a new admin user in MongoDB.
 * Enforces role: "admin", isActive: true, and bcrypt password hashing.
 * Rejects duplicate emails safely with a clear Conflict error.
 */
export const createAdminAccount = async (
  input: CreateAdminInput
): Promise<{
  action: 'created';
  email: string;
  name: string;
  role: string;
}> => {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password;
  const confirmPassword = input.confirmPassword;

  if (!name || name.length < 2 || name.length > 100) {
    throw new Error('Admin Name is required (must be between 2 and 100 characters).');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new Error(`Invalid email address format: "${email}".`);
  }

  if (!password || password.length < 8) {
    throw new Error('Admin password must be at least 8 characters in length.');
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new Error('Passwords do not match. Please verify your password entry.');
  }

  // Check if an account already exists with this email (case-insensitive)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error(
      `An account with email "${email}" already exists (Current Role: ${existingUser.role}). Duplicate admin was not created.`
    );
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  await User.create({
    name,
    email,
    passwordHash,
    role: ROLES.ADMIN, // Guaranteed role: "admin"
    isActive: true,
  });

  return {
    action: 'created',
    email,
    name,
    role: ROLES.ADMIN,
  };
};

/**
 * Optional bootstrap helper for automated environments or initial setup.
 */
export const createOrUpdateSuperAdmin = async (): Promise<{
  action: 'created' | 'updated';
  email: string;
  name: string;
  role: string;
}> => {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || 'AXION SuperAdmin';

  if (!email || !password) {
    throw new Error(
      'Missing required environment variables. INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be defined in .env.'
    );
  }

  const existingUser = await User.findOne({ email });
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  if (existingUser) {
    existingUser.name = name;
    existingUser.passwordHash = passwordHash;
    existingUser.role = ROLES.ADMIN;
    existingUser.isActive = true;
    await existingUser.save();

    return {
      action: 'updated',
      email,
      name,
      role: ROLES.ADMIN,
    };
  }

  return createAdminAccount({
    name,
    email,
    password,
    confirmPassword: password,
  });
};

/**
 * Interactive prompt manager supporting TTY masking and non-TTY line streaming.
 */
export class PromptManager {
  private rl: readline.Interface | null = null;
  private lineQueue: string[] = [];
  private resolvers: ((value: string) => void)[] = [];

  constructor() {
    if (!process.stdin.isTTY) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      this.rl.on('line', (line) => {
        const trimmed = line.trim();
        if (this.resolvers.length > 0) {
          const resolve = this.resolvers.shift()!;
          resolve(trimmed);
        } else {
          this.lineQueue.push(trimmed);
        }
      });
    }
  }

  async ask(query: string, hideInput = false): Promise<string> {
    if (!process.stdin.isTTY) {
      process.stdout.write(query);
      if (this.lineQueue.length > 0) {
        const val = this.lineQueue.shift()!;
        process.stdout.write(hideInput ? '********\n' : `${val}\n`);
        return val;
      }
      return new Promise<string>((resolve) => {
        this.resolvers.push((val) => {
          process.stdout.write(hideInput ? '********\n' : `${val}\n`);
          resolve(val);
        });
      });
    }

    if (hideInput) {
      return new Promise<string>((resolve) => {
        let input = '';
        process.stdout.write(query);

        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding('utf8');

        const onData = (char: string) => {
          if (char === '\n' || char === '\r' || char === '\u0004') {
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(input);
          } else if (char === '\u0003') {
            process.stdout.write('\n');
            process.exit(1);
          } else if (char === '\b' || char === '\x7f') {
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
          } else {
            input += char;
            process.stdout.write('*');
          }
        };

        stdin.on('data', onData);
      });
    }

    return new Promise<string>((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  close(): void {
    if (this.rl) {
      this.rl.close();
    }
  }
}

/**
 * Parse optional CLI flags for non-interactive automation (e.g. --name, --email, --password, --confirm)
 */
export const parseArgs = (): {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} => {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--name=')) {
      result.name = arg.split('=')[1];
    } else if (arg === '--name' && i + 1 < args.length) {
      result.name = args[++i];
    } else if (arg.startsWith('--email=')) {
      result.email = arg.split('=')[1];
    } else if (arg === '--email' && i + 1 < args.length) {
      result.email = args[++i];
    } else if (arg.startsWith('--password=')) {
      result.password = arg.split('=')[1];
    } else if (arg === '--password' && i + 1 < args.length) {
      result.password = args[++i];
    } else if (arg.startsWith('--confirm=')) {
      result.confirmPassword = arg.split('=')[1];
    } else if (arg === '--confirm' && i + 1 < args.length) {
      result.confirmPassword = args[++i];
    }
  }

  return result;
};

const run = async (): Promise<void> => {
  const promptManager = new PromptManager();
  try {
    logger.info('Connecting to database...');
    await connectDB();

    console.log('\n====================================================');
    console.log('  AXION PackTech - Admin User Creation Portal');
    console.log('====================================================\n');

    const cliArgs = parseArgs();

    let name = cliArgs.name;
    let email = cliArgs.email;
    let password = cliArgs.password;
    let confirmPassword = cliArgs.confirmPassword;

    // Prompt for any missing arguments interactively
    if (!name) {
      name = await promptManager.ask('Enter Admin Name: ');
    }

    if (!email) {
      email = await promptManager.ask('Enter Admin Email: ');
    }

    if (!password) {
      password = await promptManager.ask('Enter Admin Password (min 8 chars): ', true);
    }

    if (!confirmPassword) {
      confirmPassword = await promptManager.ask('Confirm Admin Password: ', true);
    }

    promptManager.close();

    logger.info('Creating admin account in MongoDB...');
    const result = await createAdminAccount({
      name,
      email,
      password,
      confirmPassword,
    });

    console.log('\n====================================================');
    console.log('  AXION PackTech Admin Account Created Successfully');
    console.log(`  Name:     ${result.name}`);
    console.log(`  Email:    ${result.email}`);
    console.log(`  Role:     ${result.role}`);
    console.log('  Status:   Active');
    console.log('  Secret:   [PROTECTED - Stored as bcrypt hash]');
    console.log('====================================================');
    console.log('This administrator can now sign in at http://localhost:3000/admin/login.\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    promptManager.close();
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const sanitized = errorMsg.replace(/mongodb:\/\/[^@]+@/g, 'mongodb://***:***@');
    logger.error(`Admin creation failed: ${sanitized}`);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
};

if (process.argv[1]?.includes('createAdmin')) {
  void run();
}
