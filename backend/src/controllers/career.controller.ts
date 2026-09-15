import { Request, Response, NextFunction } from 'express';
import { careerService } from '../services/career.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getCareers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const careers = await careerService.getCareers({
      type: req.query.type as string,
      search: req.query.search as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
      publishedOnly,
    });
    sendSuccess({ res, data: careers });
  } catch (error) {
    next(error);
  }
};

export const getCareer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const career = await careerService.getCareerBySlug(req.params.slug, publishedOnly);
    sendSuccess({ res, data: career });
  } catch (error) {
    next(error);
  }
};

export const createCareer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const career = await careerService.createCareer(req.body);
    sendSuccess({ res, statusCode: 201, data: career, message: 'Career opening created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateCareer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const career = await careerService.updateCareer(req.params.slug, req.body);
    sendSuccess({ res, data: career, message: 'Career opening updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCareer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await careerService.deleteCareer(req.params.slug);
    sendSuccess({ res, message: 'Career opening deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await careerService.submitApplication(
      {
        ...req.body,
        careerSlug: req.params.slug || req.body.careerSlug || req.body.position,
      },
      req.file
    );
    sendSuccess({
      res,
      statusCode: 201,
      data: application,
      message: 'Application submitted successfully. Our HR team will review your profile.',
    });
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applications = await careerService.getApplications({
      careerSlug: req.query.careerSlug as string,
      status: req.query.status as string,
      search: req.query.search as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });
    sendSuccess({ res, data: applications });
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await careerService.getApplicationById(req.params.id);
    sendSuccess({ res, data: application });
  } catch (error) {
    next(error);
  }
};

export const downloadResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filePath, fileName, mimeType } = await careerService.getResumeFile(req.params.id);
    if (filePath) {
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.sendFile(filePath);
      return;
    }
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const application = await careerService.updateApplicationStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    sendSuccess({ res, data: application, message: 'Application status updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await careerService.deleteApplication(req.params.id);
    sendSuccess({ res, message: 'Career application deleted successfully' });
  } catch (error) {
    next(error);
  }
};

