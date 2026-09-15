import { Router } from 'express';
import {
  getContactSettings,
  updateContactSettings,
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '../controllers/contact.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  submitContactInquirySchema,
  updateContactSettingsSchema,
} from '../validators/contact.validator.js';
import {
  formSubmissionLimiter,
  verifyHumanVerification,
} from '../middleware/humanVerification.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public contact settings & RFQ submission
router.get('/settings', getContactSettings);
router.post(
  '/',
  formSubmissionLimiter,
  verifyHumanVerification,
  validateRequest(submitContactInquirySchema),
  submitInquiry
);

// Admin contact settings & inquiry management
router.put(
  '/settings',
  authenticate,
  requireAdmin,
  validateRequest(updateContactSettingsSchema),
  updateContactSettings
);
router.get('/inquiries', authenticate, requireEditorOrAdmin, getInquiries);
router.patch('/inquiries/:id', authenticate, requireEditorOrAdmin, updateInquiryStatus);
router.delete('/inquiries/:id', authenticate, requireAdmin, deleteInquiry);

export default router;

