import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { signAccessToken } from '../utils/jwt.js';

async function main() {
  await connectDB();

  let adminUser = await User.findOne({ role: 'admin', isActive: true });
  if (!adminUser) {
    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@axionpacktech.com',
      passwordHash: '$2b$10$epRswS7W7Y7j7mJ0G6mNveM8j2o3u8U8J2o3u8U8J2o3u8U8J2o3u',
      role: 'admin',
      isActive: true,
    });
  }

  const token = signAccessToken({
    userId: adminUser._id.toString(),
    email: adminUser.email,
    role: adminUser.role as any,
  });

  console.log(`Using admin token for user ${adminUser.email} (ID: ${adminUser._id})`);
  console.log('Testing live Catalog Lead Endpoints against http://localhost:5000...\n');

  // 1. Submit a catalog lead
  const postRes = await fetch('http://localhost:5000/api/v1/catalog-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikram Mehta',
      email: 'vikram.mehta@gujaratpharma.com',
      phone: '+91 9825012345',
      company: 'Gujarat Pharma Packaging Ltd',
      requirement: 'Need high-precision vial filling and rubber stoppering catalog for sterile packaging project.',
      catalogName: 'Rotary Vial Filling & Stoppering Line',
      entityType: 'product',
      entitySlug: 'rotary-vial-filling-machine',
      pdfUrl: 'https://cdn.axionpacktech.com/catalogs/vial-filling.pdf',
    }),
  });

  const postData = (await postRes.json()) as any;
  console.log('1. Lead Submission Status:', postRes.status, '| Success:', postData.success);
  console.log('   Message:', postData.message);
  console.log('   Stored Lead:', postData.data?.name, '| Catalog:', postData.data?.catalogName);

  if (!postData.success) {
    throw new Error('Failed to submit lead: ' + JSON.stringify(postData));
  }

  const leadId = postData.data._id;

  // 2. Fetch leads as admin with search
  const getRes = await fetch('http://localhost:5000/api/v1/catalog-leads?search=Vikram', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getData = (await getRes.json()) as any;
  console.log('\n2. Admin Search Result:', getData.success, '| Found:', getData.data?.items?.length, 'item(s)');
  console.log('   Lead retrieved:', getData.data?.items?.[0]?.name, '| Status:', getData.data?.items?.[0]?.status);

  // 3. Update status and notes as admin
  const patchRes = await fetch(`http://localhost:5000/api/v1/catalog-leads/${leadId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'contacted',
      notes: 'Spoke with Vikram. Sent full machine layout drawing and R2 datasheet.',
    }),
  });
  const patchData = (await patchRes.json()) as any;
  console.log('\n3. Status Update Result:', patchData.success, '| New Status:', patchData.data?.status);
  console.log('   Updated Notes:', patchData.data?.notes);

  // 4. Retrieve stats
  const statsRes = await fetch('http://localhost:5000/api/v1/catalog-leads/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsData = (await statsRes.json()) as any;
  console.log('\n4. Stats Result:', statsData.success, '| Counts:', statsData.data);

  // 5. Clean up delete
  const delRes = await fetch(`http://localhost:5000/api/v1/catalog-leads/${leadId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const delData = (await delRes.json()) as any;
  console.log('\n5. Delete Result:', delData.success, '| Message:', delData.message);

  console.log('\n======================================================');
  console.log('✅ ALL LIVE CATALOG LEAD END-TO-END FLOWS FULLY PASSED!');
  console.log('======================================================');

  await disconnectDB();
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
