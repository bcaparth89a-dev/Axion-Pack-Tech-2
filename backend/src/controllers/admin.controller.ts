import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { Industry } from '../models/Industry.model.js';
import { Service } from '../models/Service.model.js';
import { News } from '../models/News.model.js';
import { Blog } from '../models/Blog.model.js';
import { Career } from '../models/Career.model.js';
import { ContactInquiry } from '../models/ContactInquiry.model.js';
import { CareerApplication } from '../models/CareerApplication.model.js';
import { cacheService } from '../cache/cache.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalProducts,
      publishedProducts,
      totalCategories,
      publishedCategories,
      totalModels,
      publishedModels,
      totalIndustries,
      totalServices,
      totalNews,
      totalBlogs,
      totalCareers,
      totalInquiries,
      catalogDownloads,
      totalApplications,
      unreadInquiries,
      pendingApplications,
      recentInquiries,
      recentApplications,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isPublished: true }),
      Category.countDocuments(),
      Category.countDocuments({ isPublished: true }),
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ isPublished: true }),
      Industry.countDocuments(),
      Service.countDocuments(),
      News.countDocuments(),
      Blog.countDocuments(),
      Career.countDocuments(),
      ContactInquiry.countDocuments(),
      ContactInquiry.countDocuments({
        $or: [
          { inquiryGroup: 'Catalog' },
          { inquiryType: { $regex: /catalog|brochure|spec/i } },
        ],
      }),
      CareerApplication.countDocuments(),
      ContactInquiry.countDocuments({ status: 'unread' }),
      CareerApplication.countDocuments({ status: { $in: ['new', 'pending'] } }),
      ContactInquiry.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name email phone company inquiryType inquiryGroup status createdAt')
        .lean(),
      CareerApplication.find()
        .sort({ submittedAt: -1 })
        .limit(6)
        .select('candidateName careerTitle email phone status submittedAt')
        .lean(),
    ]);

    sendSuccess({
      res,
      data: {
        counts: {
          products: totalProducts,
          publishedProducts,
          draftProducts: totalProducts - publishedProducts,
          categories: totalCategories,
          publishedCategories,
          draftCategories: totalCategories - publishedCategories,
          models: totalModels,
          publishedModels,
          draftModels: totalModels - publishedModels,
          industries: totalIndustries,
          services: totalServices,
          news: totalNews,
          blogs: totalBlogs,
          careers: totalCareers,
          inquiries: totalInquiries,
          catalogDownloads,
          contactRequests: totalInquiries - catalogDownloads,
          applications: totalApplications,
          unreadInquiries,
          pendingApplications,
        },
        recentInquiries,
        recentApplications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const flushCache = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await cacheService.flushPublicCache();
    sendSuccess({
      res,
      message: 'All public Redis cache keys have been invalidated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
