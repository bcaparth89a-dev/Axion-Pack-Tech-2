import { Request, Response, NextFunction } from 'express';
import { productModelService } from '../services/productModel.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, search, page, limit } = req.query;
    const activeOnly = req.query.all !== 'true';

    const result = await productModelService.getModels({
      productId: productId as string,
      search: search as string,
      isActive: activeOnly ? true : undefined,
      page: page as string,
      limit: limit as string,
    });

    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const getModelBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const activeOnly = req.query.all !== 'true';
    const result = await productModelService.getModelBySlug(slug, activeOnly);
    sendSuccess({ res, data: result });
  } catch (error) {
    next(error);
  }
};

export const getModelById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const model = await productModelService.getModelById(id);
    sendSuccess({ res, data: model });
  } catch (error) {
    next(error);
  }
};

export const createModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const model = await productModelService.createModel(req.body);
    sendSuccess({ res, statusCode: 201, message: 'Model created successfully', data: model });
  } catch (error) {
    next(error);
  }
};

export const updateModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const model = await productModelService.updateModel(id, req.body);
    sendSuccess({ res, message: 'Model updated successfully', data: model });
  } catch (error) {
    next(error);
  }
};

export const reorderModels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orders } = req.body;
    const result = await productModelService.reorderModels(orders);
    sendSuccess({ res, message: 'Models reordered successfully', data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteModel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await productModelService.deleteModel(id);
    sendSuccess({ res, message: result.message });
  } catch (error) {
    next(error);
  }
};

export const getModelHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await productModelService.getModelHero(id);
    sendSuccess({ res, data: hero });
  } catch (error) {
    next(error);
  }
};

export const updateModelHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const hero = await productModelService.updateModelHero(id, req.body);
    sendSuccess({ res, message: 'Model hero updated successfully', data: hero });
  } catch (error) {
    next(error);
  }
};
