import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import nodemailer from 'nodemailer';

async function testLiveEmail() {
  console.log('Testing Brevo Live SMTP Transport...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('From:', process.env.MAIL_FROM);
  console.log('Admin:', process.env.ADMIN_EMAIL);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.verify();
  console.log('✅ SMTP Transporter Verified!');

  const info = await transporter.sendMail({
    from: `"${process.env.MAIL_FROM_NAME || 'Axion PackTech'}" <${process.env.MAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: '✅ AXION PackTech - Live Brevo SMTP System Verification',
    html: '<h3>Live Brevo SMTP Test</h3><p>Brevo SMTP is operational and verified.</p>',
  });

  console.log('✅ Email Dispatched! Message ID:', info.messageId);
}

testLiveEmail().catch((err) => {
  console.error('❌ Live Email Test Failed:', err);
  process.exit(1);
});
