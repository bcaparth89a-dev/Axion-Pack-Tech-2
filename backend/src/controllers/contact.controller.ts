import { Request, Response, NextFunction } from 'express';
import { contactService } from '../services/contact.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getContactSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await contactService.getSettings();
    sendSuccess({ res, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateContactSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await contactService.updateSettings(req.body);
    sendSuccess({ res, data: settings, message: 'Contact settings updated' });
  } catch (error) {
    next(error);
  }
};

export const submitInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inquiry = await contactService.submitInquiry(req.body);
    sendSuccess({
      res,
      statusCode: 201,
      data: inquiry,
      message: 'Inquiry submitted successfully. An AXION PackTech representative will reach out to you shortly.',
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inquiries = await contactService.getInquiries({
      status: req.query.status as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });
    sendSuccess({ res, data: inquiries });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inquiry = await contactService.updateInquiryStatus(
      req.params.id,
      req.body.status,
      req.body.notes
    );
    sendSuccess({ res, data: inquiry, message: 'Inquiry status updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteInquiry = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await contactService.deleteInquiry(req.params.id);
    sendSuccess({ res, message: 'Contact inquiry deleted successfully' });
  } catch (error) {
    next(error);
  }
};

