import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { emailService } from '../services/email.service.js';

async function runDiagnostic() {
  console.log('====================================================');
  console.log('🔍 BREVO SMTP DIAGNOSTIC & LIVE SEND TEST');
  console.log('====================================================');

  const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || '';
  const mailFrom = process.env.MAIL_FROM || '';
  const mailFromName = process.env.MAIL_FROM_NAME || 'Axion PackTech';
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const testRecipient = process.env.EMAIL_TEST_RECIPIENT || user || adminEmail;

  console.log('SMTP Host:', host);
  console.log('SMTP Port:', port);
  console.log('SMTP User:', user);
  console.log('Mail From:', mailFrom);
  console.log('Mail From Name:', mailFromName);
  console.log('Admin Email:', adminEmail);
  console.log('Test Recipient (EMAIL_TEST_RECIPIENT):', testRecipient);

  console.log('\nStep 1: Verifying Brevo Transporter Connection...');
  const verifyResult = await emailService.verifyConnection();
  if (!verifyResult) {
    throw new Error('Brevo SMTP Transporter connection verification failed');
  }
  console.log('✅ Brevo Transporter connection verified: true');

  console.log('\nStep 2: Sending Admin Notification Test via Central Email Service...');
  const adminResult = await emailService.sendAdminNotification({
    subject: `[DIAGNOSTIC TEST] Admin Notification - ${new Date().toISOString()}`,
    html: `<h3>Admin Notification Test</h3><p>Testing admin email delivery via Brevo SMTP singleton service.</p><p>Timestamp: ${new Date().toISOString()}</p>`,
    text: `Admin Notification Test. Timestamp: ${new Date().toISOString()}`,
    replyToUserEmail: testRecipient,
  });

  if (!adminResult.success) {
    throw new Error(`Admin email delivery failed: ${adminResult.error}`);
  }
  console.log(`✅ Admin email accepted! MessageId: ${adminResult.messageId}`);
  console.log('  Response:', adminResult.response);

  console.log('\nStep 3: Sending User Confirmation Test via Central Email Service...');
  const userResult = await emailService.sendUserConfirmation({
    recipientEmail: testRecipient,
    subject: `[DIAGNOSTIC TEST] User Confirmation - ${new Date().toISOString()}`,
    html: `<h3>User Confirmation Test</h3><p>Dear Valued User,</p><p>Testing user confirmation email delivery via Brevo SMTP singleton service.</p><p>Timestamp: ${new Date().toISOString()}</p>`,
    text: `User Confirmation Test. Timestamp: ${new Date().toISOString()}`,
  });

  if (!userResult.success) {
    throw new Error(`User email delivery failed: ${userResult.error}`);
  }
  console.log(`✅ User confirmation email accepted! MessageId: ${userResult.messageId}`);
  console.log('  Response:', userResult.response);

  console.log('\n====================================================');
  console.log('🎉 ALL SMTP TESTS COMPLETED & ACCEPTED BY BREVO');
  console.log('====================================================');
}

runDiagnostic().catch((err) => {
  console.error('\n❌ DIAGNOSTIC TEST FAILED:', err);
  process.exit(1);
});
