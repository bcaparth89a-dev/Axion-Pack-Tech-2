export * from './client';
export * as industriesApi from './industries';
export * as servicesApi from './services';
export * as newsApi from './news';
export * as blogsApi from './blogs';
export * as careersApi from './careers';
export * as contactApi from './contact';
export * as pagesApi from './pages';
export * as settingsApi from './settings';
export * as productsApi from './products';

// Re-export common functions directly
export {
  getCategoryTree,
  getAllCategories,
  getCategoryBySlug,
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getModels,
  getModelBySlug,
  resolveCatalogEntityBySlug,
} from './products';
export { getIndustries, getIndustryBySlug } from './industries';
export { getServices, getServiceBySlug } from './services';
export { getAllNews, getNewsBySlug, getNewsCategories, getFeaturedNews } from './news';
export { getAllBlogs, getBlogBySlug, getBlogCategories, getFeaturedBlogs } from './blogs';
export { getAllCareers, getCareerBySlug, getCareersByType, getCareerCounts } from './careers';
export { getContactInfo, submitContactInquiry } from './contact';
export { getHomePage, getAboutPage, getResponsibilityPage } from './pages';
export { getSiteSettings, getCompanyStats } from './settings';
