# AXION PackTech — Industrial Packaging, Bagging & Automation Solutions

<div align="center">

![AXION PackTech](public/logo.jpeg)

**Next-Generation Industrial Packaging, High-Speed Bagging & Robotic Automation Systems**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Deployment](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 🏭 Overview

**AXION PackTech** is a premier engineering solutions company specializing in state-of-the-art packaging machinery, bulk bagging lines, material handling systems, and end-of-line robotic automation. With a commitment to *"Engineering for a Better Tomorrow"*, AXION PackTech delivers turnkey manufacturing lines and customized automation to global industrial clients across chemical, food, pharmaceutical, building materials, and logistics sectors.

This repository contains the complete, modern, responsive, and SEO-optimized web application for AXION PackTech, built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🚀 Key Modules & Architecture

### 1. 📦 Machinery & Engineering Divisions
Comprehensive, multi-tier product catalog with technical specifications, dynamic routing, and high-resolution visuals:
* **Filling & Bagging Systems**: Open-mouth bagging, valve bag fillers, FFS tubular bagging, jumbo FIBC bag stations, premade pouch packing, and small bag packers.
* **Packaging Machines**: Vertical Form Fill Seal (VFFS), horizontal flow wrappers, multi-head weighers, automated carton sealers, and case packers.
* **Sealing & Closing Systems**: Industrial heat sealers, continuous band sealers, ultrasonic pouch welders, automatic sewing heads, and vacuum chamber machines.
* **Material Handling & Conveying**: Heavy-duty roller conveyors, modular belt conveyors, pneumatic vacuum transfer, bucket elevators, and spiral accumulation towers.
* **Palletizing & Robotic Handling**: High-payload robotic palletizers, high-level and low-level Cartesian palletizers, pallet dispensers, and slip-sheet placers.
* **End-of-Line & Stretch Wrapping**: Rotary arm stretch wrappers, turntable wrappers, automatic strapping machines, checkweighers, and industrial metal detectors.

*Route Pattern:* `/products` → `/products/[category]` → `/products/[category]/[subcategory]`

### 2. 🌐 Industries Served
Engineered solutions tailored to stringent sector compliance and operating conditions:
* **Chemicals & Petrochemicals**: Corrosion-resistant, explosion-proof (ATEX) bagging and dust-tight conveying for polymers, resins, and hazardous powders.
* **Food & Agro Products**: Sanitary stainless steel 304/316 designs, washdown-ready bulk grain, flour, sugar, and spices packaging.
* **Cement & Building Materials**: High-throughput bagging and automated palletizing for dry mortar, cement, sand, tile adhesives, and aggregates.
* **Minerals & Mining**: Heavy-duty abrasion-resistant packaging systems for bentonite, silica, coal, and minerals.
* **Pharmaceuticals & Healthcare**: Cleanroom-compatible (cGMP) sterile blister, pouch, and bottle packaging with serialized tracking.
* **Logistics & Warehousing**: High-speed sorting, inline barcode verification, dynamic checkweighing, and automated stretch wrapping.

*Route Pattern:* `/industries` → `/industries/[industry]`

### 3. 🛠️ Industrial Services & Turnkey Solutions
End-to-end lifecycle engineering support for manufacturing plants:
* **Engineering Design & Turnkey Projects**: Custom layout planning, 3D simulation, CAD modeling, and turnkey project management.
* **Installation & Commissioning**: On-site mechanical and electrical setup, PLC/SCADA integration, SAT/FAT protocol execution.
* **Maintenance & AMC**: Preventive maintenance schedules, Annual Maintenance Contracts (AMC), and emergency breakdown support.
* **Spare Parts & Retrofits**: Genuine OEM components, mechanical retrofits, controls upgrades (Siemens/Rockwell), and line speed optimization.
* **Training & Technical Advisory**: Operator safety training, maintenance team workshops, and OEE audit consultations.

*Route Pattern:* `/services` → `/services/[service]`

### 4. 📰 News & Media Hub
Real-time company announcements, technology unveilings, case studies, and multimedia:
* Categorized updates: *Company News*, *Product & Technology*, *Projects & Installations*, *Events & Exhibitions*, and *Technical Insights*.
* Dedicated article pages with structured metadata, breadcrumbs, tags, and related news recommendations.
* Embedded responsive video player support for live machinery demonstrations.

*Route Pattern:* `/news` → `/news/[category]` → `/news/[category]/[slug]`

### 5. 🎓 Careers & Opportunities Portal
Full-fledged employment, internship, and apprenticeship discovery center:
* **Job Opportunities**: Full-time positions for Mechanical Design Engineers, Service Engineers, Automation Specialists, and Production Managers.
* **Student Internships**: Paid semester and summer internships in Mechanical Design, Mechatronics, R&D, and Production.
* **Apprenticeships & Training**: Structured technical programs for Machinist Apprentices, Industrial Electricians, and Quality Control Technicians.
* **Selection Process & Eligibility**: Clear criteria detailing screening, technical assessments, interviews, and background verifications.
* **Interactive Application Form**: Online job application with multi-file CV/resume upload and role-specific data binding.

*Route Pattern:* `/careers` → `/careers/jobs`, `/careers/internships`, `/careers/apprenticeships` → `/careers/[type]/[slug]` → `/careers/[type]/[slug]/apply`

### 6. ✍️ Engineering Blog & Technical Insights
Authoritative packaging technology articles written by engineering specialists:
* 6 Core Categories: *Packaging Technology*, *Industrial Automation*, *Filling & Bagging Solutions*, *Industry 4.0 & Smart Tech*, *Maintenance & Best Practices*, *Sustainability in Packaging*.
* Deep-dive technical articles featuring key takeaways, implementation checklists, engineering tables, and related reads.
* Category filtering and real-time query navigation.

*Route Pattern:* `/blog` → `/blog/category/[category]` → `/blog/[slug]`

### 7. 📬 Contact & RFQ Inquiry System
High-conversion, industrial-grade inquiry workflow:
* Detailed multi-field technical inquiry form (Product Division, Line Capacity, Material Type, Scope of Work).
* Interactive office cards for Headquarters, Regional Sales Offices, and Manufacturing Centers.
* Direct contact points: Phone, WhatsApp, and official corporate email links.

*Route Pattern:* `/contact`

### 8. 🎨 Design System & Responsive Navbar UX
* **Color Palette**: Deep Navy (`#061527`), Steel Blue, Clean White, and Precision Industrial Orange (`#ea580c`).
* **Desktop Navigation**: Floating glassmorphism navbar that smoothly transitions to pinned state on scroll with rich dropdown menus.
* **Mobile & Tablet Header**: Ultra-compact 56px/64px header, vertically centered AXION logo, custom 3-bar industrial hamburger toggle, and a slide-over navigation drawer with nested accordions.
* **Intro Splash Screen**: Ambient branded glow intro with automatic skip and fade transition.

---

## 💻 Tech Stack & Dependencies

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.3.4` | App Router, Static Site Generation (SSG), Image Optimization |
| **React** | `19.2.8` | Core UI library & Server/Client Component Architecture |
| **TypeScript** | `5.x` | Strict type safety across datasets, props, and routing |
| **Tailwind CSS** | `v4.0` | High-performance utility styling with modern CSS variables |
| **ESLint** | `^9` | Code quality, consistency, and Next.js best practices |

---

## 📁 Project Structure

```text
axion-pack-tech/
├── public/
│   ├── images/
│   │   ├── about/          # Facility, sustainability, and corporate imagery
│   │   ├── blog/           # Editorial thumbnails and article hero banners
│   │   ├── careers/        # Engineering team, workplace, and career headers
│   │   ├── industries/     # Sector-specific processing and packaging visuals
│   │   ├── news/           # News releases, exhibitions, and technical assets
│   │   ├── products/       # Machine photography across 6 divisions
│   │   └── services/       # Field service, design, and commissioning photos
│   ├── videos/             # Industrial machinery motion clips
│   └── logo.jpeg           # Official AXION PackTech logo
├── src/
│   ├── app/
│   │   ├── about-us/       # Company history, vision, leadership, and responsibilities
│   │   ├── blog/           # Technical articles and category archives
│   │   ├── careers/        # Job portal, details, and application workflow
│   │   ├── contact/        # Technical inquiry and RFQ form
│   │   ├── industries/     # Industrial sectors landing and individual pages
│   │   ├── news/           # News releases, media center, and video showcases
│   │   ├── products/       # 6 divisions and 24 machine subcategories
│   │   ├── services/       # Engineering and after-sales service offerings
│   │   ├── globals.css     # Global theme tokens, typography, and animations
│   │   ├── layout.tsx      # Root layout with SEO metadata and font configuration
│   │   └── page.tsx        # Homepage composing heroes, intro, products, and insights
│   ├── components/
│   │   ├── about/          # WhyChooseUs, AboutHero, AboutInfo, Values
│   │   ├── blog/           # BlogCard, BlogHero, BlogFilter, RelatedBlogs
│   │   ├── careers/        # CareerCard, CareerHero, ApplicationForm, SelectionProcess
│   │   ├── contact/        # ContactForm, ContactInfo, OfficeLocations
│   │   ├── home/           # HomeHero, CompanyIntro, HomeProducts, HomeIndustries
│   │   ├── layout/         # Navbar, Footer, ScrollToTop
│   │   ├── navigation/     # MobileMenu drawer, Desktop dropdown menus
│   │   ├── news/           # NewsCard, NewsGrid, VideoPlayer, RelatedNews
│   │   └── splash/         # Animated brand splash screen
│   ├── data/               # Centralized TypeScript data files (products, news, blogs, careers)
│   ├── hooks/              # Custom React hooks (scroll detection, media queries)
│   ├── lib/                # Utility helpers
│   └── types/              # Domain-specific TypeScript definitions
├── .gitignore              # Production-grade Git ignore configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Scripts and dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # Repository documentation
```

---

## 🛠️ Getting Started

### Prerequisites
* **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
* **npm**, **yarn**, or **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bcaparth89a-dev/Axion-Pack-Tech-.git
   cd Axion-Pack-Tech-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Build & Quality Verification

* **Linting & Code Standards:**
  ```bash
  npm run lint
  ```

* **Production Static Build:**
  ```bash
  npm run build
  ```
  Generates 117 statically pre-rendered routes (SSG) with optimized HTML, CSS, and JavaScript bundles.

* **Production Preview:**
  ```bash
  npm run start
  ```

---

## 🚢 Deployment

This project is fully optimized for continuous deployment on **Vercel**:

1. Import this repository into [Vercel](https://vercel.com/new).
2. Framework Preset: **Next.js**
3. Build Command: `next build` (default)
4. Output Directory: `.next` (default)
5. Deploy directly without requiring database setups or backend environment keys.

---

## 📄 License & Intellectual Property

© 2026 **AXION PackTech**. All Rights Reserved.  
Engineering for a Better Tomorrow.
