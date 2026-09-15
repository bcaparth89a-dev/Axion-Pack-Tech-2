import sharp from 'sharp';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

export interface OptimizedImageResult {
  buffer: Buffer;
  format: 'webp';
  contentType: 'image/webp';
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
}

const SUPPORTED_INPUT_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'avif'];
const MAX_DIMENSION = 1920; // High-def slider desktop width
const WEBP_QUALITY = 84;

export class ImageOptimizer {
  public async optimize(
    inputBuffer: Buffer,
    originalMimeType?: string
  ): Promise<OptimizedImageResult> {
    try {
      const originalSize = inputBuffer.length;
      const metadata = await sharp(inputBuffer).metadata();

      if (!metadata.format || !SUPPORTED_INPUT_FORMATS.includes(metadata.format)) {
        throw AppError.badRequest(
          `Unsupported image format: ${metadata.format || originalMimeType || 'unknown'}. Accepted formats: JPG, PNG, WEBP, AVIF.`
        );
      }

      const originalWidth = metadata.width || 1200;
      const originalHeight = metadata.height || 800;

      // Pipeline: resize if exceeds max bounds, strip EXIF metadata, convert to WebP
      let pipeline = sharp(inputBuffer).rotate(); // auto-rotate based on EXIF orientation

      if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
        pipeline = pipeline.resize({
          width: originalWidth >= originalHeight ? MAX_DIMENSION : undefined,
          height: originalHeight > originalWidth ? MAX_DIMENSION : undefined,
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      const outputBuffer = await pipeline
        .webp({
          quality: WEBP_QUALITY,
          effort: 5,
          lossless: false,
        })
        .toBuffer();

      const outputMetadata = await sharp(outputBuffer).metadata();
      const optimizedSize = outputBuffer.length;
      const reductionPercent = Math.max(
        0,
        Math.round(((originalSize - optimizedSize) / originalSize) * 100)
      );

      logger.info(
        `[ImageOptimizer] Optimized ${metadata.format.toUpperCase()} -> WebP: ${originalSize}B -> ${optimizedSize}B (${reductionPercent}% saved, ${outputMetadata.width}x${outputMetadata.height})`
      );

      return {
        buffer: outputBuffer,
        format: 'webp',
        contentType: 'image/webp',
        width: outputMetadata.width || originalWidth,
        height: outputMetadata.height || originalHeight,
        originalSize,
        optimizedSize,
        reductionPercent,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('[ImageOptimizer] Image optimization failed:', error);
      throw AppError.badRequest('Failed to process and optimize image.');
    }
  }
}

export const imageOptimizer = new ImageOptimizer();
