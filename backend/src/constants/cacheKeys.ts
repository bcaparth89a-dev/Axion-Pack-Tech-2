export const CACHE_TTL = {
  SHORT: 300, // 5 minutes (Homepage, high-frequency updates)
  MEDIUM: 900, // 15 minutes (Products, Industries, Careers, Blogs)
  LONG: 1800, // 30 minutes (Services, Categories, About/Responsibilities pages)
  EXTENDED: 3600, // 1 hour (SiteSettings, ContactSettings)
} as const;

export const CACHE_KEYS = {
  // Public content keys
  HOME_DATA: 'axion:public:home',
  ABOUT_DATA: 'axion:public:about',
  RESPONSIBILITIES_DATA: 'axion:public:responsibilities',
  COMPANY_STATS: 'axion:public:company_stats',
  CATEGORY_HERO_DATA: 'axion:public:category_hero',

  // Categories, Products, Models
  PRODUCT_CATEGORIES: 'axion:public:products:categories',
  CATEGORY_TREE: 'axion:public:categories:tree',
  CATEGORY_NAV: (parentId: string = 'root') => `axion:public:categories:nav:${parentId}`,
  CATEGORY_LIST: 'axion:public:categories:list',
  CATEGORY_DETAIL: (slug: string) => `axion:public:categories:detail:${slug}`,
  CATEGORY_ANCESTRY: (slug: string) => `axion:public:categories:ancestry:${slug}`,

  PRODUCTS_LIST: (query: string = '') => `axion:public:products:list:${query}`,
  PRODUCT_DETAIL: (slug: string) => `axion:public:products:detail:${slug}`,
  PRODUCTS_FEATURED: 'axion:public:products:featured',

  MODELS_LIST: (productId: string = '') => `axion:public:models:list:${productId}`,
  MODEL_DETAIL: (slug: string) => `axion:public:models:detail:${slug}`,

  INDUSTRIES_LIST: (query: string = '') => `axion:public:industries:list:${query}`,
  INDUSTRY_DETAIL: (slug: string) => `axion:public:industries:detail:${slug}`,

  SERVICES_LIST: 'axion:public:services:list',
  SERVICE_DETAIL: (slug: string) => `axion:public:services:detail:${slug}`,

  CAREERS_LIST: (type: string = '', query: string = '') => `axion:public:careers:list:${type}:${query}`,
  CAREER_DETAIL: (slug: string) => `axion:public:careers:detail:${slug}`,

  NEWS_LIST: (query: string = '') => `axion:public:news:list:${query}`,
  NEWS_CATEGORIES: 'axion:public:news:categories',
  NEWS_DETAIL: (categorySlug: string, slug: string) => `axion:public:news:detail:${categorySlug}:${slug}`,

  BLOGS_LIST: (query: string = '') => `axion:public:blogs:list:${query}`,
  BLOG_CATEGORIES: 'axion:public:blogs:categories',
  BLOG_DETAIL: (slug: string) => `axion:public:blogs:detail:${slug}`,

  SITE_SETTINGS: 'axion:public:settings:site',
  CONTACT_SETTINGS: 'axion:public:settings:contact',
} as const;

export const CACHE_PATTERNS = {
  ALL_CATEGORIES: 'axion:public:categories:*',
  ALL_PRODUCTS: 'axion:public:products:*',
  ALL_MODELS: 'axion:public:models:*',
  ALL_INDUSTRIES: 'axion:public:industries:*',
  ALL_SERVICES: 'axion:public:services:*',
  ALL_CAREERS: 'axion:public:careers:*',
  ALL_NEWS: 'axion:public:news:*',
  ALL_BLOGS: 'axion:public:blogs:*',
  ALL_PAGES: 'axion:public:*:home',
  ALL_SETTINGS: 'axion:public:settings:*',
  EVERYTHING_PUBLIC: 'axion:public:*',
} as const;
