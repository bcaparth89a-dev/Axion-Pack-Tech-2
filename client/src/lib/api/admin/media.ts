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
            'Cloudflare R2 rejected upload (HTTP 403 Forbidden). Presigned URL may have expired or bucket CORS policy blocked the request.'
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
          'Direct R2 upload blocked by browser (CORS / Network error). Please ensure Cloudflare R2 bucket CORS is configured to allow origin http://localhost:3000 with PUT method.'
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
 * Composite helper for complete Direct-to-R2 upload flow
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
  const contentType = file.type || 'application/octet-stream';

  // 1. Initiate
  const init = await initiateMediaUploadAdmin({
    fileName: file.name,
    contentType,
    size: file.size,
    category,
  });

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
  } catch (err: unknown) {
    // Clean up failed record
    await failMediaUploadAdmin(init.mediaId, (err as Error)?.message);
    throw err;
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
