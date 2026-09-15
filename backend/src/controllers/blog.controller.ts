import { Request, Response, NextFunction } from 'express';
import { blogService } from '../services/blog.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getBlogCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await blogService.getCategories();
    sendSuccess({ res, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await blogService.createCategory(req.body);
    sendSuccess({ res, statusCode: 201, data: category, message: 'Blog category created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await blogService.updateCategory(req.params.slug, req.body);
    sendSuccess({ res, data: category, message: 'Blog category updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.deleteCategory(req.params.slug);
    sendSuccess({ res, message: 'Blog category deleted successfully' });
  } catch (error) {
    next(error);
  }
};


export const getBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const blogs = await blogService.getBlogs({
      page: req.query.page as string,
      limit: req.query.limit as string,
      category: req.query.category as string,
      search: req.query.search as string,
      featured: req.query.featured as string,
      publishedOnly,
    });
    sendSuccess({ res, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const blog = await blogService.getBlogBySlug(req.params.slug, publishedOnly);
    sendSuccess({ res, data: blog });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blog = await blogService.createBlog(req.body);
    sendSuccess({ res, statusCode: 201, data: blog, message: 'Blog article created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blog = await blogService.updateBlog(req.params.slug, req.body);
    sendSuccess({ res, data: blog, message: 'Blog article updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await blogService.deleteBlog(req.params.slug);
    sendSuccess({ res, message: 'Blog article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderBlogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await blogService.reorderBlogs(req.body.orders);
    sendSuccess({ res, data: items, message: 'Blog posts reordered successfully' });
  } catch (error) {
    next(error);
  }
};

