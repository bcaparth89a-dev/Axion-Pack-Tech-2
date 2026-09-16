import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId, standalone, search, featured, page, limit } = req.query;
    const activeOnly = req.query.all !== 'true';

    const result = await productService.getProducts({
      categoryId: categoryId as string,
      isStandalone: standalone === 'true',
      search: search as string,
      isFeatured: featured !== undefined ? featured === 'true' : undefined,
      isActive: activeOnly ? true : undefined,
      page: page as string,
      limit: limit as string,
    });

    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const activeOnly = req.query.all !== 'true';
    const result = await productService.getProductBySlug(slug, activeOnly);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    sendSuccess({ res, data: product });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
    const products = await productService.getFeaturedProducts(limit);
    sendSuccess({ res, data: products });
  } catch (error) {
    next(error);
  }
};

export const getCatalogs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const catalogs = await productService.getAllCatalogs();
    sendSuccess({ res, data: catalogs });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.createProduct(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Product created successfully', data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    sendSuccess({ res, message: 'Product updated successfully', data: product });
  } catch (error) {
    next(error);
  }
};

export const reorderProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orders } = req.body;
    const result = await productService.reorderProducts(orders);
    sendSuccess({ res, message: 'Products reordered successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const cascade = req.query.cascade === 'true';
    const result = await productService.deleteProduct(id, cascade);
    sendSuccess({ res, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getProductHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await productService.getProductHero(id);
    sendSuccess({ res, data: hero });
  } catch (error) {
    next(error);
  }
};

export const updateProductHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await productService.updateProductHero(id, req.body);
    sendSuccess({ res, message: 'Product hero updated successfully', data: hero });
  } catch (error) {
    next(error);
  }
};
