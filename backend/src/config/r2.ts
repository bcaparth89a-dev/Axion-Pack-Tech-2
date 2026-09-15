import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../utils/logger.js';

let s3ClientInstance: S3Client | null = null;

export const getR2Client = (): S3Client => {
  if (s3ClientInstance) {
    return s3ClientInstance;
  }

  const accountId = process.env.R2_ACCOUNT_ID || 'dummy_account';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'dummy_key';
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'dummy_secret';

  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3ClientInstance;
};

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  contentLength?: number;
  expiresInSeconds?: number;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export const generatePresignedUploadUrl = async (
  options: PresignedUploadOptions
): Promise<PresignedUploadResponse> => {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || 'axion-packtech-media';
  const expiresIn = options.expiresInSeconds || 900; // 15 minutes default

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: options.key,
    ContentType: options.contentType,
    ...(options.contentLength ? { ContentLength: options.contentLength } : {}),
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn });
    const publicBaseUrl = (process.env.R2_PUBLIC_URL || 'https://media.axionpacktech.com').replace(
      /\/$/,
      ''
    );
    const publicUrl = `${publicBaseUrl}/${options.key}`;

    return {
      uploadUrl,
      key: options.key,
      publicUrl,
      expiresIn,
    };
  } catch (error) {
    logger.error('Failed to generate presigned upload URL for R2:', error);
    throw error;
  }
};

export const deleteR2Object = async (key: string): Promise<void> => {
  const s3 = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || 'axion-packtech-media';

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    logger.info(`Object deleted from Cloudflare R2: ${key}`);
  } catch (error) {
    logger.error(`Error deleting object ${key} from R2:`, error);
    throw error;
  }
};
