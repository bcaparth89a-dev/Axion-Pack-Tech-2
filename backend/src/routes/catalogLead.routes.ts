import { Router } from 'express';
import {
  submitCatalogLead,
  getCatalogLeads,
  updateCatalogLeadStatus,
  deleteCatalogLead,
  getCatalogLeadStats,
} from '../controllers/catalogLead.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  submitCatalogLeadSchema,
  updateCatalogLeadStatusSchema,
} from '../validators/catalogLead.validator.js';
import {
  formSubmissionLimiter,
  verifyHumanVerification,
} from '../middleware/humanVerification.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public catalog lead submission endpoint
router.post(
  '/',
  formSubmissionLimiter,
  verifyHumanVerification,
  validateRequest(submitCatalogLeadSchema),
  submitCatalogLead
);

// Admin catalog lead management endpoints
router.get('/', authenticate, requireEditorOrAdmin, getCatalogLeads);
router.get('/stats', authenticate, requireEditorOrAdmin, getCatalogLeadStats);
router.patch(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateCatalogLeadStatusSchema),
  updateCatalogLeadStatus
);
router.delete('/:id', authenticate, requireAdmin, deleteCatalogLead);

export default router;
