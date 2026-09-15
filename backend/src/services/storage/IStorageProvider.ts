export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

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

export interface HeadObjectResult {
  contentLength: number;
  contentType?: string;
  eTag?: string;
  lastModified?: Date;
}

export interface IStorageProvider {
  name: string;
  isConfigured(): boolean;
  uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<StorageUploadResult>;
  deleteObject(key: string): Promise<void>;
  getPublicUrl(key: string): string;
  generatePresignedUploadUrl(
    options: PresignedUploadOptions
  ): Promise<PresignedUploadResponse>;
  headObject(key: string): Promise<HeadObjectResult | null>;
  getObjectText(key: string): Promise<string>;
  generatePresignedGetUrl(key: string, expiresInSeconds?: number): Promise<string>;
  checkPublicDomainResolves(): Promise<boolean>;
}

