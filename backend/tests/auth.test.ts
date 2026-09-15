import bcrypt from 'bcryptjs';
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
  hashToken,
} from '../src/utils/jwt.js';
import { AuthService } from '../src/services/auth.service.js';
import { User } from '../src/models/User.model.js';
import { Session } from '../src/models/Session.model.js';
import { ROLES } from '../src/constants/roles.js';

jest.mock('../src/models/User.model.js');
jest.mock('../src/models/Session.model.js');
jest.mock('../src/services/loginThrottle.service.js', () => ({
  loginThrottleService: {
    isThrottled: jest.fn().mockResolvedValue({ isThrottled: false, remainingSeconds: 0 }),
    recordFailedAttempt: jest.fn().mockResolvedValue(1),
    resetThrottle: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Authentication & Persistent Multi-Device Session System', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('JWT and Token Utilities', () => {
    it('should sign and verify access tokens accurately', () => {
      const payload = {
        userId: '65f123456789abcdef012345',
        email: 'admin@axionpacktech.com',
        role: ROLES.ADMIN,
        sessionId: 'session-id-123',
      };

      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(ROLES.ADMIN);
      expect(decoded.sessionId).toBe(payload.sessionId);
    });

    it('should sign and verify refresh tokens accurately', () => {
      const payload = {
        userId: '65f123456789abcdef012345',
        email: 'admin@axionpacktech.com',
        role: ROLES.ADMIN,
      };

      const refreshToken = signRefreshToken(payload);
      expect(typeof refreshToken).toBe('string');
      const decoded = verifyRefreshToken(refreshToken);
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should hash tokens deterministically using SHA-256', () => {
      const rawToken = 'random_cryptographic_token_xyz_123';
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should hash passwords and verify matching hashes using bcrypt', async () => {
      const rawPassword = 'StrongPassword123!';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(rawPassword, salt);

      expect(hash).not.toBe(rawPassword);
      expect(await bcrypt.compare(rawPassword, hash)).toBe(true);
      expect(await bcrypt.compare('WrongPassword456', hash)).toBe(false);
    });
  });

  describe('Multi-Device Login & Session Creation', () => {
    it('should create an independent session on login and return access & refresh tokens', async () => {
      const email = 'admin@axionpacktech.com';
      const password = 'CorrectPassword123!';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'mock-user-id-001',
          name: 'Main Admin',
          email,
          passwordHash,
          role: ROLES.ADMIN,
          isActive: true,
          save: jest.fn().mockResolvedValue(true),
        }),
      });

      (Session.create as jest.Mock).mockResolvedValue({
        _id: 'mock-session-id-laptop',
        userId: 'mock-user-id-001',
        isValid: true,
      });

      const result = await authService.login(email, password, '192.168.1.50', 'Chrome on Windows');

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(Session.create).toHaveBeenCalledTimes(1);
      expect(Session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'mock-user-id-001',
          deviceInfo: 'Chrome on Windows',
          ip: '192.168.1.50',
          isValid: true,
        })
      );
    });

    it('should reject login for deactivated users', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'mock-deact-id',
          name: 'Deactivated Admin',
          email: 'deact@axionpacktech.com',
          passwordHash: 'hash',
          role: ROLES.ADMIN,
          isActive: false,
        }),
      });

      await expect(
        authService.login('deact@axionpacktech.com', 'Pass123!', '127.0.0.1')
      ).rejects.toThrow('This account has been deactivated');
    });
  });

  describe('Refresh Token Rotation & Invalidation', () => {
    it('should rotate refresh token and return a new access token when session is valid', async () => {
      const rawToken = 'valid_raw_refresh_token_string';
      const tokenHash = hashToken(rawToken);

      const mockSession = {
        _id: 'session-id-phone',
        userId: 'mock-user-id-001',
        refreshTokenHash: tokenHash,
        isValid: true,
        expiresAt: new Date(Date.now() + 100000),
        lastUsedAt: new Date(),
        ip: '127.0.0.1',
        deviceInfo: 'Mobile Safari',
        save: jest.fn().mockResolvedValue(true),
      };

      (Session.findOne as jest.Mock).mockResolvedValue(mockSession);
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'mock-user-id-001',
          name: 'Main Admin',
          email: 'admin@axionpacktech.com',
          role: ROLES.ADMIN,
          isActive: true,
        }),
      });

      const refreshResult = await authService.refreshSession(rawToken, '192.168.1.60', 'Safari on iOS');

      expect(refreshResult.token).toBeDefined();
      expect(refreshResult.refreshToken).toBeDefined();
      expect(refreshResult.refreshToken).not.toBe(rawToken); // Rotated
      expect(mockSession.save).toHaveBeenCalledTimes(1);
    });

    it('should throw 401 when refresh token does not match any active session in MongoDB', async () => {
      (Session.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.refreshSession('invalid_or_revoked_token')
      ).rejects.toThrow('Invalid or expired refresh token');
    });

    it('should invalidate only the target device session on single-device logout', async () => {
      (Session.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      await authService.logoutSession('target_device_token');

      expect(Session.updateOne).toHaveBeenCalledWith(
        { refreshTokenHash: hashToken('target_device_token') },
        { isValid: false }
      );
    });

    it('should invalidate all active sessions for a user on logout-all', async () => {
      (Session.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 });

      await authService.logoutAllSessions('mock-user-id-001');

      expect(Session.updateMany).toHaveBeenCalledWith(
        { userId: 'mock-user-id-001', isValid: true },
        { isValid: false }
      );
    });
  });
});
