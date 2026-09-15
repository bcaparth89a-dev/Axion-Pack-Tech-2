import { Router } from 'express';
import { getDashboardStats, flushCache } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// All admin routes require valid JWT authentication and role === "admin"
router.use(authenticate, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.post('/cache/flush', flushCache);

export default router;
