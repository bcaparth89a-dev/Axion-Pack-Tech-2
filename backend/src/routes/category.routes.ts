import { Router } from 'express';
import {
  getCategoryTree,
  getNavigationHierarchy,
  getAllCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  moveCategory,
  reorderCategories,
  deleteCategory,
  getCategoryHero,
  updateCategoryHero,
} from '../controllers/category.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updateEntityHeroSchema } from '../validators/hero.validator.js';
import {
  createCategorySchema,
  updateCategorySchema,
  moveCategorySchema,
  reorderCategoriesSchema,
} from '../validators/category.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public routes
router.get('/tree', getCategoryTree);
router.get('/nav', getNavigationHierarchy);
router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.get('/:id/hero', getCategoryHero);

// Admin-protected routes
router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(createCategorySchema),
  createCategory
);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(reorderCategoriesSchema),
  reorderCategories
);

router.patch(
  '/:id/move',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(moveCategorySchema),
  moveCategory
);

router.put(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateCategorySchema),
  updateCategory
);

router.put(
  '/:id/hero',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateEntityHeroSchema),
  updateCategoryHero
);

router.delete('/:id', authenticate, requireEditorOrAdmin, deleteCategory);

export default router;
