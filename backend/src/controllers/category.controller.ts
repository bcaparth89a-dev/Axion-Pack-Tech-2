import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeOnly = req.query.all !== 'true';
    const tree = await categoryService.getCategoryTree(activeOnly);
    sendSuccess({ res, data: tree });
  } catch (error) {
    next(error);
  }
};

export const getNavigationHierarchy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parentCategoryId = req.query.parentCategoryId ? String(req.query.parentCategoryId) : null;
    const activeOnly = req.query.all !== 'true';
    const hierarchy = await categoryService.getNavigationHierarchy(parentCategoryId, activeOnly);
    sendSuccess({ res, data: hierarchy });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const activeOnly = req.query.all !== 'true';
    const result = await categoryService.getCategoryBySlug(slug, activeOnly);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const categories = await categoryService.getAllCategories(activeOnly);
    sendSuccess({ res, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    sendSuccess({ res, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Category created successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.updateCategory(id, req.body);
    sendSuccess({ res, message: 'Category updated successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const moveCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { parentCategoryId } = req.body;
    const category = await categoryService.moveCategory(id, parentCategoryId);
    sendSuccess({ res, message: 'Category moved successfully', data: category });
  } catch (error) {
    next(error);
  }
};

export const reorderCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orders } = req.body;
    const result = await categoryService.reorderCategories(orders);
    sendSuccess({ res, message: 'Categories reordered successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const cascade = req.query.cascade === 'true';
    const result = await categoryService.deleteCategory(id, cascade);
    sendSuccess({ res, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getCategoryHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await categoryService.getCategoryHero(id);
    sendSuccess({ res, data: hero });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await categoryService.updateCategoryHero(id, req.body);
    sendSuccess({ res, message: 'Category hero updated successfully', data: hero });
  } catch (error) {
    next(error);
  }
};
