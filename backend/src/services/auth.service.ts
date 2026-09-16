import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.model.js';
import { Session } from '../models/Session.model.js';
import {
  signAccessToken,
  hashToken,
  generateRandomToken,
} from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { UserRole, ROLES } from '../constants/roles.js';
import { loginThrottleService } from './loginThrottle.service.js';
import { logger } from '../utils/logger.js';

export interface LoginResult {
  token: string; // Access Token
  refreshToken: string; // Long-lived Refresh Token
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface RefreshResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export class AuthService {
  /**
   * Authenticate admin credentials and generate a multi-device persistent session.
   */
  async login(
    email: string,
    password: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<LoginResult> {
    const normalizedEmail = (email || '').toLowerCase().trim();

    // 1. Check if account or IP is throttled
    try {
      const throttleStatus = await loginThrottleService.isThrottled(normalizedEmail, clientIp);
      if (throttleStatus.isThrottled) {
        const remainingMinutes = Math.ceil(throttleStatus.remainingSeconds / 60);
        const timeMsg =
          throttleStatus.remainingSeconds > 60
            ? `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
            : `${throttleStatus.remainingSeconds} seconds`;
        throw AppError.tooManyRequests(
          `Too many login attempts. Account temporarily throttled for ${timeMsg}.`
        );
      }
    } catch (err: unknown) {
      if (err instanceof AppError && err.statusCode === 429) {
        throw err;
      }
      logger.warn('Throttle check error during login, proceeding safely with database check:', err);
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash +isActive');

    if (!user) {
      await loginThrottleService.recordFailedAttempt(normalizedEmail, clientIp).catch(() => {});
      throw AppError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      await loginThrottleService.recordFailedAttempt(normalizedEmail, clientIp).catch(() => {});
      throw AppError.unauthorized('This account has been deactivated. Please contact an administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await loginThrottleService.recordFailedAttempt(normalizedEmail, clientIp).catch(() => {});
      throw AppError.unauthorized('Invalid email or password.');
    }

    // 2. Successful Login: Immediately clear failed attempt / throttle state
    await loginThrottleService.resetThrottle(normalizedEmail, clientIp).catch(() => {});

    // 3. Update lastLogin timestamp asynchronously
    user.lastLogin = new Date();
    await user.save();

    // 4. Create a persistent Session record in MongoDB for this specific device
    const rawRefreshToken = generateRandomToken(40);
    const refreshTokenHash = hashToken(rawRefreshToken);
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const session = await Session.create({
      userId: user._id,
      refreshTokenHash,
      deviceInfo: userAgent || 'Standard Web Browser',
      ip: clientIp || '127.0.0.1',
      isValid: true,
      lastUsedAt: new Date(),
      expiresAt: sessionExpiresAt,
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: session._id.toString(),
    });

    return {
      token: accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Rotates refresh token and generates a new access token for persistent sessions.
   */
  async refreshSession(
    rawRefreshToken: string,
    clientIp?: string,
    userAgent?: string
  ): Promise<RefreshResult> {
    if (!rawRefreshToken) {
      throw AppError.unauthorized('Refresh token is required.');
    }

    const tokenHash = hashToken(rawRefreshToken);

    const session = await Session.findOne({
      refreshTokenHash: tokenHash,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw AppError.unauthorized('Invalid or expired refresh token. Please sign in again.');
    }

    // Verify user exists and remains active with admin role
    const user = await User.findById(session.userId).select('role email name isActive');
    if (!user || !user.isActive) {
      session.isValid = false;
      await session.save();
      throw AppError.unauthorized('User account does not exist or has been deactivated.');
    }

    if (user.role !== ROLES.ADMIN) {
      session.isValid = false;
      await session.save();
      throw AppError.forbidden('Access restricted to administrators only.');
    }

    // Refresh Token Rotation: issue a new refresh token and update existing session
    const newRawRefreshToken = generateRandomToken(40);
    session.refreshTokenHash = hashToken(newRawRefreshToken);
    session.lastUsedAt = new Date();
    if (clientIp) session.ip = clientIp;
    if (userAgent) session.deviceInfo = userAgent;
    await session.save();

    const newAccessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      sessionId: session._id.toString(),
    });

    return {
      token: newAccessToken,
      refreshToken: newRawRefreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Log out a single device session without affecting other devices.
   */
  async logoutSession(rawRefreshTokenOrSessionId?: string): Promise<void> {
    if (!rawRefreshTokenOrSessionId) return;

    try {
      // Check if it matches an ID or token hash
      if (rawRefreshTokenOrSessionId.length === 24) {
        await Session.updateOne({ _id: rawRefreshTokenOrSessionId }, { isValid: false });
      } else {
        const hash = hashToken(rawRefreshTokenOrSessionId);
        await Session.updateOne({ refreshTokenHash: hash }, { isValid: false });
      }
    } catch (error) {
      logger.warn('Error during logoutSession:', error);
    }
  }

  /**
   * Invalidate all sessions for a user across all devices.
   */
  async logoutAllSessions(userId: string): Promise<void> {
    if (!userId) return;
    try {
      await Session.updateMany({ userId, isValid: true }, { isValid: false });
    } catch (error) {
      logger.warn(`Error logging out all sessions for user ${userId}:`, error);
    }
  }

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<IUser> {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw AppError.conflict('A user with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || ROLES.ADMIN,
      isActive: true,
    });

    return user;
  }

  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found.');
    }
    return user;
  }
}

export const authService = new AuthService();
