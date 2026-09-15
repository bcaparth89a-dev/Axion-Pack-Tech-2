import { ServiceService } from '../src/services/service.service.js';
import { Service } from '../src/models/Service.model.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS } from '../src/constants/cacheKeys.js';
import {
  serviceSchema,
  updateServiceSchema,
  reorderServicesSchema,
} from '../src/validators/service.validator.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/Service.model.js');
jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn(),
    setCached: jest.fn(),
    deleteCached: jest.fn(),
    deleteByPattern: jest.fn(),
  },
}));

describe('Service Service & CMS Architecture', () => {
  let serviceService: ServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    serviceService = new ServiceService();
  });

  describe('getServices', () => {
    it('should return cached services if present in Redis', async () => {
      const mockCached = [
        { title: 'Engineering & Design', slug: 'engineering-design', published: true, sortOrder: 1 },
      ];
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockCached);

      const result = await serviceService.getServices(true);

      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.SERVICES_LIST);
      expect(Service.find).not.toHaveBeenCalled();
      expect(result).toEqual(mockCached);
    });

    it('should query MongoDB on cache miss and cache the result', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockDbServices = [
        { title: 'Engineering & Design', slug: 'engineering-design', published: true, sortOrder: 1 },
        { title: 'Installation', slug: 'installation-commissioning', published: true, sortOrder: 2 },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDbServices),
      };
      (Service.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await serviceService.getServices(true);

      expect(Service.find).toHaveBeenCalledWith({ published: true });
      expect(mockQuery.select).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ sortOrder: 1, createdAt: 1 });
      expect(cacheService.setCached).toHaveBeenCalledWith(
        CACHE_KEYS.SERVICES_LIST,
        mockDbServices,
        expect.any(Number)
      );
      expect(result).toEqual(mockDbServices);
    });

    it('should query all services without published filter when publishedOnly is false', async () => {
      const mockDbServices = [
        { title: 'Engineering & Design', slug: 'engineering-design', published: true, sortOrder: 1 },
        { title: 'Draft Service', slug: 'draft-service', published: false, sortOrder: 2 },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDbServices),
      };
      (Service.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await serviceService.getServices(false);

      expect(Service.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockDbServices);
    });
  });

  describe('getServiceBySlug', () => {
    it('should return cached service detail on cache hit', async () => {
      const mockService = { title: 'Engineering & Design', slug: 'engineering-design', published: true };
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockService);

      const result = await serviceService.getServiceBySlug('engineering-design', true);

      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.SERVICE_DETAIL('engineering-design'));
      expect(Service.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockService);
    });

    it('should throw AppError 404 when service is not found in MongoDB', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };
      (Service.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(serviceService.getServiceBySlug('nonexistent')).rejects.toThrow(
        'Service "nonexistent" not found.'
      );
    });
  });

  describe('createService', () => {
    it('should throw conflict error if slug already exists', async () => {
      (Service.findOne as jest.Mock).mockResolvedValue({ _id: '123', slug: 'packaging-automation' });

      await expect(
        serviceService.createService({ title: 'Packaging Automation', slug: 'packaging-automation' } as any)
      ).rejects.toThrow(AppError);
    });

    it('should create service and invalidate Redis cache', async () => {
      (Service.findOne as jest.Mock).mockResolvedValue(null);
      (Service.countDocuments as jest.Mock).mockResolvedValue(5);
      const newService = {
        title: 'Packaging Automation',
        slug: 'packaging-automation',
        sortOrder: 6,
        published: true,
      };
      (Service.create as jest.Mock).mockResolvedValue(newService);

      const result = await serviceService.createService(newService as any);

      expect(Service.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'packaging-automation', sortOrder: 6 })
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_SERVICES);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(
        CACHE_KEYS.SERVICE_DETAIL('packaging-automation')
      );
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.SERVICES_LIST);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.HOME_DATA);
      expect(result).toEqual(newService);
    });
  });

  describe('updateService & reorderServices', () => {
    it('should update service and invalidate cache', async () => {
      const updatedService = {
        title: 'Updated Packaging Automation',
        slug: 'packaging-automation',
        published: true,
      };
      (Service.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedService);

      const result = await serviceService.updateService('packaging-automation', { title: 'Updated Packaging Automation' });

      expect(Service.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'packaging-automation' },
        { title: 'Updated Packaging Automation' },
        { new: true, runValidators: true }
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_SERVICES);
      expect(result).toEqual(updatedService);
    });

    it('should reorder services using bulkWrite and invalidate cache', async () => {
      (Service.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { slug: 'installation-commissioning', sortOrder: 1 },
          { slug: 'engineering-design', sortOrder: 2 },
        ]),
      };
      (Service.find as jest.Mock).mockReturnValue(mockQuery);

      const orders = [
        { slug: 'installation-commissioning', sortOrder: 1 },
        { slug: 'engineering-design', sortOrder: 2 },
      ];

      const result = await serviceService.reorderServices(orders);

      expect(Service.bulkWrite).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { slug: 'installation-commissioning' },
            update: { $set: { sortOrder: 1 } },
          },
        },
        {
          updateOne: {
            filter: { slug: 'engineering-design' },
            update: { $set: { sortOrder: 2 } },
          },
        },
      ]);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_SERVICES);
      expect(result.length).toBe(2);
    });
  });

  describe('deleteService', () => {
    it('should delete service and invalidate cache', async () => {
      (Service.findOneAndDelete as jest.Mock).mockResolvedValue({ slug: 'packaging-automation' });

      await serviceService.deleteService('packaging-automation');

      expect(Service.findOneAndDelete).toHaveBeenCalledWith({ slug: 'packaging-automation' });
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_SERVICES);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(
        CACHE_KEYS.SERVICE_DETAIL('packaging-automation')
      );
    });
  });

  describe('Validation Schemas', () => {
    it('should validate complete service creation body', () => {
      const validPayload = {
        body: {
          title: 'Packaging Automation',
          slug: 'packaging-automation',
          shortDescription: 'Comprehensive end-to-end automation solutions.',
          description: 'High performance turnkey robotic and PLC packaging lines.',
          image: '/images/services/engineering-design.webp',
          icon: '⚙️',
          capabilities: ['PLC Programming', 'SCADA Integration'],
          features: ['Robotic Pick and Place', 'Conveyor Automation'],
          process: ['Consultation', 'Blueprint', 'Commissioning'],
          published: true,
          sortOrder: 1,
        },
      };

      const parsed = serviceSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('should validate partial update body', () => {
      const partialPayload = {
        body: {
          published: false,
        },
      };

      const parsed = updateServiceSchema.safeParse(partialPayload);
      expect(parsed.success).toBe(true);
    });

    it('should validate reorder body', () => {
      const reorderPayload = {
        body: {
          orders: [
            { slug: 'packaging-automation', sortOrder: 1 },
            { slug: 'engineering-design', sortOrder: 2 },
          ],
        },
      };

      const parsed = reorderServicesSchema.safeParse(reorderPayload);
      expect(parsed.success).toBe(true);
    });
  });
});
