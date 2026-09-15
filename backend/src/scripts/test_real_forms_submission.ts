import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Career } from '../models/Career.model.js';
import { CareerApplication } from '../models/CareerApplication.model.js';
import { CatalogLead } from '../models/CatalogLead.model.js';
import { ContactInquiry } from '../models/ContactInquiry.model.js';

const API_BASE = 'http://localhost:5000/api/v1';
const VALID_TURNSTILE_TOKEN = '1x00000000000000000000AA';

async function testRealForms() {
  console.log('====================================================');
  console.log('🧪 REAL FORMS SUBMISSION & EMAIL DELIVERY TEST');
  console.log('====================================================');

  await connectDB();

  const testUserEmail = process.env.EMAIL_TEST_RECIPIENT || process.env.ADMIN_EMAIL || 'bcaparth89a@gmail.com';
  console.log('Target User Email for Test:', testUserEmail);
  console.log('Target Admin Email from Env:', process.env.ADMIN_EMAIL);

  // 1. Contact Form Test
  console.log('\n--- 1. Testing Contact Form ---');
  const contactPayload = {
    name: 'Parth Contact Test',
    email: testUserEmail,
    phone: '+91 9876543210',
    company: 'Axion Partner Corp',
    inquiryType: 'High Speed Packaging Line',
    inquiryGroup: 'Packaging Automation',
    message: 'Testing user confirmation delivery for real mailbox verification.',
    turnstileToken: VALID_TURNSTILE_TOKEN,
  };

  const contactRes = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactPayload),
  });
  const contactData = (await contactRes.json()) as any;
  console.log('Contact Form API Status:', contactRes.status);
  console.log('Contact Form Response Message:', contactData.message);
  if (contactRes.status !== 201 || !contactData.data?._id) {
    throw new Error(`Contact form failed: ${JSON.stringify(contactData)}`);
  }
  const contactDoc = await ContactInquiry.findById(contactData.data._id);
  console.log('✅ Contact MongoDB Document Verified:', contactDoc?._id, 'Name:', contactDoc?.name, 'Email:', contactDoc?.email);

  // 2. Catalog Download Form Test
  console.log('\n--- 2. Testing Catalog Lead Form ---');
  const catalogPayload = {
    name: 'Parth Catalog Test',
    email: testUserEmail,
    phone: '+91 9876543210',
    company: 'Axion Tech Lines',
    requirement: 'Requesting Rotary Capping machine dimensions and brochure.',
    catalogName: 'Rotary Capping Series - Technical Catalog',
    entityType: 'category',
    entitySlug: 'capping-machines',
    pdfUrl: 'https://pub-a756b10839b346b68dabea7852d66a44.r2.dev/catalogs/capping.pdf',
    turnstileToken: VALID_TURNSTILE_TOKEN,
  };

  const catalogRes = await fetch(`${API_BASE}/catalog-leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(catalogPayload),
  });
  const catalogData = (await catalogRes.json()) as any;
  console.log('Catalog Form API Status:', catalogRes.status);
  console.log('Catalog Form Response Message:', catalogData.message);
  if (catalogRes.status !== 201 || !catalogData.data?._id) {
    throw new Error(`Catalog form failed: ${JSON.stringify(catalogData)}`);
  }
  const catalogDoc = await CatalogLead.findById(catalogData.data._id);
  console.log('✅ Catalog MongoDB Document Verified:', catalogDoc?._id, 'Catalog:', catalogDoc?.catalogName, 'Email:', catalogDoc?.email);

  // 3. Career Application Form Test
  console.log('\n--- 3. Testing Career Application Form ---');
  let career = await Career.findOne({ status: 'active' });
  if (!career) {
    career = await Career.create({
      title: 'Packaging Automation Engineer',
      slug: 'packaging-automation-engineer',
      type: 'job',
      department: 'Engineering',
      location: 'Vadodara',
      experience: '2+ years',
      description: 'Packaging automation role',
      status: 'active',
      published: true,
    });
  }

  // Use unique timestamp email or test email with query tag to bypass duplicate 24h constraint
  const uniqueCandidateEmail = testUserEmail.includes('@') 
    ? `${testUserEmail.split('@')[0]}+career${Date.now()}@${testUserEmail.split('@')[1]}`
    : testUserEmail;

  const formData = new FormData();
  formData.append('candidateName', 'Parth Career Test');
  formData.append('email', uniqueCandidateEmail);
  formData.append('phone', '+91 9876543210');
  formData.append('careerSlug', career.slug);
  formData.append('careerTitle', career.title);
  formData.append('coverMessage', 'Passionate about packaging automation engineering.');
  formData.append('turnstileToken', VALID_TURNSTILE_TOKEN);

  const mockPdf = new Blob(['%PDF-1.4 Mock Candidate Resume Document for Live SMTP Verification'], { type: 'application/pdf' });
  formData.append('resume', mockPdf, 'Parth_Resume.pdf');

  const careerRes = await fetch(`${API_BASE}/careers/${career.slug}/apply`, {
    method: 'POST',
    body: formData,
  });
  const careerData = (await careerRes.json()) as any;
  console.log('Career Form API Status:', careerRes.status);
  console.log('Career Form Response Message:', careerData.message);
  if (careerRes.status !== 201 || !careerData.data?._id) {
    throw new Error(`Career form failed: ${JSON.stringify(careerData)}`);
  }
  const careerDoc = await CareerApplication.findById(careerData.data._id);
  console.log('✅ Career MongoDB Document Verified:', careerDoc?._id, 'Candidate:', careerDoc?.candidateName, 'Email:', careerDoc?.email);

  await disconnectDB();

  console.log('\n====================================================');
  console.log('🎉 ALL 3 FORMS TESTED & SUBMISSIONS RECORDED');
  console.log('====================================================');
}

testRealForms().catch((err) => {
  console.error('\n❌ Forms test failed:', err);
  process.exit(1);
});
