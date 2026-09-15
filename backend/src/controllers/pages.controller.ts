import { Request, Response, NextFunction } from 'express';
import { pagesService } from '../services/pages.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getHomePage = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = await pagesService.getHomePage();
    sendSuccess({ res, data: page });
  } catch (error) {
    next(error);
  }
};

export const updateHomePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = await pagesService.updateHomePage(req.body);
    sendSuccess({ res, data: page, message: 'Home page content updated' });
  } catch (error) {
    next(error);
  }
};

export const getAboutPage = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = await pagesService.getAboutPage();
    sendSuccess({ res, data: page });
  } catch (error) {
    next(error);
  }
};

export const updateAboutPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = await pagesService.updateAboutPage(req.body);
    sendSuccess({ res, data: page, message: 'About page content updated' });
  } catch (error) {
    next(error);
  }
};

export const getResponsibilityPage = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = await pagesService.getResponsibilityPage();
    sendSuccess({ res, data: page });
  } catch (error) {
    next(error);
  }
};

export const updateResponsibilityPage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = await pagesService.updateResponsibilityPage(req.body);
    sendSuccess({ res, data: page, message: 'Responsibilities page content updated' });
  } catch (error) {
    next(error);
  }
};

export const getCompanyStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await pagesService.getCompanyStats();
    sendSuccess({ res, data: stats });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await pagesService.updateCompanyStats(req.body);
    sendSuccess({ res, data: stats, message: 'Company statistics updated' });
  } catch (error) {
    next(error);
  }
};

export const getCategoryHero = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hero = await pagesService.getCategoryHero('published');
    sendSuccess({ res, data: hero });
  } catch (error) {
    next(error);
  }
};

export const getCategoryHeroAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hero = await pagesService.getCategoryHero('admin');
    sendSuccess({ res, data: hero });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hero = await pagesService.updateCategoryHero(req.body);
    sendSuccess({ res, data: hero, message: 'Category hero updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const publishCategoryHero = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hero = await pagesService.publishCategoryHero();
    sendSuccess({ res, data: hero, message: 'Category hero published successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryHero = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await pagesService.deleteCategoryHero();
    sendSuccess({ res, data: null, message: 'Category hero disabled successfully' });
  } catch (error) {
    next(error);
  }
};
