import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Career } from '../models/Career.model.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function testHumanVerification() {
  await connectDB();
  console.log('--- STARTING HUMAN VERIFICATION TESTS ---\n');

  // Ensure a test career opening exists
  let career = await Career.findOne({ status: 'active' });
  if (!career) {
    career = await Career.create({
      title: 'Automation & Control Engineer',
      slug: 'automation-control-engineer',
      department: 'Engineering',
      location: 'Vadodara, Gujarat',
      type: 'job',
      experience: '2+ years',
      description: 'Design and program PLC/SCADA systems for high-speed packaging machinery.',
      responsibilities: ['PLC programming', 'Commissioning'],
      qualifications: ['B.Tech / Diploma in Mechanical or Electrical'],
      status: 'active',
      published: true,
    });
  }

  const validToken = '1x00000000000000000000AA';
  const invalidToken = 'invalid-turnstile-token-xyz';

  // ==========================================
  // 1. CATALOG LEAD FORM TESTS
  // ==========================================
  console.log('1. [Catalog Lead Form] Testing verification...');

  // 1a. Missing / invalid token rejection
  const catLeadBadRes = await fetch('http://localhost:5000/api/v1/catalog-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bot User',
      email: 'bot@spam.com',
      phone: '+91 9999999999',
      company: 'Bot Corp',
      requirement: 'Spam requirement',
      catalogName: 'Rotary Vial Filling',
      turnstileToken: invalidToken,
    }),
  });
  const catLeadBadData = (await catLeadBadRes.json()) as any;
  console.log('   1a. Invalid token response:', catLeadBadRes.status, '| Success:', catLeadBadData.success, '| Message:', catLeadBadData.message);
  if (catLeadBadRes.status !== 400 || catLeadBadData.success !== false) {
    throw new Error('Catalog Lead should reject invalid turnstile token');
  }

  await sleep(300);

  // 1b. Honeypot rejection
  const catLeadHpRes = await fetch('http://localhost:5000/api/v1/catalog-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Bot Honeypot',
      email: 'bot@honeypot.com',
      phone: '+91 9999999999',
      company: 'Spam Corp',
      requirement: 'Spam requirement',
      catalogName: 'Rotary Vial Filling',
      turnstileToken: validToken,
      hp_website: 'http://spam-site.com',
    }),
  });
  const catLeadHpData = (await catLeadHpRes.json()) as any;
  console.log('   1b. Honeypot filled response:', catLeadHpRes.status, '| Success:', catLeadHpData.success, '| Message:', catLeadHpData.message);
  if (catLeadHpRes.status !== 400 || catLeadHpData.success !== false) {
    throw new Error('Catalog Lead should reject honeypot input');
  }

  await sleep(300);

  // 1c. Valid submission
  const catLeadOkRes = await fetch('http://localhost:5000/api/v1/catalog-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@pharma-innovations.in',
      phone: '+91 9876543210',
      company: 'Pharma Innovations Ltd',
      requirement: 'Requesting technical catalog for high speed rotary capping line.',
      catalogName: 'Rotary Capping Series',
      entityType: 'category',
      entitySlug: 'capping-machines',
      pdfUrl: 'https://cdn.axionpacktech.com/catalogs/rotary-capping.pdf',
      turnstileToken: validToken,
    }),
  });
  const catLeadOkData = (await catLeadOkRes.json()) as any;
  console.log('   1c. Valid lead submission:', catLeadOkRes.status, '| Success:', catLeadOkData.success, '| Lead ID:', catLeadOkData.data?._id);
  if (catLeadOkRes.status !== 201 || !catLeadOkData.success) {
    throw new Error('Catalog Lead should succeed with valid token');
  }

  // ==========================================
  // 2. CONTACT / RFQ FORM TESTS
  // ==========================================
  console.log('\n2. [Contact Form] Testing verification...');
  await sleep(300);

  // 2a. Missing token rejection
  const contactBadRes = await fetch('http://localhost:5000/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Spam Bot',
      email: 'spam@bot.com',
      message: 'Hello buy crypto now now now',
      inquiryType: 'General Inquiry',
      turnstileToken: invalidToken,
    }),
  });
  const contactBadData = (await contactBadRes.json()) as any;
  console.log('   2a. Invalid token response:', contactBadRes.status, '| Success:', contactBadData.success, '| Message:', contactBadData.message);
  if (contactBadRes.status !== 400 || contactBadData.success !== false) {
    throw new Error('Contact Form should reject invalid token');
  }

  await sleep(300);

  // 2b. Honeypot rejection
  const contactHpRes = await fetch('http://localhost:5000/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Spam Bot',
      email: 'spam@bot.com',
      message: 'Hello spam inquiry message here for testing',
      inquiryType: 'General Inquiry',
      turnstileToken: validToken,
      hp_website: 'http://malicious.org',
    }),
  });
  const contactHpData = (await contactHpRes.json()) as any;
  console.log('   2b. Honeypot filled response:', contactHpRes.status, '| Success:', contactHpData.success, '| Message:', contactHpData.message);
  if (contactHpRes.status !== 400 || contactHpData.success !== false) {
    throw new Error('Contact Form should reject honeypot input');
  }

  await sleep(300);

  // 2c. Valid submission
  const contactOkRes = await fetch('http://localhost:5000/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Pooja Verma',
      email: 'pooja.verma@beverageco.com',
      phone: '+91 9123456780',
      company: 'Pure Beverage Co',
      message: 'Interested in a turnkey bottle washing, filling, and packaging line.',
      inquiryType: 'Turnkey Line Solution',
      inquiryGroup: 'Beverage Industry',
      turnstileToken: validToken,
    }),
  });
  const contactOkData = (await contactOkRes.json()) as any;
  console.log('   2c. Valid contact submission:', contactOkRes.status, '| Success:', contactOkData.success, '| Message:', contactOkData.message);
  if (contactOkRes.status !== 201 || !contactOkData.success) {
    throw new Error('Contact Form should succeed with valid token');
  }

  // ==========================================
  // 3. CAREER APPLICATION FORM TESTS
  // ==========================================
  console.log('\n3. [Career Application Form] Testing verification...');
  await sleep(300);

  const careerSlug = career.slug;

  // 3a. Invalid token rejection (FormData multipart)
  const formBad = new FormData();
  formBad.append('fullName', 'Bot Applicant');
  formBad.append('email', 'bot.applicant@spam.com');
  formBad.append('phone', '+91 9999999999');
  formBad.append('experience', '3');
  formBad.append('coverLetter', 'I am an automated bot.');
  formBad.append('turnstileToken', invalidToken);
  const dummyFile = new Blob(['%PDF-1.4 Mock resume content for testing'], { type: 'application/pdf' });
  formBad.append('resume', dummyFile, 'resume.pdf');

  const careerBadRes = await fetch(`http://localhost:5000/api/v1/careers/${careerSlug}/apply`, {
    method: 'POST',
    body: formBad,
  });
  const careerBadData = (await careerBadRes.json()) as any;
  console.log('   3a. Invalid token response:', careerBadRes.status, '| Success:', careerBadData.success, '| Message:', careerBadData.message);
  if (careerBadRes.status !== 400 || careerBadData.success !== false) {
    throw new Error('Career Application should reject invalid token');
  }

  await sleep(300);

  // 3b. Honeypot rejection
  const formHp = new FormData();
  formHp.append('fullName', 'Bot Applicant');
  formHp.append('email', 'bot.applicant@spam.com');
  formHp.append('phone', '+91 9999999999');
  formHp.append('experience', '3');
  formHp.append('turnstileToken', validToken);
  formHp.append('hp_website', 'http://spambot.net');
  formHp.append('resume', dummyFile, 'resume.pdf');

  const careerHpRes = await fetch(`http://localhost:5000/api/v1/careers/${careerSlug}/apply`, {
    method: 'POST',
    body: formHp,
  });
  const careerHpData = (await careerHpRes.json()) as any;
  console.log('   3b. Honeypot response:', careerHpRes.status, '| Success:', careerHpData.success, '| Message:', careerHpData.message);
  if (careerHpRes.status !== 400 || careerHpData.success !== false) {
    throw new Error('Career Application should reject honeypot input');
  }

  await sleep(300);

  // 3c. Valid submission
  const formOk = new FormData();
  formOk.append('fullName', 'Rohan Desai');
  formOk.append('email', 'rohan.desai@engineer.com');
  formOk.append('phone', '+91 9822334455');
  formOk.append('experience', '4.5');
  formOk.append('currentCompany', 'Apex Packaging Automation');
  formOk.append('noticePeriod', '30 days');
  formOk.append('coverLetter', 'Passionate about automated packaging control systems and PLC programming.');
  formOk.append('turnstileToken', validToken);
  formOk.append('resume', dummyFile, 'rohan_desai_resume.pdf');

  const careerOkRes = await fetch(`http://localhost:5000/api/v1/careers/${careerSlug}/apply`, {
    method: 'POST',
    body: formOk,
  });
  const careerOkData = (await careerOkRes.json()) as any;
  console.log('   3c. Valid career application:', careerOkRes.status, '| Success:', careerOkData.success, '| Application ID:', careerOkData.data?._id);
  if (careerOkRes.status !== 201 || !careerOkData.success) {
    throw new Error('Career Application should succeed with valid token');
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 3 FORMS HUMAN VERIFICATION LIVE TESTS PASSED 100%!');
  console.log('======================================================\n');

  await disconnectDB();
}

testHumanVerification().catch((err) => {
  console.error('Human Verification test failed:', err);
  process.exit(1);
});
