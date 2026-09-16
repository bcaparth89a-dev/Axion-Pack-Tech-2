import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} from '@aws-sdk/client-s3';

async function checkAndApplyCors() {
  console.log('--- Inspecting Cloudflare R2 Bucket CORS Configuration ---');
  const accountId = process.env.R2_ACCOUNT_ID || '82d68227f53960cf7c0c9d32e7243ae4';
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME || 'axion-packtech-media';
  const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;

  console.log(`Target Bucket: ${bucket}`);
  console.log(`Endpoint: ${endpoint}`);

  if (!accessKeyId || !secretAccessKey) {
    console.error('Missing R2 credentials in environment.');
    return;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const getCorsCmd = new GetBucketCorsCommand({ Bucket: bucket });
    const currentCors = await client.send(getCorsCmd);
    console.log('Current Bucket CORS Rules:', JSON.stringify(currentCors.CORSRules, null, 2));
  } catch (err: any) {
    console.log('Could not fetch existing CORS (may be unconfigured):', err.message || err.name);
  }

  const desiredCorsRules = [
    {
      AllowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'https://axionpacktech.com',
        'https://www.axionpacktech.com',
        'https://admin.axionpacktech.com',
        'https://media.axionpacktech.com',
        'https://pub-a756b10839b346b68dabea7852d66a44.r2.dev',
      ],
      AllowedMethods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE'],
      AllowedHeaders: ['*'],
      ExposeHeaders: ['ETag', 'Content-Type', 'Content-Length', 'Last-Modified'],
      MaxAgeSeconds: 3600,
    },
  ];

  console.log('\nApplying Updated Bucket CORS Rules to Cloudflare R2...');
  try {
    const putCorsCmd = new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: desiredCorsRules,
      },
    });

    await client.send(putCorsCmd);
    console.log('✅ SUCCESS: Cloudflare R2 Bucket CORS rules successfully applied!');

    // Verify
    const verifyCmd = new GetBucketCorsCommand({ Bucket: bucket });
    const verifiedCors = await client.send(verifyCmd);
    console.log('\nVerified Active CORS Rules in R2:', JSON.stringify(verifiedCors.CORSRules, null, 2));
  } catch (err: any) {
    console.error('❌ Failed to set bucket CORS via S3 API:', err);
  }
}

checkAndApplyCors();
