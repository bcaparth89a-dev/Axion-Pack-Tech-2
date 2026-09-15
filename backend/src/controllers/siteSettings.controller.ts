import { Request, Response, NextFunction } from 'express';
import { siteSettingsService } from '../services/siteSettings.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getSiteSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await siteSettingsService.getSettings();
    sendSuccess({ res, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSiteSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await siteSettingsService.updateSettings(req.body);
    sendSuccess({ res, data: settings, message: 'Site settings updated successfully' });
  } catch (error) {
    next(error);
  }
};
