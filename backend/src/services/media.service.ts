import mongoose from 'mongoose';
import crypto from 'crypto';
import { Media, IMedia } from '../models/Media.model.js';
import { storageService } from './storage/StorageService.js';
import { r2StorageProvider } from './storage/R2StorageProvider.js';
import { imageOptimizer } from './media/imageOptimizer.js';
import { videoOptimizer } from './media/videoOptimizer.js';
import { getPagination, buildPaginatedResponse, PaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import { parseVideoUrl } from '../utils/videoHelper.js';
import { cacheService } from '../cache/cache.service.js';
import { validateSvgContent } from '../utils/svgSecurity.js';
import {
  getMaxAllowedSize,
  getMediaTypeFromMime,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  ALLOWED_IMAGE_MIMES,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_DOCUMENT_MIMES,
} from '../validators/media.validator.js';

// Models to check for media references
import { Product } from '../models/Product.model.js';
import { Category } from '../models/Category.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { CatalogProduct } from '../models/CatalogProduct.model.js';
import { CategoryHero } from '../models/CategoryHero.model.js';
import { Service } from '../models/Service.model.js';
import { Industry } from '../models/Industry.model.js';
import { News } from '../models/News.model.js';
import { Blog } from '../models/Blog.model.js';
import { Career } from '../models/Career.model.js';
import { HomePage } from '../models/HomePage.model.js';
import { AboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { SiteSettings } from '../models/SiteSettings.model.js';

export interface MediaUploadResponse {
  mediaId: string;
  url: string;
  embedUrl?: string;
  posterUrl?: string;
  key: string;
  posterKey?: string;
  type: 'image' | 'video' | 'document' | 'other';
  provider: 'r2' | 'external' | 'youtube' | 'vimeo' | 'local';
  sourceType: 'upload' | 'url';
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  originalFileName: string;
  folder?: string;
}

export interface MediaReferenceItem {
  model: string;
  title: string;
  field: string;
  id: string;
}

export interface MediaUsageCheckResult {
  isReferenced: boolean;
  count: number;
  references: MediaReferenceItem[];
}

export interface InitiateUploadParams {
  fileName: string;
  contentType: string;
  size: number;
  category?: string;
  entityType?: string;
  entityId?: string;
}

export interface CompleteUploadParams {
  mediaId: string;
  key: string;
  altText?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export class MediaService {
  public async getConfig() {
    const isPublicDomainResolving = await storageService.checkPublicDomainResolves().catch(() => false);
    const publicDomain = (
      process.env.R2_PUBLIC_URL ||
      process.env.R2_PUBLIC_BASE_URL ||
      'https://media.axionpacktech.com'
    ).trim();

    return {
      r2Configured: storageService.isConfigured(),
      providerName: storageService.getProviderName(),
      publicDomain,
      isPublicDomainResolving,
      maxImageSize: MAX_IMAGE_SIZE,
      maxVideoSize: MAX_VIDEO_SIZE,
      maxDocumentSize: MAX_DOCUMENT_SIZE,
      acceptedImageFormats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'svg'],
      acceptedVideoFormats: ['mp4', 'webm', 'mov'],
      acceptedDocumentFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
    };
  }

  /**
   * Direct-to-R2 Upload Phase 1: Initiate
   * Generates a presigned PUT URL and creates an initial Media record in 'uploading' status.
   */
  public async initiateDirectUpload(
    params: InitiateUploadParams,
    userId?: string
  ): Promise<{
    uploadUrl: string;
    mediaId: string;
    key: string;
    publicUrl: string;
    expiresIn: number;
  }> {
    if (!storageService.isConfigured()) {
      throw AppError.badRequest(
        'Cloudflare R2 storage is not configured. Please supply valid R2 environment credentials.'
      );
    }

    if (!userId) {
      throw AppError.unauthorized('Authentication required to initiate media uploads.');
    }

    const normalizedMime = params.contentType.toLowerCase().trim();
    const maxAllowed = getMaxAllowedSize(normalizedMime);

    if (params.size > maxAllowed) {
      throw AppError.badRequest(
        `File size (${params.size} bytes) exceeds the maximum allowed limit of ${maxAllowed} bytes for ${normalizedMime}.`
      );
    }

    const category = (params.category || 'general').trim();
    const key = storageService.generateStructuredKey(category, params.fileName);
    const expiresIn = 900; // 15 minutes

    const presigned = await storageService.generatePresignedUploadUrl({
      key,
      contentType: normalizedMime,
      contentLength: params.size,
      expiresInSeconds: expiresIn,
    });

    const publicUrl = storageService.getPublicUrl(key);
    const mediaType = getMediaTypeFromMime(normalizedMime);
    const fileExt = params.fileName.split('.').pop()?.toLowerCase() || '';

    let mediaDoc: IMedia;
    try {
      mediaDoc = await Media.create({
        name: params.fileName,
        key,
        url: publicUrl,
        publicUrl,
        status: 'uploading',
        type: mediaType,
        mimeType: normalizedMime,
        size: params.size,
        originalSize: params.size,
        optimizedSize: params.size,
        category,
        folder: category,
        entityType: params.entityType?.trim() || '',
        entityId: params.entityId?.trim() || '',
        provider: 'r2',
        sourceType: 'upload',
        originalFileName: params.fileName,
        originalMimeType: normalizedMime,
        format: fileExt,
        referenceCount: 1,
        uploadedBy: new mongoose.Types.ObjectId(userId),
      });
    } catch (err) {
      logger.error('[MediaService] Error creating initial Media record in MongoDB:', err);
      throw AppError.internal('Failed to initiate media upload in database.');
    }

    // Targeted cache invalidation
    await cacheService.deleteByPattern('axion:media:*');

    return {
      uploadUrl: presigned.uploadUrl,
      mediaId: mediaDoc._id.toString(),
      key,
      publicUrl,
      expiresIn,
    };
  }

  /**
   * Direct-to-R2 Upload Phase 2: Complete & Verify
   * Verifies upload ownership, checks actual object metadata in R2 via HeadObject,
   * enforces file size constraints, performs SVG security scanning, and transitions status to 'ready'.
   */
  public async completeDirectUpload(
    params: CompleteUploadParams,
    userId?: string,
    userRole?: string
  ): Promise<IMedia> {
    if (!userId) {
      throw AppError.unauthorized('Authentication required to complete media upload.');
    }

    const mediaDoc = await Media.findById(params.mediaId);
    if (!mediaDoc) {
      throw AppError.notFound('Media record not found.');
    }

    // 1. Verify upload initiator (must match authenticated user unless admin)
    if (mediaDoc.uploadedBy && mediaDoc.uploadedBy.toString() !== userId && userRole !== 'admin') {
      logger.warn(
        `[MediaService] Unauthorized completion attempt: user ${userId} tried to complete upload belonging to ${mediaDoc.uploadedBy}`
      );
      throw AppError.forbidden('Forbidden: You are not authorized to complete an upload initiated by another user.');
    }

    // 2. Verify stored R2 key matches requested key
    if (mediaDoc.key !== params.key) {
      logger.warn(
        `[MediaService] Key mismatch on upload completion: expected "${mediaDoc.key}", received "${params.key}"`
      );
      throw AppError.badRequest('Security validation failed: Key mismatch between requested key and stored media record.');
    }

    // 3. Verify actual object existence and metadata in Cloudflare R2 via HeadObject
    const headResult = await storageService.headObject(mediaDoc.key);
    if (!headResult) {
      throw AppError.badRequest(
        'Upload verification failed: Object was not found in Cloudflare R2 storage. Direct upload may have failed or timed out.'
      );
    }

    // 4. Verify actual uploaded ContentLength
    if (headResult.contentLength <= 0) {
      await storageService.safeCleanup(mediaDoc.key);
      mediaDoc.status = 'failed';
      await mediaDoc.save();
      throw AppError.badRequest('Upload verification failed: Uploaded file in storage is empty (0 bytes).');
    }

    // 5. Enforce allowed file size limit on actual uploaded file (Do not accept oversized objects)
    const maxAllowed = getMaxAllowedSize(mediaDoc.mimeType);
    if (headResult.contentLength > maxAllowed) {
      logger.warn(
        `[MediaService] Oversized object detected: ${headResult.contentLength} bytes (max allowed: ${maxAllowed}). Cleaning up.`
      );
      await storageService.safeCleanup(mediaDoc.key);
      mediaDoc.status = 'failed';
      await mediaDoc.save();
      throw AppError.badRequest(
        `Upload verification failed: Actual uploaded file size (${headResult.contentLength} bytes) exceeds the maximum allowed limit of ${maxAllowed} bytes.`
      );
    }

    // 6. Verify Content-Type compatibility
    const expectedMime = mediaDoc.mimeType.toLowerCase();
    const actualMime = (headResult.contentType || '').toLowerCase();
    if (actualMime) {
      const isExpectedImage = ALLOWED_IMAGE_MIMES.includes(expectedMime as any);
      const isActualImage = ALLOWED_IMAGE_MIMES.includes(actualMime as any);
      const isExpectedVideo = ALLOWED_VIDEO_MIMES.includes(expectedMime as any);
      const isActualVideo = ALLOWED_VIDEO_MIMES.includes(actualMime as any);
      const isExpectedDoc = ALLOWED_DOCUMENT_MIMES.includes(expectedMime as any);
      const isActualDoc = ALLOWED_DOCUMENT_MIMES.includes(actualMime as any);

      const isMimeCategoryMatch =
        (isExpectedImage && isActualImage) ||
        (isExpectedVideo && isActualVideo) ||
        (isExpectedDoc && isActualDoc);

      if (!isMimeCategoryMatch && expectedMime !== actualMime) {
        logger.warn(
          `[MediaService] Content-Type mismatch: expected "${expectedMime}", storage reported "${actualMime}". Cleaning up.`
        );
        await storageService.safeCleanup(mediaDoc.key);
        mediaDoc.status = 'failed';
        await mediaDoc.save();
        throw AppError.badRequest(
          `Upload verification failed: Content-Type mismatch. Expected "${expectedMime}", but found "${actualMime}".`
        );
      }
    }

    // 7. Special Security Handling for SVG (Prevent Stored XSS)
    if (expectedMime === 'image/svg+xml' || mediaDoc.key.toLowerCase().endsWith('.svg')) {
      try {
        const svgContent = await storageService.getObjectText(mediaDoc.key);
        const svgCheck = validateSvgContent(svgContent);
        if (!svgCheck.isValid) {
          logger.warn(`[MediaService] Malicious SVG content rejected: ${svgCheck.reason}. Cleaning up.`);
          await storageService.safeCleanup(mediaDoc.key);
          mediaDoc.status = 'failed';
          await mediaDoc.save();
          throw AppError.badRequest(
            `SVG security validation failed: ${svgCheck.reason || 'SVG contains disallowed executable scripts or event handlers.'}`
          );
        }
      } catch (svgErr: any) {
        if (svgErr instanceof AppError) throw svgErr;
        logger.error('[MediaService] Error scanning SVG content:', svgErr);
        await storageService.safeCleanup(mediaDoc.key);
        mediaDoc.status = 'failed';
        await mediaDoc.save();
        throw AppError.badRequest('Failed to verify SVG security integrity.');
      }
    }

    // 8. Update Media record to 'ready' status
    mediaDoc.status = 'ready';
    mediaDoc.size = headResult.contentLength;
    mediaDoc.optimizedSize = headResult.contentLength;
    if (params.altText) mediaDoc.altText = params.altText.trim();
    if (params.title) mediaDoc.title = params.title.trim();
    if (params.caption) mediaDoc.caption = params.caption.trim();
    if (params.width) mediaDoc.width = params.width;
    if (params.height) mediaDoc.height = params.height;
    if (params.duration) mediaDoc.duration = params.duration;

    await mediaDoc.save();

    // Targeted cache invalidation
    await cacheService.deleteByPattern('axion:media:*');

    logger.info(`[MediaService] Direct R2 upload verified & completed successfully: ${mediaDoc.key}`);
    return mediaDoc;
  }

  /**
   * Records a failed upload and cleans up any orphaned R2 object.
   */
  public async recordFailedUpload(
    mediaId: string,
    errorReason: string,
    userId?: string,
    userRole?: string
  ): Promise<void> {
    const mediaDoc = await Media.findById(mediaId);
    if (!mediaDoc) return;

    if (mediaDoc.uploadedBy && mediaDoc.uploadedBy.toString() !== userId && userRole !== 'admin') {
      return;
    }

    logger.warn(`[MediaService] Upload failure recorded for ${mediaId}: ${errorReason}`);

    if (mediaDoc.key) {
      await storageService.safeCleanup(mediaDoc.key);
    }

    mediaDoc.status = 'failed';
    await mediaDoc.save();
    await cacheService.deleteByPattern('axion:media:*');
  }

  /**
   * Conservative stale upload cleanup:
   * Considers incomplete MongoDB Media records in 'uploading' status older than cutoffHours (default 24h),
   * checks if R2 object exists and safely removes orphaned objects, then deletes incomplete DB records.
   */
  public async cleanStaleUploads(cutoffHours: number = 24): Promise<{
    cleanedRecords: number;
    message: string;
  }> {
    const cutoffDate = new Date(Date.now() - cutoffHours * 60 * 60 * 1000);

    const staleRecords = await Media.find({
      status: 'uploading',
      createdAt: { $lt: cutoffDate },
    });

    let cleanedCount = 0;

    for (const record of staleRecords) {
      try {
        if (record.key) {
          const head = await storageService.headObject(record.key).catch(() => null);
          if (head) {
            await storageService.safeCleanup(record.key);
          }
        }
        await Media.findByIdAndDelete(record._id);
        cleanedCount++;
      } catch (err) {
        logger.error(`[MediaService] Error during stale cleanup for record ${record._id}:`, err);
      }
    }

    if (cleanedCount > 0) {
      await cacheService.deleteByPattern('axion:media:*');
      logger.info(`[MediaService] Conservative stale upload cleanup: removed ${cleanedCount} incomplete records.`);
    }

    return {
      cleanedRecords: cleanedCount,
      message: `Conservative stale upload cleanup completed. Cleaned ${cleanedCount} records older than ${cutoffHours}h.`,
    };
  }

  public async optimizeAndUploadImage(
    file: Express.Multer.File,
    userId?: string,
    folder: string = 'images'
  ): Promise<MediaUploadResponse> {
    if (!storageService.isConfigured()) {
      throw AppError.badRequest(
        'Cloudflare R2 storage is not configured on the server. Please configure R2 environment variables or use a Public Image URL.'
      );
    }

    const targetFolder = (folder || 'images').replace(/^\/+|\/+$/g, '');

    // 1. Image Optimization Pipeline via Sharp
    const optimized = await imageOptimizer.optimize(file.buffer, file.mimetype);

    // 2. Generate safe R2 object key
    const key = storageService.generateKey(targetFolder, 'webp');

    // 3. Upload optimized WebP to Cloudflare R2
    let uploadResult;
    try {
      uploadResult = await storageService.uploadBuffer(key, optimized.buffer, 'image/webp');
    } catch (err) {
      logger.error('[MediaService] R2 image upload failed:', err);
      throw AppError.internal('Failed to upload optimized image to Cloudflare R2 storage.');
    }

    // 4. Record metadata in MongoDB with rollback safety
    let mediaDoc: IMedia;
    try {
      mediaDoc = await Media.create({
        name: file.originalname || 'Optimized Image',
        key,
        url: uploadResult.url,
        publicUrl: uploadResult.url,
        status: 'ready',
        type: 'image',
        mimeType: 'image/webp',
        size: optimized.optimizedSize,
        folder: targetFolder,
        category: targetFolder,
        provider: 'r2',
        sourceType: 'upload',
        originalFileName: file.originalname,
        originalMimeType: file.mimetype,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        width: optimized.width,
        height: optimized.height,
        format: 'webp',
        referenceCount: 1,
        uploadedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      });
    } catch (dbError) {
      logger.error('[MediaService] MongoDB media save failed. Rolling back R2 upload:', dbError);
      await storageService.safeCleanup(key);
      throw AppError.internal('Database error saving media metadata. Upload was rolled back.');
    }

    await cacheService.deleteByPattern('axion:media:*');

    return {
      mediaId: mediaDoc._id.toString(),
      url: mediaDoc.url,
      key: mediaDoc.key,
      type: 'image',
      provider: 'r2',
      sourceType: 'upload',
      format: 'webp',
      width: optimized.width,
      height: optimized.height,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      reductionPercent: optimized.reductionPercent,
      originalFileName: file.originalname,
      folder: targetFolder,
    };
  }

  public async optimizeAndUploadVideo(
    file: Express.Multer.File,
    userId?: string,
    folder: string = 'videos'
  ): Promise<MediaUploadResponse> {
    if (!storageService.isConfigured()) {
      throw AppError.badRequest(
        'Cloudflare R2 storage is not configured on the server. Please configure R2 environment variables or use a Public Video URL.'
      );
    }

    const targetFolder = (folder || 'videos').replace(/^\/+|\/+$/g, '');

    // 1. Video Optimization Pipeline via FFmpeg
    const optimized = await videoOptimizer.optimize(file.buffer, file.originalname);

    // 2. Generate safe R2 object keys
    const videoKey = storageService.generateKey(targetFolder, 'mp4');
    const posterKey = storageService.generateKey(`${targetFolder}/posters`, 'webp');

    // 3. Upload both optimized video and WebP poster to Cloudflare R2
    let videoUpload;
    let posterUpload;

    try {
      posterUpload = await storageService.uploadBuffer(
        posterKey,
        optimized.posterResult.buffer,
        'image/webp'
      );
      videoUpload = await storageService.uploadBuffer(
        videoKey,
        optimized.videoBuffer,
        'video/mp4'
      );
    } catch (uploadErr) {
      logger.error('[MediaService] R2 video upload failed. Cleaning up:', uploadErr);
      await storageService.safeCleanup(posterKey);
      await storageService.safeCleanup(videoKey);
      throw AppError.internal('Failed to upload optimized video and poster to Cloudflare R2.');
    }

    // 4. Save metadata in MongoDB with rollback safety
    let mediaDoc: IMedia;
    try {
      mediaDoc = await Media.create({
        name: file.originalname || 'Optimized Video',
        key: videoKey,
        url: videoUpload.url,
        publicUrl: videoUpload.url,
        status: 'ready',
        type: 'video',
        mimeType: 'video/mp4',
        size: optimized.optimizedSize,
        folder: targetFolder,
        category: targetFolder,
        provider: 'r2',
        sourceType: 'upload',
        posterUrl: posterUpload.url,
        posterKey,
        originalFileName: file.originalname,
        originalMimeType: file.mimetype,
        originalSize: optimized.originalSize,
        optimizedSize: optimized.optimizedSize,
        width: optimized.width,
        height: optimized.height,
        duration: optimized.duration,
        format: 'mp4',
        referenceCount: 1,
        uploadedBy: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      });
    } catch (dbError) {
      logger.error('[MediaService] MongoDB video metadata save failed. Rolling back R2 uploads:', dbError);
      await storageService.safeCleanup(videoKey);
      await storageService.safeCleanup(posterKey);
      throw AppError.internal('Database error saving video metadata. Uploads were rolled back.');
    }

    await cacheService.deleteByPattern('axion:media:*');

    return {
      mediaId: mediaDoc._id.toString(),
      url: mediaDoc.url,
      posterUrl: mediaDoc.posterUrl,
      key: mediaDoc.key,
      posterKey: mediaDoc.posterKey,
      type: 'video',
      provider: 'r2',
      sourceType: 'upload',
      format: 'mp4',
      width: optimized.width,
      height: optimized.height,
      duration: optimized.duration,
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      reductionPercent: optimized.reductionPercent,
      originalFileName: file.originalname,
      folder: targetFolder,
    };
  }

  /**
   * Validates and registers an external media URL.
   * Strict security: enforces HTTPS only, rejects javascript:, data:, file:, or dangerous schemes.
   */
  public async registerExternalMedia(data: {
    name: string;
    url: string;
    type: 'image' | 'video';
    folder?: string;
    posterUrl?: string;
    altText?: string;
    userId?: string;
  }): Promise<MediaUploadResponse> {
    const cleanUrl = data.url.trim();

    // Strict URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(cleanUrl);
    } catch {
      throw AppError.badRequest('Invalid external media URL. Must be a well-formed absolute URL.');
    }

    if (parsedUrl.protocol !== 'https:') {
      throw AppError.badRequest(
        'Security policy: External media URL must strictly use HTTPS scheme (https://). Insecure http://, javascript:, data:, file:, or other schemes are not permitted.'
      );
    }

    if (!parsedUrl.hostname || parsedUrl.hostname.includes(' ') || parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
      throw AppError.badRequest('Invalid external media host.');
    }

    if (data.posterUrl && data.posterUrl.trim()) {
      try {
        const parsedPoster = new URL(data.posterUrl.trim());
        if (parsedPoster.protocol !== 'https:') {
          throw AppError.badRequest('Poster URL must strictly use HTTPS scheme (https://).');
        }
      } catch {
        throw AppError.badRequest('Invalid poster URL.');
      }
    }

    const targetFolder = (data.folder || 'external').replace(/^\/+|\/+$/g, '');
    const uniqueKey = `external/${crypto.randomUUID()}`;

    let provider: 'r2' | 'external' | 'youtube' | 'vimeo' | 'local' = 'external';
    let embedUrl = '';
    let posterUrl = data.posterUrl?.trim() || '';
    let format = data.type === 'image' ? 'external-image' : 'external-video';

    if (data.type === 'video') {
      const parsed = parseVideoUrl(cleanUrl);
      if (parsed.provider === 'youtube') {
        provider = 'youtube';
        embedUrl = parsed.embedUrl || '';
        if (!posterUrl && parsed.thumbnailUrl) {
          posterUrl = parsed.thumbnailUrl;
        }
        format = 'youtube';
      } else if (parsed.provider === 'vimeo') {
        provider = 'vimeo';
        embedUrl = parsed.embedUrl || '';
        if (!posterUrl && parsed.thumbnailUrl) {
          posterUrl = parsed.thumbnailUrl;
        }
        format = 'vimeo';
      } else if (parsed.provider === 'embed') {
        provider = 'external';
        embedUrl = parsed.embedUrl || cleanUrl;
        format = 'embed';
      } else {
        provider = 'external';
        format = 'direct-video';
      }
    }

    const mediaDoc = await Media.create({
      name: data.name.trim() || (data.type === 'video' ? 'External Video' : 'External Image'),
      key: uniqueKey,
      url: cleanUrl,
      publicUrl: cleanUrl,
      status: 'ready',
      type: data.type,
      mimeType: data.type === 'image' ? 'image/jpeg' : 'video/mp4',
      size: 0,
      folder: targetFolder,
      category: targetFolder,
      provider,
      sourceType: 'url',
      embedUrl,
      posterUrl,
      altText: data.altText?.trim() || '',
      format,
      referenceCount: 1,
      uploadedBy: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    });

    await cacheService.deleteByPattern('axion:media:*');

    return {
      mediaId: mediaDoc._id.toString(),
      url: mediaDoc.url,
      embedUrl: mediaDoc.embedUrl,
      posterUrl: mediaDoc.posterUrl,
      key: mediaDoc.key,
      type: data.type,
      provider: mediaDoc.provider,
      sourceType: 'url',
      format: mediaDoc.format || format,
      originalSize: 0,
      optimizedSize: 0,
      reductionPercent: 0,
      originalFileName: data.name,
      folder: targetFolder,
    };
  }

  public async getMediaList(params: {
    folder?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: string | number;
    limit?: string | number;
  }): Promise<PaginatedResponse<IMedia>> {
    const { page, limit, skip } = getPagination({
      page: params.page,
      limit: params.limit,
    });

    const filter: Record<string, unknown> = {};

    // By default, exclude failed or deleted records from public media picker
    if (params.status && params.status !== 'all') {
      filter.status = params.status;
    } else {
      filter.status = { $nin: ['failed', 'deleted'] };
    }

    if (params.folder && params.folder !== 'all') {
      filter.$or = [{ folder: params.folder }, { category: params.folder }];
    }
    if (params.type && params.type !== 'all') {
      filter.type = params.type;
    }
    if (params.search && params.search.trim()) {
      const searchRegex = { $regex: params.search.trim(), $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { originalFileName: searchRegex },
        { altText: searchRegex },
        { title: searchRegex },
        { url: searchRegex },
        { folder: searchRegex },
        { category: searchRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const [items, totalItems] = await Promise.all([
      Media.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Media.countDocuments(filter),
    ]);

    return buildPaginatedResponse(items as unknown as IMedia[], totalItems, page, limit);
  }

  /**
   * Checks for media references across all content collections in the CMS.
   */
  public async checkMediaReferences(id: string): Promise<MediaUsageCheckResult> {
    const media = await Media.findById(id).lean();
    if (!media) {
      return { isReferenced: false, count: 0, references: [] };
    }

    const urls = [media.url, media.publicUrl, media.posterUrl].filter(Boolean) as string[];
    if (urls.length === 0) {
      return { isReferenced: false, count: 0, references: [] };
    }

    const references: MediaReferenceItem[] = [];

    try {
      const [
        products,
        categories,
        productModels,
        catalogProducts,
        categoryHeroes,
        services,
        industries,
        newsList,
        blogList,
        careers,
        homePages,
        aboutPages,
        respPages,
        siteSettings,
      ] = await Promise.all([
        Product.find({
          $or: [
            { 'media.image': { $in: urls } },
            { 'media.heroImage': { $in: urls } },
            { 'media.gallery': { $in: urls } },
          ],
        }).select('name slug').lean(),
        Category.find({
          $or: [
            { 'media.image': { $in: urls } },
            { 'media.heroImage': { $in: urls } },
            { 'media.gallery': { $in: urls } },
          ],
        }).select('name slug').lean(),
        ProductModel.find({
          $or: [
            { 'media.image': { $in: urls } },
            { 'media.heroImage': { $in: urls } },
            { 'media.gallery': { $in: urls } },
          ],
        }).select('name slug').lean(),
        CatalogProduct.find({
          $or: [
            { image: { $in: urls } },
            { 'hero.background.image': { $in: urls } },
            { 'hero.visual.image': { $in: urls } },
            { 'hero.visual.video': { $in: urls } },
            { 'hero.visual.videoPoster': { $in: urls } },
          ],
        }).select('name slug').lean(),
        CategoryHero.find({
          $or: [
            { 'background.image': { $in: urls } },
            { 'visual.image': { $in: urls } },
            { 'visual.video': { $in: urls } },
            { 'visual.videoPoster': { $in: urls } },
          ],
        }).select('page title').lean(),
        Service.find({
          $or: [{ image: { $in: urls } }, { heroImage: { $in: urls } }, { 'seo.ogImage': { $in: urls } }],
        }).select('title slug').lean(),
        Industry.find({
          $or: [{ image: { $in: urls } }, { heroImage: { $in: urls } }, { 'seo.ogImage': { $in: urls } }],
        }).select('title slug').lean(),
        News.find({
          $or: [{ featuredImage: { $in: urls } }, { image: { $in: urls } }, { 'seo.ogImage': { $in: urls } }],
        }).select('title slug').lean(),
        Blog.find({
          $or: [
            { featuredImage: { $in: urls } },
            { image: { $in: urls } },
            { 'seo.ogImage': { $in: urls } },
            { 'author.avatar': { $in: urls } },
          ],
        }).select('title slug').lean(),
        Career.find({
          $or: [{ image: { $in: urls } }, { 'seo.ogImage': { $in: urls } }],
        }).select('title slug').lean(),
        HomePage.find({
          $or: [
            { 'hero.mediaUrl': { $in: urls } },
            { 'hero.posterUrl': { $in: urls } },
            { 'sections.image': { $in: urls } },
            { 'seo.ogImage': { $in: urls } },
          ],
        }).select('hero').lean(),
        AboutPage.find({
          $or: [
            { 'hero.mediaUrl': { $in: urls } },
            { 'hero.posterUrl': { $in: urls } },
            { 'story.image': { $in: urls } },
            { 'leadership.image': { $in: urls } },
            { 'awards.image': { $in: urls } },
            { 'seo.ogImage': { $in: urls } },
          ],
        }).select('hero').lean(),
        ResponsibilityPage.find({
          $or: [
            { 'hero.image': { $in: urls } },
            { 'initiatives.image': { $in: urls } },
            { 'seo.ogImage': { $in: urls } },
          ],
        }).select('hero').lean(),
        SiteSettings.find({
          $or: [
            { logoUrl: { $in: urls } },
            { faviconUrl: { $in: urls } },
            { ogImage: { $in: urls } },
            { footerLogo: { $in: urls } },
          ],
        }).select('siteName').lean(),
      ]);

      products.forEach((p) => references.push({ model: 'Product', title: p.name || p.slug, field: 'media', id: p._id.toString() }));
      categories.forEach((c) => references.push({ model: 'Category', title: c.name || c.slug, field: 'media', id: c._id.toString() }));
      productModels.forEach((pm) => references.push({ model: 'ProductModel', title: pm.name || pm.slug, field: 'media', id: pm._id.toString() }));
      catalogProducts.forEach((cp) => references.push({ model: 'CatalogProduct', title: cp.name || cp.slug, field: 'hero/visual', id: cp._id.toString() }));
      categoryHeroes.forEach((ch) => references.push({ model: 'CategoryHero', title: ch.title || ch.page, field: 'hero', id: ch._id.toString() }));
      services.forEach((s) => references.push({ model: 'Service', title: s.title || s.slug, field: 'image', id: s._id.toString() }));
      industries.forEach((i) => references.push({ model: 'Industry', title: i.title || i.slug, field: 'image', id: i._id.toString() }));
      newsList.forEach((n) => references.push({ model: 'News', title: n.title, field: 'featuredImage', id: n._id.toString() }));
      blogList.forEach((b) => references.push({ model: 'Blog', title: b.title, field: 'featuredImage', id: b._id.toString() }));
      careers.forEach((c) => references.push({ model: 'Career', title: c.title, field: 'image', id: c._id.toString() }));
      homePages.forEach((h) => references.push({ model: 'HomePage', title: 'Home Page', field: 'hero/sections', id: h._id.toString() }));
      aboutPages.forEach((a) => references.push({ model: 'AboutPage', title: 'About Us Page', field: 'media', id: a._id.toString() }));
      respPages.forEach((r) => references.push({ model: 'ResponsibilityPage', title: 'Sustainability/Responsibility', field: 'media', id: r._id.toString() }));
      siteSettings.forEach((ss) => references.push({ model: 'SiteSettings', title: ss.siteName || 'Site Settings', field: 'brand assets', id: ss._id.toString() }));
    } catch (err) {
      logger.error('[MediaService] Reference checking failed:', err);
    }

    return {
      isReferenced: references.length > 0,
      count: references.length,
      references,
    };
  }

  public async safeDeleteMedia(id: string, force: boolean = false): Promise<{ message: string }> {
    const media = await Media.findById(id);
    if (!media) {
      throw AppError.notFound('Media item not found');
    }

    // Safety check: is media actively referenced?
    if (!force) {
      const usage = await this.checkMediaReferences(id);
      if (usage.isReferenced) {
        const referenceSummary = usage.references
          .slice(0, 3)
          .map((r) => `${r.model}: "${r.title || r.id}"`)
          .join(', ');
        const extra = usage.count > 3 ? ` and ${usage.count - 3} more` : '';
        throw AppError.badRequest(
          `Cannot delete media: it is currently referenced in ${usage.count} place(s) (${referenceSummary}${extra}). Please replace or remove references first, or check 'Force Delete'.`
        );
      }
    }

    // Only delete physical object from R2 if referenceCount <= 1 and provider is r2
    if (media.referenceCount <= 1 || force) {
      if (media.provider === 'r2') {
        await storageService.safeCleanup(media.key);
        if (media.posterKey) {
          await storageService.safeCleanup(media.posterKey);
        }
      }
      await Media.findByIdAndDelete(id);
      await cacheService.deleteByPattern('axion:media:*');
      return { message: 'Media permanently deleted from storage and database.' };
    } else {
      media.referenceCount = Math.max(0, media.referenceCount - 1);
      await media.save();
      await cacheService.deleteByPattern('axion:media:*');
      return { message: 'Media reference count decremented.' };
    }
  }

  public async requestUploadUrl(params: {
    filename: string;
    contentType: string;
    folder?: string;
    contentLength?: number;
  }) {
    if (!storageService.isConfigured()) {
      throw AppError.badRequest('Cloudflare R2 storage is not configured.');
    }

    const folder = (params.folder || 'general').replace(/^\/+|\/+$/g, '');
    const cleanFilename = params.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;

    return r2StorageProvider.generatePresignedUploadUrl({
      key,
      contentType: params.contentType,
      contentLength: params.contentLength,
      expiresInSeconds: 900,
    });
  }

  public async saveMedia(data: {
    name: string;
    key: string;
    url: string;
    type?: 'image' | 'document' | 'video' | 'other';
    mimeType: string;
    size: number;
    folder?: string;
    altText?: string;
    userId?: string;
  }): Promise<IMedia> {
    const media = await Media.create({
      ...data,
      publicUrl: data.url,
      status: 'ready',
      uploadedBy: data.userId ? new mongoose.Types.ObjectId(data.userId) : undefined,
    });
    await cacheService.deleteByPattern('axion:media:*');
    return media;
  }

  public async deleteMedia(id: string, force: boolean = false): Promise<{ message: string }> {
    return this.safeDeleteMedia(id, force);
  }
}

export const mediaService = new MediaService();
