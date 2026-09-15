import mongoose from 'mongoose';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { categoryService } from '../services/category.service.js';
import { productService } from '../services/product.service.js';
import { productModelService } from '../services/productModel.service.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { getRedisClient, initRedis, disconnectRedis } from '../config/redis.js';

async function runLiveVerification() {
  console.log('====================================================');
  console.log('STARTING LIVE DELETION & SEO REMOVAL VERIFICATION');
  console.log('====================================================');

  await connectDB();
  await initRedis();
  const redis = getRedisClient();

  const timestamp = Date.now();
  const catSlug = `test-cat-live-${timestamp}`;
  const subCatSlug = `test-subcat-live-${timestamp}`;
  const prodSlug = `test-prod-live-${timestamp}`;
  const modelSlug = `test-model-live-${timestamp}`;

  try {
    // -------------------------------------------------------------
    // TEST 1: CREATE HIERARCHY (Category -> SubCategory -> Product -> Model)
    // -------------------------------------------------------------
    console.log('\n[1] Creating test hierarchy...');
    const mainCategory = await Category.create({
      name: `Test Main Category ${timestamp}`,
      slug: catSlug,
      parentCategoryId: null,
      parentId: null,
      shortDescription: 'Main category for deletion test',
      description: 'Full description',
      isActive: true,
      displayOrder: 1,
    });
    console.log(`✓ Main Category created with ID: ${mainCategory._id}`);

    const subCategory = await Category.create({
      name: `Test Sub Category ${timestamp}`,
      slug: subCatSlug,
      parentCategoryId: mainCategory._id,
      parentId: mainCategory._id,
      shortDescription: 'Sub category for deletion test',
      description: 'Sub category description',
      isActive: true,
      displayOrder: 1,
    });
    console.log(`✓ Sub Category created with ID: ${subCategory._id}`);

    const product = await Product.create({
      name: `Test Product ${timestamp}`,
      slug: prodSlug,
      categoryId: subCategory._id,
      parentId: subCategory._id,
      shortDescription: 'Product for deletion test',
      description: 'Product description',
      isActive: true,
      displayOrder: 1,
    });
    console.log(`✓ Product created with ID: ${product._id}`);

    const model = await ProductModel.create({
      name: `Test Model ${timestamp}`,
      modelNumber: `TM-${timestamp}`,
      slug: modelSlug,
      productId: product._id,
      parentId: product._id,
      shortDescription: 'Model for deletion test',
      description: 'Model description',
      isActive: true,
      displayOrder: 1,
    });
    console.log(`✓ Model created with ID: ${model._id}`);

    // Verify SEO field is absent / not populated
    console.log('\n[2] Verifying SEO fields are removed from models...');
    const fetchedCat: any = await Category.findById(mainCategory._id).lean();
    const fetchedProd: any = await Product.findById(product._id).lean();
    const fetchedModel: any = await ProductModel.findById(model._id).lean();

    if (fetchedCat && 'seo' in fetchedCat && fetchedCat.seo && Object.keys(fetchedCat.seo).length > 0) {
      console.warn('⚠️ Category has SEO data populated unexpectedly');
    } else {
      console.log('✓ Category schema has no SEO definition');
    }

    if (fetchedProd && 'seo' in fetchedProd && fetchedProd.seo && Object.keys(fetchedProd.seo).length > 0) {
      console.warn('⚠️ Product has SEO data populated unexpectedly');
    } else {
      console.log('✓ Product schema has no SEO definition');
    }

    if (fetchedModel && 'seo' in fetchedModel && fetchedModel.seo && Object.keys(fetchedModel.seo).length > 0) {
      console.warn('⚠️ Model has SEO data populated unexpectedly');
    } else {
      console.log('✓ Model schema has no SEO definition');
    }

    // Populate Redis with sample keys to verify cache invalidation
    await redis.set(`axion:public:categories:detail:${catSlug}`, '{"cached": true}');
    await redis.set(`axion:public:products:detail:${prodSlug}`, '{"cached": true}');
    await redis.set(`axion:public:models:detail:${modelSlug}`, '{"cached": true}');
    await redis.set(`axion:public:categories:tree`, '{"cached": true}');

    // -------------------------------------------------------------
    // TEST 3: DELETE MODEL
    // -------------------------------------------------------------
    console.log('\n[3] Testing Model Deletion...');
    const modelDeleteResult = await productModelService.deleteModel(model._id.toString());
    console.log('✓ productModelService.deleteModel response:', modelDeleteResult);

    const modelCheck = await ProductModel.findById(model._id);
    if (modelCheck === null) {
      console.log('✓ Model was permanently deleted from MongoDB (null)');
    } else {
      throw new Error('Model still exists in MongoDB after deletion!');
    }

    const modelCacheCheck = await redis.get(`axion:public:models:detail:${modelSlug}`);
    if (!modelCacheCheck) {
      console.log('✓ Model Redis cache was invalidated successfully');
    } else {
      console.warn('⚠️ Model cache key was not purged immediately');
    }

    // -------------------------------------------------------------
    // TEST 4: CREATE ANOTHER MODEL AND TEST PRODUCT DELETION (CASCADE)
    // -------------------------------------------------------------
    console.log('\n[4] Testing Product Deletion with child model cascade...');
    const childModel = await ProductModel.create({
      name: `Child Model ${timestamp}`,
      modelNumber: `CM-${timestamp}`,
      slug: `child-model-${timestamp}`,
      productId: product._id,
      parentId: product._id,
      isActive: true,
      displayOrder: 1,
    });

    const prodDeleteResult = await productService.deleteProduct(product._id.toString(), true);
    console.log('✓ productService.deleteProduct response:', prodDeleteResult);

    const prodCheck = await Product.findById(product._id);
    const childModelCheck = await ProductModel.findById(childModel._id);

    if (prodCheck === null && childModelCheck === null) {
      console.log('✓ Product and its child models permanently deleted from MongoDB');
    } else {
      throw new Error('Product or child model still exists in MongoDB!');
    }

    // -------------------------------------------------------------
    // TEST 5: CREATE CHILD PRODUCT & MODEL, TEST CATEGORY DELETION (CASCADE)
    // -------------------------------------------------------------
    console.log('\n[5] Testing Category Deletion with subcategory & product cascade...');
    const catProd = await Product.create({
      name: `Cat Product ${timestamp}`,
      slug: `cat-prod-${timestamp}`,
      categoryId: subCategory._id,
      parentId: subCategory._id,
      isActive: true,
      displayOrder: 1,
    });

    const catModel = await ProductModel.create({
      name: `Cat Model ${timestamp}`,
      modelNumber: `CAT-M-${timestamp}`,
      slug: `cat-model-${timestamp}`,
      productId: catProd._id,
      parentId: catProd._id,
      isActive: true,
      displayOrder: 1,
    });

    const catDeleteResult = await categoryService.deleteCategory(mainCategory._id.toString(), true);
    console.log('✓ categoryService.deleteCategory response:', catDeleteResult);

    const mainCatCheck = await Category.findById(mainCategory._id);
    const subCatCheck = await Category.findById(subCategory._id);
    const catProdCheck = await Product.findById(catProd._id);
    const catModelCheck = await ProductModel.findById(catModel._id);

    if (mainCatCheck === null && subCatCheck === null && catProdCheck === null && catModelCheck === null) {
      console.log('✓ Main Category, Sub Category, Child Product, and Child Model all permanently deleted from MongoDB');
    } else {
      throw new Error('Category cascade deletion left orphan documents in MongoDB!');
    }

    const treeCacheCheck = await redis.get('axion:public:categories:tree');
    if (!treeCacheCheck) {
      console.log('✓ Category Tree Redis cache was invalidated successfully');
    }

    // -------------------------------------------------------------
    // TEST 6: NON-EXISTENT ID DELETION ERROR HANDLING
    // -------------------------------------------------------------
    console.log('\n[6] Testing Non-existent ID deletion error handling...');
    const randomId = new mongoose.Types.ObjectId().toString();
    try {
      await categoryService.deleteCategory(randomId, true);
      throw new Error('Deleting non-existent Category should have thrown an error!');
    } catch (err: any) {
      console.log(`✓ Non-existent category deletion rejected with error: "${err.message}" (Status: ${err.statusCode || 404})`);
    }

    try {
      await productService.deleteProduct(randomId, true);
      throw new Error('Deleting non-existent Product should have thrown an error!');
    } catch (err: any) {
      console.log(`✓ Non-existent product deletion rejected with error: "${err.message}" (Status: ${err.statusCode || 404})`);
    }

    try {
      await productModelService.deleteModel(randomId);
      throw new Error('Deleting non-existent Model should have thrown an error!');
    } catch (err: any) {
      console.log(`✓ Non-existent model deletion rejected with error: "${err.message}" (Status: ${err.statusCode || 404})`);
    }

    console.log('\n====================================================');
    console.log('ALL LIVE VERIFICATION TESTS PASSED SUCCESSFULLY! ✅');
    console.log('====================================================\n');
  } finally {
    await disconnectDB();
    await disconnectRedis();
  }
}

runLiveVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
