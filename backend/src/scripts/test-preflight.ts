import dotenv from 'dotenv';
import path from 'path';
import https from 'https';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { storageService } from '../services/storage/StorageService.js';

async function testFullBrowserFlow() {
  console.log('--- Testing Full Browser-like PUT to Cloudflare R2 ---');

  const key = 'media/test/browser-simulation.png';
  const presigned = await storageService.generatePresignedUploadUrl({
    key,
    contentType: 'image/png',
    expiresInSeconds: 900,
  });

  const parsed = new URL(presigned.uploadUrl);

  // 1. Preflight OPTIONS
  console.log('\n1. Sending Preflight OPTIONS...');
  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        method: 'OPTIONS',
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'PUT',
          'Access-Control-Request-Headers': 'content-type',
        },
      },
      (res) => {
        console.log('Preflight status:', res.statusCode);
        console.log('Preflight allow-origin:', res.headers['access-control-allow-origin']);
        console.log('Preflight allow-methods:', res.headers['access-control-allow-methods']);
        console.log('Preflight allow-headers:', res.headers['access-control-allow-headers']);
        resolve();
      }
    );
    req.on('error', reject);
    req.end();
  });

  // 2. Direct PUT with Origin and Content-Type
  console.log('\n2. Sending Direct PUT with Origin: http://localhost:3000 ...');
  const buffer = Buffer.from('FAKE_IMAGE_DATA_FOR_R2_TEST', 'utf-8');

  await new Promise<void>((resolve, reject) => {
    const req = https.request(
      {
        method: 'PUT',
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'Origin': 'http://localhost:3000',
          'Content-Type': 'image/png',
          'Content-Length': buffer.length,
        },
      },
      (res) => {
        console.log('PUT response status:', res.statusCode);
        console.log('PUT allow-origin header:', res.headers['access-control-allow-origin']);
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Direct PUT Succeeded with HTTP', res.statusCode);
          } else {
            console.log('❌ Direct PUT Failed with HTTP', res.statusCode, 'Body:', body);
          }
          resolve();
        });
      }
    );
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });

  // 3. HeadObject
  console.log('\n3. Verifying with HeadObject...');
  const head = await storageService.headObject(key);
  console.log('HeadObject result:', head);

  // Clean up
  await storageService.safeCleanup(key);
  console.log('Cleaned up test key.');
}

testFullBrowserFlow();
