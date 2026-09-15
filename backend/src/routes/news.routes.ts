import { Router } from 'express';
import {
  getNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  getNews,
  getNewsArticle,
  createNews,
  updateNews,
  deleteNews,
  reorderNews,
} from '../controllers/news.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { newsSchema, updateNewsSchema, newsCategorySchema, reorderNewsSchema } from '../validators/news.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Categories
router.get('/categories', getNewsCategories);
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  validateRequest(newsCategorySchema),
  createNewsCategory
);
router.put(
  '/categories/:slug',
  authenticate,
  requireAdmin,
  validateRequest(newsCategorySchema),
  updateNewsCategory
);
router.delete('/categories/:slug', authenticate, requireAdmin, deleteNewsCategory);

// Reorder Articles (must be before /:slug)
router.put(
  '/reorder',
  authenticate,
  requireAdmin,
  validateRequest(reorderNewsSchema),
  reorderNews
);
router.post(
  '/reorder',
  authenticate,
  requireAdmin,
  validateRequest(reorderNewsSchema),
  reorderNews
);

// News Articles List & Detail
router.get('/', getNews);
router.get('/:category/:slug', getNewsArticle);
router.get('/:slug', getNewsArticle);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(newsSchema),
  createNews
);
router.put(
  '/:slug',
  authenticate,
  requireAdmin,
  validateRequest(updateNewsSchema),
  updateNews
);
router.delete('/:slug', authenticate, requireAdmin, deleteNews);

export default router;


