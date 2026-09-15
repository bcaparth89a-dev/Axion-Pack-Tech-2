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
const INVALID_TURNSTILE_TOKEN = '2x00000000000000000000AB';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVerificationSuite() {
  console.log('================================================================');
  console.log('🧪 FULL VERIFICATION SUITE: CAREER, CATALOG & CONTACT FORMS');
  console.log('================================================================\n');

  await connectDB();

  // Ensure an active career opening exists for testing
  let career = await Career.findOne({ status: 'active' });
  if (!career) {
    career = await Career.create({
      title: 'Senior Automation Engineer',
      slug: 'senior-automation-engineer',
      department: 'Robotics & Control',
      location: 'Vadodara, Gujarat',
      type: 'job',
      experience: '4+ years',
      description: 'Lead automation development for industrial packaging lines.',
      status: 'active',
      published: true,
    });
    console.log('Created sample active career position:', career.slug);
  }

  const results: { test: string; status: 'PASS' | 'FAIL'; details: string }[] = [];

  // --------------------------------------------------------------------------
  // TEST 1: Valid Contact / Application Request Form Submission (with phone)
  // --------------------------------------------------------------------------
  console.log('Test 1: Valid Contact Form with phone...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        email: `aarav.mehta+${Date.now()}@example.com`,
        phone: '+91 9876543210',
        company: 'Mehta Packaging Industries',
        inquiryType: 'Automatic Liquid Filling Machine',
        inquiryGroup: 'Liquid Packaging Division',
        message: 'Looking for 120 BPM rotary filling line proposal and technical layouts.',
        turnstileToken: VALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 201 && data.success && data.data?._id) {
      const doc = await ContactInquiry.findById(data.data._id);
      if (doc && doc.name === 'Aarav Mehta') {
        results.push({ test: 'Valid Contact Form (with phone)', status: 'PASS', details: `HTTP 201, Doc ID: ${doc._id}` });
        console.log('  ✅ PASS: Saved to MongoDB, HTTP 201');
      } else {
        throw new Error('Document not found in MongoDB');
      }
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({ test: 'Valid Contact Form (with phone)', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 2: Valid Contact Form Submission without optional phone
  // --------------------------------------------------------------------------
  console.log('Test 2: Valid Contact Form without optional phone...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pooja Verma',
        email: `pooja.verma+${Date.now()}@example.com`,
        phone: '',
        company: 'Verma Bio Tech',
        inquiryType: 'General Inquiry',
        message: 'Requesting consultation on pharmaceutical blister packing equipment.',
        turnstileToken: VALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 201 && data.success && data.data?._id) {
      results.push({ test: 'Valid Contact Form (optional phone omitted)', status: 'PASS', details: `HTTP 201, Doc ID: ${data.data._id}` });
      console.log('  ✅ PASS: Saved to MongoDB without phone, HTTP 201');
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({ test: 'Valid Contact Form (optional phone omitted)', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 3: Invalid Contact Form (Missing required fields / invalid email)
  // --------------------------------------------------------------------------
  console.log('Test 3: Invalid Contact Form validation rejection...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A',
        email: 'invalid-email-format',
        message: 'short',
        turnstileToken: VALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Invalid Contact Form Validation', status: 'PASS', details: `HTTP 400 rejected with errors: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Bad Request returned');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({ test: 'Invalid Contact Form Validation', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 4: Valid Catalog Download Lead Submission
  // --------------------------------------------------------------------------
  console.log('Test 4: Valid Catalog Download Lead Submission...');
  try {
    const res = await fetch(`${API_BASE}/catalog-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohan Deshmukh',
        email: `rohan.deshmukh+${Date.now()}@apexlines.com`,
        phone: '+91 9765432109',
        company: 'Apex Automated Lines',
        requirement: 'Require high speed rotary capping brochure and speed specs.',
        catalogName: 'Rotary Capping Series - Technical Catalog',
        entityType: 'category',
        entitySlug: 'capping-machines',
        pdfUrl: 'https://media.axionpacktech.com/catalogs/rotary-capping.pdf',
        turnstileToken: VALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 201 && data.success && data.data?._id) {
      const doc = await CatalogLead.findById(data.data._id);
      if (doc && doc.name === 'Rohan Deshmukh') {
        results.push({ test: 'Valid Catalog Download Lead', status: 'PASS', details: `HTTP 201, Doc ID: ${doc._id}` });
        console.log('  ✅ PASS: Saved to MongoDB, HTTP 201');
      } else {
        throw new Error('CatalogLead document not found in DB');
      }
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({ test: 'Valid Catalog Download Lead', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 5: Invalid Catalog Download Lead Submission (Missing name/email)
  // --------------------------------------------------------------------------
  console.log('Test 5: Invalid Catalog Lead Validation...');
  try {
    const res = await fetch(`${API_BASE}/catalog-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'invalid',
        catalogName: '',
        turnstileToken: VALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Invalid Catalog Lead Validation', status: 'PASS', details: `HTTP 400: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Bad Request returned');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  } catch (err: any) {
    results.push({ test: 'Invalid Catalog Lead Validation', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 6: Valid Career Application Submission with Resume File Upload
  // --------------------------------------------------------------------------
  console.log('Test 6: Valid Career Application with Resume Upload...');
  try {
    const candidateEmail = `priya.nair+${Date.now()}@candidate.com`;
    const formData = new FormData();
    formData.append('candidateName', 'Priya Nair');
    formData.append('email', candidateEmail);
    formData.append('phone', '+91 9123456780');
    formData.append('careerSlug', career.slug);
    formData.append('careerTitle', career.title);
    formData.append('coverMessage', 'Passionate about robotic pick and place automation.');
    formData.append('turnstileToken', VALID_TURNSTILE_TOKEN);

    const mockPdfBlob = new Blob(['%PDF-1.4 Mock CV Content for Automated Test Suite'], { type: 'application/pdf' });
    formData.append('resume', mockPdfBlob, 'Priya_Nair_Resume.pdf');

    const res = await fetch(`${API_BASE}/careers/${career.slug}/apply`, {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as any;
    if (res.status === 201 && data.success && data.data?._id) {
      const doc = await CareerApplication.findById(data.data._id);
      if (doc && doc.candidateName === 'Priya Nair') {
        results.push({ test: 'Valid Career Application Submission', status: 'PASS', details: `HTTP 201, Doc ID: ${doc._id}, Resume: ${doc.resumeFileName}` });
        console.log('  ✅ PASS: Saved to MongoDB, Resume Stored, HTTP 201');
      } else {
        throw new Error('CareerApplication document not found in DB');
      }
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(data)}`);
    }
  } catch (err: any) {
    results.push({ test: 'Valid Career Application Submission', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 7: Invalid Career Application Submission (Missing Resume)
  // --------------------------------------------------------------------------
  console.log('Test 7: Invalid Career Application (Missing Resume)...');
  try {
    const formData = new FormData();
    formData.append('candidateName', 'Vijay Kumar');
    formData.append('email', 'vijay.kumar@test.com');
    formData.append('phone', '+91 9988776655');
    formData.append('careerSlug', career.slug);
    formData.append('turnstileToken', VALID_TURNSTILE_TOKEN);

    const res = await fetch(`${API_BASE}/careers/${career.slug}/apply`, {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Career Application Missing Resume Rejection', status: 'PASS', details: `HTTP 400: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Bad Request returned');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  } catch (err: any) {
    results.push({ test: 'Career Application Missing Resume Rejection', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 8: Failed / Invalid Turnstile Challenge Token
  // --------------------------------------------------------------------------
  console.log('Test 8: Failed / Invalid Turnstile Token Rejection...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Spam Bot',
        email: 'spambot@spam.com',
        message: 'Spam message violating turnstile human check.',
        turnstileToken: INVALID_TURNSTILE_TOKEN,
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Turnstile Challenge Verification Failure', status: 'PASS', details: `HTTP 400: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Security Challenge Failed');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  } catch (err: any) {
    results.push({ test: 'Turnstile Challenge Verification Failure', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 9: Missing Turnstile Token
  // --------------------------------------------------------------------------
  console.log('Test 9: Missing Turnstile Token Rejection...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Direct API Poster',
        email: 'direct@api.com',
        message: 'Trying to bypass frontend verification.',
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Missing Turnstile Token Rejection', status: 'PASS', details: `HTTP 400: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Security Verification Required');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  } catch (err: any) {
    results.push({ test: 'Missing Turnstile Token Rejection', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  await sleep(300);

  // --------------------------------------------------------------------------
  // TEST 10: Honeypot Trap Detection
  // --------------------------------------------------------------------------
  console.log('Test 10: Honeypot Bot Trap Detection...');
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Bot',
        email: 'bot@automated-crawler.com',
        message: 'Automated bot filling all visible and hidden form fields.',
        turnstileToken: VALID_TURNSTILE_TOKEN,
        hp_website: 'http://malicious-spam-url.com',
      }),
    });
    const data = (await res.json()) as any;
    if (res.status === 400 && data.success === false) {
      results.push({ test: 'Honeypot Trap Detection', status: 'PASS', details: `HTTP 400: ${data.message}` });
      console.log('  ✅ PASS: HTTP 400 Bot Trap Rejected');
    } else {
      throw new Error(`Expected HTTP 400, got ${res.status}`);
    }
  } catch (err: any) {
    results.push({ test: 'Honeypot Trap Detection', status: 'FAIL', details: err.message });
    console.error('  ❌ FAIL:', err.message);
  }

  console.log('\n================================================================');
  console.log('📊 VERIFICATION SUMMARY');
  console.log('================================================================');
  console.table(results);

  const allPassed = results.every((r) => r.status === 'PASS');
  console.log(allPassed ? '🎉 ALL 10 TEST SUITES PASSED SUCCESSFULLY!' : '⚠️ SOME TESTS FAILED');

  await disconnectDB();

  if (!allPassed) {
    process.exit(1);
  }
}

runVerificationSuite().catch((err) => {
  console.error('Suite error:', err);
  process.exit(1);
});
