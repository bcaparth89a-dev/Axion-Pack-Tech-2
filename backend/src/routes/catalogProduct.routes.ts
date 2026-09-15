import { Router } from 'express';
import {
  listCatalogProducts,
  getCatalogProductById,
  getCatalogProductBySlug,
  getCatalogProductTree,
  getCatalogProductStats,
  createCatalogProduct,
  updateCatalogProduct,
  duplicateCatalogProduct,
  reorderCatalogProducts,
  deleteCatalogProduct,
} from '../controllers/catalogProduct.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Public read endpoints
router.get('/', listCatalogProducts);
router.get('/slug/:slug', getCatalogProductBySlug);
router.get('/:id/tree', getCatalogProductTree);
router.get('/:id/stats', getCatalogProductStats);
router.get('/:id', getCatalogProductById);

// Admin / Editor protected mutations
router.post(
  '/',
  authenticate,
  requireEditorOrAdmin,
  createCatalogProduct
);

router.patch(
  '/reorder',
  authenticate,
  requireEditorOrAdmin,
  reorderCatalogProducts
);

router.post(
  '/:id/duplicate',
  authenticate,
  requireEditorOrAdmin,
  duplicateCatalogProduct
);

router.put(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  updateCatalogProduct
);

router.delete(
  '/:id',
  authenticate,
  requireEditorOrAdmin,
  deleteCatalogProduct
);

export const catalogProductRoutes = router;
