import dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';

// Ensure .env is loaded before database connection
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import mongoose from 'mongoose';
import { initRedis, disconnectRedis, isRedisReady } from '../config/redis.js';
import { cacheService } from '../cache/cache.service.js';
import { Industry } from '../models/Industry.model.js';
import { Service } from '../models/Service.model.js';
import { NewsCategory } from '../models/NewsCategory.model.js';
import { News } from '../models/News.model.js';
import { BlogCategory } from '../models/BlogCategory.model.js';
import { Blog } from '../models/Blog.model.js';
import { Career } from '../models/Career.model.js';
import { ContactSettings } from '../models/ContactSettings.model.js';
import { SiteSettings } from '../models/SiteSettings.model.js';
import { HomePage } from '../models/HomePage.model.js';
import { CompanyStats } from '../models/CompanyStats.model.js';
import { AboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { logger } from '../utils/logger.js';


interface SourceIndustrySolution {
  title: string;
  description: string;
}

interface SourceIndustry {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  heroSubtitle: string;
  image: string;
  heroImage: string;
  icon: string;
  challenges: string[];
  solutions: SourceIndustrySolution[];
  benefits: string[];
  relatedCategories: string[];
}

interface SourceService {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string;
  icon?: string;
  features: string[];
}

interface SourceNewsCategory {
  title: string;
  slug: string;
  description: string;
  badge: string;
  icon: string;
}

interface SourceNewsArticle {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  excerpt: string;
  content: {
    lead: string;
    sections: { heading?: string; paragraphs: string[]; bullets?: string[] }[];
    quote?: { text: string; author: string; role: string };
  };
  image: string;
  video?: { type: 'local' | 'embed'; url: string };
  videoUrl?: string;
  publishedDate: string;
  author?: string;
  featured?: boolean;
  readTime?: string;
  tags?: string[];
}

interface SourceBlogCategory {
  title: string;
  slug: string;
  badge: string;
  description: string;
  icon: string;
}

interface SourceBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  publishedDate: string;
  readingTime: string;
  image: string;
  featured?: boolean;
  tags: string[];
  introduction: string;
  sections: { heading: string; body: string; bulletPoints?: string[]; callout?: string }[];
  conclusion: string;
}

interface SourceCareerOpportunity {
  id: string;
  slug: string;
  title: string;
  type: 'job' | 'internship' | 'apprenticeship';
  department: string;
  location: string;
  employmentType: string;
  experience: string;
  shortDescription: string;
  description: string;
  image: string;
  postedDate: string;
  applicationDeadline: string;
  eligibility: string[];
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  selectionProcess: string[];
  isActive: boolean;
  duration?: string;
  stipendOrBenefits?: string;
  mentorSupport?: string;
  certification?: string;
}

interface SourceContactInfo {
  companyName: string;
  tagline: string;
  slogan: string;
  email: string;
  phones: string[];
  website: string;
  address: {
    city: string;
    state: string;
    country: string;
    display: string;
  };
  social: {
    whatsapp: string;
    facebook: string;
    instagram: string;
    email: string;
  };
}

const loadSourceData = async () => {
  const clientDataDir = path.resolve(process.cwd(), '../client/src/data');
  logger.info(`Loading all source datasets from: ${clientDataDir}`);

  const [industriesMod, servicesMod, newsMod, blogsMod, careersMod, contactMod] =
    await Promise.all([
      import(pathToFileURL(path.resolve(clientDataDir, 'industries.ts')).href),
      import(pathToFileURL(path.resolve(clientDataDir, 'services.ts')).href),
      import(pathToFileURL(path.resolve(clientDataDir, 'news.ts')).href),
      import(pathToFileURL(path.resolve(clientDataDir, 'blogs.ts')).href),
      import(pathToFileURL(path.resolve(clientDataDir, 'careers.ts')).href),
      import(pathToFileURL(path.resolve(clientDataDir, 'contact.ts')).href),
    ]);

  const rawIndustries: SourceIndustry[] =
    industriesMod.industriesData || industriesMod.default?.industriesData;
  const rawServices: SourceService[] =
    servicesMod.servicesData || servicesMod.default?.servicesData;
  const rawNewsCategories: SourceNewsCategory[] =
    newsMod.newsCategories || newsMod.default?.newsCategories;
  const rawNewsArticles: SourceNewsArticle[] =
    newsMod.newsArticles || newsMod.default?.newsArticles;
  const rawBlogCategories: SourceBlogCategory[] =
    blogsMod.blogCategories || blogsMod.default?.blogCategories;
  const rawBlogPosts: SourceBlogPost[] =
    blogsMod.blogPosts || blogsMod.default?.blogPosts;
  const rawCareerOpportunities: SourceCareerOpportunity[] =
    careersMod.careerOpportunities || careersMod.default?.careerOpportunities;
  const rawContactInfo: SourceContactInfo =
    contactMod.contactInfo || contactMod.default?.contactInfo;

  return {
    industries: rawIndustries,
    services: rawServices,
    newsCategories: rawNewsCategories,
    newsArticles: rawNewsArticles,
    blogCategories: rawBlogCategories,
    blogPosts: rawBlogPosts,
    careers: rawCareerOpportunities,
    contactInfo: rawContactInfo,
  };
};

