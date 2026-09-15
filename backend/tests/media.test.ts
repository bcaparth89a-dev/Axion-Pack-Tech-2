import { mediaService } from '../src/services/media.service.js';
import { Media } from '../src/models/Media.model.js';
import { Product } from '../src/models/Product.model.js';
import { Category } from '../src/models/Category.model.js';
import { ProductModel } from '../src/models/ProductModel.model.js';
import { CatalogProduct } from '../src/models/CatalogProduct.model.js';
import { CategoryHero } from '../src/models/CategoryHero.model.js';
import { Service } from '../src/models/Service.model.js';
import { Industry } from '../src/models/Industry.model.js';
import { News } from '../src/models/News.model.js';
import { Blog } from '../src/models/Blog.model.js';
import { Career } from '../src/models/Career.model.js';
import { HomePage } from '../src/models/HomePage.model.js';
import { AboutPage } from '../src/models/AboutPage.model.js';
import { ResponsibilityPage } from '../src/models/ResponsibilityPage.model.js';
import { SiteSettings } from '../src/models/SiteSettings.model.js';
import { storageService } from '../src/services/storage/StorageService.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/Media.model.js');
jest.mock('../src/models/Product.model.js');
jest.mock('../src/models/Category.model.js');
jest.mock('../src/models/ProductModel.model.js');
jest.mock('../src/models/CatalogProduct.model.js');
jest.mock('../src/models/CategoryHero.model.js');
jest.mock('../src/models/Service.model.js');
jest.mock('../src/models/Industry.model.js');
jest.mock('../src/models/News.model.js');
jest.mock('../src/models/Blog.model.js');
jest.mock('../src/models/Career.model.js');
jest.mock('../src/models/HomePage.model.js');
jest.mock('../src/models/AboutPage.model.js');
jest.mock('../src/models/ResponsibilityPage.model.js');
jest.mock('../src/models/SiteSettings.model.js');
jest.mock('../src/services/storage/StorageService.js', () => ({
  storageService: {
    isConfigured: jest.fn().mockReturnValue(true),
    getProviderName: jest.fn().mockReturnValue('Cloudflare R2'),
    generateKey: jest.fn((folder, ext) => `${folder}/mock-key.${ext}`),
    uploadBuffer: jest.fn().mockResolvedValue({ url: 'https://cdn.example.com/mock.webp', key: 'mock.webp' }),
    safeCleanup: jest.fn().mockResolvedValue(true),
    checkPublicDomainResolves: jest.fn().mockResolvedValue(true),
  },
}));

