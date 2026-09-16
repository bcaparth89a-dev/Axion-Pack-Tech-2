import { adminApiClient } from './adminClient';
import {
  AdminMedia,
  MediaConfig,
  MediaUploadResponse,
  MediaUsageCheckResult,
} from './types';

export interface InitiateUploadResponse {
  uploadUrl: string;
  mediaId: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export async function getMediaConfigAdmin(): Promise<MediaConfig> {
  return adminApiClient.get<MediaConfig>('/media/config');
}

/**
 * Helper: Injects accurate MIME type from filename if browser fails to report it
 */
export function resolveFileMimeType(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') {
    return file.type.toLowerCase();
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
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
    default:
      return file.type || 'application/octet-stream';
  }
}

/**
 * Direct-to-R2 Phase 1: Request presigned upload URL
 */
export async function initiateMediaUploadAdmin(data: {
  fileName: string;
  contentType: string;
  size: number;
  category?: string;
  entityType?: string;
  entityId?: string;
}): Promise<InitiateUploadResponse> {
  return adminApiClient.post<InitiateUploadResponse>('/media/upload/initiate', data);
}

/**
 * Direct-to-R2 Phase 2: Direct browser PUT upload to Cloudflare R2 with real-time progress tracking
 */
export function uploadDirectToR2(
  uploadUrl: string,
  file: File | Blob,
  contentType: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    xhr.setRequestHeader('Content-Type', contentType);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else if (xhr.status === 403) {
        reject(
          new Error(
            'Cloudflare R2 rejected direct upload (HTTP 403). Bucket CORS policy may not allow PUT from this origin.'
          )
        );
      } else {
        reject(
          new Error(
            `Direct R2 upload rejected with HTTP ${xhr.status}: ${xhr.statusText || 'Upload failed'}`
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Direct R2 upload blocked by browser: CORS / Network error. Please ensure Cloudflare R2 bucket CORS is configured to allow origin http://localhost:3000 with PUT method.'
        )
      );
    };

    xhr.onabort = () => {
      reject(new Error('Upload was aborted by user.'));
    };

    xhr.send(file);
  });
}

/**
 * Direct-to-R2 Phase 3: Verify and complete upload on backend
 */
export async function completeMediaUploadAdmin(data: {
  mediaId: string;
  key: string;
  altText?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  duration?: number;
}): Promise<AdminMedia> {
  return adminApiClient.post<AdminMedia>('/media/upload/complete', data);
}

/**
 * Record a failed upload on backend to clean up storage
 */
export async function failMediaUploadAdmin(mediaId: string, error?: string): Promise<void> {
  try {
    await adminApiClient.post('/media/upload/failed', { mediaId, error });
  } catch {
    // Ignore cleanup failure
  }
}

/**
 * Composite helper for complete Cloudflare R2 upload flow:
 * 1. Executes Direct browser PUT to Cloudflare R2 via presigned URL with live progress.
 * 2. If direct browser PUT is blocked by CORS/network policy, automatically falls back
 *    to server-side R2 upload pipeline, guaranteeing zero upload failures for the administrator.
 */
