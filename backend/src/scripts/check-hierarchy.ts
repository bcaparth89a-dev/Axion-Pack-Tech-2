import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { catalogProductService } from '../services/catalogProduct.service.js';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/axion-pack-tech');
  
  const stats = await catalogProductService.getCatalogProductStats('6aa95d21f28274e5bba95d0d');
  console.log('--- STATS ---', stats);
  
  const tree = await catalogProductService.getCatalogProductTree('6aa95d21f28274e5bba95d0d', false);
  console.log('--- TREE ROOT COUNT ---', tree.length);
  tree.forEach(n => {
    console.log(`- [${n.type}] "${n.name}" (children: ${n.children?.length || 0})`);
  });

  await mongoose.disconnect();
}

check().catch(console.error);
