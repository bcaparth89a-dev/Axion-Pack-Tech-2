import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Industry } from '../models/Industry.model.js';
import { Service } from '../models/Service.model.js';
import { Career } from '../models/Career.model.js';
import { NewsCategory } from '../models/NewsCategory.model.js';
import { News } from '../models/News.model.js';
import { BlogCategory } from '../models/BlogCategory.model.js';
import { Blog } from '../models/Blog.model.js';
import { HomePage } from '../models/HomePage.model.js';
import { AboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { CompanyStats } from '../models/CompanyStats.model.js';
import { ContactSettings } from '../models/ContactSettings.model.js';
import { SiteSettings } from '../models/SiteSettings.model.js';
import { logger } from '../utils/logger.js';

const seed = async () => {
  try {
    logger.info('Connecting to database for idempotent migration/seed...');
    await connectDB();


    // 3. Industries
    if ((await Industry.countDocuments()) === 0) {
      logger.info('Seeding initial Industries...');
      const industries = [
        {
          title: 'Food & Beverage',
          slug: 'food-beverage',
          shortDescription: 'Sanitary stainless steel 304/316 bagging and pouch packing lines.',
          description: 'Hygienic packaging systems for grains, pulses, sugar, flour, and powders.',
          image: '/images/industries/food-beverage.jpg',
          published: true,
          sortOrder: 1,
        },
        {
          title: 'Chemicals',
          slug: 'chemicals',
          shortDescription: 'Corrosion-resistant and ATEX explosion-proof packaging machinery.',
          description: 'Specialized packaging solutions for polymer resins, pigments, and fine chemicals.',
          image: '/images/industries/chemicals.jpg',
          published: true,
          sortOrder: 2,
        },
      ];
      await Industry.insertMany(industries);
      logger.info(`Seeded ${industries.length} industries.`);
    }

    // 4. Services
    if ((await Service.countDocuments()) === 0) {
      logger.info('Seeding initial Services...');
      const services = [
        {
          title: 'Engineering & Design',
          slug: 'engineering-design',
          shortDescription: 'Customized system design and plant integration tailored to production constraints.',
          description: 'Turnkey engineering solutions from layout drafting to 3D simulation.',
          image: '/images/services/engineering-design.webp',
          published: true,
          sortOrder: 1,
        },
        {
          title: 'Installation & Commissioning',
          slug: 'installation-commissioning',
          shortDescription: 'Professional onsite installation and commissioning by certified engineers.',
          description: 'Mechanical erection, electrical hookups, and trial runs.',
          image: '/images/services/installation-commissioning.webp',
          published: true,
          sortOrder: 2,
        },
      ];
      await Service.insertMany(services);
      logger.info(`Seeded ${services.length} services.`);
    }

    // 5. Careers
    if ((await Career.countDocuments()) === 0) {
      logger.info('Seeding initial Career openings...');
      const careers = [
        {
          title: 'Mechanical Design Engineer',
          slug: 'mechanical-design-engineer',
          type: 'job',
          department: 'Engineering & R&D',
          location: 'Vadodara, Gujarat, India',
          description: 'Design automated packaging machinery and robotic material handling systems in SolidWorks.',
          experience: '3-6 years',
          published: true,
          status: 'active',
          sortOrder: 1,
        },
      ];
      await Career.insertMany(careers);
      logger.info(`Seeded ${careers.length} career openings.`);
    }

    // 6. News & Categories
    if ((await NewsCategory.countDocuments()) === 0) {
      await NewsCategory.insertMany([
        { title: 'Company News', slug: 'company-news', sortOrder: 1 },
        { title: 'Product & Technology', slug: 'product-technology', sortOrder: 2 },
      ]);
    }
    if ((await News.countDocuments()) === 0) {
      await News.create({
        title: 'AXION PackTech Expands Packaging Engineering Capabilities',
        slug: 'axion-packtech-expands-packaging-engineering-capabilities',
        categorySlug: 'company-news',
        excerpt: 'New state-of-the-art manufacturing wing dedicated to high-speed automated bagging lines.',
        content: 'AXION PackTech has officially inaugurated its expanded manufacturing wing in Vadodara.',
        featuredImage: '/images/news/company/engineering-wing-expansion.jpg',
        author: 'AXION Communications',
        published: true,
      });
    }

    // 7. Blogs & Categories
    if ((await BlogCategory.countDocuments()) === 0) {
      await BlogCategory.insertMany([
        { title: 'Packaging Technology', slug: 'packaging-technology', sortOrder: 1 },
        { title: 'Industrial Automation', slug: 'industrial-automation', sortOrder: 2 },
      ]);
    }
    if ((await Blog.countDocuments()) === 0) {
      await Blog.create({
        title: 'How Automation Is Transforming Modern Packaging Lines',
        slug: 'how-automation-is-transforming-modern-packaging-lines',
        categorySlug: 'industrial-automation',
        excerpt: 'Examining the impact of robotic handling, servo drives, and dynamic checkweighing.',
        content: 'Automation in packaging lines has evolved from simple mechanized conveyor assists to full cyber-physical systems.',
        featuredImage: '/images/blog/automation-packaging.jpg',
        published: true,
      });
    }
    if ((await HomePage.countDocuments()) === 0) {
      await HomePage.create({});
      logger.info('Initialized default HomePage CMS record.');
    }

    if ((await AboutPage.countDocuments()) === 0) {
      await AboutPage.create({});
      logger.info('Initialized default AboutPage CMS record.');
    }

    if ((await ResponsibilityPage.countDocuments()) === 0) {
      await ResponsibilityPage.create({});
      logger.info('Initialized default ResponsibilityPage CMS record.');
    }

    if ((await CompanyStats.countDocuments()) === 0) {
      await CompanyStats.create({});
      logger.info('Initialized default CompanyStats record.');
    }

    if ((await ContactSettings.countDocuments()) === 0) {
      await ContactSettings.create({});
      logger.info('Initialized default ContactSettings record.');
    }

    if ((await SiteSettings.countDocuments()) === 0) {
      await SiteSettings.create({});
      logger.info('Initialized default SiteSettings record.');
    }

    logger.info('Seeding finished successfully. Database is initialized and ready.');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seed:', error);
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
};

seed();
