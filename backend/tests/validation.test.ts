import request from 'supertest';
import { createApp } from '../src/app.js';

describe('Zod Validation Middleware', () => {
  const app = createApp();

  it('POST /api/v1/auth/login should reject empty body with 400', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Validation failed');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/auth/login should reject invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'not-an-email',
      password: 'validpassword123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.some((e: { field: string }) => e.field.includes('email'))).toBe(true);
  });

  it('POST /api/v1/contact should reject contact without required fields', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      name: 'John',
      // Missing email, phone, message
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/careers/:slug/apply should reject application without resume URL and key', async () => {
    const res = await request(app).post('/api/v1/careers/mechanical-engineer/apply').send({
      careerSlug: 'mechanical-engineer',
      careerTitle: 'Mechanical Engineer',
      candidateName: 'Parth',
      email: 'test@example.com',
      phone: '+91 9999999999',
      education: 'B.Tech Mechanical',
      experience: '3 years',
      // Missing resumeUrl and resumeKey
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
