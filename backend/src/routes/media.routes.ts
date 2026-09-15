import { Router } from 'express';
import {
  getMediaConfig,
  getMediaFile,
  initiateUpload,
  completeUpload,
  failUpload,
  cleanupStaleUploads,
  optimizeAndUploadImage,
  optimizeAndUploadVideo,
  registerExternalMedia,
  getUploadUrl,
  saveMediaMetadata,
  getMediaList,
  checkMediaUsage,
  deleteMedia,
} from '../controllers/media.controller.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import {
  initiateUploadSchema,
  completeUploadSchema,
  presignedUploadUrlSchema,
  saveMediaMetadataSchema,
} from '../validators/media.validator.js';
import { uploadUrlLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireEditorOrAdmin } from '../middleware/authorization.middleware.js';
import {
  uploadImageMiddleware,
  uploadVideoMiddleware,
} from '../middleware/upload.middleware.js';

const router = Router();

// 1. Public Media Endpoints
router.get('/config', getMediaConfig);
router.get('/file/:key(*)', getMediaFile);

// 2. Protected Media Management Endpoints
router.use(authenticate, requireEditorOrAdmin);

// Direct-to-R2 Upload Pipeline (Presigned PUT URLs, Zero VPS Proxying)
router.post(
  '/upload/initiate',
  uploadUrlLimiter,
  validateRequest(initiateUploadSchema),
  initiateUpload
);

router.post(
  '/upload/complete',
  validateRequest(completeUploadSchema),
  completeUpload
);

router.post('/upload/failed', failUpload);

// Conservative Stale Upload Cleanup
router.post('/cleanup-stale', cleanupStaleUploads);

// Legacy/Compatibility endpoints
router.post('/optimize/image', uploadImageMiddleware, optimizeAndUploadImage);
router.post('/optimize/video', uploadVideoMiddleware, optimizeAndUploadVideo);
router.post('/external', registerExternalMedia);

router.post(
  '/upload-url',
  uploadUrlLimiter,
  validateRequest(presignedUploadUrlSchema),
  getUploadUrl
);

router.post(
  '/metadata',
  validateRequest(saveMediaMetadataSchema),
  saveMediaMetadata
);

router.get('/', getMediaList);
router.get('/:id/usage', checkMediaUsage);
router.delete('/:id', deleteMedia);

export default router;
