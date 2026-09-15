import { NewsService } from '../src/services/news.service.js';
import { News } from '../src/models/News.model.js';
import { NewsCategory } from '../src/models/NewsCategory.model.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS } from '../src/constants/cacheKeys.js';
import {
  newsSchema,
  updateNewsSchema,
  reorderNewsSchema,
  newsCategorySchema,
} from '../src/validators/news.validator.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/News.model.js');
jest.mock('../src/models/NewsCategory.model.js');
jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn(),
    setCached: jest.fn(),
    deleteCached: jest.fn(),
    deleteByPattern: jest.fn(),
  },
}));

describe('News Service & CMS Architecture', () => {
  let newsService: NewsService;

  beforeEach(() => {
    jest.clearAllMocks();
    newsService = new NewsService();
  });

  describe('getCategories', () => {
    it('should return cached categories on cache hit', async () => {
      const mockCached = [{ title: 'Company News', slug: 'company-news' }];
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockCached);

      const result = await newsService.getCategories();
      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.NEWS_CATEGORIES);
      expect(result).toEqual(mockCached);
    });

    it('should query MongoDB on cache miss and cache the result', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockCategories = [{ title: 'Company News', slug: 'company-news' }];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategories),
      };
      (NewsCategory.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await newsService.getCategories();
      expect(NewsCategory.find).toHaveBeenCalled();
      expect(cacheService.setCached).toHaveBeenCalledWith(
        CACHE_KEYS.NEWS_CATEGORIES,
        mockCategories,
        expect.any(Number)
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getNews', () => {
    it('should return paginated published news for public requests', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockArticles = [
        { title: 'New Machinery Wing', slug: 'new-machinery-wing', published: true },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockArticles),
      };
      (News.find as jest.Mock).mockReturnValue(mockQuery);
      (News.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await newsService.getNews({ page: 1, limit: 10 });
      expect(News.find).toHaveBeenCalledWith({ published: true });
      expect(result.items).toEqual(mockArticles);
      expect(result.pagination.totalItems).toBe(1);

    });

    it('should return all articles including drafts when publishedOnly is false', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockArticles = [
        { title: 'Live Article', slug: 'live-article', published: true },
        { title: 'Draft Article', slug: 'draft-article', published: false },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockArticles),
      };
      (News.find as jest.Mock).mockReturnValue(mockQuery);
      (News.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await newsService.getNews({ publishedOnly: false });
      expect(News.find).toHaveBeenCalledWith({});
      expect(result.items.length).toBe(2);
    });
  });

  describe('getNewsBySlug', () => {
    it('should find news by single direct slug', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockArticle = {
        title: 'New Machinery Wing',
        slug: 'new-machinery-wing',
        categorySlug: 'company-news',
        published: true,
      };
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockArticle),
      };
      (News.findOne as jest.Mock).mockReturnValue(mockQuery);

      const result = await newsService.getNewsBySlug('new-machinery-wing', true);
      expect(News.findOne).toHaveBeenCalledWith({ slug: 'new-machinery-wing', published: true });
      expect(result).toEqual(mockArticle);
    });

    it('should find news by category and slug', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockArticle = {
        title: 'New Machinery Wing',
        slug: 'new-machinery-wing',
        categorySlug: 'company-news',
        published: true,
      };
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockArticle),
      };
      (News.findOne as jest.Mock).mockReturnValue(mockQuery);

      const result = await newsService.getNewsBySlug('company-news', 'new-machinery-wing', true);
      expect(News.findOne).toHaveBeenCalledWith({
        categorySlug: 'company-news',
        slug: 'new-machinery-wing',
        published: true,
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw AppError 404 when article is not found', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };
      (News.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(newsService.getNewsBySlug('nonexistent')).rejects.toThrow(AppError);
    });
  });

  describe('createNews & updateNews & deleteNews & reorderNews', () => {
    it('should create article and invalidate cache', async () => {
      (News.findOne as jest.Mock).mockResolvedValue(null);
      const newArticle = {
        title: 'Expansion Announcement',
        slug: 'expansion-announcement',
        categorySlug: 'company-news',
        excerpt: 'Axion PackTech expands its facility.',
        featuredImage: '/images/news/expansion.jpg',
        published: true,
      };
      (News.create as jest.Mock).mockResolvedValue(newArticle);

      const result = await newsService.createNews(newArticle as any);
      expect(News.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'expansion-announcement', categorySlug: 'company-news' })
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_NEWS);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.HOME_DATA);
      expect(result).toEqual(newArticle);
    });

    it('should throw conflict error if slug already exists on create', async () => {
      (News.findOne as jest.Mock).mockResolvedValue({ _id: '123', slug: 'existing-slug' });

      await expect(
        newsService.createNews({ title: 'Duplicate', slug: 'existing-slug', excerpt: 'Test' } as any)
      ).rejects.toThrow(AppError);
    });

    it('should update article and invalidate cache', async () => {
      const updatedArticle = {
        title: 'Updated Expansion',
        slug: 'expansion-announcement',
        categorySlug: 'company-news',
      };
      (News.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedArticle);

      const result = await newsService.updateNews('expansion-announcement', { title: 'Updated Expansion' });
      expect(News.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'expansion-announcement' },
        { title: 'Updated Expansion' },
        { new: true, runValidators: true }
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_NEWS);
      expect(result).toEqual(updatedArticle);
    });

    it('should delete article and invalidate cache', async () => {
      (News.findOneAndDelete as jest.Mock).mockResolvedValue({
        slug: 'expansion-announcement',
        categorySlug: 'company-news',
      });

      await newsService.deleteNews('expansion-announcement');
      expect(News.findOneAndDelete).toHaveBeenCalledWith({ slug: 'expansion-announcement' });
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_NEWS);
    });

    it('should reorder news articles with bulkWrite', async () => {
      (News.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { slug: 'article-1', sortOrder: 1 },
          { slug: 'article-2', sortOrder: 2 },
        ]),
      };
      (News.find as jest.Mock).mockReturnValue(mockQuery);

      const orders = [
        { slug: 'article-1', sortOrder: 1 },
        { slug: 'article-2', sortOrder: 2 },
      ];

      const result = await newsService.reorderNews(orders);
      expect(News.bulkWrite).toHaveBeenCalledWith([
        { updateOne: { filter: { slug: 'article-1' }, update: { $set: { sortOrder: 1 } } } },
        { updateOne: { filter: { slug: 'article-2' }, update: { $set: { sortOrder: 2 } } } },
      ]);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_NEWS);
      expect(result.length).toBe(2);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate complete news creation body', () => {
      const payload = {
        body: {
          title: 'Advanced Automatic Bagging Systems',
          slug: 'advanced-automatic-bagging-systems',
          categorySlug: 'product-technology',
          excerpt: 'New developments in automated bagging technology are helping manufacturers.',
          featuredImage: '/images/news/bagging.jpg',
          published: true,
        },
      };
      const parsed = newsSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should validate partial news update body', () => {
      const payload = {
        body: {
          published: false,
          featured: true,
        },
      };
      const parsed = updateNewsSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should validate category schema', () => {
      const payload = {
        body: {
          title: 'Company News',
          slug: 'company-news',
          description: 'Latest official company updates',
        },
      };
      const parsed = newsCategorySchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should validate reorder body', () => {
      const payload = {
        body: {
          orders: [
            { slug: 'news-1', sortOrder: 1 },
            { slug: 'news-2', sortOrder: 2 },
          ],
        },
      };
      const parsed = reorderNewsSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });
  });
});
