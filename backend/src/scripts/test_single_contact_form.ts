import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const API_BASE = 'http://localhost:5000/api/v1';
const VALID_TURNSTILE_TOKEN = '1x00000000000000000000AA';

async function testSingleContactForm() {
  console.log('====================================================');
  console.log('🧪 SUBMITTING ONE CONTACT FORM');
  console.log('====================================================');

  const testUserEmail = process.env.EMAIL_TEST_RECIPIENT || 'bcaparth89a@gmail.com';
  console.log('User Recipient Submitted:', testUserEmail);

  const contactPayload = {
    name: 'Parth Two-Email Test',
    email: testUserEmail,
    phone: '+91 9876543210',
    company: 'Axion Packaging Solutions',
    inquiryType: 'Automatic Liquid Packaging Line',
    inquiryGroup: 'Liquid Packaging Division',
    message: 'Testing two-email dispatch with exact [EMAIL FLOW] logging.',
    turnstileToken: VALID_TURNSTILE_TOKEN,
  };

  const response = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactPayload),
  });

  const responseData = (await response.json()) as any;
  console.log('HTTP Status:', response.status);
  console.log('Response Message:', responseData.message);
  console.log('Submission ID:', responseData.data?._id);

  if (response.status !== 201) {
    throw new Error('Contact submission failed: ' + JSON.stringify(responseData));
  }

  console.log('\n✅ One Contact form submitted successfully!');
}

testSingleContactForm().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