describe('Universal Media System Service & API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return safe media configuration', async () => {
      const config = await mediaService.getConfig();
      expect(config.r2Configured).toBe(true);
      expect(config.providerName).toBe('Cloudflare R2');
      expect(config.acceptedImageFormats).toContain('webp');
      expect(config.acceptedVideoFormats).toContain('mp4');
    });
  });

  describe('registerExternalMedia', () => {
    it('should register valid external image URL', async () => {
      const mockCreated = {
        _id: '507f1f77bcf86cd799439011',
        name: 'External CDN Image',
        url: 'https://images.unsplash.com/photo-12345',
        type: 'image',
        key: 'external/mock-uuid',
        posterUrl: '',
      };
      (Media.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await mediaService.registerExternalMedia({
        name: 'External CDN Image',
        url: 'https://images.unsplash.com/photo-12345',
        type: 'image',
        folder: 'products',
      });

      expect(Media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'External CDN Image',
          url: 'https://images.unsplash.com/photo-12345',
          type: 'image',
          folder: 'products',
          provider: 'external',
          sourceType: 'url',
        })
      );
      expect(result.mediaId).toBe('507f1f77bcf86cd799439011');
      expect(result.url).toBe('https://images.unsplash.com/photo-12345');
    });

    it('should reject invalid non-http URL with AppError 400', async () => {
      await expect(
        mediaService.registerExternalMedia({
          name: 'Bad URL',
          url: 'javascript:alert(1)',
          type: 'image',
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('getMediaList', () => {
    it('should apply search filter and return paginated media list', async () => {
      const mockItems = [
        { _id: '1', name: 'Packaging Machine A', url: 'https://cdn.example.com/a.webp' },
      ];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockItems),
      };
      (Media.find as jest.Mock).mockReturnValue(mockQuery);
      (Media.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await mediaService.getMediaList({
        search: 'machine',
        folder: 'products',
        type: 'image',
        page: 1,
        limit: 10,
      });

      expect(Media.find).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'image',
          $and: expect.any(Array),
        })
      );
      expect(result.items.length).toBe(1);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('checkMediaReferences', () => {
    it('should scan all models and identify references when URL matches', async () => {
      const mockMediaDoc = {
        _id: 'media123',
        url: 'https://cdn.example.com/robot-arm.webp',
        posterUrl: '',
      };
      (Media.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMediaDoc),
      });

      // Product matches
      (Product.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'prod1', name: 'Robotic Pick & Place', slug: 'robotic-pick-and-place' },
          ]),
        }),
      });
      // Service matches
      (Service.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'serv1', title: 'Automation Services', slug: 'automation-services' },
          ]),
        }),
      });

      // Other models return empty
      const emptySelectMock = {
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      };
      (Category.find as jest.Mock).mockReturnValue(emptySelectMock);
      (ProductModel.find as jest.Mock).mockReturnValue(emptySelectMock);
      (CatalogProduct.find as jest.Mock).mockReturnValue(emptySelectMock);
      (CategoryHero.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Industry.find as jest.Mock).mockReturnValue(emptySelectMock);
      (News.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Blog.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Career.find as jest.Mock).mockReturnValue(emptySelectMock);
      (HomePage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (AboutPage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (ResponsibilityPage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (SiteSettings.find as jest.Mock).mockReturnValue(emptySelectMock);

      const usage = await mediaService.checkMediaReferences('media123');

      expect(usage.isReferenced).toBe(true);
      expect(usage.count).toBe(2);
      expect(usage.references).toEqual([
        { model: 'Product', title: 'Robotic Pick & Place', field: 'media', id: 'prod1' },
        { model: 'Service', title: 'Automation Services', field: 'image', id: 'serv1' },
      ]);
    });
  });

  describe('safeDeleteMedia', () => {
    it('should throw AppError 400 when attempting to delete referenced media without force', async () => {
      const mockMediaDoc = {
        _id: 'media123',
        url: 'https://cdn.example.com/robot-arm.webp',
        referenceCount: 1,
      };
      (Media.findById as jest.Mock).mockImplementation(() => {
        return {
          lean: jest.fn().mockResolvedValue(mockMediaDoc),
          ...mockMediaDoc,
        };
      });


      // Mock reference found in Product
      (Product.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'prod1', name: 'Robotic Pick & Place', slug: 'robotic-pick-and-place' },
          ]),
        }),
      });
      const emptySelectMock = {
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      };
      (Category.find as jest.Mock).mockReturnValue(emptySelectMock);
      (ProductModel.find as jest.Mock).mockReturnValue(emptySelectMock);
      (CatalogProduct.find as jest.Mock).mockReturnValue(emptySelectMock);
      (CategoryHero.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Service.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Industry.find as jest.Mock).mockReturnValue(emptySelectMock);
      (News.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Blog.find as jest.Mock).mockReturnValue(emptySelectMock);
      (Career.find as jest.Mock).mockReturnValue(emptySelectMock);
      (HomePage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (AboutPage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (ResponsibilityPage.find as jest.Mock).mockReturnValue(emptySelectMock);
      (SiteSettings.find as jest.Mock).mockReturnValue(emptySelectMock);

      await expect(mediaService.safeDeleteMedia('media123', false)).rejects.toThrow(
        /Cannot delete media: it is currently referenced/
      );
    });

    it('should successfully delete when force=true even if referenced', async () => {
      const mockMediaDoc = {
        _id: 'media123',
        url: 'https://cdn.example.com/robot-arm.webp',
        key: 'products/robot-arm.webp',
        provider: 'r2',
        referenceCount: 1,
      };
      (Media.findById as jest.Mock).mockResolvedValue(mockMediaDoc);
      (Media.findByIdAndDelete as jest.Mock).mockResolvedValue(mockMediaDoc);

      const result = await mediaService.safeDeleteMedia('media123', true);

      expect(storageService.safeCleanup).toHaveBeenCalledWith('products/robot-arm.webp');
      expect(Media.findByIdAndDelete).toHaveBeenCalledWith('media123');
      expect(result.message).toContain('permanently deleted');
    });
  });
});
