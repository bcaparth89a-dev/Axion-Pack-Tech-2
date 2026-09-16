import dotenv from 'dotenv';
dotenv.config();

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface HierarchyNode {
  _id: string;
  name: string;
  slug: string;
  type: string;
  parentId?: string | null;
  children?: HierarchyNode[];
}

async function runVerification() {
  console.log('=== FULL CATALOG HIERARCHY VERIFICATION SUITE ===\n');

  // 1. Test HTTP GET /api/v1/catalog-products/6aa95d21f28274e5bba95d0d/tree?all=true
  console.log('1. Testing HTTP Tree Endpoint...');
  const treeRes = await fetch('http://localhost:5000/api/v1/catalog-products/6aa95d21f28274e5bba95d0d/tree?all=true');
  const treeJson = (await treeRes.json()) as ApiResponse<HierarchyNode[]>;
  
  if (!treeJson.success) {
    console.error('Tree fetch failed:', treeJson);
    process.exit(1);
  }

  const rootItems = treeJson.data;
  console.log(`✓ Tree successfully fetched. Total root nodes: ${rootItems.length}`);
  rootItems.forEach((item) => {
    console.log(`  - [${item.type.toUpperCase()}] "${item.name}" (parentId: ${item.parentId}, children: ${item.children?.length || 0})`);
  });

  const parthProduct = rootItems.find((item) => item.name === 'Hello I am Parth');
  if (!parthProduct) {
    console.error('❌ "Hello I am Parth" product is MISSING from root nodes!');
    process.exit(1);
  }
  console.log('✓ "Hello I am Parth" is present as a standalone ROOT product in the hierarchy!');

  // 2. Count total nodes in tree
  function countNodes(nodes: HierarchyNode[]): { categories: number; products: number; models: number; total: number } {
    let categories = 0;
    let products = 0;
    let models = 0;
    for (const n of nodes) {
      if (n.type === 'mainCategory' || n.type === 'subCategory' || n.type === 'category') categories++;
      else if (n.type === 'product') products++;
      else if (n.type === 'model') models++;
      if (n.children && n.children.length > 0) {
        const sub = countNodes(n.children);
        categories += sub.categories;
        products += sub.products;
        models += sub.models;
      }
    }
    return { categories, products, models, total: categories + products + models };
  }

  const counts = countNodes(rootItems);
  console.log(`\n2. Tree Node Counts:
  - Categories: ${counts.categories}
  - Products: ${counts.products}
  - Models: ${counts.models}
  - TOTAL NODES: ${counts.total}`);

  if (counts.total !== 19 || counts.products !== 5 || counts.models !== 9 || counts.categories !== 5) {
    console.error('❌ Node count mismatch! Expected 19 total (5 cat, 5 prod, 9 mod)');
    process.exit(1);
  }
  console.log('✓ All 19 catalog nodes are verified and present in hierarchy!');

  console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY ===');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
