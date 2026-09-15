import { Router } from 'express';
import {
  getIndustries,
  getIndustry,
  createIndustry,
  updateIndustry,
  reorderIndustries,
  deleteIndustry,
} from '../controllers/industry.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  industrySchema,
  updateIndustrySchema,
  reorderIndustriesSchema,
} from '../validators/industry.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

router.get('/', getIndustries);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(reorderIndustriesSchema),
  reorderIndustries
);

router.get('/:slug', getIndustry);

router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(industrySchema),
  createIndustry
);

router.put(
  '/:slug',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateIndustrySchema),
  updateIndustry
);

router.delete('/:slug', authenticate, requireEditorOrAdmin, deleteIndustry);

export default router;

