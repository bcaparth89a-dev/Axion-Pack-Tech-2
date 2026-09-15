import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  createAdminUser,
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { loginSchema, createAdminSchema } from '../validators/auth.validator.js';
import { loginLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public authentication endpoints
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected authentication endpoints
router.get('/me', authenticate, getMe);
router.post('/logout-all', authenticate, requireAdmin, logoutAll);
router.post(
  '/create-user',
  authenticate,
  requireAdmin,
  validateRequest(createAdminSchema),
  createAdminUser
);

export default router;
