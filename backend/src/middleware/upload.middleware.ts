import multer from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/appError.js';

const storage = multer.memoryStorage();

const ACCEPTED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const ACCEPTED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
];

export const uploadImageMiddleware = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB max image upload
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ACCEPTED_IMAGE_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          `Unsupported image format: ${file.mimetype}. Accepted formats: JPG, PNG, WEBP, AVIF.`
        )
      );
    }
  },
}).single('file');

export const uploadVideoMiddleware = multer({
  storage,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60 MB max video upload
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ACCEPTED_VIDEO_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          `Unsupported video format: ${file.mimetype}. Accepted formats: MP4, WEBM, MOV.`
        )
      );
    }
  },
}).single('file');

const ACCEPTED_RESUME_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
];

const ACCEPTED_RESUME_EXTS = ['.pdf', '.doc', '.docx'];

export const uploadResumeMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max resume file size
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const ext = '.' + (file.originalname.split('.').pop() || '').toLowerCase();
    const isMimeValid = ACCEPTED_RESUME_MIMES.includes(file.mimetype);
    const isExtValid = ACCEPTED_RESUME_EXTS.includes(ext);

    if (isMimeValid && isExtValid) {
      cb(null, true);
    } else {
      cb(
        AppError.badRequest(
          `Unsupported resume file format (${ext || file.mimetype}). Accepted formats: PDF, DOC, DOCX.`
        )
      );
    }
  },
}).single('resume');