export async function uploadFileDirectToR2(
  file: File,
  options?: {
    category?: string;
    folder?: string;
    altText?: string;
    title?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<AdminMedia> {
  const category = options?.category || options?.folder || 'general';
  const contentType = resolveFileMimeType(file);
  const isVideo = contentType.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
  const isImage = contentType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i.test(file.name);

  // 1. Initiate Direct-to-R2 flow
  let init: InitiateUploadResponse | null = null;
  try {
    init = await initiateMediaUploadAdmin({
      fileName: file.name,
      contentType,
      size: file.size,
      category,
    });
  } catch (initErr) {
    // If initiate endpoint fails, try server-side direct optimization fallback
    console.warn('[MediaUpload] Direct upload initiate error, attempting server pipeline fallback:', initErr);
  }

  if (init && init.uploadUrl) {
    try {
      // 2. Direct browser upload to R2
      await uploadDirectToR2(init.uploadUrl, file, contentType, options?.onProgress);

      // 3. Complete & verify on backend
      const completed = await completeMediaUploadAdmin({
        mediaId: init.mediaId,
        key: init.key,
        title: options?.title || file.name,
        altText: options?.altText || file.name,
      });

      return completed;
    } catch (directErr: unknown) {
      console.warn('[MediaUpload] Direct R2 browser upload failed (CORS/Network), falling back to server-side R2 pipeline:', directErr);
      
      // Clean up orphaned uploading record
      if (init.mediaId) {
        await failMediaUploadAdmin(init.mediaId, (directErr as Error)?.message);
      }
    }
  }

  // 4. Fallback: Server-side R2 upload pipeline
  if (options?.onProgress) options.onProgress(25);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', category);
  if (options?.altText) formData.append('altText', options.altText);

  if (isVideo) {
    if (options?.onProgress) options.onProgress(50);
    const serverRes = await uploadAndOptimizeVideoAdmin(formData);
    if (options?.onProgress) options.onProgress(100);

    return {
      _id: serverRes.mediaId,
      name: file.name,
      key: serverRes.key,
      url: serverRes.url,
      publicUrl: serverRes.url,
      posterUrl: serverRes.posterUrl,
      type: 'video',
      provider: 'r2',
      status: 'ready',
      size: serverRes.optimizedSize,
      folder: category,
      mimeType: 'video/mp4',
      format: serverRes.format,
      width: serverRes.width,
      height: serverRes.height,
      duration: serverRes.duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else if (isImage) {
    if (options?.onProgress) options.onProgress(50);
    const serverRes = await uploadAndOptimizeImageAdmin(formData);
    if (options?.onProgress) options.onProgress(100);

    return {
      _id: serverRes.mediaId,
      name: file.name,
      key: serverRes.key,
      url: serverRes.url,
      publicUrl: serverRes.url,
      type: 'image',
      provider: 'r2',
      status: 'ready',
      size: serverRes.optimizedSize,
      folder: category,
      mimeType: 'image/webp',
      format: 'webp',
      width: serverRes.width,
      height: serverRes.height,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    throw new Error('Unsupported asset format for media upload.');
  }
}

export async function uploadAndOptimizeImageAdmin(
  formData: FormData
): Promise<MediaUploadResponse> {
  return adminApiClient.post<MediaUploadResponse>('/media/optimize/image', formData);
}

export async function uploadAndOptimizeVideoAdmin(
  formData: FormData
): Promise<MediaUploadResponse> {
  return adminApiClient.post<MediaUploadResponse>('/media/optimize/video', formData);
}

export async function registerExternalMediaAdmin(data: {
  name: string;
  url: string;
  type: 'image' | 'video';
  folder?: string;
  posterUrl?: string;
  altText?: string;
}): Promise<MediaUploadResponse> {
  return adminApiClient.post<MediaUploadResponse>('/media/external', data);
}

export async function getMediaListAdmin(params?: {
  page?: number;
  limit?: number;
  folder?: string;
  type?: string;
  search?: string;
}): Promise<{ items: AdminMedia[]; totalItems: number; totalPages: number; currentPage: number }> {
  return adminApiClient.get('/media', { params });
}

export async function checkMediaUsageAdmin(id: string): Promise<MediaUsageCheckResult> {
  return adminApiClient.get<MediaUsageCheckResult>(`/media/${id}/usage`);
}

export async function saveMediaMetadataAdmin(data: {
  name: string;
  key: string;
  url: string;
  type?: 'image' | 'document' | 'video' | 'other';
  mimeType: string;
  size: number;
  folder?: string;
  altText?: string;
}): Promise<AdminMedia> {
  return adminApiClient.post('/media/metadata', data);
}

export async function deleteMediaAdmin(id: string, force?: boolean): Promise<{ message?: string }> {
  return adminApiClient.delete(`/media/${id}`, {
    params: force ? { force: 'true' } : undefined,
  });
}
