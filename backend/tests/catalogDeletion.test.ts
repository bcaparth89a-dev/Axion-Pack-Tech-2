import mongoose from 'mongoose';
import { Category } from '../src/models/Category.model.js';
import { Product } from '../src/models/Product.model.js';
import { ProductModel } from '../src/models/ProductModel.model.js';
import { CategoryHero } from '../src/models/CategoryHero.model.js';
import { categoryService } from '../src/services/category.service.js';
import { productService } from '../src/services/product.service.js';
import { productModelService } from '../src/services/productModel.service.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_PATTERNS } from '../src/constants/cacheKeys.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn().mockResolvedValue(null),
    setCached: jest.fn().mockResolvedValue(undefined),
    deleteCached: jest.fn().mockResolvedValue(undefined),
    deleteByPattern: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../src/utils/revalidate.js', () => ({
  triggerNextjsRevalidation: jest.fn().mockResolvedValue(undefined),
}));

describe('Catalog Deletion System (Category, Product, Model)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model Deletion', () => {
    it('should permanently delete model from MongoDB, remove reference from parent product, and invalidate cache', async () => {
      const mockModelId = new mongoose.Types.ObjectId();
      const mockProductId = new mongoose.Types.ObjectId();
      const mockModelDoc = {
        _id: mockModelId,
        name: 'AP-500 Model',
        modelNumber: 'AP-500',
        slug: 'ap-500',
        productId: mockProductId,
      };

      jest.spyOn(ProductModel, 'findById').mockResolvedValue(mockModelDoc as any);
      jest.spyOn(Product, 'updateMany').mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);
      jest.spyOn(ProductModel, 'findByIdAndDelete').mockResolvedValue(mockModelDoc as any);

      const result = await productModelService.deleteModel(mockModelId.toString());

      expect(result).toEqual({ message: 'Model deleted successfully' });
      expect(Product.updateMany).toHaveBeenCalledWith(
        { models: mockModelId.toString() },
        { $pull: { models: mockModelId.toString() } }
      );
      expect(ProductModel.findByIdAndDelete).toHaveBeenCalledWith(mockModelId.toString());
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_MODELS);
    });

    it('should throw 404 AppError if model does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      jest.spyOn(ProductModel, 'findById').mockResolvedValue(null);

      await expect(productModelService.deleteModel(nonExistentId)).rejects.toThrow(AppError);
    });
  });

  describe('Product Deletion', () => {
    it('should permanently delete product, delete all associated models, clean category references, and invalidate cache', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProductDoc = {
        _id: mockProductId,
        name: 'High Speed Wrapper',
        slug: 'high-speed-wrapper',
        categoryId: new mongoose.Types.ObjectId(),
      };

      jest.spyOn(Product, 'findById').mockResolvedValue(mockProductDoc as any);
      jest.spyOn(ProductModel, 'countDocuments').mockResolvedValue(3);
      jest.spyOn(ProductModel, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 3 } as any);
      jest.spyOn(Category, 'updateMany').mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);
      jest.spyOn(Product, 'findByIdAndDelete').mockResolvedValue(mockProductDoc as any);

      const result = await productService.deleteProduct(mockProductId.toString(), true);

      expect(result).toEqual({ message: 'Product deleted successfully' });
      expect(ProductModel.deleteMany).toHaveBeenCalledWith({
        $or: [{ productId: mockProductId.toString() }, { parentId: mockProductId.toString() }],
      });
      expect(Category.updateMany).toHaveBeenCalledWith(
        { catalogProductId: mockProductId.toString() },
        { $set: { catalogProductId: null } }
      );
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith(mockProductId.toString());
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_PRODUCTS);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_MODELS);
    });

    it('should throw 400 AppError if product contains models and cascade is false', async () => {
      const mockProductId = new mongoose.Types.ObjectId();
      const mockProductDoc = {
        _id: mockProductId,
        name: 'High Speed Wrapper',
        slug: 'high-speed-wrapper',
      };

      jest.spyOn(Product, 'findById').mockResolvedValue(mockProductDoc as any);
      jest.spyOn(ProductModel, 'countDocuments').mockResolvedValue(2);

      await expect(productService.deleteProduct(mockProductId.toString(), false)).rejects.toThrow(AppError);
    });
  });

  describe('Category Deletion', () => {
    it('should cascade delete category, child subcategories, products, and models, and invalidate cache', async () => {
      const mockCatId = new mongoose.Types.ObjectId();
      const mockSubCatId = new mongoose.Types.ObjectId();
      const mockProdId = new mongoose.Types.ObjectId();

      const mockCatDoc = {
        _id: mockCatId,
        name: 'Packaging Machinery',
        slug: 'packaging-machinery',
      };

      jest.spyOn(Category, 'findById').mockResolvedValue(mockCatDoc as any);
      jest.spyOn(Product, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(Category, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(Category as any, 'find').mockImplementation(((query: any) => {
        const matchesCat = query?.$or?.some(
          (c: any) => String(c.parentCategoryId) === String(mockCatId) || String(c.parentId) === String(mockCatId)
        );
        if (matchesCat) {
          return {
            select: () => ({
              lean: async () => [{ _id: mockSubCatId }],
            }),
          };
        }
        return {
          select: () => ({
            lean: async () => [],
          }),
        };
      }) as any);

      jest.spyOn(Product, 'find').mockReturnValue({
        select: () => ({
          lean: async () => [{ _id: mockProdId }],
        }),
      } as any);

      jest.spyOn(ProductModel, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 2 } as any);
      jest.spyOn(Product, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 } as any);
      jest.spyOn(Category, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 2 } as any);
      jest.spyOn(CategoryHero, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 } as any);
      jest.spyOn(Category, 'updateMany').mockResolvedValue({ acknowledged: true, modifiedCount: 0 } as any);

      const result = await categoryService.deleteCategory(mockCatId.toString(), true);

      expect(result).toEqual({ message: 'Category deleted successfully' });
      expect(ProductModel.deleteMany).toHaveBeenCalled();
      expect(Product.deleteMany).toHaveBeenCalled();
      expect(Category.deleteMany).toHaveBeenCalled();
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_CATEGORIES);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_PRODUCTS);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_MODELS);
    });

    it('should throw 400 AppError when deleting category with children without cascade', async () => {
      const mockCatId = new mongoose.Types.ObjectId();
      const mockCatDoc = {
        _id: mockCatId,
        name: 'Packaging Machinery',
        slug: 'packaging-machinery',
      };

      jest.spyOn(Category, 'findById').mockResolvedValue(mockCatDoc as any);
      jest.spyOn(Category, 'find').mockReturnValue({
        select: () => ({
          lean: async () => [],
        }),
      } as any);
      jest.spyOn(Product, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(Category, 'countDocuments').mockResolvedValue(0);

      await expect(categoryService.deleteCategory(mockCatId.toString(), false)).rejects.toThrow(AppError);
    });
  });
});
