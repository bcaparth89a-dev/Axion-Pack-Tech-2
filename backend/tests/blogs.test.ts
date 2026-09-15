import { BlogService } from '../src/services/blog.service.js';
import { Blog } from '../src/models/Blog.model.js';
import { BlogCategory } from '../src/models/BlogCategory.model.js';
import { cacheService } from '../src/cache/cache.service.js';
import { CACHE_KEYS, CACHE_PATTERNS } from '../src/constants/cacheKeys.js';
import {
  blogSchema,
  updateBlogSchema,
  reorderBlogsSchema,
  blogCategorySchema,
} from '../src/validators/blog.validator.js';
import { AppError } from '../src/utils/appError.js';

jest.mock('../src/models/Blog.model.js');
jest.mock('../src/models/BlogCategory.model.js');
jest.mock('../src/cache/cache.service.js', () => ({
  cacheService: {
    getCached: jest.fn(),
    setCached: jest.fn(),
    deleteCached: jest.fn(),
    deleteByPattern: jest.fn(),
  },
}));

describe('Blog Service & CMS Architecture', () => {
  let blogService: BlogService;

  beforeEach(() => {
    jest.clearAllMocks();
    blogService = new BlogService();
  });

  describe('getCategories', () => {
    it('should return cached categories on cache hit', async () => {
      const mockCached = [{ title: 'Packaging Technology', slug: 'packaging-technology' }];
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockCached);

      const result = await blogService.getCategories();
      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.BLOG_CATEGORIES);
      expect(result).toEqual(mockCached);
    });

    it('should query MongoDB on cache miss and cache the result', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockCategories = [{ title: 'Packaging Technology', slug: 'packaging-technology' }];
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockCategories),
      };
      (BlogCategory.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await blogService.getCategories();
      expect(BlogCategory.find).toHaveBeenCalled();
      expect(cacheService.setCached).toHaveBeenCalledWith(
        CACHE_KEYS.BLOG_CATEGORIES,
        mockCategories,
        expect.any(Number)
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getBlogs', () => {
    it('should return paginated published blogs for public requests', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockPosts = [
        { title: 'Modern Packaging Lines', slug: 'modern-packaging-lines', published: true },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      (Blog.find as jest.Mock).mockReturnValue(mockQuery);
      (Blog.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await blogService.getBlogs({ page: 1, limit: 10 });
      expect(Blog.find).toHaveBeenCalledWith({ published: true });
      expect(result.items).toEqual(mockPosts);
      expect(result.pagination.totalItems).toBe(1);
    });

    it('should return all blog posts including drafts when publishedOnly is false', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockPosts = [
        { title: 'Live Post', slug: 'live-post', published: true },
        { title: 'Draft Post', slug: 'draft-post', published: false },
      ];
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      (Blog.find as jest.Mock).mockReturnValue(mockQuery);
      (Blog.countDocuments as jest.Mock).mockResolvedValue(2);

      const result = await blogService.getBlogs({ publishedOnly: false });
      expect(Blog.find).toHaveBeenCalledWith({});
      expect(result.items.length).toBe(2);
    });
  });

  describe('getBlogBySlug', () => {
    it('should return blog post on cache hit', async () => {
      const mockBlog = { title: 'Modern Packaging Lines', slug: 'modern-packaging-lines', published: true };
      (cacheService.getCached as jest.Mock).mockResolvedValue(mockBlog);

      const result = await blogService.getBlogBySlug('modern-packaging-lines', true);
      expect(cacheService.getCached).toHaveBeenCalledWith(CACHE_KEYS.BLOG_DETAIL('modern-packaging-lines'));
      expect(result).toEqual(mockBlog);
    });

    it('should throw AppError 404 when blog is not found', async () => {
      (cacheService.getCached as jest.Mock).mockResolvedValue(null);
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      };
      (Blog.findOne as jest.Mock).mockReturnValue(mockQuery);

      await expect(blogService.getBlogBySlug('nonexistent')).rejects.toThrow(AppError);
    });
  });

  describe('createBlog & updateBlog & deleteBlog & reorderBlogs', () => {
    it('should create blog post and invalidate cache', async () => {
      (Blog.findOne as jest.Mock).mockResolvedValue(null);
      (BlogCategory.findOne as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        title: 'Packaging Technology',
        slug: 'packaging-technology',
      });
      const newBlog = {
        title: 'Future of Packaging',
        slug: 'future-of-packaging',
        category: 'packaging-technology',
        excerpt: 'An in-depth look at emerging robotics and packaging technologies.',
        featuredImage: '/images/blog/future.jpg',
        published: true,
      };
      (Blog.create as jest.Mock).mockImplementation((data) => Promise.resolve({ ...data, _id: 'blog123' }));

      const result = await blogService.createBlog(newBlog as any);
      expect(Blog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'future-of-packaging',
          categorySlug: 'packaging-technology',
          category: '507f1f77bcf86cd799439011',
          categoryName: 'Packaging Technology',
        })
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_BLOGS);
      expect(cacheService.deleteCached).toHaveBeenCalledWith(CACHE_KEYS.HOME_DATA);
      expect(result.slug).toBe('future-of-packaging');
    });

    it('should throw conflict error if slug already exists on create', async () => {
      (Blog.findOne as jest.Mock).mockResolvedValue({ _id: '123', slug: 'existing-slug' });

      await expect(
        blogService.createBlog({ title: 'Duplicate', slug: 'existing-slug', excerpt: 'Test' } as any)
      ).rejects.toThrow(AppError);
    });

    it('should update blog post and invalidate cache', async () => {
      const updatedBlog = {
        title: 'Updated Future of Packaging',
        slug: 'future-of-packaging',
        categorySlug: 'packaging-technology',
      };
      (Blog.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedBlog);

      const result = await blogService.updateBlog('future-of-packaging', { title: 'Updated Future of Packaging' });
      expect(Blog.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'future-of-packaging' },
        expect.objectContaining({ title: 'Updated Future of Packaging' }),
        { new: true, runValidators: true }
      );
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_BLOGS);
      expect(result).toEqual(updatedBlog);
    });

    it('should delete blog post and invalidate cache', async () => {
      (Blog.findOneAndDelete as jest.Mock).mockResolvedValue({ slug: 'future-of-packaging' });

      await blogService.deleteBlog('future-of-packaging');
      expect(Blog.findOneAndDelete).toHaveBeenCalledWith({ slug: 'future-of-packaging' });
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_BLOGS);
    });

    it('should reorder blogs using bulkWrite', async () => {
      (Blog.bulkWrite as jest.Mock).mockResolvedValue({ modifiedCount: 2 });
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { slug: 'blog-1', sortOrder: 1 },
          { slug: 'blog-2', sortOrder: 2 },
        ]),
      };
      (Blog.find as jest.Mock).mockReturnValue(mockQuery);

      const orders = [
        { slug: 'blog-1', sortOrder: 1 },
        { slug: 'blog-2', sortOrder: 2 },
      ];

      const result = await blogService.reorderBlogs(orders);
      expect(Blog.bulkWrite).toHaveBeenCalledWith([
        { updateOne: { filter: { slug: 'blog-1' }, update: { $set: { sortOrder: 1 } } } },
        { updateOne: { filter: { slug: 'blog-2' }, update: { $set: { sortOrder: 2 } } } },
      ]);
      expect(cacheService.deleteByPattern).toHaveBeenCalledWith(CACHE_PATTERNS.ALL_BLOGS);
      expect(result.length).toBe(2);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate complete blog creation body with string category', () => {
      const payload = {
        body: {
          title: 'How Automation Is Transforming Modern Packaging Lines',
          slug: 'how-automation-is-transforming-modern-packaging-lines',
          category: 'industrial-automation',
          excerpt: 'Discover how advanced robotics eliminate packaging bottlenecks.',
          image: '/images/blog/automation.jpg',
          published: true,
          publishedDate: 'March 15, 2026',
          readingTime: '6 min read',
          sections: [
            {
              heading: 'Technical Dynamics',
              body: 'High-speed automated bagging kinematics.',
              bulletPoints: ['±0.2% load cell precision'],
              callout: 'Reduces operational bottleneck.',
            },
          ],
        },
      };
      const parsed = blogSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should reject blog with title shorter than 3 characters', () => {
      const payload = {
        body: {
          title: 'Hi',
          slug: 'hi',
          excerpt: 'Short excerpt for test',
        },
      };
      const parsed = blogSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
      if (!parsed.success) {
        expect(parsed.error.errors.some((e) => e.path.includes('title'))).toBe(true);
      }
    });

    it('should validate partial blog update body', () => {
      const payload = {
        body: {
          published: false,
          featured: true,
          publishedDate: 'April 1, 2026',
        },
      };
      const parsed = updateBlogSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should validate category schema', () => {
      const payload = {
        body: {
          title: 'Packaging Technology',
          slug: 'packaging-technology',
          description: 'Advanced packaging machinery innovations',
        },
      };
      const parsed = blogCategorySchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('should validate reorder body', () => {
      const payload = {
        body: {
          orders: [
            { slug: 'blog-1', sortOrder: 1 },
            { slug: 'blog-2', sortOrder: 2 },
          ],
        },
      };
      const parsed = reorderBlogsSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });
  });
});
