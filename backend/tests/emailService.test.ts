import { emailService } from '../src/services/email.service.js';

describe('Brevo SMTP Email Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      SMTP_HOST: 'smtp-relay.brevo.com',
      SMTP_PORT: '587',
      SMTP_USER: 'test-smtp-user@axionpacktech.com',
      SMTP_PASSWORD: 'test-smtp-password',
      MAIL_FROM: 'sales@axionpacktech.com',
      MAIL_FROM_NAME: 'AXION PackTech Machinery',
      ADMIN_EMAIL: 'admin@axionpacktech.com',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Contact & Inquiry Emails', () => {
    it('should dispatch both Admin notification and User confirmation for contact inquiry', async () => {
      const mockInquiry = {
        name: 'Rajesh Patel',
        email: 'rajesh.patel@pharma.com',
        phone: '+91 9876543210',
        company: 'Patel Pharma Solutions',
        inquiryType: 'Automatic Liquid Filling Machine',
        inquiryGroup: 'Pharmaceutical Packaging',
        message: 'Need 120 BPM vial filling and stoppering machine quote.',
      };

      const result = await emailService.sendContactEmails(mockInquiry as any);

      expect(result.admin.success).toBe(true);
      expect(result.user.success).toBe(true);
    });

    it('should handle inquiry without user email gracefully', async () => {
      const mockInquiry = {
        name: 'Anonymous Lead',
        email: '',
        message: 'Quick question',
      };

      const result = await emailService.sendContactEmails(mockInquiry as any);

      expect(result.admin.success).toBe(true);
      expect(result.user.success).toBe(false);
      expect(result.user.error).toContain('missing user email');
    });
  });

  describe('Catalog Download Lead Emails', () => {
    it('should dispatch Admin notification and User confirmation with catalog PDF link', async () => {
      const mockLead = {
        name: 'Anita Sharma',
        email: 'anita@beveragepack.com',
        phone: '+91 9123456789',
        company: 'Apex Beverage Packaging',
        catalogName: 'Rotary Capping Series',
        entityType: 'category',
        entitySlug: 'capping-machines',
        pdfUrl: 'https://cdn.axionpacktech.com/catalogs/rotary-capping.pdf',
        requirement: 'High speed juice bottle capping line requirement.',
      };

      const result = await emailService.sendCatalogLeadEmails(mockLead as any);

      expect(result.admin.success).toBe(true);
      expect(result.user.success).toBe(true);
    });
  });

  describe('Career Application Emails', () => {
    it('should dispatch Admin notification and Candidate confirmation with position details', async () => {
      const mockApplication = {
        candidateName: 'Amit Verma',
        email: 'amit.verma@engineer.com',
        phone: '+91 9811223344',
        careerTitle: 'Senior PLC Automation Engineer',
        careerSlug: 'senior-plc-automation-engineer',
        experience: '5 years',
        education: 'B.Tech in Mechatronics',
        address: 'Vadodara, Gujarat',
        portfolioUrl: 'https://github.com/amit-verma',
        coverMessage: 'Interested in designing high-speed packaging control systems.',
        resumeUrl: '/api/v1/careers/admin/applications/65f123456789abcdef012345/resume',
      };

      const result = await emailService.sendCareerApplicationEmails(mockApplication as any);

      expect(result.admin.success).toBe(true);
      expect(result.user.success).toBe(true);
    });
  });

  describe('Raw sendEmail Error Handling', () => {
    it('should simulate successful email delivery in test environment', async () => {
      const result = await emailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test Body</p>',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });
});
