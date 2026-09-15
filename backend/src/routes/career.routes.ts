import { Router, Request, Response, NextFunction } from 'express';
import {
  getCareers,
  getCareer,
  createCareer,
  updateCareer,
  deleteCareer,
  submitApplication,
  getApplications,
  getApplication,
  downloadResume,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/career.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  careerSchema,
  careerApplicationSchema,
  updateCareerApplicationStatusSchema,
} from '../validators/career.validator.js';
import {
  formSubmissionLimiter,
  verifyHumanVerification,
} from '../middleware/humanVerification.middleware.js';
import { uploadResumeMiddleware } from '../middleware/upload.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireEditorOrAdmin } from '../middleware/authorization.middleware.js';
import { AppError } from '../utils/appError.js';

const requireResume = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file && (!req.body.resumeUrl || !req.body.resumeKey)) {
    return next(AppError.badRequest('Resume file is required (PDF, DOC, or DOCX).'));
  }
  next();
};

const router = Router();

// ============================================================================
// 1. Admin Applications Management (MUST be defined before /:slug)
// ============================================================================
router.get('/admin/applications', authenticate, requireEditorOrAdmin, getApplications);
router.get('/admin/applications/:id', authenticate, requireEditorOrAdmin, getApplication);
router.get('/admin/applications/:id/resume', authenticate, requireEditorOrAdmin, downloadResume);
router.patch(
  '/admin/applications/:id',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateCareerApplicationStatusSchema),
  updateApplicationStatus
);
router.delete('/admin/applications/:id', authenticate, requireAdmin, deleteApplication);

// ============================================================================
// 2. Public Candidate Application Submission (General / Direct)
// ============================================================================
router.post(
  '/apply',
  uploadResumeMiddleware,
  formSubmissionLimiter,
  verifyHumanVerification,
  validateRequest(careerApplicationSchema),
  requireResume,
  submitApplication
);

// ============================================================================
// 3. Public Career Listings & Admin Career Opening Creation
// ============================================================================
router.get('/', getCareers);
router.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(careerSchema),
  createCareer
);

// ============================================================================
// 4. Role-Specific Application Submission (e.g. /:slug/apply)
// ============================================================================
router.post(
  '/:slug/apply',
  uploadResumeMiddleware,
  formSubmissionLimiter,
  verifyHumanVerification,
  validateRequest(careerApplicationSchema),
  requireResume,
  submitApplication
);

// ============================================================================
// 5. Individual Career Detail & Management (Parameterized /:slug)
// ============================================================================
router.get('/:slug', getCareer);
router.put(
  '/:slug',
  authenticate,
  requireAdmin,
  validateRequest(careerSchema),
  updateCareer
);
router.delete('/:slug', authenticate, requireAdmin, deleteCareer);

export default router;
