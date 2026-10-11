# AXION PackTech — Industrial Packaging, Automation & Machinery Platform

<div align="center">

![AXION PackTech](client/public/logo.jpeg)

**Next-Generation Industrial Packaging Machinery, Bulk Bagging Lines & Robotic Automation Systems**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Turnstile_%26_R2-F38020?style=for-the-badge&logo=cloudflare)](https://www.cloudflare.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 🏭 Overview

**AXION PackTech** is an industrial engineering solutions manufacturer specializing in advanced packaging machinery, bulk bagging lines, high-speed container handling, and end-of-line robotic automation.

This repository contains the complete full-stack web application and content management system for AXION PackTech, engineered for high performance, top-tier security, and dynamic content management.

---

## 🏗️ Repository Structure

```
Axion-Pack-Tech-2/
├── backend/                      # Node.js + Express + TypeScript API Server
│   ├── src/
│   │   ├── config/               # Database, Redis & Cloudflare R2 configurations
│   │   ├── controllers/          # Business logic & route handlers
│   │   ├── middleware/           # Turnstile verification, auth, rate limiting & multer
│   │   ├── models/               # Mongoose schemas & MongoDB models
│   │   ├── routes/               # API endpoint routing (/api/v1/*)
│   │   ├── services/             # Turnstile, R2 storage, email & cache services
│   │   ├── utils/                # JWT, logger, and helper utilities
│   │   └── validators/           # Zod schema validation rules
│   ├── tests/                    # Jest + Supertest integration & security tests
│   ├── .env.example              # Safe template for backend environment variables
│   ├── Dockerfile                # Production container configuration
│   ├── docker-compose.yml        # Multi-container setup (MongoDB, Redis, API)
│   └── package.json
│
├── client/                       # Next.js 16 (App Router) + React 19 + Tailwind v4
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages and layouts
│   │   │   ├── admin/            # Protected Admin CMS dashboard & managers
│   │   │   ├── careers/          # Career portal & candidate application flow
│   │   │   ├── contact/          # Contact & RFQ inquiry system
│   │   │   ├── products/         # Dynamic 3-tier product catalog
│   │   │   └── (content)/        # Industries, Services, News, Blogs, About Us
│   │   ├── components/           # Reusable UI, Layout, Form & CMS components
│   │   │   ├── common/           # HumanVerification (Turnstile), Modals, DynamicHero
│   │   │   ├── contact/          # ContactForm and inquiry components
│   │   │   └── careers/          # CareerApplicationForm and job cards
│   │   ├── hooks/                # Custom React state & data hooks
│   │   ├── lib/api/              # Typed client-side and server-side API clients
│   │   └── types/                # TypeScript interfaces and entity types
│   ├── public/                   # Static assets, logos, and icons
│   ├── .env.example              # Safe template for frontend environment variables
│   └── package.json
│
├── .gitignore                    # Comprehensive exclusion for secrets & build outputs
└── README.md                     # Project documentation & setup guide
```

---

## 🛡️ Security Architecture & Cloudflare Turnstile Integration

All public data submission workflows are protected against automated bots, spam, and abuse:

1. **Cloudflare Turnstile Human Verification**: Every public form obtains an interactive or invisible Turnstile challenge token.
2. **Backend Siteverify Verification**: The backend independently validates every submission token with `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
3. **Imperative Reset Cycle**: When verification fails or expires, widgets automatically reset and clear stale tokens.
4. **Honeypot Trap Fields**: Invisible honeypot fields (`hp_website`) trap simple crawler bots immediately.
5. **IP Rate Limiting & Duplicate Prevention**: In-memory and Redis throttlers block rapid-fire duplicate submissions.
6. **Server-Side Data Sanitization**: Recursive null-byte stripping and string trimming prevent injection vectors.
7. **Protected Admin Endpoints**: All CMS mutation and management endpoints require JWT authentication and Role-Based Access Control (`admin` or `editor`).

### Public Form Protection Matrix

| Form Name | User Action | Frontend Component | Backend Route | Protection Layer |
| :--- | :--- | :--- | :--- | :--- |
| **Contact & RFQ Inquiries** | General inquiry, quote request, engineering spec inquiry | `ContactForm.tsx` | `POST /api/v1/contact` | Turnstile + Honeypot + Rate Limiter |
| **Catalog PDF Lead Gating** | Technical brochure & machine datasheet download | `CatalogLeadModal.tsx` | `POST /api/v1/catalog-leads` | Turnstile + Honeypot + Rate Limiter |
| **Career Job Applications** | General job application with candidate CV upload | `CareerApplicationForm.tsx` | `POST /api/v1/careers/apply` | Turnstile + Honeypot + Multer Check |
| **Role-Specific Applications**| Position-targeted application (e.g. `/careers/jobs/[slug]/apply`) | `CareerApplicationForm.tsx` | `POST /api/v1/careers/:slug/apply` | Turnstile + Honeypot + Multer Check |

*Note: Informational content pages (`/about-us`, `/news`, `/blog`, `/services`, `/industries`, `/products`) remain clean and do not execute unnecessary Turnstile challenges.*

---

## ⚡ Tech Stack & Technologies

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Human Verification**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure
- **Runtime**: [Node.js 22](https://nodejs.org/)
- **Framework**: [Express 4](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Caching**: [Redis](https://redis.io/)
- **Media & Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible presigned direct upload pipeline)
- **Validation**: [Zod](https://zod.dev/)
- **Email Delivery**: [Nodemailer](https://nodemailer.com/) / Brevo SMTP
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or 22.x
- MongoDB (local service or MongoDB Atlas)
- Redis (optional for local caching, falls back to direct database)
- npm or pnpm

---

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your local MongoDB URI, JWT secret, and Cloudflare credentials

# 3. Start development server (Port 5000)
npm run dev
```

The backend will start at `http://localhost:5000/api/v1` with a health check endpoint at `http://localhost:5000/api/v1/health`.

---

### 2. Frontend Setup

```bash
cd client

# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Next.js public API URL and Turnstile site key

# 3. Start development server (Port 3000)
npm run dev
```

The frontend will be available at `http://localhost:3000`.

---

## 🐳 Docker Deployment

To launch the full stack (API, MongoDB, Redis) with Docker Compose:

```bash
cd backend
docker-compose up -d --build
```

---

## 🧪 Testing & Quality Assurance

Run the automated test suite in the backend:

```bash
cd backend

# Run all test suites
npm test

# Run Human Verification & Security tests specifically
npm test -- tests/humanVerification.test.ts
```

Build the client production bundle:

```bash
cd client
npm run build
```

---

## 🔒 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API Server Port | `5000` |
| `NODE_ENV` | Environment mode | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/axion_packtech` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for JWT signing | `min_32_characters_secret_key` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Secret Key (Backend only) | `1x0000000000000000000000000000000AA` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `your_account_id` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | `your_access_key` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | `your_secret_key` |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name | `axion-packtech-media` |
| `R2_PUBLIC_URL` | Public CDN URL for media | `https://media.yourdomain.com` |

### Frontend (`client/.env.local`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `API_BASE_URL` | Server-Side API URL | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_API_URL` | Client-Side API URL | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical Site URL | `http://localhost:3000` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Site Key | `1x00000000000000000000AA` |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public Media CDN URL | `https://media.yourdomain.com` |

---



# AXION PackTech — Technology Stack, Free-Tier Limits & Upgrade Policy

Dear Client,

The AXION PackTech website and content management system have been developed using a modern full-stack technology stack. At the current stage, the project is intended to use free-tier services wherever available to keep the initial operating costs low.

The application includes a dynamic product catalog, admin panel, database integration, media storage, security features, caching, contact forms, career applications, and email notifications.

## 1. Technologies and Services Used

| Technology / Service | Purpose | Current Plan / Cost Model |
|---|---|---|
| Next.js and React | Website frontend and dynamic pages | Frameworks are open-source; hosting is separate |
| TypeScript and Tailwind CSS | Type safety and responsive UI design | Open-source |
| Node.js and Express.js | Backend APIs and application logic | Open-source |
| MongoDB | Database for products, categories, inquiries and other content | Self-hosted or cloud plan, depending on deployment |
| Redis | Caching and performance optimization | Open-source software; hosting is separate |
| Cloudflare R2 | Storage for product images, videos and PDF catalogs | Free tier, subject to account usage |
| Cloudflare Turnstile | Bot protection for public forms | Free plan, subject to plan conditions |
| Brevo SMTP | Email notifications and form confirmations | Free plan, if the account is enrolled in that plan |
| Docker and Docker Compose | Application containerization and deployment | Open-source |
| Cloudflare CDN | Media delivery and caching | Configuration and applicable plan determine the cost |

**Important:** The project code contains these integrations, but the live account plans, hosting subscriptions and actual usage must be confirmed separately before they can be represented as the current billing status.

## 2. Free-Tier Usage Limits

The following are the published free-tier allowances for relevant services as of October 2026. They are service limits, not guaranteed website traffic capacities.

| Service | Free-Tier Allowance | What Happens When Exceeded |
|---|---|---|
| Cloudflare R2 | 10 GB-month of Standard storage, 1 million Class A requests/month and 10 million Class B requests/month | Additional eligible usage is billed according to the pricing schedule |
| Cloudflare Turnstile | Up to 20 widgets per account and unlimited verification challenges under the Free plan | Enterprise features may require an upgrade |
| Brevo SMTP | 300 email sends per day | Additional emails may be held or not delivered; a higher plan is needed for increased sending limits |
| MongoDB Atlas Free | 512 MB of data and index storage | Writes can fail when the storage quota is reached; upgrade to a higher cluster tier |
| Vercel Hobby, if used | Free hosting allowances subject to resource-specific limits | Some services may be restricted until the quota resets or the account is upgraded |

Official references:

- Cloudflare R2: https://developers.cloudflare.com/r2/pricing/
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/plans/
- Brevo: https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/
- Vercel: https://vercel.com/docs/plans/hobby

**Note:** MongoDB Atlas and Vercel are included as conditional examples of cloud services. The project audit found local/Docker MongoDB and Redis configuration, and does not confirm an active MongoDB Atlas or Vercel production deployment.

## 3. What Happens If Usage Exceeds the Free Limits?

If the website's traffic, storage, email volume or other resource consumption increases beyond the included free allowances, the following actions may be required:

1. **Media storage:** Upgrade the Cloudflare R2 billing arrangement or optimize and archive unnecessary media.
2. **Email notifications:** Move to a higher Brevo plan if the daily email limit is insufficient.
3. **Database:** Increase database capacity if the selected cloud database reaches its storage or performance limits.
4. **Website hosting:** Upgrade the hosting plan or server resources if traffic, compute or bandwidth requirements exceed the current allocation.
5. **Caching and backend infrastructure:** Increase server resources or use a suitable managed service if the existing infrastructure cannot handle the workload.
6. **Security services:** Upgrade only if the business requires features or capacity unavailable under the current security plan.

Upgrades will be recommended based on actual usage, performance requirements and the provider's current pricing. Not every service requires a paid upgrade when traffic increases.

## 4. Billing and Upgrade Policy

- The initial implementation uses free-tier services wherever suitable and available.
- Free-tier allowances are subject to the respective provider's terms, quotas and pricing changes.
- A free-tier service exceeding its allowance does not necessarily incur an automatic charge; some services restrict functionality, while others bill eligible overages.
- Any proposed paid subscription, additional hosting expense or infrastructure upgrade should be communicated to the client before the additional cost is committed.
- The client should approve the applicable plan and billing arrangement before any client-funded upgrade.
- Domain registration, VPS hosting, paid subscriptions, taxes and other third-party charges are separate unless explicitly included in the project agreement.

## 5. Future Scalability

AXION PackTech has been designed with a modular architecture so that database capacity, media storage, email delivery and hosting resources can be upgraded as business requirements grow.

The current free-tier approach is suitable for controlling initial costs, but actual production capacity depends on the selected hosting environment, configuration, workload and provider limits. No specific number of concurrent users or performance level is guaranteed by a free plan alone.

Thank you.

**AXION PackTech — Technology and Infrastructure Overview**

## 📄 License

© 2026 AXION PackTech. All Rights Reserved.
