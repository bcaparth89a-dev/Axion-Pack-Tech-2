import { Request, Response, NextFunction } from 'express';
import { newsService } from '../services/news.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getNewsCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await newsService.getCategories();
    sendSuccess({ res, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createNewsCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await newsService.createCategory(req.body);
    sendSuccess({ res, statusCode: 201, data: category, message: 'News category created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateNewsCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await newsService.updateCategory(req.params.slug, req.body);
    sendSuccess({ res, data: category, message: 'News category updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteNewsCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await newsService.deleteCategory(req.params.slug);
    sendSuccess({ res, message: 'News category deleted successfully' });
  } catch (error) {
    next(error);
  }
};


export const getNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const news = await newsService.getNews({
      page: req.query.page as string,
      limit: req.query.limit as string,
      category: req.query.category as string,
      search: req.query.search as string,
      featured: req.query.featured as string,
      publishedOnly,
    });
    sendSuccess({ res, data: news });
  } catch (error) {
    next(error);
  }
};

export const getNewsArticle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const publishedOnly = req.query.all !== 'true';
    const article = req.params.category && req.params.slug
      ? await newsService.getNewsBySlug(req.params.category, req.params.slug, publishedOnly)
      : await newsService.getNewsBySlug(req.params.slug, publishedOnly);
    sendSuccess({ res, data: article });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await newsService.createNews(req.body);
    sendSuccess({ res, statusCode: 201, data: article, message: 'News article created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const article = await newsService.updateNews(req.params.slug, req.body);
    sendSuccess({ res, data: article, message: 'News article updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await newsService.deleteNews(req.params.slug);
    sendSuccess({ res, message: 'News article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const items = await newsService.reorderNews(req.body.orders);
    sendSuccess({ res, data: items, message: 'News articles reordered successfully' });
  } catch (error) {
    next(error);
  }
};

