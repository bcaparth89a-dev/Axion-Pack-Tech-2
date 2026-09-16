import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { HomePage } from '../models/HomePage.model.js';
import { AboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { CompanyStats } from '../models/CompanyStats.model.js';
import { SiteSettings } from '../models/SiteSettings.model.js';
import { ContactSettings } from '../models/ContactSettings.model.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { Industry } from '../models/Industry.model.js';
import { Service } from '../models/Service.model.js';
import { Career } from '../models/Career.model.js';
import { NewsCategory } from '../models/NewsCategory.model.js';
import { News } from '../models/News.model.js';
import { BlogCategory } from '../models/BlogCategory.model.js';
import { Blog } from '../models/Blog.model.js';

async function main() {
  await connectDB();
  const report = {
    homePage: await HomePage.countDocuments(),
    aboutPage: await AboutPage.countDocuments(),
    responsibilityPage: await ResponsibilityPage.countDocuments(),
    companyStats: await CompanyStats.countDocuments(),
    siteSettings: await SiteSettings.countDocuments(),
    contactSettings: await ContactSettings.countDocuments(),
    categories: await Category.countDocuments(),
    products: await Product.countDocuments(),
    productModels: await ProductModel.countDocuments(),
    industries: await Industry.countDocuments(),
    services: await Service.countDocuments(),
    careers: await Career.countDocuments(),
    newsCategories: await NewsCategory.countDocuments(),
    news: await News.countDocuments(),
    blogCategories: await BlogCategory.countDocuments(),
    blogs: await Blog.countDocuments(),
  };
  console.log('CURRENT MONGODB RECORD COUNTS:');
  console.table(report);

  const industries = await Industry.find().select('title slug').lean();
  console.log('Industries in DB:', industries);

  const services = await Service.find().select('title slug').lean();
  console.log('Services in DB:', services);

  const careers = await Career.find().select('title slug type').lean();
  console.log('Careers in DB:', careers);

  const news = await News.find().select('title slug categorySlug').lean();
  console.log('News in DB:', news);

  const blogs = await Blog.find().select('title slug categorySlug').lean();
  console.log('Blogs in DB:', blogs);

  await disconnectDB();
}
main().catch(console.error);
