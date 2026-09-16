import { z } from 'zod';

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'image/heic',
  'image/bmp',
  'image/tiff',
] as const;

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-matroska', // .mkv
  'video/ogg',
  'video/m4v',
  'video/x-msvideo', // .avi
] as const;

export const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
] as const;

export const ALL_ALLOWED_MIMES = [
  ...ALLOWED_IMAGE_MIMES,
  ...ALLOWED_VIDEO_MIMES,
  ...ALLOWED_DOCUMENT_MIMES,
] as const;

export function normalizeMimeType(fileName?: string, reportedMime?: string): string {
  const mime = (reportedMime || '').toLowerCase().trim();
  if (mime && ALL_ALLOWED_MIMES.includes(mime as any)) {
    return mime === 'image/jpg' ? 'image/jpeg' : mime;
  }

  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt':
      return 'text/plain';
    default:
      return mime || 'application/octet-stream';
  }
}

export const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150MB
export const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB

export function getMaxAllowedSize(mimeType: string): number {
  if (ALLOWED_IMAGE_MIMES.includes(mimeType as any)) return MAX_IMAGE_SIZE;
  if (ALLOWED_VIDEO_MIMES.includes(mimeType as any)) return MAX_VIDEO_SIZE;
  if (ALLOWED_DOCUMENT_MIMES.includes(mimeType as any)) return MAX_DOCUMENT_SIZE;
  return MAX_IMAGE_SIZE;
}

export function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'document' | 'other' {
  if (ALLOWED_IMAGE_MIMES.includes(mimeType as any)) return 'image';
  if (ALLOWED_VIDEO_MIMES.includes(mimeType as any)) return 'video';
  if (ALLOWED_DOCUMENT_MIMES.includes(mimeType as any)) return 'document';
  return 'other';
}

export const initiateUploadSchema = z.object({
  body: z.object({
    fileName: z
      .string()
      .trim()
      .min(1, 'File name is required')
      .max(255, 'File name too long'),
    contentType: z.string().trim(),
    size: z
      .number()
      .int()
      .positive('File size must be positive')
      .refine((size) => size <= MAX_VIDEO_SIZE, {
        message: 'File exceeds absolute maximum limit (150MB)',
      }),
    category: z
      .string()
      .trim()
      .default('general'),
    entityType: z.string().trim().optional(),
    entityId: z.string().trim().optional(),
  }).transform((data) => {
    const normalized = normalizeMimeType(data.fileName, data.contentType);
    return {
      ...data,
      contentType: normalized,
    };
  }).refine(
    (data) => ALL_ALLOWED_MIMES.includes(data.contentType as any),
    (data) => ({
      message: `Unsupported file type: "${data.contentType}". Supported types: JPG, PNG, WebP, GIF, SVG, AVIF, MP4, WebM, MOV, PDF.`,
      path: ['contentType'],
    })
  ),
});

export const completeUploadSchema = z.object({
  body: z.object({
    mediaId: z
      .string()
      .trim()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid mediaId ObjectId'),
    key: z.string().trim().min(1, 'Object key is required'),
    altText: z.string().trim().optional(),
    title: z.string().trim().optional(),
    caption: z.string().trim().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().positive().optional(),
  }),
});

export const presignedUploadUrlSchema = z.object({
  body: z.object({
    filename: z.string().min(1, 'Filename is required'),
    contentType: z.string().min(1, 'Content-Type is required'),
    folder: z.string().default('general'),
    contentLength: z.number().int().positive().max(157286400, 'Max file size is 150MB').optional(),
  }),
});

export const saveMediaMetadataSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Media name is required'),
    key: z.string().min(1, 'Storage key is required'),
    url: z.string().url('Valid URL is required'),
    type: z.enum(['image', 'document', 'video', 'other']).default('image'),
    mimeType: z.string().min(1, 'Mime type is required'),
    size: z.number().int().nonnegative(),
    folder: z.string().default('general'),
    altText: z.string().optional(),
  }),
});
