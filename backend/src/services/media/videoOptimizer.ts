import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import { imageOptimizer, OptimizedImageResult } from './imageOptimizer.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

export interface OptimizedVideoResult {
  videoBuffer: Buffer;
  posterResult: OptimizedImageResult;
  format: 'mp4';
  contentType: 'video/mp4';
  duration?: number;
  width?: number;
  height?: number;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
}

export class VideoOptimizer {
  private isFfmpegAvailableCache: boolean | null = null;

  public async checkFfmpegAvailable(): Promise<boolean> {
    if (this.isFfmpegAvailableCache !== null) {
      return this.isFfmpegAvailableCache;
    }

    return new Promise<boolean>((resolve) => {
      ffmpeg.getAvailableCodecs((err) => {
        if (err) {
          logger.warn('[VideoOptimizer] FFmpeg is not detected on this system.');
          this.isFfmpegAvailableCache = false;
          resolve(false);
        } else {
          this.isFfmpegAvailableCache = true;
          resolve(true);
        }
      });
    });
  }

  public async optimize(
    inputBuffer: Buffer,
    originalFilename: string
  ): Promise<OptimizedVideoResult> {
    const originalSize = inputBuffer.length;
    const tempDir = os.tmpdir();
    const tempId = crypto.randomUUID();
    const ext = path.extname(originalFilename).toLowerCase() || '.mp4';
    const inputPath = path.join(tempDir, `input_${tempId}${ext}`);
    const outputPath = path.join(tempDir, `optimized_${tempId}.mp4`);
    const posterRawPath = path.join(tempDir, `poster_${tempId}.jpg`);

    const isAvailable = await this.checkFfmpegAvailable();

    if (!isAvailable) {
      // Graceful fallback for environments where FFmpeg is not yet installed:
      // Treat input video as already web-ready if it's MP4/WEBM, and generate a placeholder poster
      logger.warn('[VideoOptimizer] FFmpeg unavailable. Passing through video with generated poster.');
      
      // Generate a subtle dark poster buffer using sharp
      const fallbackPosterBuffer = await this.createFallbackPoster();
      const posterResult = await imageOptimizer.optimize(fallbackPosterBuffer, 'image/jpeg');

      return {
        videoBuffer: inputBuffer,
        posterResult,
        format: 'mp4',
        contentType: 'video/mp4',
        originalSize,
        optimizedSize: originalSize,
        reductionPercent: 0,
      };
    }

    try {
      // 1. Write input buffer to disk for ffmpeg processing
      await fs.writeFile(inputPath, inputBuffer);

      // 2. Read metadata (duration, dimensions)
      const metadata = await new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const duration = metadata.format.duration ? Math.round(metadata.format.duration) : undefined;
      const width = videoStream?.width;
      const height = videoStream?.height;

      // 3. Extract representative frame at 1 second (or 0s) for the poster
      const captureTime = duration && duration > 1 ? 1 : 0;
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(captureTime)
          .frames(1)
          .output(posterRawPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      // 4. Convert extracted frame to high-quality WebP poster
      const posterRawBuffer = await fs.readFile(posterRawPath);
      const posterResult = await imageOptimizer.optimize(posterRawBuffer, 'image/jpeg');

      // 5. Transcode and compress video to web-optimized MP4 (H.264, AAC, faststart)
      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg(inputPath)
          .output(outputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset medium',
            '-crf 23',
            '-movflags +faststart', // Web streaming: places moov atom at beginning
            '-pix_fmt yuv420p',
          ]);

        // If resolution is excessively large (4K+), scale down to 1080p
        if (width && width > 1920) {
          command.size('1920x?');
        }

        command
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });

      // 6. Read optimized video back
      const optimizedBuffer = await fs.readFile(outputPath);
      const optimizedSize = optimizedBuffer.length;
      const reductionPercent = Math.max(
        0,
        Math.round(((originalSize - optimizedSize) / originalSize) * 100)
      );

      logger.info(
        `[VideoOptimizer] Optimized video -> MP4: ${originalSize}B -> ${optimizedSize}B (${reductionPercent}% saved, ${duration || 0}s, poster: ${posterResult.optimizedSize}B)`
      );

      return {
        videoBuffer: optimizedBuffer,
        posterResult,
        format: 'mp4',
        contentType: 'video/mp4',
        duration,
        width: width && width > 1920 ? 1920 : width,
        height,
        originalSize,
        optimizedSize,
        reductionPercent,
      };
    } catch (error) {
      logger.error('[VideoOptimizer] Video optimization failed:', error);
      throw AppError.badRequest('Failed to process and optimize video.');
    } finally {
      // Clean up temporary files
      await this.safeUnlink(inputPath);
      await this.safeUnlink(outputPath);
      await this.safeUnlink(posterRawPath);
    }
  }

  private async safeUnlink(filePath: string): Promise<void> {
    try {
      if (fsSync.existsSync(filePath)) {
        await fs.unlink(filePath);
      }
    } catch {
      // non-blocking cleanup
    }
  }

  private async createFallbackPoster(): Promise<Buffer> {
    const sharp = (await import('sharp')).default;
    // Create an elegant dark navy placeholder poster with subtle blueprint gradient
    return sharp({
      create: {
        width: 1280,
        height: 720,
        channels: 3,
        background: { r: 11, g: 25, b: 44 },
      },
    })
      .jpeg()
      .toBuffer();
  }
}

export const videoOptimizer = new VideoOptimizer();