export const runCatalogMigration = async () => {
  const startTime = Date.now();
  logger.info('====================================================');
  logger.info('Starting AXION PackTech FULL Website Migration (Phase 3)');
  logger.info('Mode: Safe Upsert (No drop / No deleteMany)');
  logger.info('====================================================');

  try {
    await connectDB();

    const data = await loadSourceData();


    // 3. INDUSTRIES (8)
    logger.info(`--- Migrating Industries (${data.industries.length} records) ---`);
    const industryBulkOps = data.industries.map((ind, idx) => ({
      updateOne: {
        filter: { slug: ind.slug.toLowerCase().trim() },
        update: {
          $set: {
            title: ind.title.trim(),
            slug: ind.slug.toLowerCase().trim(),
            shortDescription: ind.shortDescription?.trim() || '',
            description: ind.description.trim(),
            heroSubtitle: ind.heroSubtitle?.trim() || '',
            icon: ind.icon || '🏭',
            challenges: ind.challenges || [],
            solutions: ind.solutions.map((s) => ({
              title: s.title.trim(),
              description: s.description.trim(),
            })),
            benefits: ind.benefits || [],
            relatedCategories: ind.relatedCategories || [],
            image: ind.image,
            heroImage: ind.heroImage || ind.image,
            published: true,
            sortOrder: idx + 1,
          },
        },
        upsert: true,
      },
    }));
    const indResult = await Industry.bulkWrite(industryBulkOps);
    logger.info(`Industries: ${indResult.upsertedCount} created, ${indResult.modifiedCount} updated.`);

    // 4. SERVICES (5)
    logger.info(`--- Migrating Services (${data.services.length} records) ---`);
    const serviceBulkOps = data.services.map((s, idx) => ({
      updateOne: {
        filter: { slug: s.slug.toLowerCase().trim() },
        update: {
          $set: {
            title: s.title.trim(),
            slug: s.slug.toLowerCase().trim(),
            shortDescription: s.shortDescription?.trim() || '',
            description: s.description.trim(),
            image: s.image,
            icon: s.icon || '🔧',
            features: s.features || [],
            published: true,
            sortOrder: idx + 1,
          },
        },
        upsert: true,
      },
    }));
    const servResult = await Service.bulkWrite(serviceBulkOps);
    logger.info(`Services: ${servResult.upsertedCount} created, ${servResult.modifiedCount} updated.`);

    // 5. NEWS CATEGORIES (5)
    logger.info(`--- Migrating News Categories (${data.newsCategories.length} records) ---`);
    const newsCatBulkOps = data.newsCategories.map((nc, idx) => ({
      updateOne: {
        filter: { slug: nc.slug.toLowerCase().trim() },
        update: {
          $set: {
            title: nc.title.trim(),
            slug: nc.slug.toLowerCase().trim(),
            description: nc.description?.trim() || '',
            badge: nc.badge || '',
            icon: nc.icon || '📰',
            sortOrder: idx + 1,
          },
        },
        upsert: true,
      },
    }));
    const newsCatResult = await NewsCategory.bulkWrite(newsCatBulkOps);
    logger.info(`News Categories: ${newsCatResult.upsertedCount} created, ${newsCatResult.modifiedCount} updated.`);

    const allDbNewsCats = await NewsCategory.find({});
    const newsCatIdMap = new Map<string, mongoose.Types.ObjectId>();
    for (const nc of allDbNewsCats) {
      newsCatIdMap.set(nc.slug, nc._id as mongoose.Types.ObjectId);
    }

    // 6. NEWS ARTICLES (10)
    logger.info(`--- Migrating News Articles (${data.newsArticles.length} records) ---`);
    const newsBulkOps = data.newsArticles.map((na, idx) => {
      const catId = newsCatIdMap.get(na.categorySlug.toLowerCase().trim());
      return {
        updateOne: {
          filter: { slug: na.slug.toLowerCase().trim() },
          update: {
            $set: {
              title: na.title.trim(),
              slug: na.slug.toLowerCase().trim(),
              categorySlug: na.categorySlug.toLowerCase().trim(),
              categoryName: na.category,
              category: catId,
              excerpt: na.excerpt.trim(),
              content: na.content,
              image: na.image,
              featuredImage: na.image,
              video: na.video,
              videoUrl: na.videoUrl || (na.video?.url || ''),
              author: na.author || 'Corporate Communications Desk',
              readTime: na.readTime || '4 min read',
              tags: na.tags || [],
              published: true,
              publishedAt: new Date(na.publishedDate || Date.now()),
              featured: na.featured || false,
              sortOrder: idx + 1,
            },
          },
          upsert: true,
        },
      };
    });
    const newsResult = await News.bulkWrite(newsBulkOps);
    logger.info(`News Articles: ${newsResult.upsertedCount} created, ${newsResult.modifiedCount} updated.`);

    // 7. BLOG CATEGORIES (6)
    logger.info(`--- Migrating Blog Categories (${data.blogCategories.length} records) ---`);
    const blogCatBulkOps = data.blogCategories.map((bc, idx) => ({
      updateOne: {
        filter: { slug: bc.slug.toLowerCase().trim() },
        update: {
          $set: {
            title: bc.title.trim(),
            slug: bc.slug.toLowerCase().trim(),
            description: bc.description?.trim() || '',
            badge: bc.badge || '',
            icon: bc.icon || '📝',
            sortOrder: idx + 1,
          },
        },
        upsert: true,
      },
    }));
    const blogCatResult = await BlogCategory.bulkWrite(blogCatBulkOps);
    logger.info(`Blog Categories: ${blogCatResult.upsertedCount} created, ${blogCatResult.modifiedCount} updated.`);

    const allDbBlogCats = await BlogCategory.find({});
    const blogCatIdMap = new Map<string, mongoose.Types.ObjectId>();
    for (const bc of allDbBlogCats) {
      blogCatIdMap.set(bc.slug, bc._id as mongoose.Types.ObjectId);
    }

    // 8. BLOG POSTS (10)
    logger.info(`--- Migrating Blog Posts (${data.blogPosts.length} records) ---`);
    const blogBulkOps = data.blogPosts.map((bp, idx) => {
      const catId = blogCatIdMap.get(bp.category.toLowerCase().trim());
      return {
        updateOne: {
          filter: { slug: bp.slug.toLowerCase().trim() },
          update: {
            $set: {
              title: bp.title.trim(),
              slug: bp.slug.toLowerCase().trim(),
              categorySlug: bp.category.toLowerCase().trim(),
              categoryName: bp.category,
              category: catId,
              excerpt: bp.excerpt.trim(),
              introduction: bp.introduction || '',
              sections: bp.sections || [],
              conclusion: bp.conclusion || '',
              content: bp.introduction || '',
              image: bp.image,
              featuredImage: bp.image,
              author: bp.author || 'AXION PackTech Technical Editorial',
              authorRole: bp.authorRole || 'Technical Editorial',
              readTime: bp.readingTime || '5 min read',
              readingTime: bp.readingTime || '5 min read',
              tags: bp.tags || [],
              published: true,
              publishedAt: new Date(bp.publishedDate || Date.now()),
              featured: bp.featured || false,
              sortOrder: idx + 1,
            },
          },
          upsert: true,
        },
      };
    });
    const blogResult = await Blog.bulkWrite(blogBulkOps);
    logger.info(`Blog Posts: ${blogResult.upsertedCount} created, ${blogResult.modifiedCount} updated.`);

    // 9. CAREERS (12)
    logger.info(`--- Migrating Careers (${data.careers.length} records) ---`);
    const careerBulkOps = data.careers.map((co, idx) => ({
      updateOne: {
        filter: { slug: co.slug.toLowerCase().trim() },
        update: {
          $set: {
            title: co.title.trim(),
            slug: co.slug.toLowerCase().trim(),
            type: co.type,
            department: co.department.trim(),
            location: co.location.trim(),
            employmentType: co.employmentType || 'Full-Time',
            experience: co.experience || 'Not specified',
            shortDescription: co.shortDescription?.trim() || '',
            description: co.description.trim(),
            image: co.image || '',
            postedDate: co.postedDate || '',
            applicationDeadline: co.applicationDeadline || '',
            eligibility: co.eligibility || [],
            responsibilities: co.responsibilities || [],
            qualifications: co.requirements || [],
            requirements: co.requirements || [],
            skills: co.skills || [],
            selectionProcess: co.selectionProcess || [],
            duration: co.duration,
            stipendOrBenefits: co.stipendOrBenefits,
            mentorSupport: co.mentorSupport,
            certification: co.certification,
            published: co.isActive !== false,
            status: (co.isActive ? 'active' : 'closed') as 'active' | 'closed',
            sortOrder: idx + 1,
          },
        },
        upsert: true,
      },
    }));
    const careerResult = await Career.bulkWrite(careerBulkOps);
    logger.info(`Careers: ${careerResult.upsertedCount} created, ${careerResult.modifiedCount} updated.`);

    // 10. CONTACT SETTINGS (1)
    logger.info('--- Migrating Contact Settings ---');
    const existingContact = await ContactSettings.findOne();
    const contactPayload = {
      companyName: data.contactInfo.companyName,
      tagline: data.contactInfo.tagline,
      slogan: data.contactInfo.slogan,
      email: data.contactInfo.email,
      phones: data.contactInfo.phones,
      website: data.contactInfo.website,
      address: {
        city: data.contactInfo.address.city,
        state: data.contactInfo.address.state,
        country: data.contactInfo.address.country,
        display: data.contactInfo.address.display,
        fullStreet: 'GIDC Industrial Area, Makarpura',
        postalCode: '390010',
      },
      social: {
        whatsapp: data.contactInfo.social.whatsapp,
        facebook: data.contactInfo.social.facebook,
        instagram: data.contactInfo.social.instagram,
        linkedin: 'https://www.linkedin.com/company/axionpacktech',
        email: data.contactInfo.social.email,
      },
    };
    if (existingContact) {
      await ContactSettings.updateOne({ _id: existingContact._id }, { $set: contactPayload });
      logger.info('Contact Settings updated.');
    } else {
      await ContactSettings.create(contactPayload);
      logger.info('Contact Settings created.');
    }

    // 11. SITE SETTINGS (1)
    logger.info('--- Migrating Site Settings ---');
    const existingSite = await SiteSettings.findOne();
    const sitePayload = {
      siteName: 'AXION PackTech',
      siteTitle: 'AXION PackTech — Industrial Packaging, Bagging & Automation Solutions',
      logoUrl: '/logo.jpeg',
      faviconUrl: '/favicon.ico',
      metaDescription:
        'Next-generation industrial packaging, high-speed bagging systems, robotic automation, and turnkey engineering solutions.',
      copyrightText: '© 2026 AXION PackTech. All Rights Reserved.',
      footerTagline: 'Engineering for a Better Tomorrow.',
      maintenanceMode: false,
    };
    if (existingSite) {
      await SiteSettings.updateOne({ _id: existingSite._id }, { $set: sitePayload });
      logger.info('Site Settings updated.');
    } else {
      await SiteSettings.create(sitePayload);
      logger.info('Site Settings created.');
    }

    // 12. COMPANY STATS (1)
    logger.info('--- Migrating Company Stats ---');
    const existingStats = await CompanyStats.findOne();
    const statsPayload = {
      stats: [
        { label: 'ESTABLISHED', value: '2000', sortOrder: 1 },
        { label: 'PRODUCTS', value: '25+', sortOrder: 2 },
        { label: 'INDUSTRIES SERVED', value: '4000+', sortOrder: 3 },
        { label: 'PROJECTS EXECUTED', value: '2500+', sortOrder: 4 },
      ],
      isActive: true,
    };
    if (existingStats) {
      await CompanyStats.updateOne({ _id: existingStats._id }, { $set: statsPayload });
      logger.info('Company Stats updated.');
    } else {
      await CompanyStats.create(statsPayload);
      logger.info('Company Stats created.');
    }

    // 13. HOMEPAGE, ABOUT, RESPONSIBILITIES
    logger.info('--- Ensuring Page Singletons (HomePage, AboutPage, ResponsibilityPage) ---');
    if ((await HomePage.countDocuments()) === 0) {
      await HomePage.create({});
      logger.info('HomePage singleton initialized.');
    }
    if ((await AboutPage.countDocuments()) === 0) {
      await AboutPage.create({});
      logger.info('AboutPage singleton initialized.');
    }
    if ((await ResponsibilityPage.countDocuments()) === 0) {
      await ResponsibilityPage.create({});
      logger.info('ResponsibilityPage singleton initialized.');
    }

    // --- Post-Migration Verification & DB Audit ---
    logger.info('====================================================');
    logger.info('POST-MIGRATION DATABASE VERIFICATION AUDIT');
    logger.info('====================================================');
    const totalIndustriesInDb = await Industry.countDocuments();
    const totalServicesInDb = await Service.countDocuments();
    const totalNewsCatsInDb = await NewsCategory.countDocuments();
    const totalNewsInDb = await News.countDocuments();
    const totalBlogCatsInDb = await BlogCategory.countDocuments();
    const totalBlogsInDb = await Blog.countDocuments();
    const totalCareersInDb = await Career.countDocuments();

    logger.info(`Industries:          ${totalIndustriesInDb} in DB (Source: ${data.industries.length})`);
    logger.info(`Services:            ${totalServicesInDb} in DB (Source: ${data.services.length})`);
    logger.info(`News Categories:     ${totalNewsCatsInDb} in DB (Source: ${data.newsCategories.length})`);
    logger.info(`News Articles:       ${totalNewsInDb} in DB (Source: ${data.newsArticles.length})`);
    logger.info(`Blog Categories:     ${totalBlogCatsInDb} in DB (Source: ${data.blogCategories.length})`);
    logger.info(`Blog Posts:          ${totalBlogsInDb} in DB (Source: ${data.blogPosts.length})`);
    logger.info(`Careers:             ${totalCareersInDb} in DB (Source: ${data.careers.length})`);

    // Integrity checks
    const checkDuplicateSlugs = async <T>(model: mongoose.Model<T>, name: string) => {
      const duplicates = await model.aggregate([
        { $group: { _id: '$slug', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
      ]);
      if (duplicates.length > 0) {
        logger.error(`Found duplicate slugs in ${name}: ${JSON.stringify(duplicates)}`);
      } else {
        logger.info(`Integrity Check [${name}]: Zero duplicate slugs confirmed.`);
      }
    };

    await checkDuplicateSlugs(Industry, 'Industry');
    await checkDuplicateSlugs(Service, 'Service');
    await checkDuplicateSlugs(NewsCategory, 'NewsCategory');
    await checkDuplicateSlugs(News, 'News');
    await checkDuplicateSlugs(BlogCategory, 'BlogCategory');
    await checkDuplicateSlugs(Blog, 'Blog');
    await checkDuplicateSlugs(Career, 'Career');

    // Invalidate Redis public cache if available
    try {
      const redis = initRedis();
      await new Promise<void>((resolve) => {
        if (isRedisReady()) return resolve();
        redis.once('ready', () => resolve());
        setTimeout(resolve, 1500);
      });
      if (isRedisReady()) {
        await cacheService.flushPublicCache();
        logger.info('Public Redis cache successfully flushed for fresh website data.');
      }
      await disconnectRedis();
    } catch (cacheErr) {
      logger.warn('Redis cache invalidation skipped:', cacheErr);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info('====================================================');
    logger.info(`All domains migrated successfully in ${duration}s.`);
    logger.info('====================================================');

    return { success: true };
  } catch (error) {
    logger.error('Migration failed with error:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedFullCatalog.ts')) {
  runCatalogMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Fatal seedFullCatalog error:', err);
      process.exit(1);
    });
}
