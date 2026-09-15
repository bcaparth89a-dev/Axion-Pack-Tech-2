import { Router } from 'express';
import {
  getModels,
  getModelBySlug,
  getModelById,
  createModel,
  updateModel,
  reorderModels,
  deleteModel,
  getModelHero,
  updateModelHero,
} from '../controllers/productModel.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updateEntityHeroSchema } from '../validators/hero.validator.js';
import {
  createProductModelSchema,
  updateProductModelSchema,
  reorderProductModelsSchema,
} from '../validators/productModel.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public routes
router.get('/', getModels);
router.get('/slug/:slug', getModelBySlug);
router.get('/:id', getModelById);
router.get('/:id/hero', getModelHero);

// Admin-protected routes
router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(createProductModelSchema),
  createModel
);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(reorderProductModelsSchema),
  reorderModels
);

router.put(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateProductModelSchema),
  updateModel
);

router.put(
  '/:id/hero',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateEntityHeroSchema),
  updateModelHero
);

router.delete('/:id', authenticate, requireEditorOrAdmin, deleteModel);

export default router;
