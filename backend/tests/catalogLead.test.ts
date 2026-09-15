import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { CatalogLead } from '../src/models/CatalogLead.model.js';
import { User } from '../src/models/User.model.js';
import { signAccessToken } from '../src/utils/jwt.js';

describe('Catalog Download Leads API & Workflow', () => {
  const app = createApp();
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/axion_packtech');
    }

    await User.deleteMany({ email: 'catalogleadtestadmin@axionpacktech.com' });
    const adminUser = await User.create({
      name: 'Catalog Lead Admin',
      email: 'catalogleadtestadmin@axionpacktech.com',
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
  });

  afterAll(async () => {
    await CatalogLead.deleteMany({ email: /@leadtest\.com$/ });
    await User.deleteMany({ email: 'catalogleadtestadmin@axionpacktech.com' });
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await CatalogLead.deleteMany({});
  });

  describe('Public Catalog Lead Submission (POST /api/v1/catalog-leads)', () => {
    it('should successfully submit a catalog lead with valid data', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@leadtest.com',
        phone: '+1 234 567 8900',
        company: 'Doe Enterprises',
        requirement: 'Looking for 120 BPM liquid filling line.',
        catalogName: 'Liquid Filling Machines Series',
        entityType: 'category',
        entitySlug: 'liquid-filling-machines',
        pdfUrl: 'https://cdn.axionpacktech.com/catalogs/liquid-filling.pdf',
      };

      const res = await request(app)
        .post('/api/v1/catalog-leads')
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(payload.name);
      expect(res.body.data.email).toBe(payload.email);
      expect(res.body.data.phone).toBe(payload.phone);
      expect(res.body.data.company).toBe(payload.company);
      expect(res.body.data.requirement).toBe(payload.requirement);
      expect(res.body.data.catalogName).toBe(payload.catalogName);
      expect(res.body.data.status).toBe('unread');

      // Verify stored in DB
      const lead = await CatalogLead.findOne({ email: 'john@leadtest.com' });
      expect(lead).toBeTruthy();
      expect(lead?.catalogName).toBe('Liquid Filling Machines Series');
    });

    it('should reject submission with missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/catalog-leads')
        .send({
          name: 'J', // too short (< 2 chars)
          email: 'invalid-email',
          phone: '', // missing
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Catalog Leads Management (GET, PATCH, DELETE)', () => {
    let createdLeadId: string;

    beforeEach(async () => {
      const lead = await CatalogLead.create({
        name: 'Jane Smith',
        email: 'jane@leadtest.com',
        phone: '+91 9876543210',
        company: 'Smith Pharma Ltd',
        requirement: 'High-speed rotary capping catalog request.',
        catalogName: 'Rotary Capping Series',
        entityType: 'product',
        entitySlug: 'rotary-capping-machine',
        pdfUrl: 'https://cdn.axionpacktech.com/catalogs/capping.pdf',
        status: 'unread',
      });
      createdLeadId = lead._id.toString();
    });

    it('should allow admin to list leads with pagination and search', async () => {
      const res = await request(app)
        .get('/api/v1/catalog-leads?search=Smith')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].email).toBe('jane@leadtest.com');
    });

    it('should allow admin to filter leads by status and catalogName', async () => {
      const res = await request(app)
        .get('/api/v1/catalog-leads?status=unread&catalogName=Rotary+Capping+Series')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
    });

    it('should allow admin to update lead status and notes', async () => {
      const res = await request(app)
        .patch(`/api/v1/catalog-leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'contacted',
          notes: 'Spoke with Jane on WhatsApp, shared quotation.',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('contacted');
      expect(res.body.data.notes).toBe('Spoke with Jane on WhatsApp, shared quotation.');

      const updated = await CatalogLead.findById(createdLeadId);
      expect(updated?.status).toBe('contacted');
      expect(updated?.notes).toBe('Spoke with Jane on WhatsApp, shared quotation.');
    });

    it('should return lead stats for admin dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/catalog-leads/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeGreaterThanOrEqual(1);
      expect(res.body.data.unread).toBeGreaterThanOrEqual(1);
    });

    it('should allow admin to delete a lead', async () => {
      const res = await request(app)
        .delete(`/api/v1/catalog-leads/${createdLeadId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const deleted = await CatalogLead.findById(createdLeadId);
      expect(deleted).toBeNull();
    });
  });
});
