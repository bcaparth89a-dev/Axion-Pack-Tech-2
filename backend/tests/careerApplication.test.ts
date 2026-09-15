import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { Career } from '../src/models/Career.model.js';
import { CareerApplication } from '../src/models/CareerApplication.model.js';
import { signAccessToken } from '../src/utils/jwt.js';
import { User } from '../src/models/User.model.js';

describe('Career Application System & End-to-End Flow', () => {
  const app = createApp();
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/axion_packtech_test');
    }

    await User.deleteMany({ email: 'careeradmin@axionpacktech.com' });
    const adminUser = await User.create({
      name: 'Career Admin',
      email: 'careeradmin@axionpacktech.com',
      passwordHash: '$2b$10$epRswS7W7Y7j7mJ0G6mNveM8j2o3u8U8J2o3u8U8J2o3u8U8J2o3u',
      role: 'admin',
      isActive: true,
    });
    adminUserId = adminUser._id.toString();
    adminToken = signAccessToken({
      userId: adminUserId,
      email: adminUser.email,
      role: 'admin',
    });

    await Career.deleteMany({ slug: 'test-automation-engineer' });
    await Career.create({
      title: 'Test Automation Engineer',
      slug: 'test-automation-engineer',
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
    await CareerApplication.deleteMany({ email: /@testcandidate\.com$/ });
    await Career.deleteMany({ slug: 'test-automation-engineer' });
    await User.deleteMany({ email: 'careeradmin@axionpacktech.com' });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await CareerApplication.deleteMany({ email: /@testcandidate\.com$/ });
  });

  describe('Candidate Public Application Submission', () => {
    it('should successfully submit an application with file attachment', async () => {
      const dummyPdfBuffer = Buffer.from('%PDF-1.4 dummy resume content');

      const res = await request(app)
        .post('/api/v1/careers/test-automation-engineer/apply')
        .field('candidateName', 'Aarav Patel')
        .field('email', 'aarav@testcandidate.com')
        .field('phone', '+91 9876543210')
        .field('careerSlug', 'test-automation-engineer')
        .field('careerTitle', 'Test Automation Engineer')
        .field('coverMessage', 'Excited to apply for the Automation Engineer role at Axion.')
        .attach('resume', dummyPdfBuffer, 'Aarav_Patel_Resume.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('candidateName', 'Aarav Patel');
      expect(res.body.data).toHaveProperty('status', 'new');
      expect(res.body.data).toHaveProperty('careerSlug', 'test-automation-engineer');
      expect(res.body.data).toHaveProperty('resumeFileName', 'Aarav_Patel_Resume.pdf');

      // Verify in MongoDB
      const dbApp = await CareerApplication.findOne({ email: 'aarav@testcandidate.com' });
      expect(dbApp).not.toBeNull();
      expect(dbApp?.candidateName).toBe('Aarav Patel');
      expect(dbApp?.status).toBe('new');
    });

    it('should reject duplicate submission with same email for same position within 24h', async () => {
      const dummyPdfBuffer = Buffer.from('%PDF-1.4 dummy resume content');

      // First submission
      await request(app)
        .post('/api/v1/careers/test-automation-engineer/apply')
        .field('fullName', 'Neha Joshi')
        .field('email', 'neha@testcandidate.com')
        .field('phone', '+91 9876543211')
        .attach('resume', dummyPdfBuffer, 'Neha_Resume.pdf');

      // Duplicate submission
      const res = await request(app)
        .post('/api/v1/careers/test-automation-engineer/apply')
        .field('fullName', 'Neha Joshi')
        .field('email', 'neha@testcandidate.com')
        .field('phone', '+91 9876543211')
        .attach('resume', dummyPdfBuffer, 'Neha_Resume.pdf');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been submitted');
    });

    it('should reject application with invalid file format (e.g. .exe or .txt)', async () => {
      const dummyTextBuffer = Buffer.from('plain text file');

      const res = await request(app)
        .post('/api/v1/careers/test-automation-engineer/apply')
        .field('fullName', 'Vikram Desai')
        .field('email', 'vikram@testcandidate.com')
        .field('phone', '+91 9876543212')
        .attach('resume', dummyTextBuffer, 'malicious.exe');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported resume file format');
    });
  });

  describe('End-to-End: Submission → MongoDB → Admin Applications API', () => {
    it('should submit candidate application, persist to MongoDB, and be immediately retrievable via Admin API', async () => {
      const dummyDocxBuffer = Buffer.from('PK\x03\x04 dummy docx content');

      // 1. Candidate submits via customer API
      const submitRes = await request(app)
        .post('/api/v1/careers/apply')
        .field('candidateName', 'Priya Sharma')
        .field('email', 'priya@testcandidate.com')
        .field('phone', '+91 9811223344')
        .field('careerSlug', 'test-automation-engineer')
        .field('careerTitle', 'Test Automation Engineer')
        .field('coverMessage', 'Experienced PLC programmer with 3 years in packaging machinery.')
        .attach('resume', dummyDocxBuffer, 'Priya_Sharma_Resume.docx');

      expect(submitRes.status).toBe(201);
      expect(submitRes.body.success).toBe(true);
      const submittedId = submitRes.body.data._id;
      expect(submittedId).toBeDefined();

      // 2. Direct MongoDB check
      const mongoDoc = await CareerApplication.findById(submittedId);
      expect(mongoDoc).not.toBeNull();
      expect(mongoDoc?.candidateName).toBe('Priya Sharma');
      expect(mongoDoc?.email).toBe('priya@testcandidate.com');
      expect(mongoDoc?.phone).toBe('+91 9811223344');
      expect(mongoDoc?.careerTitle).toBe('Test Automation Engineer');
      expect(mongoDoc?.coverMessage).toContain('PLC programmer');
      expect(mongoDoc?.resumeFileName).toBe('Priya_Sharma_Resume.docx');
      expect(mongoDoc?.status).toBe('new');

      // 3. Admin fetches applications list (verifying route is NOT intercepted by /:slug)
      const listRes = await request(app)
        .get('/api/v1/careers/admin/applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data.items)).toBe(true);

      const found = listRes.body.data.items.find((a: { _id: string }) => a._id === submittedId);
      expect(found).toBeDefined();
      expect(found.candidateName).toBe('Priya Sharma');
      expect(found.email).toBe('priya@testcandidate.com');
      expect(found.phone).toBe('+91 9811223344');
      expect(found.status).toBe('new');

      // 4. Admin fetches single application by ID
      const detailRes = await request(app)
        .get(`/api/v1/careers/admin/applications/${submittedId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.candidateName).toBe('Priya Sharma');

      // 5. Admin updates status to 'reviewing', then 'shortlisted', then 'hired'
      const statusRes = await request(app)
        .patch(`/api/v1/careers/admin/applications/${submittedId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'shortlisted',
          notes: 'Excellent candidate. 1st round technical interview cleared.',
        });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('shortlisted');
      expect(statusRes.body.data.notes).toContain('1st round technical');

      // 6. Search filter check
      const searchRes = await request(app)
        .get('/api/v1/careers/admin/applications?search=Priya')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(searchRes.body.data.items[0].candidateName).toBe('Priya Sharma');

      // 7. Status filter check
      const statusFilterRes = await request(app)
        .get('/api/v1/careers/admin/applications?status=shortlisted')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statusFilterRes.status).toBe(200);
      const shortlistedItem = statusFilterRes.body.data.items.find((a: { _id: string }) => a._id === submittedId);
      expect(shortlistedItem).toBeDefined();

      // 8. Admin deletes application
      const deleteRes = await request(app)
        .delete(`/api/v1/careers/admin/applications/${submittedId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify deletion in MongoDB
      const postDeleteDoc = await CareerApplication.findById(submittedId);
      expect(postDeleteDoc).toBeNull();
    });
  });
});
