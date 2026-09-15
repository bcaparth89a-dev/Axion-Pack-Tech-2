import { Router } from 'express';
import {
  getHomePage,
  updateHomePage,
  getAboutPage,
  updateAboutPage,
  getResponsibilityPage,
  updateResponsibilityPage,
  getCompanyStats,
  updateCompanyStats,
  getCategoryHero,
  getCategoryHeroAdmin,
  updateCategoryHero,
  publishCategoryHero,
  deleteCategoryHero,
} from '../controllers/pages.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  updateHomePageSchema,
  updateAboutPageSchema,
  updateResponsibilityPageSchema,
  updateCategoryHeroSchema,
} from '../validators/pages.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin, requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Home Page
router.get('/home', getHomePage);
router.put(
  '/home',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateHomePageSchema),
  updateHomePage
);

// About Us Page
router.get('/about', getAboutPage);
router.put(
  '/about',
  authenticate,
  requireAdmin,
  validateRequest(updateAboutPageSchema),
  updateAboutPage
);

// Responsibilities Page
router.get('/responsibilities', getResponsibilityPage);
router.put(
  '/responsibilities',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateResponsibilityPageSchema),
  updateResponsibilityPage
);

// Company Stats
router.get('/stats', getCompanyStats);
router.put('/stats', authenticate, requireEditorOrAdmin, updateCompanyStats);

// Main Category Page Hero CMS
router.get('/category-hero', getCategoryHero);
router.get('/category-hero/admin', authenticate, requireEditorOrAdmin, getCategoryHeroAdmin);
router.put(
  '/category-hero',
  authenticate,
  requireEditorOrAdmin,
  validateRequest(updateCategoryHeroSchema),
  updateCategoryHero
);
router.post('/category-hero/publish', authenticate, requireEditorOrAdmin, publishCategoryHero);
router.delete('/category-hero', authenticate, requireEditorOrAdmin, deleteCategoryHero);

export default router;
