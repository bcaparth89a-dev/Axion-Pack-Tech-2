import { Response, NextFunction } from 'express';
import { ROLES } from '../src/constants/roles.js';
import { requireAdmin } from '../src/middleware/authorization.middleware.js';
import { AuthenticatedRequest } from '../src/types/index.js';
import { AppError } from '../src/utils/appError.js';
import { createAdminAccount, createOrUpdateSuperAdmin } from '../src/scripts/createAdmin.js';
import { User } from '../src/models/User.model.js';

jest.mock('../src/models/User.model.js');
jest.mock('../src/config/db.js', () => ({
  connectDB: jest.fn(),
  disconnectDB: jest.fn(),
}));

describe('Multi-Admin Creation & RBAC Protection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createAdminAccount Validation & Creation', () => {
    it('should reject when Admin Name is missing or too short', async () => {
      await expect(
        createAdminAccount({
          name: '',
          email: 'admin2@axionpacktech.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        })
      ).rejects.toThrow('Admin Name is required (must be between 2 and 100 characters).');
    });

    it('should reject invalid email format', async () => {
      await expect(
        createAdminAccount({
          name: 'Operations Admin',
          email: 'not-a-valid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        })
      ).rejects.toThrow('Invalid email address format: "not-a-valid-email".');
    });

    it('should reject password shorter than 8 characters', async () => {
      await expect(
        createAdminAccount({
          name: 'Operations Admin',
          email: 'ops@axionpacktech.com',
          password: 'short',
          confirmPassword: 'short',
        })
      ).rejects.toThrow('Admin password must be at least 8 characters in length.');
    });

    it('should reject when confirm password does not match', async () => {
      await expect(
        createAdminAccount({
          name: 'Operations Admin',
          email: 'ops@axionpacktech.com',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword456!',
        })
      ).rejects.toThrow('Passwords do not match. Please verify your password entry.');
    });

    it('should prevent duplicate accounts when email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue({
        email: 'ops@axionpacktech.com',
        role: ROLES.ADMIN,
      });

      await expect(
        createAdminAccount({
          name: 'Duplicate Ops Admin',
          email: 'ops@axionpacktech.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        })
      ).rejects.toThrow('An account with email "ops@axionpacktech.com" already exists');

      expect(User.create).not.toHaveBeenCalled();
    });

    it('should successfully create an admin user with role "admin" and isActive true', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        _id: 'mock-admin-id',
        name: 'Technical Admin',
        email: 'tech.admin@axionpacktech.com',
        role: ROLES.ADMIN,
        isActive: true,
      });

      const result = await createAdminAccount({
        name: 'Technical Admin',
        email: 'tech.admin@axionpacktech.com',
        password: 'TechSecurePassword123!',
        confirmPassword: 'TechSecurePassword123!',
      });

      expect(result.action).toBe('created');
      expect(result.name).toBe('Technical Admin');
      expect(result.email).toBe('tech.admin@axionpacktech.com');
      expect(result.role).toBe('admin');

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Technical Admin',
          email: 'tech.admin@axionpacktech.com',
          role: ROLES.ADMIN,
          isActive: true,
          passwordHash: expect.any(String),
        })
      );
    });

    it('should allow creating multiple distinct admin accounts sequentially', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const admin1 = await createAdminAccount({
        name: 'Admin Alpha',
        email: 'alpha@axionpacktech.com',
        password: 'AlphaPassword123!',
        confirmPassword: 'AlphaPassword123!',
      });

      const admin2 = await createAdminAccount({
        name: 'Admin Beta',
        email: 'beta@axionpacktech.com',
        password: 'BetaPassword456!',
        confirmPassword: 'BetaPassword456!',
      });

      expect(admin1.email).toBe('alpha@axionpacktech.com');
      expect(admin1.role).toBe('admin');
      expect(admin2.email).toBe('beta@axionpacktech.com');
      expect(admin2.role).toBe('admin');
      expect(User.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('createOrUpdateSuperAdmin Fallback', () => {
    it('should safely update existing admin user without duplicating records', async () => {
      process.env.INITIAL_ADMIN_EMAIL = 'admin@axionpacktech.com';
      process.env.INITIAL_ADMIN_PASSWORD = 'UpdatedPassword123!';
      process.env.INITIAL_ADMIN_NAME = 'AXION SuperAdmin';

      const mockExisting = {
        name: 'Old Name',
        email: 'admin@axionpacktech.com',
        role: ROLES.ADMIN,
        isActive: true,
        passwordHash: 'oldhash',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockExisting);

      const result = await createOrUpdateSuperAdmin();

      expect(result.action).toBe('updated');
      expect(result.email).toBe('admin@axionpacktech.com');
      expect(mockExisting.save).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('RBAC Protection (requireAdmin middleware)', () => {
    it('should block non-admin users (e.g. editor role) with 403 Forbidden', async () => {
      const req = {
        user: {
          id: '65f123456789abcdef012399',
          email: 'editor@axionpacktech.com',
          role: ROLES.EDITOR,
        },
      } as unknown as AuthenticatedRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorPassed = (next as jest.Mock).mock.calls[0][0];
      expect(errorPassed).toBeInstanceOf(AppError);
      expect(errorPassed.statusCode).toBe(403);
    });

    it('should allow admin users to proceed to next() without error', async () => {
      const req = {
        user: {
          id: '65f123456789abcdef012345',
          email: 'admin@axionpacktech.com',
          role: ROLES.ADMIN,
        },
      } as unknown as AuthenticatedRequest;

      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect((next as jest.Mock).mock.calls[0][0]).toBeUndefined();
    });
  });
});
