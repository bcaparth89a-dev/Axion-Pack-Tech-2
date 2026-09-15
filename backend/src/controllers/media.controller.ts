import { Request, Response, NextFunction } from 'express';
import { mediaService } from '../services/media.service.js';
import { storageService } from '../services/storage/StorageService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { AppError } from '../utils/appError.js';

export const getMediaConfig = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await mediaService.getConfig();
    sendSuccess({
      res,
      data: config,
      message: 'Media configuration retrieved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public Media Resolver Endpoint (Safe Zero-Proxy Development Fallback)
 * Issues HTTP 302 redirect to Cloudflare R2 presigned GET URL.
 * The binary never passes through Express/VPS.
 */
export const getMediaFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawKey = req.params[0] || (req.params as any).key;
    if (!rawKey) {
      throw AppError.badRequest('Missing media object key.');
    }

    const cleanKey = rawKey.replace(/^\/+/, '');

    // 1. Verify object exists in storage via HeadObject
    const head = await storageService.headObject(cleanKey);
    if (!head) {
      throw AppError.notFound(`Media object not found in storage: ${cleanKey}`);
    }

    // 2. Generate short-lived presigned GET URL (15 minutes TTL)
    const presignedUrl = await storageService.generatePresignedGetUrl(cleanKey, 900);

    // 3. Issue 302 Found redirect - binary streams directly from Cloudflare R2, never proxied through Express
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.redirect(302, presignedUrl);
  } catch (error) {
    next(error);
  }
};

export const initiateUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await mediaService.initiateDirectUpload(
      req.body,
      req.user?.userId
    );
    sendSuccess({
      res,
      statusCode: 201,
      data: result,
      message: 'Direct upload initiated. Upload directly to Cloudflare R2 using presigned URL.',
    });
  } catch (error) {
    next(error);
  }
};

export const completeUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await mediaService.completeDirectUpload(
      req.body,
      req.user?.userId,
      req.user?.role
    );
    sendSuccess({
      res,
      statusCode: 200,
      data: result,
      message: 'Direct upload verified and media asset completed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const failUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { mediaId, error } = req.body;
    if (mediaId) {
      await mediaService.recordFailedUpload(
        mediaId,
        error || 'Upload aborted or failed in browser',
        req.user?.userId,
        req.user?.role
      );
    }
    sendSuccess({
      res,
      data: { success: true },
      message: 'Upload failure recorded and cleaned up.',
    });
  } catch (error) {
    next(error);
  }
};

export const cleanupStaleUploads = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await mediaService.cleanStaleUploads();
    sendSuccess({
      res,
      data: result,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const optimizeAndUploadImage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No image file uploaded.');
    }

    const folder = (req.body.folder as string) || 'images';
    const result = await mediaService.optimizeAndUploadImage(
      req.file,
      req.user?.userId,
      folder
    );

    sendSuccess({
      res,
      statusCode: 201,
      data: result,
      message: `Image converted to WebP and uploaded successfully (${result.reductionPercent}% size reduction)`,
    });
  } catch (error) {
    next(error);
  }
};

export const optimizeAndUploadVideo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      throw AppError.badRequest('No video file uploaded.');
    }

    const folder = (req.body.folder as string) || 'videos';
    const result = await mediaService.optimizeAndUploadVideo(
      req.file,
      req.user?.userId,
      folder
    );

    sendSuccess({
      res,
      statusCode: 201,
      data: result,
      message: `Video optimized to web MP4 with WebP poster uploaded successfully (${result.reductionPercent}% size reduction)`,
    });
  } catch (error) {
    next(error);
  }
};

export const registerExternalMedia = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, url, type, folder, posterUrl, altText } = req.body;
    if (!url || !type) {
      throw AppError.badRequest('Media URL and type are required.');
    }

    const result = await mediaService.registerExternalMedia({
      name: name || 'External Media',
      url,
      type,
      folder,
      posterUrl,
      altText,
      userId: req.user?.userId,
    });

    sendSuccess({
      res,
      statusCode: 201,
      data: result,
      message: 'External media source registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUploadUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename, contentType, folder, contentLength } = req.body;
    const result = await mediaService.requestUploadUrl({
      filename,
      contentType,
      folder,
      contentLength,
    });

    sendSuccess({
      res,
      data: result,
      message: 'Presigned upload URL generated successfully. Upload directly to Cloudflare R2.',
    });
  } catch (error) {
    next(error);
  }
};

export const saveMediaMetadata = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const media = await mediaService.saveMedia({
      ...req.body,
      userId: req.user?.userId,
    });

    sendSuccess({
      res,
      statusCode: 201,
      data: media,
      message: 'Media metadata saved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMediaList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const mediaList = await mediaService.getMediaList({
      folder: req.query.folder as string,
      type: req.query.type as string,
      status: req.query.status as string,
      search: req.query.search as string,
      page: req.query.page as string,
      limit: req.query.limit as string,
    });

    sendSuccess({ res, data: mediaList });
  } catch (error) {
    next(error);
  }
};

export const checkMediaUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const usage = await mediaService.checkMediaReferences(req.params.id);
    sendSuccess({
      res,
      data: usage,
      message: usage.isReferenced
        ? `Media is referenced by ${usage.count} item(s)`
        : 'Media is not referenced by any CMS item',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const force = req.query.force === 'true';
    const result = await mediaService.deleteMedia(req.params.id, force);
    sendSuccess({ res, message: result.message || 'Media item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
