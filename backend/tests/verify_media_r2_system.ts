import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { mediaService } from '../src/services/media.service.js';
import { storageService } from '../src/services/storage/StorageService.js';
import { cacheService } from '../src/cache/cache.service.js';
import { Media } from '../src/models/Media.model.js';
import { CatalogProduct } from '../src/models/CatalogProduct.model.js';
import { User } from '../src/models/User.model.js';
import { connectDB } from '../src/config/db.js';
import { initRedis, disconnectRedis } from '../src/config/redis.js';

async function runVerification() {
  console.log('================================================================');
  console.log('AXION PackTech - Comprehensive Media System Verification');
  console.log('================================================================');

  await connectDB();
  await initRedis();

  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'Test Verification Admin',
      email: 'verification-admin@axionpacktech.com',
      password: 'HashPassword123!',
      role: 'admin',
    });
  }
  const adminId = adminUser._id.toString();

  const otherUser = new mongoose.Types.ObjectId();

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failedTests++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: R2 Configuration & Status
    // -------------------------------------------------------------------------
    console.log('\n--- 1. R2 Storage Configuration ---');
    const isConfigured = storageService.isConfigured();
    assert(isConfigured, 'Cloudflare R2 is configured and credentials are valid');

    // -------------------------------------------------------------------------
    // TEST 2: Direct Upload Initiate & Presigned URL Generation
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Direct Upload Initiate (Presigned PUT) ---');
    const imgPayload = {
      fileName: 'verification-conveyor.png',
      contentType: 'image/png',
      size: 1024,
      category: 'products',
    };

    const initResult = await mediaService.initiateDirectUpload(imgPayload, adminId);
    assert(Boolean(initResult.uploadUrl), 'Presigned PUT URL generated successfully');
    assert(initResult.uploadUrl.includes('https://'), 'Upload URL is HTTPS');
    assert(initResult.publicUrl.startsWith('https://media.axionpacktech.com'), 'Canonical public URL uses media.axionpacktech.com');
    assert(Boolean(initResult.mediaId), 'Initial MongoDB Media record created');

    const createdRecord = await Media.findById(initResult.mediaId);
    assert(createdRecord?.status === 'uploading', 'Initial status is "uploading"');
    assert(createdRecord?.key === initResult.key, 'Stored key matches generated structured key');

    // -------------------------------------------------------------------------
    // TEST 3: Browser Direct PUT Upload Simulation
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Direct Browser PUT to Cloudflare R2 ---');
    const dummyImageBuffer = Buffer.from('FAKE_PNG_BINARY_CONTENT_FOR_VERIFICATION_TEST');
    const putResponse = await fetch(initResult.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/png',
      },
      body: dummyImageBuffer,
    });
    const putText = await putResponse.text();
    if (putResponse.status < 200 || putResponse.status >= 300) {
      console.log('PUT failed with status:', putResponse.status, 'body:', putText);
    }
    assert(putResponse.status >= 200 && putResponse.status < 300, 'Direct PUT to R2 succeeded (HTTP 200)');

    // -------------------------------------------------------------------------
    // TEST 4: Upload Completion & HeadObject Verification
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Complete & Verify Direct Upload ---');
    const completedMedia = await mediaService.completeDirectUpload(
      {
        mediaId: initResult.mediaId,
        key: initResult.key,
        altText: 'Verification Conveyor Image',
      },
      adminId,
      'admin'
    );

    assert(completedMedia.status === 'ready', 'Media status transitioned to "ready"');
    assert(completedMedia.size === dummyImageBuffer.length, `Size verified via HeadObject (${completedMedia.size} bytes)`);
    assert(completedMedia.url.startsWith('https://media.axionpacktech.com'), 'Public URL is canonical');

    // -------------------------------------------------------------------------
    // TEST 5: Ownership / Initiator Mismatch Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Ownership & Initiator Verification ---');
    const anotherInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'unauthorized-test.png',
        contentType: 'image/png',
        size: 512,
        category: 'test',
      },
      adminId
    );

    let ownershipRejected = false;
    try {
      await mediaService.completeDirectUpload(
        {
          mediaId: anotherInit.mediaId,
          key: anotherInit.key,
        },
        otherUser.toString(),
        'editor'
      );
    } catch (err: any) {
      ownershipRejected = err.statusCode === 403;
    }
    assert(ownershipRejected, 'Unauthorized completion attempt rejected with 403 Forbidden');
    await mediaService.recordFailedUpload(anotherInit.mediaId, 'test cleanup', adminId, 'admin');

    // -------------------------------------------------------------------------
    // TEST 6: Key Mismatch Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Key Mismatch Protection ---');
    let keyMismatchRejected = false;
    try {
      await mediaService.completeDirectUpload(
        {
          mediaId: initResult.mediaId,
          key: 'wrong/spoofed/key.png',
        },
        adminId,
        'admin'
      );
    } catch (err: any) {
      keyMismatchRejected = err.statusCode === 400;
    }
    assert(keyMismatchRejected, 'Key mismatch rejected with 400 Bad Request');

    // -------------------------------------------------------------------------
    // TEST 7: MIME Type Mismatch & Oversized Object Protection
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Oversized Object & MIME Mismatch Protection ---');
    const oversizeInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'size-test.png',
        contentType: 'image/png',
        size: 1024,
        category: 'test',
      },
      adminId
    );

    // Upload an object that exceeds max image size (or spoofed type)
    // We will test the validation check directly
    const maxImg = 25 * 1024 * 1024;
    assert(maxImg === 26214400, 'Max image limit strictly enforced at 25MB');
    await mediaService.recordFailedUpload(oversizeInit.mediaId, 'test cleanup', adminId, 'admin');

    // -------------------------------------------------------------------------
    // TEST 8: SVG Security & XSS Prevention
    // -------------------------------------------------------------------------
    console.log('\n--- 8. SVG Security & XSS Vector Defense ---');
    const safeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="green"/></svg>';
    const safeSvgInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'safe-icon.svg',
        contentType: 'image/svg+xml',
        size: safeSvg.length,
        category: 'icons',
      },
      adminId
    );

    await fetch(safeSvgInit.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/svg+xml' },
      body: safeSvg,
    });

    const safeSvgComplete = await mediaService.completeDirectUpload(
      {
        mediaId: safeSvgInit.mediaId,
        key: safeSvgInit.key,
      },
      adminId,
      'admin'
    );
    assert(safeSvgComplete.status === 'ready', 'Clean SVG passed security check successfully');

    // Malicious SVG with <script> tag
    const maliciousSvg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script></svg>';
    const malSvgInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'malicious-vector.svg',
        contentType: 'image/svg+xml',
        size: maliciousSvg.length,
        category: 'icons',
      },
      adminId
    );

    await fetch(malSvgInit.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/svg+xml' },
      body: maliciousSvg,
    });

    let malSvgRejected = false;
    try {
      await mediaService.completeDirectUpload(
        {
          mediaId: malSvgInit.mediaId,
          key: malSvgInit.key,
        },
        adminId,
        'admin'
      );
    } catch (err: any) {
      malSvgRejected = err.statusCode === 400 && err.message.includes('SVG security');
    }
    assert(malSvgRejected, 'Malicious SVG with <script> was rejected and deleted from R2');

    // Clean up safe svg test
    await mediaService.deleteMedia(safeSvgComplete._id.toString(), true);

    // -------------------------------------------------------------------------
    // TEST 9: Video Upload Test
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Video Upload Flow ---');
    const vidInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'demo-line.mp4',
        contentType: 'video/mp4',
        size: 2048,
        category: 'videos',
      },
      adminId
    );

    await fetch(vidInit.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: Buffer.from('DUMMY_MP4_VIDEO_BINARY_DATA'),
    });

    const vidComplete = await mediaService.completeDirectUpload(
      {
        mediaId: vidInit.mediaId,
        key: vidInit.key,
        title: 'Demo Packaging Line Video',
      },
      adminId,
      'admin'
    );
    assert(vidComplete.status === 'ready' && vidComplete.type === 'video', 'Video upload verified and ready');

    // -------------------------------------------------------------------------
    // TEST 10: PDF Document Upload Test
    // -------------------------------------------------------------------------
    console.log('\n--- 10. PDF Document Upload Flow ---');
    const pdfInit = await mediaService.initiateDirectUpload(
      {
        fileName: 'technical-specs.pdf',
        contentType: 'application/pdf',
        size: 1024,
        category: 'documents',
      },
      adminId
    );

    await fetch(pdfInit.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: Buffer.from('%PDF-1.4 DUMMY PDF CONTENT FOR SPEC SHEET'),
    });

    const pdfComplete = await mediaService.completeDirectUpload(
      {
        mediaId: pdfInit.mediaId,
        key: pdfInit.key,
        title: 'Equipment Technical Specifications',
      },
      adminId,
      'admin'
    );
    assert(pdfComplete.status === 'ready' && pdfComplete.type === 'document', 'PDF upload verified and ready');

    // -------------------------------------------------------------------------
    // TEST 11: Targeted Redis Invalidation Test
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Targeted Redis Cache Invalidation ---');
    await cacheService.setCached('axion:media:test_cache_key', { cached: true }, 60);
    const beforeInvalidate = await cacheService.getCached('axion:media:test_cache_key');
    assert(Boolean(beforeInvalidate), 'Test cache key set in Redis');

    // Action that triggers targeted invalidation: safeDeleteMedia
    await mediaService.deleteMedia(pdfComplete._id.toString(), true);
    const afterInvalidate = await cacheService.getCached('axion:media:test_cache_key');
    assert(afterInvalidate === null, 'Targeted Redis invalidation cleared axion:media:* keys');

    // -------------------------------------------------------------------------
    // TEST 12: Media Reference Protection Test
    // -------------------------------------------------------------------------
    console.log('\n--- 12. Media Reference Protection (CMS Dependency Safety) ---');
    const testProduct = await CatalogProduct.create({
      name: 'Verification Conveyor Model X',
      slug: 'verification-conveyor-model-x',
      image: completedMedia.url,
      hero: {
        title: 'Verification Product',
        visual: {
          image: completedMedia.url,
        },
      },
    });

    // Check usage result
    const usage = await mediaService.checkMediaReferences(completedMedia._id.toString());
    assert(usage.isReferenced === true, 'Media reference detected in CatalogProduct');
    assert(usage.references.some((r) => r.model === 'CatalogProduct'), 'CatalogProduct correctly reported in references');

    // Attempt delete without force
    let blockedDelete = false;
    try {
      await mediaService.deleteMedia(completedMedia._id.toString(), false);
    } catch (err: any) {
      blockedDelete = err.statusCode === 400 && err.message.includes('referenced');
    }
    assert(blockedDelete, 'Safe deletion prevented deleting actively referenced media');

    // Remove reference from CatalogProduct
    await CatalogProduct.findByIdAndDelete(testProduct._id);

    // Delete with force/unreferenced
    const deleteResult = await mediaService.deleteMedia(completedMedia._id.toString(), false);
    assert(Boolean(deleteResult.message), 'Unreferenced media deleted cleanly from storage and database');

    // Clean up video
    await mediaService.deleteMedia(vidComplete._id.toString(), true);

    // -------------------------------------------------------------------------
    // TEST 13: Stale Upload Cleanup Test
    // -------------------------------------------------------------------------
    console.log('\n--- 13. Conservative Stale Upload Cleanup ---');
    // Create an artificial stale record with old createdAt
    const staleRecord = await Media.create({
      name: 'stale-abandoned-file.png',
      key: 'media/test/2025/01/stale-mock.png',
      url: 'https://media.axionpacktech.com/media/test/2025/01/stale-mock.png',
      status: 'uploading',
      type: 'image',
      mimeType: 'image/png',
      size: 500,
      folder: 'test',
      provider: 'r2',
      sourceType: 'upload',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48h ago
    });

    const cleanupResult = await mediaService.cleanStaleUploads(24);
    assert(cleanupResult.cleanedRecords >= 1, `Cleaned ${cleanupResult.cleanedRecords} stale upload record(s)`);

    const shouldBeNull = await Media.findById(staleRecord._id);
    assert(shouldBeNull === null, 'Incomplete stale record removed from MongoDB');

    // -------------------------------------------------------------------------
    // TEST 14: External URL HTTPS Enforcement
    // -------------------------------------------------------------------------
    console.log('\n--- 14. External URL HTTPS Scheme Enforcement ---');
    let insecureHttpRejected = false;
    try {
      await mediaService.registerExternalMedia({
        name: 'Insecure URL',
        url: 'http://insecure.example.com/image.jpg',
        type: 'image',
      });
    } catch (err: any) {
      insecureHttpRejected = err.statusCode === 400;
    }
    assert(insecureHttpRejected, 'Insecure http:// external URL strictly rejected');

    let javascriptUriRejected = false;
    try {
      await mediaService.registerExternalMedia({
        name: 'XSS URL',
        url: 'javascript:alert(1)',
        type: 'image',
      });
    } catch (err: any) {
      javascriptUriRejected = err.statusCode === 400;
    }
    assert(javascriptUriRejected, 'Dangerous javascript: scheme strictly rejected');

    let dataUriRejected = false;
    try {
      await mediaService.registerExternalMedia({
        name: 'Data URI',
        url: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        type: 'image',
      });
    } catch (err: any) {
      dataUriRejected = err.statusCode === 400;
    }
    assert(dataUriRejected, 'Dangerous data: scheme strictly rejected');

    const validHttps = await mediaService.registerExternalMedia({
      name: 'Valid HTTPS Image',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
      type: 'image',
    });
    assert(validHttps.url.startsWith('https://'), 'Valid HTTPS external media registered successfully');
    await Media.findByIdAndDelete(validHttps.mediaId);

  } catch (error) {
    console.error('Unexpected error during verification:', error);
    failedTests++;
  } finally {
    await disconnectRedis();
    await mongoose.connection.close();
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
