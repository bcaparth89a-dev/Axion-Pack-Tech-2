import { Request, Response, NextFunction } from 'express';
import { catalogLeadService } from '../services/catalogLead.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const submitCatalogLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await catalogLeadService.submitLead(req.body);
    sendSuccess({
      res,
      statusCode: 201,
      data: lead,
      message: 'Catalog download request verified. Your download will begin automatically.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCatalogLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const leads = await catalogLeadService.getLeads({
      status: req.query.status as string,
      search: req.query.search as string,
      catalogName: req.query.catalogName as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });
    sendSuccess({ res, data: leads });
  } catch (error) {
    next(error);
  }
};

export const updateCatalogLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const lead = await catalogLeadService.updateLeadStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    sendSuccess({ res, data: lead, message: 'Catalog lead status updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteCatalogLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await catalogLeadService.deleteLead(req.params.id);
    sendSuccess({ res, message: 'Catalog lead record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getCatalogLeadStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await catalogLeadService.getLeadStats();
    sendSuccess({ res, data: stats });
  } catch (error) {
    next(error);
  }
};
