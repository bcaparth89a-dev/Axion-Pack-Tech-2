import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { cacheService } from '../cache/cache.service.js';
import { logger } from '../utils/logger.js';

export const seedCatalog = async () => {
  try {
    logger.info('Connecting to MongoDB for catalog seeding...');
    await connectDB();

    logger.info('Purging old Category, Product, and ProductModel collections...');
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      ProductModel.deleteMany({}),
    ]);

    logger.info('Creating hierarchical Categories...');

    // 1. Root Category: Conveyor
    const conveyorCat = await Category.create({
      name: 'Conveyor',
      slug: 'conveyor',
      parentCategoryId: null,
      shortDescription: 'Industrial conveying systems engineered for seamless material handling and transport.',
      description: 'Axion PackTech designs and manufactures heavy-duty, sanitary, and modular conveying systems that deliver maximum throughput and zero downtime across demanding manufacturing environments.',
      media: {
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        ],
      },
      features: [
        'Modular 304/316 Stainless Steel Construction',
        'Variable Frequency Drive (VFD) Speed Control',
        'Washdown Safe IP69K Componentry',
        'Tool-less Belt Replacement & Tracking',
      ],
      applications: [
        'Food & Beverage Processing',
        'Pharmaceutical Secondary Packaging',
        'Bulk Bagging & Palletizing Feeds',
      ],
      benefits: [
        '99.8% Operating Reliability',
        'Up to 40% Energy Efficiency Improvement',
        'Zero Dust Retention Sanitation Standard',
      ],
      displayOrder: 1,
      isActive: true,
      seo: {
        metaTitle: 'Industrial Conveyors | Axion PackTech',
        metaDescription: 'Explore Axion PackTech industrial conveyor systems designed for high-efficiency manufacturing.',
        keywords: ['conveyors', 'industrial conveyor', 'belt conveyor', 'material handling'],
      },
    });

    // 2. Subcategory Level 1: Belt Conveyor (under Conveyor)
    const beltConveyorCat = await Category.create({
      name: 'Belt Conveyor',
      slug: 'belt-conveyor',
      parentCategoryId: conveyorCat._id,
      shortDescription: 'Precision belt conveying solutions for packaged goods, bulk items, and assembly transfers.',
      description: 'Continuous belt conveyors engineered for gentle material handling, tight transfer radii, and high-speed multi-lane sorting operations.',
      media: {
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
      },
      features: [
        'Anti-static FDA Approved Belting',
        'Integrated Sensor Tracking',
        'Low Profile Bed Architecture',
      ],
      applications: ['Carton Handling', 'Pouch Transfer', 'Sorting Lines'],
      benefits: ['Low Noise Acoustic Profile (<68 dB)', 'Minimal Maintenance Cycles'],
      displayOrder: 1,
      isActive: true,
    });

    // 3. Subcategory Level 2: Food Grade Belt Conveyor (under Belt Conveyor -> 3 levels deep!)
    const foodGradeBeltCat = await Category.create({
      name: 'Food Grade Belt Conveyor',
      slug: 'food-grade-belt-conveyor',
      parentCategoryId: beltConveyorCat._id,
      shortDescription: 'Sanitary washdown belt conveyors compliant with FDA, USDA, and 3-A sanitary guidelines.',
      description: 'Constructed completely from continuous-welded sanitary stainless steel with open-frame geometry for ultra-rapid CIP (Clean-In-Place) sanitation.',
      media: {
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
      },
      features: [
        'USDA Dairy Compliant Geometry',
        'Positive Drive Polyurethane Belting',
        'Spray Bar CIP Integration',
      ],
      applications: ['Fresh Meat & Poultry', 'Bakery Dough Transfer', 'Dairy Packaging'],
      benefits: ['Zero Harbor Points for Bacteria', '50% Faster Washdown Turnaround'],
      displayOrder: 1,
      isActive: true,
    });

    // 4. Another Root Category: Packaging Machines
    const packagingCat = await Category.create({
      name: 'Packaging Machinery',
      slug: 'packaging-machinery',
      parentCategoryId: null,
      shortDescription: 'Turnkey automated primary and secondary packaging machinery.',
      description: 'Comprehensive automated packaging platforms covering vertical form-fill-seal, horizontal flow wrappers, and end-of-line carton sealers.',
      media: {
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1600&q=80',
      },
      features: ['Full Servo Multi-axis Motion Control', 'Industrial Touchscreen HMI', 'EtherCAT Bus Communication'],
      applications: ['Dry Bulk Packaging', 'Frozen Foods', 'Consumer Goods'],
      benefits: ['Up to 180 packs/minute', 'Tool-less Changeovers in <15 minutes'],
      displayOrder: 2,
      isActive: true,
    });

    // Subcategory under Packaging Machinery: Flow Wrapping Systems
    const flowWrapCat = await Category.create({
      name: 'Flow Wrapping Systems',
      slug: 'flow-wrapping-systems',
      parentCategoryId: packagingCat._id,
      shortDescription: 'High-speed horizontal flow wrapping systems for individual and multipack products.',
      description: 'Rotary and box-motion horizontal flow wrappers engineered for delicate solid items, bakery goods, and confectionery.',
      media: {
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
      },
      features: ['Automatic Film Splicer', 'Photocell Print Mark Registration', 'Nitrogen Flush Ready'],
      applications: ['Bakery Snack Bars', 'Confectionery', 'Pharmaceutical Blister Packs'],
      benefits: ['Hermetic Seal Integrity', 'Minimal Film Waste'],
      displayOrder: 1,
      isActive: true,
    });

    logger.info('Creating Products across hierarchy and standalone...');

    // Product 1: Under Food Grade Belt Conveyor (Deep hierarchy product)
    const sanitaryProduct = await Product.create({
      name: 'Sanitary Cleated Belt Conveyor',
      slug: 'sanitary-cleated-belt-conveyor',
      categoryId: foodGradeBeltCat._id,
      shortDescription: 'Elevating sanitary conveyor with welded flights for incline product elevation without slippage.',
      description: 'The Sanitary Cleated Belt Conveyor is engineered specifically for elevated transfers in washdown food processing lines. Featuring high-frequency welded polyurethane flights and tool-free belt tensioning, this system guarantees pristine hygiene and effortless sanitation.',
      media: {
        image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        ],
      },
      features: [
        'Positive drive sprockets eliminate belt slipping',
        'Removable drip trays and washdown spray bars',
        'IP69K stainless washdown geared drive motor',
        'Configurable cleat heights from 20mm to 100mm',
      ],
      specifications: [
        { key: 'frame_material', label: 'Frame Material', value: '304 Stainless Steel (316 Optional)', group: 'Construction' },
        { key: 'belt_type', label: 'Belt Type', value: 'Solid Polyurethane Thermoplastic', group: 'Belt' },
        { key: 'incline_angle', label: 'Incline Angle', value: '0° to 65° adjustable', group: 'Dimensions' },
        { key: 'operating_temp', label: 'Operating Temp', value: '-20°C to +80°C', group: 'Performance' },
        { key: 'drive_motor', label: 'Drive Motor', value: '0.75 kW - 2.2 kW IP69K SEW Eurodrive', group: 'Electrical' },
      ],
      applications: ['IQF Frozen Vegetables', 'Fresh Cut Meat Cubes', 'Confectionery Gummies'],
      benefits: ['100% Washdown Compliant', 'Zero Belt Stretch or Delamination'],
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
      seo: {
        metaTitle: 'Sanitary Cleated Belt Conveyor | Food Grade Incline Transport',
        metaDescription: 'Explore sanitary cleated belt conveyors for incline washdown food handling.',
      },
    });

    // Models for Product 1
    await ProductModel.create([
      {
        name: 'Sanitary Cleated Conveyor 500mm',
        modelNumber: 'SCB-500',
        slug: 'scb-500',
        productId: sanitaryProduct._id,
        shortDescription: '500mm wide sanitary modular incline conveyor for medium-volume packaging.',
        description: 'SCB-500 provides high-hygiene incline elevation with a 500mm effective belt width and throughput up to 12 tons per hour.',
        media: {
          image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'belt_width', label: 'Belt Width', value: '500 mm', group: 'Dimensions' },
          { key: 'max_capacity', label: 'Max Throughput', value: '12,000 kg/hr', group: 'Performance' },
          { key: 'cleat_pitch', label: 'Cleat Pitch', value: '150 mm standard', group: 'Belt' },
          { key: 'power_rating', label: 'Power', value: '1.1 kW', group: 'Electrical' },
        ],
        features: ['Quick-release belt bed', 'Cantilevered leg frame for fast belt change'],
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Sanitary Cleated Conveyor 1000mm High Capacity',
        modelNumber: 'SCB-1000',
        slug: 'scb-1000',
        productId: sanitaryProduct._id,
        shortDescription: '1000mm ultra-wide sanitary incline conveyor for high-volume bulk elevation.',
        description: 'Designed for heavy-flow primary processing lines requiring 1000mm width and elevated capacity up to 25 tons per hour.',
        media: {
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'belt_width', label: 'Belt Width', value: '1000 mm', group: 'Dimensions' },
          { key: 'max_capacity', label: 'Max Throughput', value: '25,000 kg/hr', group: 'Performance' },
          { key: 'cleat_pitch', label: 'Cleat Pitch', value: '200 mm heavy-duty', group: 'Belt' },
          { key: 'power_rating', label: 'Power', value: '2.2 kW', group: 'Electrical' },
        ],
        features: ['Dual drive synchronous drive shafts', 'Heavy duty reinforced stainless side guides'],
        displayOrder: 2,
        isActive: true,
      },
    ]);

    // Product 2: Directly under Belt Conveyor (Level 1 subcategory)
    const heavyDutyProduct = await Product.create({
      name: 'Heavy Duty Belt Conveyor',
      slug: 'heavy-duty-belt-conveyor',
      categoryId: beltConveyorCat._id,
      shortDescription: 'Reinforced structural steel conveyor for heavy unit loads, boxes, and crates.',
      description: 'Heavy Duty Belt Conveyors are built to withstand continuous 24/7 industrial punishment. Engineered for heavy carton transfers, pallet staging, and automated warehouse feeds.',
      media: {
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
      },
      features: [
        'Formed 10-gauge structural steel slider bed',
        'Crowned and vulcanized rubber drive pulleys',
        'Precision sealed roller bearings',
      ],
      specifications: [
        { key: 'load_capacity', label: 'Unit Load Capacity', value: 'Up to 250 kg/meter', group: 'Performance' },
        { key: 'belt_speed', label: 'Belt Speed', value: '10 - 60 m/min variable', group: 'Performance' },
        { key: 'bed_length', label: 'Standard Lengths', value: '2m to 30m modular sections', group: 'Dimensions' },
      ],
      applications: ['Corrugated Box Handling', 'Tote Bin Distribution', 'Palletizer Feed'],
      benefits: ['Industrial Grade Durability', 'Low Maintenance Operation'],
      displayOrder: 2,
      isActive: true,
      isFeatured: true,
    });

    // 3 Models for Heavy Duty Belt Conveyor
    await ProductModel.create([
      {
        name: 'Heavy Duty Conveyor 100',
        modelNumber: 'HBC-100',
        slug: 'hbc-100',
        productId: heavyDutyProduct._id,
        shortDescription: '100 kg/m capacity model for standard carton handling.',
        description: 'HBC-100 is the industry standard for warehouse distribution centers and parcel handling.',
        media: {
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'max_load', label: 'Max Load', value: '100 kg/m', group: 'Performance' },
          { key: 'belt_width', label: 'Belt Width', value: '450 mm', group: 'Dimensions' },
          { key: 'motor_power', label: 'Motor', value: '0.75 kW', group: 'Electrical' },
        ],
        features: ['Formed steel bed', 'Direct hollow shaft gearmotor'],
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Heavy Duty Conveyor 200',
        modelNumber: 'HBC-200',
        slug: 'hbc-200',
        productId: heavyDutyProduct._id,
        shortDescription: '200 kg/m reinforced model for heavy totes and bundles.',
        description: 'Engineered with heavier 8-gauge steel beds and larger pulley bearings for intensive high-weight distribution.',
        media: {
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'max_load', label: 'Max Load', value: '200 kg/m', group: 'Performance' },
          { key: 'belt_width', label: 'Belt Width', value: '650 mm', group: 'Dimensions' },
          { key: 'motor_power', label: 'Motor', value: '1.5 kW', group: 'Electrical' },
        ],
        features: ['Heavy structural channels', 'Vulcanized rubber pulley'],
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Heavy Duty Conveyor 300 Heavy Haul',
        modelNumber: 'HBC-300',
        slug: 'hbc-300',
        productId: heavyDutyProduct._id,
        shortDescription: '300 kg/m severe-duty transport for automotive parts and metal components.',
        description: 'Maximum duty rating with structural I-beam underframe and multi-ply steel-reinforced PVC belting.',
        media: {
          image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'max_load', label: 'Max Load', value: '300 kg/m', group: 'Performance' },
          { key: 'belt_width', label: 'Belt Width', value: '900 mm', group: 'Dimensions' },
          { key: 'motor_power', label: 'Motor', value: '3.0 kW', group: 'Electrical' },
        ],
        features: ['Structural I-beam frame', 'Twin center drives'],
        displayOrder: 3,
        isActive: true,
      },
    ]);

    // Product 3: Direct under Root Category "Conveyor"
    const spiralProduct = await Product.create({
      name: 'Spiral Gravity Conveyor',
      slug: 'spiral-gravity-conveyor',
      categoryId: conveyorCat._id,
      shortDescription: 'Zero-power vertical downward descent conveyor for multi-floor warehousing.',
      description: 'Utilize natural gravity for high-efficiency, zero-energy vertical descents. Smooth low-friction polymer rollers guide cartons and totes safely between factory levels.',
      media: {
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
      },
      features: ['Zero electrical power consumption', 'Custom elevation change heights from 2m to 15m', 'Smooth controlled downward velocity'],
      specifications: [
        { key: 'elevation_drop', label: 'Elevation Drop', value: '2.5m - 12m', group: 'Dimensions' },
        { key: 'outer_diameter', label: 'Outer Diameter', value: '1800 mm', group: 'Dimensions' },
        { key: 'power_req', label: 'Power Requirement', value: '0 kW (Passive Gravity)', group: 'Electrical' },
      ],
      applications: ['Multi-level Warehouses', 'Mezzanine Downward Routing', 'End-of-line Chutes'],
      benefits: ['Zero Energy Costs', 'Maintenance Free Sealed Bearings'],
      displayOrder: 3,
      isActive: true,
      isFeatured: false,
    });

    await ProductModel.create([
      {
        name: 'Spiral Gravity Conveyor Compact',
        modelNumber: 'SGC-Compact',
        slug: 'sgc-compact',
        productId: spiralProduct._id,
        shortDescription: 'Compact footprint gravity spiral for tight floor space.',
        description: '1400mm footprint gravity spiral designed for standard 300x400mm boxes.',
        media: {
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'diameter', label: 'Diameter', value: '1400 mm', group: 'Dimensions' },
          { key: 'max_box_weight', label: 'Max Box Weight', value: '35 kg', group: 'Performance' },
        ],
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Spiral Gravity Continuous Heavy Lift',
        modelNumber: 'SGC-Continuous',
        slug: 'sgc-continuous',
        productId: spiralProduct._id,
        shortDescription: 'Heavy-duty 2200mm diameter spiral for continuous industrial tote streams.',
        description: 'Wide-path low-friction stainless spiral chute for large crates and containers.',
        media: {
          image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'diameter', label: 'Diameter', value: '2200 mm', group: 'Dimensions' },
          { key: 'max_box_weight', label: 'Max Box Weight', value: '75 kg', group: 'Performance' },
        ],
        displayOrder: 2,
        isActive: true,
      },
    ]);

    // Product 4: STANDALONE PRODUCT (categoryId = null)
    const standaloneProduct = await Product.create({
      name: 'Universal Rotary Capping System',
      slug: 'universal-rotary-capping-system',
      categoryId: null, // Standalone!
      shortDescription: 'Flexible rotary capping platform adaptable for screw, snap-on, and ROPP bottle closures.',
      description: 'The Universal Rotary Capping System is an autonomous, standalone packaging machine built for bottling lines requiring rapid neck finish changeover and precise magnetic torque control.',
      media: {
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1600&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        ],
      },
      features: [
        'Magnetic hysteresis torque capping heads',
        'Electronic cam profile adjustments',
        'Automatic cap sorting elevator with ionized air blow',
        'No bottle / No cap optical safety interlocking',
      ],
      specifications: [
        { key: 'capping_speed', label: 'Speed', value: 'Up to 200 bottles/min', group: 'Performance' },
        { key: 'cap_diameters', label: 'Cap Diameters', value: '18 mm to 70 mm', group: 'Compatibility' },
        { key: 'torque_range', label: 'Torque Precision', value: '0.5 - 4.5 Nm (+/- 0.1 Nm)', group: 'Performance' },
        { key: 'control_system', label: 'Controls', value: 'Siemens S7-1500 PLC + 10" HMI', group: 'Electrical' },
      ],
      applications: ['Beverage Bottling', 'Pharmaceutical Syrups', 'Cosmetic Lotions', 'Edible Oil Filling'],
      benefits: ['Zero Thread Stripping', 'Changeover under 10 minutes'],
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
    });

    await ProductModel.create([
      {
        name: 'Universal Rotary Capper 8-Head Auto',
        modelNumber: 'URC-Auto-800',
        slug: 'urc-auto-800',
        productId: standaloneProduct._id,
        shortDescription: '8-Head high-speed rotary capper for high-speed liquid packaging lines.',
        description: 'Equipped with 8 synchronized magnetic clutch capping chucks delivering 180 bpm continuous rotary performance.',
        media: {
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'heads', label: 'Capping Heads', value: '8 Heads', group: 'Configuration' },
          { key: 'speed', label: 'Max Output', value: '180 bpm', group: 'Performance' },
          { key: 'air_req', label: 'Pneumatics', value: '6 bar, 250 L/min', group: 'Utilities' },
        ],
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Universal Rotary Capper 4-Head Semi',
        modelNumber: 'URC-Semi-400',
        slug: 'urc-semi-400',
        productId: standaloneProduct._id,
        shortDescription: '4-Head mid-capacity rotary capper for artisanal and craft bottlers.',
        description: 'Compact 4-head format providing industrial precision torque at speeds up to 90 bpm.',
        media: {
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'heads', label: 'Capping Heads', value: '4 Heads', group: 'Configuration' },
          { key: 'speed', label: 'Max Output', value: '90 bpm', group: 'Performance' },
        ],
        displayOrder: 2,
        isActive: true,
      },
    ]);

    // Product 5: Under Flow Wrapping Systems
    const flowWrapperProduct = await Product.create({
      name: 'Horizontal Flow Wrapper',
      slug: 'horizontal-flow-wrapper',
      categoryId: flowWrapCat._id,
      shortDescription: 'High-speed 3-axis servo horizontal pillow-pack wrapping machine.',
      description: 'Precision horizontal packaging of biscuits, chocolates, hardware components, and medical disposables in pillow-pack form factors with gas flush options.',
      media: {
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
        heroImage: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1600&q=80',
      },
      features: [
        'Triple servo drive motors for feeding, film pull, and end sealing',
        'Self-centering reel holder with auto tension brake',
        'Misaligned product safety reject station',
      ],
      specifications: [
        { key: 'wrap_speed', label: 'Speed', value: 'Up to 250 packs/min', group: 'Performance' },
        { key: 'film_width', label: 'Max Film Reel Width', value: '450 mm', group: 'Compatibility' },
        { key: 'bag_length', label: 'Bag Length', value: '65 mm to 380 mm', group: 'Dimensions' },
      ],
      applications: ['Bakery Cookies & Buns', 'Confectionery Bars', 'Household Sponges'],
      benefits: ['Aesthetic Pillow Packs', 'Minimal Packaging Film Consumption'],
      displayOrder: 1,
      isActive: true,
      isFeatured: true,
    });

    await ProductModel.create([
      {
        name: 'Horizontal Flow Wrapper 200 Servo',
        modelNumber: 'HFW-200',
        slug: 'hfw-200',
        productId: flowWrapperProduct._id,
        shortDescription: 'Compact 200 packs/min servo wrapper for bakery and retail items.',
        description: 'HFW-200 offers dependable entry into automated high-speed pillow-pack packaging.',
        media: {
          image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'speed', label: 'Output', value: '200 packs/min', group: 'Performance' },
          { key: 'sealing_type', label: 'Sealing', value: 'Rotary jaws', group: 'Mechanism' },
        ],
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Horizontal Flow Wrapper 350 Box-Motion',
        modelNumber: 'HFW-350',
        slug: 'hfw-350',
        productId: flowWrapperProduct._id,
        shortDescription: 'Heavy-duty box-motion hermetic seal wrapper for MAP barrier gas flushing.',
        description: 'Box-motion long-dwell sealing jaws provide total hermetic integrity for extended shelf-life MAP applications.',
        media: {
          image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
        },
        specifications: [
          { key: 'speed', label: 'Output', value: '140 packs/min', group: 'Performance' },
          { key: 'sealing_type', label: 'Sealing', value: 'Box-motion long dwell', group: 'Mechanism' },
        ],
        displayOrder: 2,
        isActive: true,
      },
    ]);

    logger.info('Flushing Redis cache...');
    await cacheService.flushPublicCache();

    logger.info('====================================================');
    logger.info('CATALOG SEEDED SUCCESSFULLY!');
    logger.info(`Categories created: ${await Category.countDocuments()}`);
    logger.info(`Products created: ${await Product.countDocuments()}`);
    logger.info(`Models created: ${await ProductModel.countDocuments()}`);
    logger.info('====================================================');
  } catch (error) {
    logger.error('Catalog seeding failed:', error);
    throw error;
  } finally {
    await disconnectDB();
  }
};

// If run directly via CLI
if (process.argv[1]?.endsWith('seedCatalog.ts') || process.argv[1]?.endsWith('seedCatalog.js')) {
  seedCatalog().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
