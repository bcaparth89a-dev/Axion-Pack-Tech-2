import { Router } from 'express';
import {
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/siteSettings.controller.js';
import { getCompanyStats } from '../controllers/pages.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updateSiteSettingsSchema } from '../validators/siteSettings.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

router.get('/', getSiteSettings);
router.get('/stats', getCompanyStats);
router.put(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(updateSiteSettingsSchema),
  updateSiteSettings
);

export default router;
