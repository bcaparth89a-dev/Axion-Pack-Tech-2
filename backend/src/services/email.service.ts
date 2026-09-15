import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger.js';
import { IContactInquiry } from '../models/ContactInquiry.model.js';
import { ICatalogLead } from '../models/CatalogLead.model.js';
import { ICareerApplication } from '../models/CareerApplication.model.js';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  recipient?: string;
  error?: string;
  response?: string;
}

export function escapeHtml(str?: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const isValidEmail = (email?: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Safely mask an email address for logging without leaking full PII.
 */
export function maskEmail(email?: string): string {
  if (!email || typeof email !== 'string') return '[empty]';
  const clean = email.trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return '***';
  const [name, domain] = parts;
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
}

/**
 * Dynamically extract and normalize an email address from diverse form payloads.
 * Checks for email, userEmail, applicantEmail, candidateEmail, contactEmail, etc.
 */
export function extractRecipientEmail(data: Record<string, any>): string {
  if (!data || typeof data !== 'object') return '';
  const rawEmail =
    data.email ||
    data.userEmail ||
    data.applicantEmail ||
    data.candidateEmail ||
    data.contactEmail ||
    data.workEmail ||
    '';
  return String(rawEmail).trim().toLowerCase();
}

export class EmailService {
  private transporter: Transporter | null = null;
  private lastUser: string = '';
  private lastPass: string = '';

  constructor() {
    // Lazy initialized on first use to ensure process.env is fully loaded
  }

  public getTransporter(): Transporter {
    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASSWORD || '';
    const secure = port === 465;

    // If transporter is missing or credentials changed / became available after import
    if (!this.transporter || this.lastUser !== user || this.lastPass !== pass) {
      if (!user || !pass) {
        logger.warn('SMTP credentials (SMTP_USER / SMTP_PASSWORD) not configured in environment.');
      }
      this.lastUser = user;
      this.lastPass = pass;
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
      });
    }

    return this.transporter;
  }

  public getFromAddress(): string {
    const fromEmail = process.env.MAIL_FROM || 'sales@axionpacktech.com';
    const fromName = process.env.MAIL_FROM_NAME || 'AXION PackTech';
    return `"${fromName}" <${fromEmail}>`;
  }

  public getAdminEmail(): string {
    return (process.env.ADMIN_EMAIL || 'bcaparth89a@gmail.com').trim().toLowerCase();
  }

  /**
   * Verify SMTP connection status with Brevo relay.
   */
  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      logger.info('Brevo SMTP Transporter connection verified successfully.');
      return true;
    } catch (error) {
      logger.warn('Brevo SMTP Transporter verification failed:', error);
      return false;
    }
  }

  /**
   * Core low-level email sending method.
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailDeliveryResult> {
    const from = options.from || this.getFromAddress();
    const recipient = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // In test environment without mock transporter, simulate sending
    if (process.env.NODE_ENV === 'test') {
      logger.debug(`[TEST EMAIL SIMULATION] To: ${recipient}, Subject: ${options.subject}`);
      return {
        success: true,
        messageId: `mock-msg-${Date.now()}`,
        recipient,
        response: '250 OK: Simulated Test Delivery',
      };
    }

    const transporter = this.getTransporter();

    try {
      const info = await transporter.sendMail({
        from,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
        attachments: options.attachments,
      });

      return {
        success: true,
        messageId: info.messageId,
        recipient,
        response: info.response,
      };
    } catch (error: any) {
      logger.error(`[EMAIL] Transporter sending error for ${maskEmail(recipient)}: ${error?.message}`);
      return {
        success: false,
        recipient,
        error: error?.message || 'Email delivery failed',
      };
    }
  }

  /**
   * Send dedicated admin notification email to ADMIN_EMAIL.
   */
  async sendAdminNotification(options: {
    subject: string;
    html: string;
    text?: string;
    replyToUserEmail?: string;
    attachments?: SendEmailOptions['attachments'];
  }): Promise<EmailDeliveryResult> {
    const adminEmail = this.getAdminEmail();
    logger.info('[EMAIL FLOW] ADMIN START');
    logger.info(`[EMAIL FLOW] ADMIN TO: ${adminEmail}`);

    const mailOptions: SendEmailOptions = {
      from: this.getFromAddress(),
      to: adminEmail,
      replyTo: options.replyToUserEmail && isValidEmail(options.replyToUserEmail)
        ? options.replyToUserEmail
        : undefined,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    try {
      const result = await this.sendEmail(mailOptions);

      if (result.success) {
        logger.info(`[EMAIL FLOW] ADMIN SUCCESS: ${result.messageId}`);
      } else {
        logger.error(`[EMAIL FLOW] ADMIN FAILED: ${result.error}`);
      }

      return result;
    } catch (err: any) {
      const safeErr = err?.message || 'Admin email dispatch error';
      logger.error(`[EMAIL FLOW] ADMIN FAILED: ${safeErr}`);
      return {
        success: false,
        recipient: adminEmail,
        error: safeErr,
      };
    }
  }

  /**
   * Send dedicated user confirmation email to the dynamically submitted email address.
   */
  async sendUserConfirmation(options: {
    recipientEmail: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: SendEmailOptions['attachments'];
  }): Promise<EmailDeliveryResult> {
    const recipientEmail = String(options.recipientEmail || '').trim().toLowerCase();
    const maskedUser = maskEmail(recipientEmail);

    logger.info('[EMAIL FLOW] USER START');
    logger.info(`[EMAIL FLOW] USER TO: ${maskedUser}`);

    if (!isValidEmail(recipientEmail)) {
      const safeErr = `Invalid or missing user email address: "${maskedUser}"`;
      logger.error(`[EMAIL FLOW] USER FAILED: ${safeErr}`);
      return {
        success: false,
        recipient: recipientEmail,
        error: safeErr,
      };
    }

    const mailOptions: SendEmailOptions = {
      from: this.getFromAddress(),
      to: recipientEmail,
      replyTo: process.env.MAIL_FROM || 'sales@axionpacktech.com',
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    try {
      const result = await this.sendEmail(mailOptions);

      if (result.success) {
        logger.info(`[EMAIL FLOW] USER SUCCESS: ${result.messageId}`);
      } else {
        logger.error(`[EMAIL FLOW] USER FAILED: ${result.error}`);
      }

      return result;
    } catch (err: any) {
      const safeErr = err?.message || 'User confirmation email dispatch error';
      logger.error(`[EMAIL FLOW] USER FAILED: ${safeErr}`);
      return {
        success: false,
        recipient: recipientEmail,
        error: safeErr,
      };
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Base branded email layout wrapper
   */
  private wrapTemplate(title: string, contentHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 620px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { background: #061527; padding: 28px 32px; text-align: left; border-top: 4px solid #f97316; }
    .header-logo { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
    .header-logo span { color: #f97316; }
    .header-sub { color: #94a3b8; font-size: 12px; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 32px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #061527; margin: 0 0 16px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .table th { text-align: left; padding: 10px 14px; background: #f8fafc; color: #64748b; font-weight: 600; width: 35%; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 10px 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; }
    .highlight-box { background: #f8fafc; border-left: 4px solid #f97316; padding: 16px; border-radius: 4px; margin: 20px 0; }
    .btn { display: inline-block; background: #f97316; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0; }
    .footer { background: #f8fafc; padding: 24px 32px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">AXION <span>PACKTECH</span></div>
      <div class="header-sub">Engineering Packaging Excellence</div>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>AXION PackTech • Vadodara, Gujarat, India</p>
      <p>Sales: <a href="tel:+918511856636">+91 8511856636</a> | Email: <a href="mailto:sales@axionpacktech.com">sales@axionpacktech.com</a> | Web: <a href="https://axionpacktech.com">axionpacktech.com</a></p>
      <p style="margin-top: 8px; font-size: 11px; color: #94a3b8;">This is an automated communication from the AXION PackTech system.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * TEMPORARY DIAGNOSTIC HELPER:
   * Executes Admin email first, logs exact status with timestamp, waits 3 seconds,
   * then executes User confirmation email with independent try/catch.
   * 
   * TODO: [DIAGNOSTIC MODE] Restore concurrent Promise.allSettled flow after diagnosis.
   */
  private async executeSequentialDiagnosticEmails(params: {
    formName: string;
    adminOptions: {
      subject: string;
      html: string;
      replyToUserEmail?: string;
    };
    userOptions: {
      recipientEmail: string;
      subject: string;
      html: string;
    };
  }): Promise<{
    admin: EmailDeliveryResult;
    user: EmailDeliveryResult;
  }> {
    const adminEmail = this.getAdminEmail();
    const maskedUser = maskEmail(params.userOptions.recipientEmail);

    console.log('\n========================================');
    console.log(`EMAIL DEBUG START (${params.formName})`);
    console.log('========================================');

    // [1] Attempt ADMIN Email
    let adminResult: EmailDeliveryResult = { success: false, recipient: adminEmail };
    try {
      const startTime = new Date().toISOString();
      console.log('\n[1] ADMIN EMAIL START');
      console.log(`Time: ${startTime}`);
      console.log(`To: ${adminEmail}`);

      adminResult = await this.sendAdminNotification(params.adminOptions);

      const endTime = new Date().toISOString();
      if (adminResult.success) {
        console.log('\n[1] ADMIN EMAIL SUCCESS');
        console.log(`Time: ${endTime}`);
        console.log(`Message ID: ${adminResult.messageId}`);
        console.log(`SMTP Response: ${adminResult.response || '250 OK: queued'}`);
      } else {
        console.log('\n[1] ADMIN EMAIL FAILED');
        console.log(`Time: ${endTime}`);
        console.log(`Error: ${adminResult.error || 'Admin delivery failed'}`);
      }
    } catch (adminErr: any) {
      const errTime = new Date().toISOString();
      const safeErr = adminErr?.message || 'Admin email dispatch exception';
      console.log('\n[1] ADMIN EMAIL FAILED');
      console.log(`Time: ${errTime}`);
      console.log(`Error: ${safeErr}`);
      adminResult = { success: false, recipient: adminEmail, error: safeErr };
    }

    // Diagnostic 3-second delay
    console.log('\nWAITING 3 SECONDS BEFORE USER EMAIL...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // [2] Attempt USER Email
    let userResult: EmailDeliveryResult = { success: false, recipient: params.userOptions.recipientEmail };
    try {
      const startTime = new Date().toISOString();
      console.log('\n[2] USER EMAIL START');
      console.log(`Time: ${startTime}`);
      console.log(`To: ${maskedUser}`);

      userResult = await this.sendUserConfirmation(params.userOptions);

      const endTime = new Date().toISOString();
      if (userResult.success) {
        console.log('\n[2] USER EMAIL SUCCESS');
        console.log(`Time: ${endTime}`);
        console.log(`Message ID: ${userResult.messageId}`);
        console.log(`SMTP Response: ${userResult.response || '250 OK: queued'}`);
      } else {
        console.log('\n[2] USER EMAIL FAILED');
        console.log(`Time: ${endTime}`);
        console.log(`Error: ${userResult.error || 'User delivery failed'}`);
      }
    } catch (userErr: any) {
      const errTime = new Date().toISOString();
      const safeErr = userErr?.message || 'User confirmation email dispatch exception';
      console.log('\n[2] USER EMAIL FAILED');
      console.log(`Time: ${errTime}`);
      console.log(`Error: ${safeErr}`);
      userResult = { success: false, recipient: params.userOptions.recipientEmail, error: safeErr };
    }

    console.log('\n========================================');
    console.log(`EMAIL DEBUG COMPLETE (${params.formName})`);
    console.log('========================================\n');

    return { admin: adminResult, user: userResult };
  }

  // ==========================================================================
  // 1. CONTACT & INQUIRY / APPLICATION REQUEST EMAILS
  // ==========================================================================

  async sendContactEmails(inquiry: Partial<IContactInquiry> & Record<string, any>): Promise<{
    admin: EmailDeliveryResult;
    user: EmailDeliveryResult;
  }> {
    const userEmail = extractRecipientEmail(inquiry);
    const inquirySubject = inquiry.inquiryType || inquiry.subject || 'General Inquiry';
    const contactName = inquiry.name || inquiry.fullName || 'Valued Client';
    const submissionId = inquiry._id ? String(inquiry._id) : 'N/A';
    const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)';

    // 1. Admin Notification Email
    const adminHtml = this.wrapTemplate(
      `New Website Inquiry: ${inquirySubject}`,
      `<h2 class="title">🔔 New Website Inquiry Received</h2>
       <p>A new inquiry / application request has been submitted via the AXION PackTech website.</p>
       <table class="table">
         <tr><th>Submission ID</th><td><code>${escapeHtml(submissionId)}</code></td></tr>
         <tr><th>Form Type</th><td><strong>Application Request / Contact Form</strong></td></tr>
         <tr><th>Full Name</th><td>${escapeHtml(contactName)}</td></tr>
         <tr><th>Email Address</th><td><a href="mailto:${escapeHtml(userEmail)}">${escapeHtml(userEmail)}</a></td></tr>
         <tr><th>Phone Number</th><td>${escapeHtml(inquiry.phone || 'Not provided')}</td></tr>
         <tr><th>Company Name</th><td>${escapeHtml(inquiry.company || 'Not provided')}</td></tr>
         <tr><th>Inquiry Scope</th><td>${escapeHtml(inquiry.inquiryType || 'General Inquiry')}</td></tr>
         <tr><th>Category / Group</th><td>${escapeHtml(inquiry.inquiryGroup || 'Website Inquiry')}</td></tr>
         <tr><th>Submitted At</th><td>${submittedTime}</td></tr>
       </table>
       <div class="highlight-box">
         <strong>Inquiry Message:</strong><br />
         <p style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</p>
       </div>
       <p style="font-size: 13px; color: #64748b;">You can reply directly to this email to respond to <strong>${escapeHtml(contactName)}</strong>.</p>`
    );

    // 2. User Confirmation Email
    const userHtml = this.wrapTemplate(
      'Thank you for contacting AXION PackTech',
      `<h2 class="title">Dear ${escapeHtml(contactName)},</h2>
           <p>Thank you for reaching out to <strong>AXION PackTech</strong>. We have received your inquiry regarding <strong>${escapeHtml(inquirySubject)}</strong>.</p>
           <p>Our engineering and technical sales specialists are reviewing your requirements and will contact you directly within <strong>1 business day</strong> if required.</p>
           <div class="highlight-box">
             <strong>Summary of your submission:</strong><br />
             <ul style="margin: 8px 0 0; padding-left: 20px;">
               <li><strong>Reference ID:</strong> ${escapeHtml(submissionId)}</li>
               <li><strong>Inquiry Scope:</strong> ${escapeHtml(inquiry.inquiryType || 'General Inquiry')}</li>
               <li><strong>Company:</strong> ${escapeHtml(inquiry.company || 'N/A')}</li>
               <li><strong>Contact Phone:</strong> ${escapeHtml(inquiry.phone || 'N/A')}</li>
             </ul>
           </div>
           <p>If you have urgent machine breakdown or immediate project requirements, please feel free to call our technical team directly at <strong>+91 8511856636</strong>.</p>
           <p style="margin-top: 24px;">Best Regards,<br /><strong>The AXION PackTech Team</strong><br /><span style="font-size: 12px; color: #64748b;">Packaging Automation & Machinery Division</span></p>`
    );

    // DIAGNOSTIC FLOW: Sequential execution with 3-second delay
    return this.executeSequentialDiagnosticEmails({
      formName: 'Contact / Application Request',
      adminOptions: {
        subject: `[New Inquiry] ${escapeHtml(inquirySubject)} - ${escapeHtml(contactName)}`,
        html: adminHtml,
        replyToUserEmail: userEmail,
      },
      userOptions: {
        recipientEmail: userEmail,
        subject: `Thank you for contacting AXION PackTech - We received your inquiry`,
        html: userHtml,
      },
    });
  }

  // ==========================================================================
  // 2. CATALOG DOWNLOAD LEAD EMAILS
  // ==========================================================================

  async sendCatalogLeadEmails(lead: Partial<ICatalogLead> & Record<string, any>): Promise<{
    admin: EmailDeliveryResult;
    user: EmailDeliveryResult;
  }> {
    const userEmail = extractRecipientEmail(lead);
    const catalogTitle = lead.catalogName || 'AXION Machinery Catalog';
    const userName = lead.name || 'Valued Visitor';
    const submissionId = lead._id ? String(lead._id) : 'N/A';
    const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)';

    // 1. Admin Notification Email
    const adminHtml = this.wrapTemplate(
      `Catalog Download: ${catalogTitle}`,
      `<h2 class="title">📥 Catalog Download Lead Captured</h2>
       <p>A visitor has requested and downloaded a technical machinery catalog.</p>
       <table class="table">
         <tr><th>Submission ID</th><td><code>${escapeHtml(submissionId)}</code></td></tr>
         <tr><th>Form Type</th><td><strong>Catalog Download Request</strong></td></tr>
         <tr><th>Full Name</th><td>${escapeHtml(lead.name)}</td></tr>
         <tr><th>Email Address</th><td><a href="mailto:${escapeHtml(userEmail)}">${escapeHtml(userEmail)}</a></td></tr>
         <tr><th>Phone Number</th><td>${escapeHtml(lead.phone)}</td></tr>
         <tr><th>Company Name</th><td>${escapeHtml(lead.company || 'Not provided')}</td></tr>
         <tr><th>Requested Catalog</th><td><strong>${escapeHtml(catalogTitle)}</strong></td></tr>
         <tr><th>Catalog Target</th><td>${escapeHtml(lead.entityType || 'General')} (${escapeHtml(lead.entitySlug || 'N/A')})</td></tr>
         <tr><th>Submitted At</th><td>${submittedTime}</td></tr>
       </table>
       ${
         lead.requirement
           ? `<div class="highlight-box">
                <strong>Project Requirement / Note:</strong><br />
                <p style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(lead.requirement)}</p>
              </div>`
           : ''
       }
       <p style="font-size: 13px; color: #64748b;">Follow up promptly with this prospect regarding their line specification needs.</p>`
    );

    // 2. User Confirmation Email
    const pdfLinkHtml = lead.pdfUrl
      ? `<div style="text-align: center; margin: 24px 0;">
           <a href="${escapeHtml(lead.pdfUrl)}" class="btn" target="_blank" rel="noopener noreferrer">📄 Download / View Catalog PDF</a>
         </div>`
      : '';

    const userHtml = this.wrapTemplate(
      `Your Catalog: ${catalogTitle}`,
      `<h2 class="title">Dear ${escapeHtml(userName)},</h2>
       <p>Thank you for your interest in AXION PackTech packaging machinery solutions. We are pleased to provide the official technical catalog for <strong>${escapeHtml(catalogTitle)}</strong>.</p>
       ${pdfLinkHtml}
       <p>Our packaging machinery is engineered for high reliability, minimal changeover downtime, and full compliance with pharmaceutical, food, beverage, and chemical packaging standards.</p>
       <div class="highlight-box">
         <strong>Summary of your request:</strong><br />
         <ul style="margin: 8px 0 0; padding-left: 20px;">
           <li><strong>Reference ID:</strong> ${escapeHtml(submissionId)}</li>
           <li><strong>Requested Catalog:</strong> ${escapeHtml(catalogTitle)}</li>
           <li><strong>Company:</strong> ${escapeHtml(lead.company || 'N/A')}</li>
         </ul>
       </div>
       <p>Our engineering team will review your requirements and reach out to you if custom layout, nozzle configuration, or PLC control integration is required.</p>
       <p>Feel free to reply to this email or call our team directly at <strong>+91 8511856636</strong> to request a customized quotation or factory demonstration.</p>
       <p style="margin-top: 24px;">Warm Regards,<br /><strong>AXION PackTech Sales & Engineering</strong></p>`
    );

    // DIAGNOSTIC FLOW: Sequential execution with 3-second delay
    return this.executeSequentialDiagnosticEmails({
      formName: 'Catalog Download Request',
      adminOptions: {
        subject: `[Catalog Lead] ${escapeHtml(catalogTitle)} - ${escapeHtml(lead.name)} (${escapeHtml(lead.company || 'Individual')})`,
        html: adminHtml,
        replyToUserEmail: userEmail,
      },
      userOptions: {
        recipientEmail: userEmail,
        subject: `Your AXION PackTech Catalog: ${escapeHtml(catalogTitle)}`,
        html: userHtml,
      },
    });
  }

  // ==========================================================================
  // 3. CAREER APPLICATION EMAILS
  // ==========================================================================

  async sendCareerApplicationEmails(application: Partial<ICareerApplication> & Record<string, any>): Promise<{
    admin: EmailDeliveryResult;
    user: EmailDeliveryResult;
  }> {
    const candidateEmail = extractRecipientEmail(application);
    const candidateName = application.candidateName || application.fullName || 'Candidate';
    const positionTitle = application.careerTitle || application.position || 'Engineering Position';
    const submissionId = application._id ? String(application._id) : 'N/A';
    const submittedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' (IST)';

    // 1. Admin Notification Email
    const resumeLinkHtml = application.resumeUrl
      ? `<a href="${escapeHtml(application.resumeUrl)}" target="_blank" style="color: #f97316; font-weight: 600;">View Resume Document ↗</a>`
      : 'Attached / Stored on server';

    const adminHtml = this.wrapTemplate(
      `Job Application: ${positionTitle}`,
      `<h2 class="title">💼 New Job Application Received</h2>
       <p>A new candidate has submitted an application for <strong>${escapeHtml(positionTitle)}</strong>.</p>
       <table class="table">
         <tr><th>Application ID</th><td><code>${escapeHtml(submissionId)}</code></td></tr>
         <tr><th>Form Type</th><td><strong>Career Application</strong></td></tr>
         <tr><th>Candidate Name</th><td>${escapeHtml(candidateName)}</td></tr>
         <tr><th>Email Address</th><td><a href="mailto:${escapeHtml(candidateEmail)}">${escapeHtml(candidateEmail)}</a></td></tr>
         <tr><th>Phone Number</th><td>${escapeHtml(application.phone)}</td></tr>
         <tr><th>Applied Position</th><td><strong>${escapeHtml(positionTitle)}</strong></td></tr>
         <tr><th>Experience</th><td>${escapeHtml(application.experience || 'Not specified')}</td></tr>
         <tr><th>Education</th><td>${escapeHtml(application.education || 'Not specified')}</td></tr>
         <tr><th>Address</th><td>${escapeHtml(application.address || 'Not specified')}</td></tr>
         <tr><th>Portfolio / Profile</th><td>${escapeHtml(application.portfolioUrl || 'Not specified')}</td></tr>
         <tr><th>Resume Document</th><td>${resumeLinkHtml}</td></tr>
         <tr><th>Submitted At</th><td>${submittedTime}</td></tr>
       </table>
       ${
         application.coverMessage
           ? `<div class="highlight-box">
                <strong>Cover Message / Notes:</strong><br />
                <p style="margin: 8px 0 0; white-space: pre-wrap;">${escapeHtml(application.coverMessage)}</p>
              </div>`
           : ''
       }
       <p style="font-size: 13px; color: #64748b;">Reply directly to this email to communicate with <strong>${escapeHtml(candidateName)}</strong>.</p>`
    );

    // 2. Candidate Confirmation Email
    const candidateHtml = this.wrapTemplate(
      `Application Received: ${positionTitle}`,
      `<h2 class="title">Dear ${escapeHtml(candidateName)},</h2>
       <p>Thank you for your interest in building your career with <strong>AXION PackTech</strong>. We have successfully received your application and resume for the <strong>${escapeHtml(positionTitle)}</strong> position.</p>
       <div class="highlight-box">
         <strong>Application Status: Under HR Review</strong><br />
         <ul style="margin: 8px 0 0; padding-left: 20px;">
           <li><strong>Reference ID:</strong> ${escapeHtml(submissionId)}</li>
           <li><strong>Position Applied:</strong> ${escapeHtml(positionTitle)}</li>
           <li><strong>Applicant Name:</strong> ${escapeHtml(candidateName)}</li>
         </ul>
         <p style="margin: 8px 0 0;">Our Talent Acquisition and Technical Engineering Team is reviewing your qualifications and background. If your profile matches our requirements, our HR team will contact you directly for the next interview round.</p>
       </div>
       <p>In the meantime, feel free to explore our latest engineering innovations and automated packaging solutions at <a href="https://axionpacktech.com" style="color: #f97316;">axionpacktech.com</a>.</p>
       <p style="margin-top: 24px;">Best of luck with your application!<br /><strong>AXION PackTech Human Resources Team</strong><br /><span style="font-size: 12px; color: #64748b;">Engineering Packaging Excellence</span></p>`
    );

    // DIAGNOSTIC FLOW: Sequential execution with 3-second delay
    return this.executeSequentialDiagnosticEmails({
      formName: 'Career Application',
      adminOptions: {
        subject: `[Job Application] ${escapeHtml(positionTitle)} - ${escapeHtml(candidateName)}`,
        html: adminHtml,
        replyToUserEmail: candidateEmail,
      },
      userOptions: {
        recipientEmail: candidateEmail,
        subject: `Application Received: ${escapeHtml(positionTitle)} at AXION PackTech`,
        html: candidateHtml,
      },
    });
  }
}

export const emailService = new EmailService();
