import { Router } from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  reorderServices,
  deleteService,
} from '../controllers/service.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  serviceSchema,
  updateServiceSchema,
  reorderServicesSchema,
} from '../validators/service.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

router.get('/', getServices);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(reorderServicesSchema),
  reorderServices
);

router.get('/:slug', getService);

router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(serviceSchema),
  createService
);

router.put(
  '/:slug',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateServiceSchema),
  updateService
);

router.delete('/:slug', authenticate, requireEditorOrAdmin, deleteService);

export default router;

