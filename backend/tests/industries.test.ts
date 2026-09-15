import { IndustryService } from '../src/services/industry.service.js';
import { Industry } from '../src/models/Industry.model.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS } from '../src/constants/cacheKeys.js';
import {
  industrySchema,
  updateIndustrySchema,
  reorderIndustriesSchema,
} from '../src/validators/industry.validator.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/Industry.model.js');
jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn(),
    setCached: jest.fn(),
    deleteCached: jest.fn(),
    deleteByPattern: jest.fn(),
  },
}));

describe('Industry Service & CMS Architecture', () => {
  let industryService: IndustryService;

  beforeEach(() => {
    jest.clearAllMocks();
    industryService = new IndustryService();
  });

  describe('getIndustries', () => {
    it('should return cached industries if present in Redis', async () => {
      const mockCached = [
        { title: 'Food & Beverage', slug: 'food-beverage', published: true, sortOrder: 1 },
      ];
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockCached);

      const result = await industryService.getIndustries(true);

      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.INDUSTRIES_LIST());
      expect(Industry.find).not.toHaveBeenCalled();
      expect(result).toEqual(mockCached);
    });

    it('should query MongoDB on cache miss and cache the result', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockDbIndustries = [
        { title: 'Food & Beverage', slug: 'food-beverage', published: true, sortOrder: 1 },
        { title: 'Chemicals', slug: 'chemicals', published: true, sortOrder: 2 },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDbIndustries),
      };
      (Industry.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await industryService.getIndustries(true);

      expect(Industry.find).toHaveBeenCalledWith({ published: true });
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ sortOrder: 1, createdAt: 1 });
      expect(cacheService.setCached).toHaveBeenCalledWith(
        CACHE_KEYS.INDUSTRIES_LIST(),
        mockDbIndustries,
        expect.any(Number)
      );
      expect(result).toEqual(mockDbIndustries);
    });

    it('should query all industries without published filter when publishedOnly is false', async () => {
      const mockDbIndustries = [
        { title: 'Food & Beverage', slug: 'food-beverage', published: true, sortOrder: 1 },
        { title: 'Draft Sector', slug: 'draft-sector', published: false, sortOrder: 2 },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDbIndustries),
      };
      (Industry.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await industryService.getIndustries(false);

      expect(Industry.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockDbIndustries);
    });
  });

  describe('getIndustryBySlug', () => {
    it('should return cached industry detail on cache hit', async () => {
      const mockIndustry = { title: 'Chemicals', slug: 'chemicals', published: true };
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockIndustry);

      const result = await industryService.getIndustryBySlug('chemicals', true);

      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.INDUSTRY_DETAIL('chemicals'));
      expect(Industry.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockIndustry);
    });

    it('should throw AppError 404 when industry is not found in MongoDB', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };
      (Industry.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(industryService.getIndustryBySlug('nonexistent')).rejects.toThrow(
        'Industry "nonexistent" not found.'
      );
    });
  });

  describe('createIndustry', () => {
    it('should throw conflict error if slug already exists', async () => {
      (Industry.findOne as jest.Mock).mockResolvedValue({ _id: '123', slug: 'textile' });

      await expect(
        industryService.createIndustry({ title: 'Textile', slug: 'textile' } as any)
      ).rejects.toThrow(AppError);
    });

    it('should create industry and invalidate Redis cache', async () => {
      (Industry.findOne as jest.Mock).mockResolvedValue(null);
      (Industry.countDocuments as jest.Mock).mockResolvedValue(8);
      const newIndustry = {
        title: 'Textile Industry',
        slug: 'textile',
        sortOrder: 9,
        published: true,
      };
      (Industry.create as jest.Mock).mockResolvedValue(newIndustry);

      const result = await industryService.createIndustry(newIndustry as any);

      expect(Industry.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'textile', sortOrder: 9 })
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_INDUSTRIES);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(
        CACHE_KEYS.INDUSTRY_DETAIL('textile')
      );
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.HOME_DATA);
      expect(result).toEqual(newIndustry);
    });
  });

  describe('updateIndustry & reorderIndustries', () => {
    it('should update industry and invalidate cache', async () => {
      const updatedIndustry = {
        title: 'Updated Textile',
        slug: 'textile',
        published: true,
      };
      (Industry.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedIndustry);

      const result = await industryService.updateIndustry('textile', { title: 'Updated Textile' });

      expect(Industry.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'textile' },
        { title: 'Updated Textile' },
        { new: true, runValidators: true }
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_INDUSTRIES);
      expect(result).toEqual(updatedIndustry);
    });

    it('should reorder industries using bulkWrite and invalidate cache', async () => {
      (Industry.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { slug: 'chemicals', sortOrder: 1 },
          { slug: 'food-beverage', sortOrder: 2 },
        ]),
      };
      (Industry.find as jest.Mock).mockReturnValue(mockQuery);

      const orders = [
        { slug: 'chemicals', sortOrder: 1 },
        { slug: 'food-beverage', sortOrder: 2 },
      ];

      const result = await industryService.reorderIndustries(orders);

      expect(Industry.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { slug: 'chemicals' },
            update: { $set: { sortOrder: 1 } },
          },
        },
        {
          updateOne: {
            filter: { slug: 'food-beverage' },
            update: { $set: { sortOrder: 2 } },
          },
        },
      ]);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_INDUSTRIES);
      expect(result.length).toBe(2);
    });
  });

  describe('deleteIndustry', () => {
    it('should delete industry and invalidate cache', async () => {
      (Industry.findOneAndDelete as jest.Mock).mockResolvedValue({ slug: 'textile' });

      await industryService.deleteIndustry('textile');

      expect(Industry.findOneAndDelete).toHaveBeenCalledWith({ slug: 'textile' });
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_INDUSTRIES);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(
        CACHE_KEYS.INDUSTRY_DETAIL('textile')
      );
    });
  });

  describe('Validation Schemas', () => {
    it('should validate complete industry creation body', () => {
      const validPayload = {
        body: {
          title: 'Textile Industry',
          slug: 'textile-industry',
          shortDescription: 'Advanced weaving and packaging',
          description: 'Comprehensive solutions for fabric and fiber manufacturing.',
          image: '/images/industries/textile.webp',
          heroImage: '/images/industries/textile-hero.webp',
          icon: '🧵',
          challenges: ['Dust containment', 'High speed yarn winding'],
          solutions: [{ title: 'Yarn Packaging', description: 'Automated winding packaging' }],
          benefits: ['Higher throughput', 'Zero fiber damage'],
          published: true,
          sortOrder: 1,
        },
      };

      const parsed = industrySchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('should validate partial update body', () => {
      const partialPayload = {
        body: {
          published: false,
        },
      };

      const parsed = updateIndustrySchema.safeParse(partialPayload);
      expect(parsed.success).toBe(true);
    });

    it('should validate reorder body', () => {
      const reorderPayload = {
        body: {
          orders: [
            { slug: 'textile', sortOrder: 1 },
            { slug: 'chemicals', sortOrder: 2 },
          ],
        },
      };

      const parsed = reorderIndustriesSchema.safeParse(reorderPayload);
      expect(parsed.success).toBe(true);
    });
  });
});
