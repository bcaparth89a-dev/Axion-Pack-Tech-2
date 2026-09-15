import { Request, Response, NextFunction } from 'express';
import { serviceService } from '../services/service.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const services = await serviceService.getServices(publishedOnly);
    sendSuccess({ res, data: services });
  } catch (error) {
    next(error);
  }
};

export const getService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const service = await serviceService.getServiceBySlug(req.params.slug, publishedOnly);
    sendSuccess({ res, data: service });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.createService(req.body);
    sendSuccess({ res, statusCode: 201, data: service, message: 'Service created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await serviceService.updateService(req.params.slug, req.body);
    sendSuccess({ res, data: service, message: 'Service updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const services = await serviceService.reorderServices(req.body.orders);
    sendSuccess({ res, data: services, message: 'Services reordered successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await serviceService.deleteService(req.params.slug);
    sendSuccess({ res, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};

