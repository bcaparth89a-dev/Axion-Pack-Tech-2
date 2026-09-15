import { Router } from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  reorderProducts,
  deleteProduct,
  getProductHero,
  updateProductHero,
} from '../controllers/product.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { updateEntityHeroSchema } from '../validators/hero.validator.js';
import {
  createProductSchema,
  updateProductSchema,
  reorderProductsSchema,
} from '../validators/product.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.get('/:id/hero', getProductHero);

// Admin-protected routes
router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(createProductSchema),
  createProduct
);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(reorderProductsSchema),
  reorderProducts
);

router.put(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateProductSchema),
  updateProduct
);

router.put(
  '/:id/hero',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateEntityHeroSchema),
  updateProductHero
);

router.delete('/:id', authenticate, requireEditorOrAdmin, deleteProduct);

export default router;
