import { Request, Response, NextFunction } from 'express';
import { catalogProductService } from '../services/catalogProduct.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const listCatalogProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeArchived = req.query.all === 'true';
    const products = await catalogProductService.listCatalogProducts(includeArchived);
    sendSuccess({ res, data: products });
  } catch (error) {
    next(error);
  }
};

export const getCatalogProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await catalogProductService.getCatalogProductById(id);
    sendSuccess({ res, data: product });
  } catch (error) {
    next(error);
  }
};

export const getCatalogProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await catalogProductService.getCatalogProductBySlug(slug);
    sendSuccess({ res, data: product });
  } catch (error) {
    next(error);
  }
};

export const getCatalogProductTree = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const activeOnly = req.query.all !== 'true';
    const tree = await catalogProductService.getCatalogProductTree(id, activeOnly);
    sendSuccess({ res, data: tree });
  } catch (error) {
    next(error);
  }
};

export const getCatalogProductStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const stats = await catalogProductService.getCatalogProductStats(id);
    sendSuccess({ res, data: stats });
  } catch (error) {
    next(error);
  }
};

export const createCatalogProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await catalogProductService.createCatalogProduct(req.body);
    sendSuccess({
      res,
      statusCode: 201,
      message: 'Catalog Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await catalogProductService.updateCatalogProduct(id, req.body);
    sendSuccess({
      res,
      message: 'Catalog Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateCatalogProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await catalogProductService.duplicateCatalogProduct(id);
    sendSuccess({
      res,
      statusCode: 201,
      message: 'Catalog Product duplicated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const reorderCatalogProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orders } = req.body;
    const result = await catalogProductService.reorderCatalogProducts(orders);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteCatalogProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true';
    const result = await catalogProductService.deleteCatalogProduct(id, force);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};
