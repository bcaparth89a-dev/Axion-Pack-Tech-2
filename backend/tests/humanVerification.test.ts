import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { ContactInquiry } from '../src/models/ContactInquiry.model.js';
import { CatalogLead } from '../src/models/CatalogLead.model.js';
import { Career } from '../src/models/Career.model.js';
import { CareerApplication } from '../src/models/CareerApplication.model.js';
import { sanitizeData } from '../src/middleware/humanVerification.middleware.js';

describe('Human Verification, Honeypot & Bot Defense', () => {
  const app = createApp();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/axion_packtech');
    }

    await Career.deleteMany({ slug: 'verification-test-engineer' });
    await Career.create({
      title: 'Verification Test Engineer',
      slug: 'verification-test-engineer',
      type: 'job',
      department: 'Engineering',
      location: 'Vadodara, Gujarat, India',
      employmentType: 'Full-Time',
      experience: '2-4 Years',
      description: 'Developing automated packaging machinery and high-speed controls.',
      published: true,
      status: 'active',
      sortOrder: 1,
    });
  });

  afterAll(async () => {
    await ContactInquiry.deleteMany({ email: /@humanveriftest\.com$/ });
    await CatalogLead.deleteMany({ email: /@humanveriftest\.com$/ });
    await CareerApplication.deleteMany({ email: /@humanveriftest\.com$/ });
    await Career.deleteMany({ slug: 'verification-test-engineer' });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await ContactInquiry.deleteMany({ email: /@humanveriftest\.com$/ });
    await CatalogLead.deleteMany({ email: /@humanveriftest\.com$/ });
    await CareerApplication.deleteMany({ email: /@humanveriftest\.com$/ });
  });

  describe('Contact / Application Request Form Human Verification', () => {
    it('should reject submission when honeypot trap field is filled by a bot', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Spam Bot',
          email: 'bot@humanveriftest.com',
          message: 'This is an automated spam message sent across all forms.',
          hp_website: 'http://spam-casino-links.com', // BOT TRAP
          turnstileToken: 'test-valid-turnstile-token',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Security verification failed/i);
    });

    it('should reject submission with invalid or failed Turnstile token', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Real User',
          email: 'user@humanveriftest.com',
          message: 'Legitimate customer inquiry for machinery line.',
          turnstileToken: 'invalid-token',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should accept submission with valid Turnstile token and clean honeypot', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Legitimate Client',
          email: 'client@humanveriftest.com',
          phone: '+91 9876543210',
          company: 'Legit Pharma Ltd',
          message: 'Interested in automatic bottle unscrambler and packaging line.',
          turnstileToken: '1x00000000000000000000AA',
          hp_website: '',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Legitimate Client');
    });
  });

  describe('Catalog Download / Lead Form Human Verification', () => {
    it('should reject catalog lead when honeypot is triggered', async () => {
      const res = await request(app)
        .post('/api/v1/catalog-leads')
        .send({
          name: 'Bot Crawler',
          email: 'crawler@humanveriftest.com',
          phone: '1234567890',
          catalogName: 'Capping Line Catalog',
          hp_website: 'https://crawler-bot.ru',
          turnstileToken: 'test-turnstile-token',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject catalog lead with invalid Turnstile token', async () => {
      const res = await request(app)
        .post('/api/v1/catalog-leads')
        .send({
          name: 'Test Visitor',
          email: 'visitor@humanveriftest.com',
          phone: '1234567890',
          catalogName: 'Capping Line Catalog',
          turnstileToken: 'fail-token',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should successfully submit catalog lead with verified human token', async () => {
      const res = await request(app)
        .post('/api/v1/catalog-leads')
        .send({
          name: 'Verified Engineer',
          email: 'engineer@humanveriftest.com',
          phone: '+1 555 123 4567',
          company: 'Global Packaging Co',
          requirement: 'Need high-speed rotary liquid filling specs.',
          catalogName: 'Rotary Liquid Filling Series',
          turnstileToken: 'test-turnstile-token',
          hp_website: '',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.catalogName).toBe('Rotary Liquid Filling Series');
    });
  });

  describe('Career Application Form Human Verification', () => {
    it('should reject career application when honeypot is populated', async () => {
      const dummyPdfBuffer = Buffer.from('%PDF-1.4 dummy resume content');

      const res = await request(app)
        .post('/api/v1/careers/verification-test-engineer/apply')
        .field('candidateName', 'Bot Candidate')
        .field('email', 'botcand@humanveriftest.com')
        .field('phone', '+91 9876543210')
        .field('hp_website', 'http://automated-spam-scraper.com')
        .field('turnstileToken', 'test-turnstile-token')
        .attach('resume', dummyPdfBuffer, 'resume.pdf')
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should reject career application with invalid Turnstile challenge', async () => {
      const dummyPdfBuffer = Buffer.from('%PDF-1.4 dummy resume content');

      const res = await request(app)
        .post('/api/v1/careers/verification-test-engineer/apply')
        .field('candidateName', 'Valid Candidate')
        .field('email', 'validcand@humanveriftest.com')
        .field('phone', '+91 9876543210')
        .field('turnstileToken', 'invalid-token')
        .attach('resume', dummyPdfBuffer, 'resume.pdf')
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should accept career application with valid human verification token', async () => {
      const dummyPdfBuffer = Buffer.from('%PDF-1.4 dummy resume content');

      const res = await request(app)
        .post('/api/v1/careers/verification-test-engineer/apply')
        .field('candidateName', 'Verified Candidate')
        .field('email', 'verifiedcand@humanveriftest.com')
        .field('phone', '+91 9876543210')
        .field('turnstileToken', 'test-turnstile-token')
        .attach('resume', dummyPdfBuffer, 'resume.pdf')
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.candidateName).toBe('Verified Candidate');
    });
  });

  describe('Server-Side Data Sanitization Utility', () => {
    it('should strip null bytes and trim whitespace from nested input fields', () => {
      const input = {
        name: '  John\0 Doe  ',
        company: '  ACME\0 Corp  ',
        nested: {
          note: ' Clean text\0 ',
          tags: ['  tag1\0 ', ' tag2  '],
        },
      };

      const clean = sanitizeData(input);
      expect(clean.name).toBe('John Doe');
      expect(clean.company).toBe('ACME Corp');
      expect(clean.nested.note).toBe('Clean text');
      expect(clean.nested.tags).toEqual(['tag1', 'tag2']);
    });
  });
});
