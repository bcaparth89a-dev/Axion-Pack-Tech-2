import { HomePage, IHomePage } from '../models/HomePage.model.js';
import { AboutPage, IAboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage, IResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { CompanyStats, ICompanyStats } from '../models/CompanyStats.model.js';
import { CategoryHero, ICategoryHero } from '../models/CategoryHero.model.js';
import { cacheService } from '../cache/cache.service.js';
import { CACHE_KEYS, CACHE_TTL } from '../constants/cacheKeys.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';

export class PagesService {
  // --------------------------------------------------------------------------
  // Home Page
  // --------------------------------------------------------------------------

  async getHomePage(): Promise<IHomePage> {
    const cached = await cacheService.getCached<IHomePage>(CACHE_KEYS.HOME_DATA);
    if (cached) return cached;

    const existing = await HomePage.findOne().lean();
    const page = existing ? (existing as unknown as IHomePage) : ((await HomePage.create({})).toObject() as unknown as IHomePage);

    await cacheService.setCached(CACHE_KEYS.HOME_DATA, page, CACHE_TTL.SHORT);
    return page;
  }

  async updateHomePage(data: Partial<IHomePage>): Promise<IHomePage> {
    const page = await HomePage.findOneAndUpdate({}, data, { new: true, upsert: true, runValidators: true });
    await cacheService.deleteCached(CACHE_KEYS.HOME_DATA);
    await triggerNextjsRevalidation(['/'], ['home', 'pages']);
    return page as unknown as IHomePage;
  }

  // --------------------------------------------------------------------------
  // About Us Page
  // --------------------------------------------------------------------------

  async getAboutPage(): Promise<IAboutPage> {
    const cached = await cacheService.getCached<IAboutPage>(CACHE_KEYS.ABOUT_DATA);
    if (cached) return cached;

    let pageDoc = await AboutPage.findOne();
    if (!pageDoc) {
      pageDoc = await AboutPage.create({});
    }

    const page = pageDoc.toObject() as unknown as IAboutPage;
    await cacheService.setCached(CACHE_KEYS.ABOUT_DATA, page, CACHE_TTL.LONG);
    return page;
  }

  async updateAboutPage(data: Partial<IAboutPage>): Promise<IAboutPage> {
    const page = await AboutPage.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await cacheService.deleteCached(CACHE_KEYS.ABOUT_DATA);
    await cacheService.deleteByPattern('axion:public:about*');
    await triggerNextjsRevalidation(['/about-us', '/about'], ['about-page', 'pages']);
    return page as unknown as IAboutPage;
  }

  // --------------------------------------------------------------------------
  // Responsibilities Page
  // --------------------------------------------------------------------------

  async getResponsibilityPage(): Promise<IResponsibilityPage> {
    const cached = await cacheService.getCached<IResponsibilityPage>(CACHE_KEYS.RESPONSIBILITIES_DATA);
    if (cached) return cached;

    const existing = await ResponsibilityPage.findOne().lean();
    const page = existing ? (existing as unknown as IResponsibilityPage) : ((await ResponsibilityPage.create({})).toObject() as unknown as IResponsibilityPage);

    await cacheService.setCached(
      CACHE_KEYS.RESPONSIBILITIES_DATA,
      page,
      CACHE_TTL.LONG
    );
    return page;
  }

  async updateResponsibilityPage(data: Partial<IResponsibilityPage>): Promise<IResponsibilityPage> {
    const page = await ResponsibilityPage.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    await cacheService.deleteCached(CACHE_KEYS.RESPONSIBILITIES_DATA);
    await triggerNextjsRevalidation(['/responsibilities', '/about-us'], ['pages', 'about-page']);
    return page as unknown as IResponsibilityPage;
  }

  // --------------------------------------------------------------------------
  // Company Statistics
  // --------------------------------------------------------------------------

  async getCompanyStats(): Promise<ICompanyStats> {
    const cached = await cacheService.getCached<ICompanyStats>(CACHE_KEYS.COMPANY_STATS);
    if (cached) return cached;

    const existing = await CompanyStats.findOne().lean();
    const stats = existing ? (existing as unknown as ICompanyStats) : ((await CompanyStats.create({})).toObject() as unknown as ICompanyStats);

    await cacheService.setCached(CACHE_KEYS.COMPANY_STATS, stats, CACHE_TTL.LONG);
    return stats;
  }

  async updateCompanyStats(data: Partial<ICompanyStats>): Promise<ICompanyStats> {
    const stats = await CompanyStats.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    await Promise.all([
      cacheService.deleteCached(CACHE_KEYS.COMPANY_STATS),
      cacheService.deleteCached(CACHE_KEYS.HOME_DATA),
    ]);
    await triggerNextjsRevalidation(['/', '/about-us'], ['company-stats', 'home', 'pages']);
    return stats as unknown as ICompanyStats;
  }

  // --------------------------------------------------------------------------
  // Main Category Page Hero CMS
  // --------------------------------------------------------------------------

  async getCategoryHero(status = 'published'): Promise<ICategoryHero> {
    if (status === 'published') {
      const cached = await cacheService.getCached<ICategoryHero>(CACHE_KEYS.CATEGORY_HERO_DATA);
      if (cached) return cached;
    }

    let heroDoc = await CategoryHero.findOne({ page: 'main-categories' });
    if (!heroDoc) {
      heroDoc = await CategoryHero.create({
        page: 'main-categories',
        enabled: true,
        status: 'published',
      });
    }

    const hero = heroDoc.toObject() as unknown as ICategoryHero;
    if (status === 'published') {
      await cacheService.setCached(CACHE_KEYS.CATEGORY_HERO_DATA, hero, CACHE_TTL.SHORT);
    }
    return hero;
  }

  async updateCategoryHero(data: Partial<ICategoryHero>, publish = false): Promise<ICategoryHero> {
    const updatePayload: Record<string, unknown> = { ...data };
    if (publish || data.status === 'published') {
      updatePayload.status = 'published';
      updatePayload.publishedAt = new Date();
    }

    const heroDoc = await CategoryHero.findOneAndUpdate(
      { page: 'main-categories' },
      { $set: updatePayload },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    await cacheService.deleteCached(CACHE_KEYS.CATEGORY_HERO_DATA);
    await triggerNextjsRevalidation(['/products'], ['catalog-tree', 'catalog-nav', 'categories']);
    return heroDoc.toObject() as unknown as ICategoryHero;
  }

  async publishCategoryHero(): Promise<ICategoryHero> {
    const heroDoc = await CategoryHero.findOneAndUpdate(
      { page: 'main-categories' },
      {
        $set: {
          status: 'published',
          publishedAt: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await cacheService.deleteCached(CACHE_KEYS.CATEGORY_HERO_DATA);
    await triggerNextjsRevalidation(['/products'], ['catalog-tree', 'catalog-nav', 'categories']);
    return heroDoc.toObject() as unknown as ICategoryHero;
  }

  async deleteCategoryHero(): Promise<void> {
    await CategoryHero.findOneAndUpdate(
      { page: 'main-categories' },
      { $set: { enabled: false } },
      { new: true }
    );
    await cacheService.deleteCached(CACHE_KEYS.CATEGORY_HERO_DATA);
    await triggerNextjsRevalidation(['/products'], ['catalog-tree', 'catalog-nav', 'categories']);
  }
}

export const pagesService = new PagesService();
