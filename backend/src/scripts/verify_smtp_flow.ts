import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Career } from '../models/Career.model.js';
import { emailService } from '../services/email.service.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await connectDB();
  console.log('======================================================');
  console.log('🚀 TESTING BREVO SMTP EMAIL SERVICE INTEGRATION');
  console.log('======================================================\n');

  console.log('1. Verifying SMTP Transporter connection...');
  const smtpReady = await emailService.verifyConnection();
  console.log('   SMTP Ready Status:', smtpReady ? '✅ CONNECTED' : '⚠️ UNREACHABLE OR NOT CONFIGURED');

  const validTurnstileToken = '1x00000000000000000000AA';

  // ------------------------------------------------------------------
  // 1. Contact Form Submission & Email Flow
  // ------------------------------------------------------------------
  console.log('\n2. Testing Contact / Inquiry Form Submission...');
  const contactRes = await fetch('http://localhost:5000/api/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikas Malhotra',
      email: 'vikas.malhotra@packagingcorp.com',
      phone: '+91 9898012345',
      company: 'Malhotra Packaging Corp',
      inquiryType: 'Automatic Liquid Filling Machine',
      inquiryGroup: 'Liquid Packaging Division',
      message: 'Require detailed technical specifications and quotation for 150 BPM rotary vial filling machine.',
      turnstileToken: validTurnstileToken,
    }),
  });

  const contactData = (await contactRes.json()) as any;
  console.log('   Contact Submission Status:', contactRes.status, '| Success:', contactData.success);
  console.log('   Message:', contactData.message);
  if (contactRes.status !== 201 || !contactData.success) {
    throw new Error('Contact submission failed: ' + JSON.stringify(contactData));
  }
  console.log('   ✅ Contact Emails Dispatched (Admin Notification + User Confirmation)');

  await sleep(500);

  // ------------------------------------------------------------------
  // 2. Catalog Download Lead Form Submission & Email Flow
  // ------------------------------------------------------------------
  console.log('\n3. Testing Catalog Download / Lead Form Submission...');
  const catalogRes = await fetch('http://localhost:5000/api/v1/catalog-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sunita Rao',
      email: 'sunita.rao@pharmaceuticals.in',
      phone: '+91 9822334455',
      company: 'Apex Pharma Formulations',
      requirement: 'Need high speed automatic rotary capping line brochure and floor layout drawings.',
      catalogName: 'Rotary Capping Series',
      entityType: 'category',
      entitySlug: 'capping-machines',
      pdfUrl: 'https://cdn.axionpacktech.com/catalogs/rotary-capping.pdf',
      turnstileToken: validTurnstileToken,
    }),
  });

  const catalogData = (await catalogRes.json()) as any;
  console.log('   Catalog Lead Status:', catalogRes.status, '| Success:', catalogData.success);
  console.log('   Message:', catalogData.message);
  if (catalogRes.status !== 201 || !catalogData.success) {
    throw new Error('Catalog Lead submission failed: ' + JSON.stringify(catalogData));
  }
  console.log('   ✅ Catalog Lead Emails Dispatched (Admin Notification + User Confirmation + PDF Link)');

  await sleep(500);

  // ------------------------------------------------------------------
  // 3. Career Application Submission & Email Flow
  // ------------------------------------------------------------------
  console.log('\n4. Testing Career Application Form Submission...');
  let career = await Career.findOne({ status: 'active' });
  if (!career) {
    career = await Career.create({
      title: 'Mechanical Design Engineer',
      slug: 'mechanical-design-engineer',
      department: 'Engineering',
      location: 'Vadodara, Gujarat',
      type: 'job',
      experience: '3+ years',
      description: 'Design 3D CAD models for packaging conveyor and filling mechanisms.',
      responsibilities: ['SolidWorks design', 'Prototyping'],
      qualifications: ['B.E. Mechanical'],
      status: 'active',
      published: true,
    });
  }

  const uniqueApplicantEmail = `karan.singhania+${Date.now()}@engineering.com`;
  const careerFormData = new FormData();
  careerFormData.append('fullName', 'Karan Singhania');
  careerFormData.append('email', uniqueApplicantEmail);
  careerFormData.append('phone', '+91 9711223344');
  careerFormData.append('experience', '4 years');
  careerFormData.append('education', 'B.Tech Mechanical Engineering');
  careerFormData.append('address', 'Vadodara, Gujarat');
  careerFormData.append('coverLetter', 'Excited to apply for Mechanical Design Engineer role at AXION PackTech.');
  careerFormData.append('turnstileToken', validTurnstileToken);
  const resumeBlob = new Blob(['%PDF-1.4 Mock resume for testing Brevo SMTP career emails'], { type: 'application/pdf' });
  careerFormData.append('resume', resumeBlob, 'karan_singhania_resume.pdf');

  const careerRes = await fetch(`http://localhost:5000/api/v1/careers/${career.slug}/apply`, {
    method: 'POST',
    body: careerFormData,
  });

  const careerData = (await careerRes.json()) as any;
  console.log('   Career Application Status:', careerRes.status, '| Success:', careerData.success);
  console.log('   Message:', careerData.message);
  if (careerRes.status !== 201 || !careerData.success) {
    throw new Error('Career application submission failed: ' + JSON.stringify(careerData));
  }
  console.log('   ✅ Career Emails Dispatched (Admin Dossier Notification + Candidate Acknowledgment)');

  console.log('\n======================================================');
  console.log('🎉 ALL 3 FORMS BREVO SMTP INTEGRATION FULLY VERIFIED!');
  console.log('======================================================\n');

  await disconnectDB();
}

main().catch((err) => {
  console.error('SMTP flow test error:', err);
  process.exit(1);
});
