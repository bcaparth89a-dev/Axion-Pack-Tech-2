import { CACHE_KEYS, CACHE_PATTERNS, CACHE_TTL } from '../src/constants/cacheKeys.js';

describe('Cache Strategy & Key Hierarchy', () => {
  it('should define structured TTL hierarchy', () => {
    expect(CACHE_TTL.SHORT).toBe(300);
    expect(CACHE_TTL.MEDIUM).toBe(900);
    expect(CACHE_TTL.LONG).toBe(1800);
    expect(CACHE_TTL.EXTENDED).toBe(3600);
  });

  it('should generate consistent and isolated cache keys', () => {
    expect(CACHE_KEYS.HOME_DATA).toBe('axion:public:home');
    expect(CACHE_KEYS.PRODUCT_CATEGORIES).toBe('axion:public:products:categories');
    expect(CACHE_KEYS.PRODUCT_DETAIL('vffs-machine')).toBe('axion:public:products:detail:vffs-machine');
    expect(CACHE_KEYS.NEWS_DETAIL('company-news', 'expansion')).toBe(
      'axion:public:news:detail:company-news:expansion'
    );
  });

  it('should define non-blocking pattern matching targets for invalidation', () => {
    expect(CACHE_PATTERNS.ALL_PRODUCTS).toBe('axion:public:products:*');
    expect(CACHE_PATTERNS.ALL_NEWS).toBe('axion:public:news:*');
    expect(CACHE_PATTERNS.EVERYTHING_PUBLIC).toBe('axion:public:*');
  });
});
