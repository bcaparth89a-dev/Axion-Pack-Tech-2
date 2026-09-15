import { Request, Response, NextFunction } from 'express';
import { industryService } from '../services/industry.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getIndustries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const industries = await industryService.getIndustries(publishedOnly);
    sendSuccess({ res, data: industries });
  } catch (error) {
    next(error);
  }
};

export const getIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const industry = await industryService.getIndustryBySlug(req.params.slug, publishedOnly);
    sendSuccess({ res, data: industry });
  } catch (error) {
    next(error);
  }
};

export const createIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industry = await industryService.createIndustry(req.body);
    sendSuccess({ res, statusCode: 201, data: industry, message: 'Industry created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industry = await industryService.updateIndustry(req.params.slug, req.body);
    sendSuccess({ res, data: industry, message: 'Industry updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderIndustries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industries = await industryService.reorderIndustries(req.body.orders);
    sendSuccess({ res, data: industries, message: 'Industries reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteIndustry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await industryService.deleteIndustry(req.params.slug);
    sendSuccess({ res, message: 'Industry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

