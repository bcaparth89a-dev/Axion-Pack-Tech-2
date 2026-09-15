import { PagesService } from '../src/services/pages.service.js';
import { AboutPage } from '../src/models/AboutPage.model.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_KEYS } from '../src/constants/cacheKeys.js';
import { updateAboutPageSchema } from '../src/validators/pages.validator.js';

jest.mock('../src/models/AboutPage.model.js');
jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn(),
    setCached: jest.fn(),
    deleteCached: jest.fn(),
    deleteByPattern: jest.fn(),
  },
}));

describe('About Us CMS Synchronization & Cache Lifecycle', () => {
  let pagesService: PagesService;

  beforeEach(() => {
    jest.clearAllMocks();
    pagesService = new PagesService();
  });

  describe('Single Source of Truth & Cache Invalidation', () => {
    it('should return cached data if available in Redis', async () => {
      const mockCachedData = {
        hero: { title: 'Cached Innovation', image: '/cached.jpg' },
      };
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockCachedData);

      const result = await pagesService.getAboutPage();

      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.ABOUT_DATA);
      expect(AboutPage.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockCachedData);
    });

    it('should query MongoDB on cache miss and cache the fresh result in Redis', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);

      const mockDoc = {
        toObject: jest.fn().mockReturnValue({
          hero: { title: 'Fresh from MongoDB' },
          whyChooseUsSection: {
            items: [{ title: 'Custom Feature', description: 'Desc', icon: 'compass', enabled: true, order: 1 }],
          },
        }),
      };
      (AboutPage.findOne as jest.Mock).mockResolvedValue(mockDoc);

      const result = await pagesService.getAboutPage();

      expect(AboutPage.findOne).toHaveBeenCalled();
      expect(cacheService.setCached).toHaveBeenCalledWith(
        CACHE_KEYS.ABOUT_DATA,
        expect.objectContaining({ hero: { title: 'Fresh from MongoDB' } }),
        expect.any(Number)
      );
      expect(result.hero.title).toBe('Fresh from MongoDB');
    });

    it('should update MongoDB and invalidate both exact and wildcard Redis cache keys upon save', async () => {
      const updatePayload = {
        hero: {
          eyebrow: 'Corporate Pedigree',
          title: 'Synchronized Engineering',
          highlightedTitle: 'Peak Automation',
          description: 'Custom description for client',
          image: '/images/custom_hero.jpg',
        },
        whyChooseUsSection: {
          badge: 'WHY AXION',
          heading: 'Why Choose AXION PackTech',
          items: [
            { title: 'New Feature 1', description: 'Feature 1 Details', icon: 'compass', enabled: true, order: 1 },
            { title: 'New Feature 2', description: 'Feature 2 Details', icon: 'sliders', enabled: false, order: 2 },
          ],
        },
        visionMission: {
          coreValues: [
            { title: 'Extreme Reliability', description: '24/7 duty cycles', icon: 'star', enabled: true, order: 1 },
          ],
        },
        aboutInfo: {
          stats: [
            { value: '50+', label: 'Global Patents', highlight: 'Innovative', icon: 'award', enabled: true, order: 1 },
          ],
        },
      };

      (AboutPage.findOneAndUpdate as jest.Mock).mockResolvedValue(updatePayload);

      const result = await pagesService.updateAboutPage(updatePayload);

      expect(AboutPage.findOneAndUpdate).toHaveBeenCalledWith(
        {},
        { $set: updatePayload },
        expect.objectContaining({ new: true, upsert: true, runValidators: true })
      );
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.ABOUT_DATA);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith('axion:public:about*');
      expect(result).toEqual(updatePayload);
    });
  });

  describe('Validation Schema for All About Us CMS Sections', () => {
    it('should successfully validate full About Us payload including CRUD arrays', async () => {
      const validPayload = {
        body: {
          hero: {
            title: 'Engineering Innovation',
            highlightedTitle: 'Building Tomorrow',
            eyebrow: 'Corporate Profile',
            image: '/images/hero.jpg',
          },
          mediaSlider: {
            enabled: true,
            heading: 'Engineering in Motion',
            items: [
              {
                title: 'High-Precision Automated Bagging Systems',
                caption: 'Heavy duty cycles',
                url: '/images/slide1.jpg',
                type: 'image',
                enabled: true,
                order: 1,
              },
            ],
          },
          aboutInfo: {
            badge: 'About Us',
            heading: 'About AXION',
            stats: [
              { value: '25+', label: 'Machines', highlight: 'Engineered', icon: 'wrench', enabled: true, order: 1 },
            ],
          },
          whyChooseUsSection: {
            badge: 'Engineering Advantage',
            heading: 'Why Choose AXION PackTech',
            items: [
              { title: 'Customized Solutions', description: 'Tailored equipment', icon: 'sliders', enabled: true, order: 1 },
            ],
          },
          visionMission: {
            coreValues: [
              { title: 'Quality Standards', description: 'Zero compromise', icon: 'star', enabled: true, order: 1 },
            ],
          },
          responsibilitiesSection: {
            badge: 'Our Responsibility',
            points: ['Energy-efficient drives', 'Recyclable materials'],
          },
          sections: {
            hero: true,
            mediaSlider: true,
            aboutInfo: true,
            whyChooseUs: true,
            visionMission: true,
            responsibilities: true,
          },
        },
      };

      const parsed = await updateAboutPageSchema.parseAsync(validPayload);
      expect(parsed.body.hero?.title).toBe('Engineering Innovation');
      expect(parsed.body.whyChooseUsSection?.items).toHaveLength(1);
      expect(parsed.body.visionMission?.coreValues).toHaveLength(1);
    });
  });
});
