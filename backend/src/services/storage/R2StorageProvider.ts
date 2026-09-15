import dns from 'dns';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  IStorageProvider,
  StorageUploadResult,
  PresignedUploadOptions,
  PresignedUploadResponse,
  HeadObjectResult,
} from './IStorageProvider.js';
import { logger } from '../../utils/logger.js';
import { AppError } from '../../utils/appError.js';

export class R2StorageProvider implements IStorageProvider {
  public readonly name = 'Cloudflare R2';
  private s3Client: S3Client | null = null;

  public isConfigured(): boolean {
    const accountId = process.env.R2_ACCOUNT_ID?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const bucketName = process.env.R2_BUCKET_NAME?.trim();

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return false;
    }

    // Ignore placeholder values from .env.example
    const placeholders = [
      'your_cloudflare_account_id',
      'your_r2_access_key_id',
      'your_r2_secret_access_key',
      'dummy_account',
      'dummy_key',
      'dummy_secret',
    ];

    if (
      placeholders.includes(accountId) ||
      placeholders.includes(accessKeyId) ||
      placeholders.includes(secretAccessKey)
    ) {
      return false;
    }

    return true;
  }

  private getClient(): S3Client {
    if (!this.isConfigured()) {
      throw AppError.badRequest(
        'Cloudflare R2 storage is not configured. Please supply valid R2 environment credentials.'
      );
    }

    if (this.s3Client) {
      return this.s3Client;
    }

    const accountId = process.env.R2_ACCOUNT_ID!.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID!.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!.trim();
    const customEndpoint = process.env.R2_ENDPOINT?.trim();

    const endpoint =
      customEndpoint || `https://${accountId}.r2.cloudflarestorage.com`;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });

    return this.s3Client;
  }

  public getPublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, '');
    const publicBase = (
      process.env.R2_PUBLIC_URL ||
      process.env.R2_PUBLIC_BASE_URL ||
      'https://media.axionpacktech.com'
    ).replace(/\/+$/, '');

    return `${publicBase}/${cleanKey}`;
  }

  public async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<StorageUploadResult> {
    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = key.replace(/^\/+/, '');

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length,
      });

      await client.send(command);
      const url = this.getPublicUrl(cleanKey);

      logger.info(`[R2StorageProvider] Successfully uploaded object to R2: ${cleanKey} (${buffer.length} bytes)`);

      return {
        key: cleanKey,
        url,
        size: buffer.length,
        contentType,
      };
    } catch (error) {
      logger.error(`[R2StorageProvider] Failed to upload object ${cleanKey} to Cloudflare R2:`, error);
      throw AppError.internal('Failed to upload file to Cloudflare R2 storage.');
    }
  }

  public async deleteObject(key: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = key.replace(/^\/+/, '');

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });

      await client.send(command);
      logger.info(`[R2StorageProvider] Deleted object from Cloudflare R2: ${cleanKey}`);
    } catch (error) {
      logger.error(`[R2StorageProvider] Error deleting object ${cleanKey} from R2:`, error);
      // Non-blocking deletion warning
    }
  }

  public async generatePresignedUploadUrl(
    options: PresignedUploadOptions
  ): Promise<PresignedUploadResponse> {
    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = options.key.replace(/^\/+/, '');
    const expiresIn = options.expiresInSeconds || 900; // 15 mins

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
        ContentType: options.contentType,
      });

      const uploadUrl = await getSignedUrl(client, command, {
        expiresIn,
        signableHeaders: new Set(['host', 'content-type']),
      });
      const publicUrl = this.getPublicUrl(cleanKey);

      return {
        uploadUrl,
        key: cleanKey,
        publicUrl,
        expiresIn,
      };
    } catch (error) {
      logger.error(`[R2StorageProvider] Failed to generate presigned upload URL for ${cleanKey}:`, error);
      throw AppError.internal('Failed to generate presigned upload URL.');
    }
  }

  public async headObject(key: string): Promise<HeadObjectResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = key.replace(/^\/+/, '');

    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });

      const response = await client.send(command);
      return {
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType,
        eTag: response.ETag,
        lastModified: response.LastModified,
      };
    } catch (error: any) {
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        return null;
      }
      logger.error(`[R2StorageProvider] Error checking headObject for ${cleanKey}:`, error);
      throw error;
    }
  }

  public async getObjectText(key: string): Promise<string> {
    if (!this.isConfigured()) {
      return '';
    }

    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = key.replace(/^\/+/, '');

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });

      const response = await client.send(command);
      if (!response.Body) {
        return '';
      }
      return await response.Body.transformToString('utf-8');
    } catch (error: any) {
      if (error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404) {
        return '';
      }
      logger.error(`[R2StorageProvider] Error reading object text for ${cleanKey}:`, error);
      throw error;
    }
  }

  public async generatePresignedGetUrl(
    key: string,
    expiresInSeconds: number = 900
  ): Promise<string> {
    const client = this.getClient();
    const bucket = process.env.R2_BUCKET_NAME!.trim();
    const cleanKey = key.replace(/^\/+/, '');

    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: cleanKey,
      });

      return await getSignedUrl(client, command, {
        expiresIn: expiresInSeconds,
      });
    } catch (error) {
      logger.error(`[R2StorageProvider] Failed to generate presigned GET URL for ${cleanKey}:`, error);
      throw AppError.internal('Failed to generate presigned media access URL.');
    }
  }

  public async checkPublicDomainResolves(): Promise<boolean> {
    const publicBase = (
      process.env.R2_PUBLIC_URL ||
      process.env.R2_PUBLIC_BASE_URL ||
      'https://media.axionpacktech.com'
    ).trim();

    try {
      const parsed = new URL(publicBase);
      const addresses = await dns.promises.lookup(parsed.hostname);
      return Boolean(addresses && addresses.address);
    } catch {
      return false;
    }
  }
}

export const r2StorageProvider = new R2StorageProvider();
