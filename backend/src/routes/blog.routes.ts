import { Router } from 'express';
import {
  getBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  reorderBlogs,
} from '../controllers/blog.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { blogSchema, updateBlogSchema, blogCategorySchema, reorderBlogsSchema } from '../validators/blog.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

// Categories
router.get('/categories', getBlogCategories);
router.post(
  '/categories',
  authenticate,
  requireAdmin,
  validateRequest(blogCategorySchema),
  createBlogCategory
);
router.put(
  '/categories/:slug',
  authenticate,
  requireAdmin,
  validateRequest(blogCategorySchema),
  updateBlogCategory
);
router.delete('/categories/:slug', authenticate, requireAdmin, deleteBlogCategory);

// Reorder Blog Posts (must be before /:slug)
router.put(
  '/reorder',
  authenticate,
  requireAdmin,
  validateRequest(reorderBlogsSchema),
  reorderBlogs
);
router.post(
  '/reorder',
  authenticate,
  requireAdmin,
  validateRequest(reorderBlogsSchema),
  reorderBlogs
);

// Blog Posts List & Detail
router.get('/', getBlogs);
router.get('/:slug', getBlog);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validateRequest(blogSchema),
  createBlog
);
router.put(
  '/:slug',
  authenticate,
  requireAdmin,
  validateRequest(updateBlogSchema),
  updateBlog
);
router.delete('/:slug', authenticate, requireAdmin, deleteBlog);

export default router;


