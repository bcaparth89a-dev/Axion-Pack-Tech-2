import crypto from 'crypto';
import { IStorageProvider, StorageUploadResult } from './IStorageProvider.js';
import { r2StorageProvider } from './R2StorageProvider.js';
import { logger } from '../../utils/logger.js';

export class StorageService {
  private provider: IStorageProvider;

  constructor(provider: IStorageProvider = r2StorageProvider) {
    this.provider = provider;
  }

  public isConfigured(): boolean {
    return this.provider.isConfigured();
  }

  public getProviderName(): string {
    return this.provider.name;
  }

  public generateKey(
    folder: string,
    extension: string
  ): string {
    const year = new Date().getFullYear();
    const uniqueId = crypto.randomUUID();
    const cleanExt = extension.replace(/^\.+/, '').toLowerCase();
    const cleanFolder = (folder || 'general').replace(/^\/+|\/+$/g, '');
    return `${cleanFolder}/${year}/${uniqueId}.${cleanExt}`;
  }


  public generateStructuredKey(category: string, filename: string): string {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const cleanCat = (category || 'general').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const parts = filename.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
    const base = parts.join('-').toLowerCase().replace(/[^a-z0-9-_]/g, '-').slice(0, 40) || 'file';
    return `media/${cleanCat}/${year}/${month}/${uniqueId}-${base}.${ext}`;
  }

  public async generatePresignedUploadUrl(options: {
    key: string;
    contentType: string;
    contentLength?: number;
    expiresInSeconds?: number;
  }) {
    return this.provider.generatePresignedUploadUrl(options);
  }

  public async headObject(key: string) {
    return this.provider.headObject(key);
  }

  public async getObjectText(key: string): Promise<string> {
    return this.provider.getObjectText(key);
  }

  public async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<StorageUploadResult> {
    return this.provider.uploadBuffer(key, buffer, contentType);
  }

  public async deleteObject(key: string): Promise<void> {
    return this.provider.deleteObject(key);
  }

  public getPublicUrl(key: string): string {
    return this.provider.getPublicUrl(key);
  }

  public async generatePresignedGetUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.provider.generatePresignedGetUrl(key, expiresInSeconds);
  }

  public async checkPublicDomainResolves(): Promise<boolean> {
    return this.provider.checkPublicDomainResolves();
  }

  public async safeCleanup(key?: string): Promise<void> {
    if (!key) return;
    try {
      await this.provider.deleteObject(key);
      logger.info(`[StorageService] Cleaned up orphaned object: ${key}`);
    } catch (err) {
      logger.error(`[StorageService] Failed to clean up orphaned object ${key}:`, err);
    }
  }
}

export const storageService = new StorageService();
