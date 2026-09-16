import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { Industry } from '../models/Industry.model.js';
import { Service } from '../models/Service.model.js';
import { Career } from '../models/Career.model.js';
import { NewsCategory } from '../models/NewsCategory.model.js';
import { News } from '../models/News.model.js';
import { BlogCategory } from '../models/BlogCategory.model.js';
import { Blog } from '../models/Blog.model.js';
import { HomePage } from '../models/HomePage.model.js';
import { AboutPage } from '../models/AboutPage.model.js';
import { ResponsibilityPage } from '../models/ResponsibilityPage.model.js';
import { CompanyStats } from '../models/CompanyStats.model.js';
import { ContactSettings } from '../models/ContactSettings.model.js';
import { SiteSettings } from '../models/SiteSettings.model.js';
import { Category } from '../models/Category.model.js';
import { Product } from '../models/Product.model.js';
import { ProductModel } from '../models/ProductModel.model.js';
import { cacheService } from '../cache/cache.service.js';
import { triggerNextjsRevalidation } from '../utils/revalidate.js';
import { logger } from '../utils/logger.js';

export interface SeedResultReport {
  module: string;
  inserted: number;
  skipped: number;
  total: number;
}

export async function seedCompleteBusinessData(): Promise<SeedResultReport[]> {
  logger.info('Starting idempotent complete business data population...');
  const results: SeedResultReport[] = [];

  // --------------------------------------------------------------------------
  // 1. Industries (8 Key Industrial Sectors)
  // --------------------------------------------------------------------------
  const industriesData = [
    {
      title: 'Food & Beverage',
      slug: 'food-beverage',
      shortDescription: 'Sanitary stainless steel 304/316 bagging and automated pouch packing lines for food processors.',
      heroSubtitle: 'Reliable sanitary packaging and conveying technology for high-volume food production.',
      description:
        'The food and beverage industry demands strict hygiene, zero contamination risk, and continuous production uptime. From bulk grains and flours to packaged snacks and ready-to-eat products, AXION PackTech provides sanitary stainless steel conveyor lines, high-accuracy filling machines, and continuous bag sealers engineered to FDA and 3-A sanitary standards.',
      image: '/images/industries/food-beverage.webp',
      heroImage: '/images/industries/food-beverage-hero.webp',
      icon: '🍽️',
      challenges: [
        'Maintaining strict food-grade hygiene and CIP/SIP washdown compliance',
        'High-speed continuous packaging with minimal product giveaway',
        'Gentle handling of fragile snacks, baked goods, and confectioneries',
        'Hermetic seal integrity and modified atmosphere packaging (MAP) integration',
      ],
      solutions: [
        {
          title: 'Sanitary Washdown Conveyors',
          description: 'IP69K stainless steel conveyor systems with quick-release belts for rapid sanitation.',
        },
        {
          title: 'High-Accuracy Filling & Capping',
          description: 'Multi-head rotary filling and servo capping machines for bottles, jars, and pouches.',
        },
      ],
      benefits: [
        '99.5% filling accuracy to eliminate product giveaway',
        'Full stainless steel 304/316 sanitary construction',
        'Tool-less changeovers under 15 minutes',
      ],
      compliance: ['FDA 21 CFR', '3-A Sanitary Standards', 'GMP Compliant'],
      applications: ['Grains & Cereals', 'Bakery & Snacks', 'Spices & Seasonings', 'Dairy & Beverages'],
      relatedCategories: ['conveyor', 'packaging-machinery'],
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      title: 'Chemicals & Petrochemicals',
      slug: 'chemicals',
      shortDescription: 'Heavy-duty, corrosion-resistant, and ATEX explosion-proof packaging and conveying systems.',
      heroSubtitle: 'Engineered for hazardous, abrasive, corrosive, and dense chemical powders and polymers.',
      description:
        'Chemical and polymer manufacturing environments present harsh operating conditions including corrosive fumes, combustible dust, and high product density. AXION PackTech manufactures heavy-gauge steel conveyors, dust-tight bulk bag fillers, and ATEX-certified packaging lines engineered for continuous 24/7 reliability.',
      image: '/images/industries/chemicals.webp',
      heroImage: '/images/industries/chemicals-hero.webp',
      icon: '🧪',
      challenges: [
        'Combustible dust explosion risks in bagging and conveying zones',
        'Corrosive chemical powders degrading standard mechanical components',
        'Dense material handling without line bottlenecking or motor overload',
      ],
      solutions: [
        {
          title: 'Explosion-Proof Packaging Systems',
          description: 'ATEX / PESO certified flameproof control panels, motors, and dust-tight bag clamps.',
        },
        {
          title: 'Corrosion-Resistant Conveyors',
          description: 'Heavy structural steel with epoxy coating or 316L stainless steel for acid/alkali resistance.',
        },
      ],
      benefits: [
        'Certified for hazardous Zone 1 / Zone 21 operations',
        'Extended mechanical life in abrasive and acidic environments',
        'Integrated aspiration hoods to maintain clean shopfloors',
      ],
      compliance: ['ATEX Directive', 'PESO Certified', 'OSHA Dust Standards'],
      applications: ['Polymer Resins', 'Agrochemicals', 'Industrial Pigments', 'Specialty Chemicals'],
      relatedCategories: ['conveyor', 'packaging-machinery'],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      title: 'Pharmaceuticals & Life Sciences',
      slug: 'pharmaceuticals',
      shortDescription: 'Cleanroom-ready, cGMP-compliant rotary filling, capping, and sterile material handling.',
      heroSubtitle: 'Precision engineering for sterile packaging, serialization, and high-speed cleanroom lines.',
      description:
        'Pharmaceutical packaging demands ultra-high dosing precision, cleanroom compatibility, complete batch traceability, and validation documentation. AXION PackTech manufactures pharmaceutical-grade rotary vial cappers, bottle unscramblers, and hygienic conveyor lines compliant with cGMP and 21 CFR Part 11 requirements.',
      image: '/images/industries/pharmaceuticals.webp',
      heroImage: '/images/industries/pharmaceuticals-hero.webp',
      icon: '💊',
      challenges: [
        'Strict cGMP cleanroom contamination control and laminar airflow integration',
        'Zero-defect capping torque and container closure integrity (CCIT)',
        'Track-and-trace serialization and audit trail compliance',
      ],
      solutions: [
        {
          title: 'Rotary Vial & Bottle Capping',
          description: 'Servo-driven torque control capping with inline optical inspection and automatic reject.',
        },
        {
          title: 'Sanitary Accumulation Systems',
          description: 'Low-friction bi-directional accumulation tables to prevent bottle tipping and scuffing.',
        },
      ],
      benefits: [
        '100% torque verification with individual bottle data logging',
        'IQ/OQ/PQ validation support packages',
        'cGMP stainless steel 316L contact parts with mirror finish',
      ],
      compliance: ['US FDA cGMP', 'EU Annex 1', '21 CFR Part 11'],
      applications: ['Injectable Vials', 'Syrup Bottles', 'Tablet Containers', 'Diagnostic Kits'],
      relatedCategories: ['packaging-machinery', 'conveyor'],
      featured: true,
      published: true,
      sortOrder: 3,
    },
    {
      title: 'Agriculture & Seed Processing',
      slug: 'agriculture',
      shortDescription: 'High-throughput bagging, weighing, and palletizing conveyors for seeds, fertilizers, and crops.',
      heroSubtitle: 'Rugged, high-capacity machinery designed for demanding harvest and seasonal bagging cycles.',
      description:
        'Agricultural processing requires robust packaging equipment capable of handling massive seasonal volume spikes without breakdown. AXION PackTech supplies automated open-mouth bagging scales, high-speed bag sewing lines, and incline cleated belt conveyors for seed processing plants, grain terminals, and fertilizer blending facilities.',
      image: '/images/industries/agriculture.webp',
      heroImage: '/images/industries/agriculture-hero.webp',
      icon: '🌾',
      challenges: [
        'High dust generation during grain and seed handling',
        'Extreme seasonal volume surges requiring 24/7 uptime',
        'Consistent bag weight accuracy across varying seed moisture levels',
      ],
      solutions: [
        {
          title: 'Automated Gross & Net Weigh Baggers',
          description: 'High-speed loadcell bagging scales delivering up to 1,200 bags per hour with automated bag sewing.',
        },
        {
          title: 'Heavy Incline Belt Conveyors',
          description: 'Chevron and cleated belt conveyors for bulk transfer into silos and packaging hoppers.',
        },
      ],
      benefits: [
        'Up to 1,200 bags/hr throughput for peak harvest operations',
        'Rugged dust-sealed bearings and IP65 electrical enclosures',
        'Minimal maintenance requirements across extended operational campaigns',
      ],
      compliance: ['Weights & Measures Certified', 'ISO 9001:2015'],
      applications: ['Hybrid Seeds', 'Grain & Pulses', 'Granular Fertilizers', 'Animal Feeds'],
      relatedCategories: ['conveyor', 'packaging-machinery'],
      featured: false,
      published: true,
      sortOrder: 4,
    },
    {
      title: 'Minerals, Cement & Building Materials',
      slug: 'minerals-cement',
      shortDescription: 'Abrasion-resistant heavy conveying and valve bag filling systems for cement, sand, and minerals.',
      heroSubtitle: 'Engineered for extreme abrasive wear, heavy tonnages, and continuous shopfloor operations.',
      description:
        'Mineral, cement, and dry mortar production requires rugged packaging machinery built with hardened wear liners, sealed roller bearings, and dust collection interfaces. AXION PackTech designs heavy-duty belt conveyors, automated bag placers, and bag flatteners that withstand abrasive dust and continuous tonnage loads.',
      image: '/images/industries/minerals-cement.webp',
      heroImage: '/images/industries/minerals-cement-hero.webp',
      icon: '🏗️',
      challenges: [
        'Severe mechanical abrasive wear on conveyors, hoppers, and filling spouts',
        'Dense dust clouds requiring continuous extraction to protect workers',
        'Handling 25kg to 50kg heavy bags at high cycle rates',
      ],
      solutions: [
        {
          title: 'Heavy-Duty Bag Transfer Lines',
          description: 'Reinforced roller conveyors and bag flattening presses for stable palletizing stacks.',
        },
        {
          title: 'Hardened Steel Transfer Chutes',
          description: 'Abrasion-resistant Hardox-lined chutes and sealed transfer points to minimize dust.',
        },
      ],
      benefits: [
        'Hardened wear-resistant components for maximum service life',
        'Integrated bag conditioning for square, pallet-ready bags',
        'Heavy-gauge channel steel construction',
      ],
      compliance: ['Heavy Industrial Standards', 'IS 1239 / ISO Guidelines'],
      applications: ['Portland Cement', 'Dry Mortar & Grout', 'Quartz & Silica', 'Refractory Minerals'],
      relatedCategories: ['conveyor'],
      featured: false,
      published: true,
      sortOrder: 5,
    },
    {
      title: 'Animal Feed & Pet Nutrition',
      slug: 'animal-feed',
      shortDescription: 'Flexible automated packaging for kibble, pellets, supplements, and aqua feed bags.',
      heroSubtitle: 'High-speed packaging solutions supporting diverse bag sizes from 1kg retail to 50kg bulk.',
      description:
        'The animal nutrition industry requires versatile packaging machinery capable of running both small premium retail pet food pouches and large 50kg woven polypropylene livestock feed bags with quick recipe changeovers. AXION PackTech delivers automated bag filling, sealing, and conveying lines designed for clean, dust-controlled feed mills.',
      image: '/images/industries/animal-feed.webp',
      heroImage: '/images/industries/animal-feed-hero.webp',
      icon: '🐾',
      challenges: [
        'Cross-contamination prevention between medicated and non-medicated feed batches',
        'Handling diverse packaging formats from zip pouches to gusseted multiwall bags',
        'Oil and grease resistance on conveyor belts and contact points',
      ],
      solutions: [
        {
          title: 'Multi-Format Open-Mouth Baggers',
          description: 'Servo-controlled bag clamping with automatic height adjustment for 5kg to 50kg bags.',
        },
        {
          title: 'Oil-Resistant PVC/PU Conveyor Lines',
          description: 'Anti-static, oil-resistant conveyor belts designed for high-fat pet food kibbles.',
        },
      ],
      benefits: [
        'Rapid clean-out design to prevent feed batch cross-contamination',
        'Compatible with paper, woven PP, and multi-laminate bags',
        'Integrated metal detection and checkweighing stations',
      ],
      compliance: ['FAMI-QS Standards', 'HACCP Compliant'],
      applications: ['Poultry & Cattle Feed', 'Pet Food Kibble', 'Aqua Feed Pellets', 'Mineral Premixes'],
      relatedCategories: ['conveyor', 'packaging-machinery'],
      featured: false,
      published: true,
      sortOrder: 6,
    },
  ];

  let indInserted = 0;
  let indSkipped = 0;
  for (const ind of industriesData) {
    const existing = await Industry.findOne({ slug: ind.slug });
    if (!existing) {
      await Industry.create(ind);
      indInserted++;
    } else {
      indSkipped++;
    }
  }
  results.push({
    module: 'Industries',
    inserted: indInserted,
    skipped: indSkipped,
    total: await Industry.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 2. Services (5 Lifecycle Engineering Services)
  // --------------------------------------------------------------------------
  const servicesData = [
    {
      title: 'Engineering Design & Line Integration',
      slug: 'engineering-design',
      shortDescription: 'Custom 3D layout drafting, mechanical design, and turnkey plant integration tailored to factory throughput.',
      heroTitle: 'Turnkey Engineering & Packaging Line Integration',
      heroDescription: 'From greenfield packaging plant concepts to line retrofits, our engineering design team delivers optimized 3D CAD layouts and seamless machinery synchronization.',
      image: '/images/services/engineering-design.webp',
      icon: '📐',
      description:
        'Successful manufacturing starts with precise engineering design. AXION PackTech provides end-to-end plant layout simulation, equipment footprint optimization, and custom mechanical design. We evaluate product physical properties, line speeds, accumulation buffers, and operator ergonomics to engineer high-OEE packaging lines.',
      capabilities: [
        'Comprehensive 3D factory layout and line flow simulation',
        'Custom mechanical conveyor and transfer chute engineering in SolidWorks',
        'Electrical schematic drafting and PLC/SCADA control architecture',
        'Turnkey multi-vendor machine synchronization and handshakes',
      ],
      features: [
        'Dedicated project engineering managers for single-point accountability',
        'Detailed utility consumption mapping (pneumatics, power, dust extraction)',
        'Virtual commissioning to detect line bottlenecks before shopfloor fabrication',
      ],
      benefits: [
        'Up to 30% reduction in plant footprint through smart conveyor routing',
        'Minimized integration downtime during physical factory installation',
        'Future-proof line architecture with expandable accumulation buffers',
      ],
      process: [
        '1. Site Survey & Capacity Requirement Analysis',
        '2. 3D CAD Layout Drafting & Line Flow Simulation',
        '3. Design Review & Engineering Sign-Off',
        '4. Precision Shopfloor Fabrication & FAT Testing',
      ],
      solutions: [
        {
          title: 'Greenfield Packaging Plant Layouts',
          description: 'Complete end-of-line packaging and conveying schematics designed for maximum plant efficiency.',
        },
        {
          title: 'Line Bottleneck Debottlenecking',
          description: 'Engineering retrofits and high-speed accumulation buffers to increase overall plant OEE.',
        },
      ],
      relatedProducts: ['conveyor', 'sanitary-cleated-belt-conveyor', 'universal-rotary-capping-system'],
      relatedIndustries: ['food-beverage', 'pharmaceuticals', 'chemicals'],
      stats: [
        { label: 'Projects Engineered', value: '1500+' },
        { label: 'Average OEE Increase', value: '22%' },
        { label: 'CAD Design Turnaround', value: '5 Days' },
      ],
      cta: {
        title: 'Discuss Your Plant Layout With Our Engineering Team',
        description: 'Send your factory drawings and target production rates for a complimentary layout proposal.',
        buttonText: 'Request Engineering Consultation',
        buttonLink: '/contact',
      },
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      title: 'On-Site Installation & Commissioning',
      slug: 'installation-commissioning',
      shortDescription: 'Certified field service engineers conducting mechanical erection, electrical hookups, and trial runs.',
      heroTitle: 'Professional Machine Installation & Commissioning',
      heroDescription: 'Certified mechanical and automation technicians ensuring rapid, safe, and flawless on-site commissioning of your packaging lines.',
      image: '/images/services/installation-commissioning.webp',
      icon: '⚙️',
      description:
        'Our field engineering team ensures your machinery is installed safely, aligned to tight tolerances, and commissioned to design speed. We handle mechanical anchoring, precision laser belt leveling, electrical interconnects, PLC protocol handshakes, and live dry/wet product trials.',
      capabilities: [
        'Mechanical anchoring, precision conveyor leveling, and optical alignment',
        'Three-phase electrical wiring, sensor calibration, and pneumatic hookups',
        'Control system integration, fieldbus networking, and safety interlock validation',
        'Site Acceptance Testing (SAT) with live packaging materials',
      ],
      features: [
        'Full compliance with factory safety, OSHA, and PPE protocols',
        'Structured commissioning checklist with formal SAT sign-off documentation',
        'On-site operator ergonomics and startup training during commissioning',
      ],
      benefits: [
        'Faster production ramp-up with zero startup mechanical binding',
        'Guaranteed line throughput matching FAT performance benchmarks',
        'Complete baseline vibration, current draw, and alignment reports',
      ],
      process: [
        '1. Pre-Installation Site Readiness Audit',
        '2. Equipment Offloading & Mechanical Positioning',
        '3. Power, Pneumatics & Control Wiring Hookup',
        '4. Dry Run & Live Product SAT Validation',
      ],
      solutions: [
        {
          title: 'Turnkey Line Installation',
          description: 'Full mechanical erection and electrical commissioning managed by experienced lead technicians.',
        },
        {
          title: 'Machine Relocation & Re-Commissioning',
          description: 'Disassembly, transport support, re-erection, and recalibration for factory layout expansions.',
        },
      ],
      relatedProducts: ['heavy-duty-belt-conveyor', 'spiral-gravity-conveyor', 'universal-rotary-capping-system'],
      relatedIndustries: ['food-beverage', 'chemicals', 'agriculture'],
      stats: [
        { label: 'Installations Completed', value: '1200+' },
        { label: 'Average SAT Duration', value: '48 Hrs' },
        { label: 'Commissioning Success', value: '99.8%' },
      ],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      title: 'Preventative Maintenance & AMC',
      slug: 'after-sales-service',
      shortDescription: 'Comprehensive Annual Maintenance Contracts (AMC), scheduled health audits, and 24/7 service SLA.',
      heroTitle: 'Proactive Maintenance Contracts & Lifecycle Care',
      heroDescription: 'Maximize packaging uptime and prevent unexpected machine failures with structured preventative service agreements.',
      image: '/images/services/after-sales-service.webp',
      icon: '🛠️',
      description:
        'Unscheduled machine downtime costs thousands of dollars per hour. AXION PackTech offers proactive Annual Maintenance Contracts (AMC), periodic multi-point health audits, predictive vibration monitoring, and priority emergency breakdown support to protect your production schedule.',
      capabilities: [
        'Scheduled quarterly and bi-annual comprehensive machinery overhauls',
        'Laser belt tracking, gearbox lubrication, and drive chain tensioning',
        'PLC firmware updates, I/O terminal checks, and safety circuit verification',
        'Wear-part replacement scheduling and machine condition reports',
      ],
      features: [
        'Dedicated 24/7 technical hotline for immediate troubleshooting',
        'Guaranteed on-site engineer dispatch SLA for critical breakdown calls',
        'Discounted OEM spare parts pricing for AMC agreement holders',
      ],
      benefits: [
        'Up to 65% reduction in unscheduled machine breakdowns',
        'Extended equipment operating life and preserved residual asset value',
        'Predictable annual maintenance budgeting with zero surprise costs',
      ],
      process: [
        '1. Comprehensive Machine Baseline Health Audit',
        '2. Customized Preventative Schedule & SLA Plan',
        '3. Scheduled Quarterly Inspection & Lubrication Visits',
        '4. Detailed Service Reports & Component Wear Forecasts',
      ],
      solutions: [
        {
          title: 'Comprehensive Annual Maintenance (AMC)',
          description: 'Includes scheduled quarterly health checks, priority engineer dispatch, and parts discounts.',
        },
        {
          title: 'Machine Health Audits',
          description: 'Deep mechanical and electrical diagnostic inspections to identify latent wear before failures occur.',
        },
      ],
      relatedProducts: ['conveyor', 'packaging-machinery'],
      relatedIndustries: ['food-beverage', 'pharmaceuticals', 'chemicals'],
      stats: [
        { label: 'Active AMC Contracts', value: '350+' },
        { label: 'Average Emergency Response', value: '< 4 Hrs' },
        { label: 'Downtime Reduction', value: '65%' },
      ],
      featured: true,
      published: true,
      sortOrder: 3,
    },
    {
      title: 'OEM Spare Parts & Consumables',
      slug: 'spare-parts-support',
      shortDescription: 'Genuine replacement parts, modular conveyor belts, servo drives, sensors, and quick-dispatch kits.',
      heroTitle: 'Genuine OEM Spare Parts & Fast Dispatch',
      heroDescription: 'Maintain peak machine precision and warranty coverage with certified AXION PackTech OEM replacement components.',
      image: '/images/services/spare-parts-support.webp',
      icon: '📦',
      description:
        'Using substandard third-party replacement parts causes premature machine wear and unexpected breakdowns. AXION PackTech maintains a centralized warehouse stocked with certified OEM conveyor belts, servo motors, PLC modules, capping chucks, sealing jaws, and wear strips ready for immediate dispatch.',
      capabilities: [
        'Stocked inventory of critical mechanical, electrical, and pneumatic spares',
        'Same-day express dispatch for emergency breakdown part orders',
        'Customized Critical Spares Kits supplied with new machine deliveries',
        'Direct component traceability and factory quality certification',
      ],
      features: [
        '100% genuine OEM compatibility guaranteed to factory blueprints',
        'Pre-assembled sub-assemblies (idler rollers, capping heads) for rapid replacement',
        'Comprehensive spare parts manuals and exploded 3D diagrams',
      ],
      benefits: [
        'Zero fitting modifications or alignment issues on the shopfloor',
        'Preserved machine warranty and OEM performance specifications',
        'Minimized spare parts stockout risk with scheduled restocking programs',
      ],
      process: [
        '1. Part Identification via Serial Number / 3D Manual',
        '2. Inventory Check & Immediate Quote Dispatch',
        '3. Express Courier Dispatch Within 24 Hours',
        '4. Installation Guidance by Phone or Video Call',
      ],
      solutions: [
        {
          title: 'Critical Spares Backup Packages',
          description: 'Recommended 1-year and 2-year on-site spare part packages tailored to machine models.',
        },
        {
          title: 'Emergency Parts Dispatch',
          description: 'Same-day express air freight for urgent breakdown replacement components.',
        },
      ],
      relatedProducts: ['sanitary-cleated-belt-conveyor', 'heavy-duty-belt-conveyor'],
      relatedIndustries: ['food-beverage', 'chemicals', 'pharmaceuticals'],
      stats: [
        { label: 'In-Stock Parts SKUs', value: '5000+' },
        { label: 'Same-Day Dispatch Rate', value: '94%' },
        { label: 'OEM Quality Guarantee', value: '100%' },
      ],
      featured: false,
      published: true,
      sortOrder: 4,
    },
    {
      title: 'Automation, PLC & Line Upgrades',
      slug: 'upgrades-retrofits',
      shortDescription: 'Modernizing legacy packaging lines with servo drives, Siemens/Allen-Bradley PLCs, and Industry 4.0 IoT.',
      heroTitle: 'Machine Automation Retrofits & Industry 4.0 Upgrades',
      heroDescription: 'Transform aging packaging machinery into high-speed, recipe-driven, connected production assets.',
      image: '/images/services/upgrades-retrofits.webp',
      icon: '⚡',
      description:
        'Extend the working life of your existing machinery without investing in entirely new lines. AXION PackTech upgrades legacy mechanical machines with modern servo drives, touchscreen HMIs, Siemens / Allen-Bradley PLCs, remote IoT diagnostics, and automated recipe changeover systems.',
      capabilities: [
        'Pneumatic-to-servo drive mechanical conversions for higher speed and precision',
        'Legacy relay / obsolete PLC migration to modern Siemens S7-1500 or Rockwell ControlLogix',
        'Intuitive multilingual touchscreen HMI redesign with recipe management',
        'Industry 4.0 IoT gateway integration for live OEE, counter, and energy monitoring',
      ],
      features: [
        'Non-invasive retrofit engineering minimizing plant shutdown windows',
        'Integration with central factory SCADA / MES / ERP systems via OPC-UA',
        'Comprehensive updated electrical schematics and ladder logic documentation',
      ],
      benefits: [
        'Up to 40% increase in machine operating speed and cycle consistency',
        'Instant recipe-driven size changeovers saving hours of changeover labor',
        'Elimination of obsolete component obsolescence risks',
      ],
      process: [
        '1. Legacy Machine Automation & Electrical Audit',
        '2. PLC Architecture & HMI Design Development',
        '3. Pre-Wired Enclosure Pre-Testing at AXION Works',
        '4. Weekend Cut-Over, Re-Wiring & Rapid Commissioning',
      ],
      solutions: [
        {
          title: 'Servo Drive Conversions',
          description: 'Replacing mechanical cams and clutches with synchronized digital servo drives.',
        },
        {
          title: 'IoT & OEE Data Gateways',
          description: 'Adding edge IoT devices to log live production throughput, downtime reasons, and cycle times.',
        },
      ],
      relatedProducts: ['universal-rotary-capping-system', 'horizontal-flow-wrapper'],
      relatedIndustries: ['food-beverage', 'pharmaceuticals'],
      stats: [
        { label: 'Retrofits Completed', value: '280+' },
        { label: 'Average Speed Boost', value: '+35%' },
        { label: 'Changeover Time Saved', value: '70%' },
      ],
      featured: false,
      published: true,
      sortOrder: 5,
    },
  ];

  let srvInserted = 0;
  let srvSkipped = 0;
  for (const srv of servicesData) {
    const existing = await Service.findOne({ slug: srv.slug });
    if (!existing) {
      await Service.create(srv);
      srvInserted++;
    } else {
      srvSkipped++;
    }
  }
  results.push({
    module: 'Services',
    inserted: srvInserted,
    skipped: srvSkipped,
    total: await Service.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 3. Careers (12 Openings: Jobs, Internships, Apprenticeships)
  // --------------------------------------------------------------------------
  const careersData = [
    // --- Full-Time Jobs (6) ---
    {
      title: 'Senior Mechanical Design Engineer',
      slug: 'senior-mechanical-design-engineer',
      type: 'job',
      department: 'Engineering & R&D',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Full-Time (On-Site)',
      experience: '4-7 Years',
      shortDescription: 'Lead 3D mechanical CAD design, motion analysis, and fabrication drafting for automated packaging and conveyor systems.',
      description:
        'AXION PackTech is seeking an experienced Mechanical Design Engineer to lead 3D CAD modeling, structural FEA calculations, and manufacturing drawings for automated baggers, rotary cappers, and sanitary conveyors in SolidWorks.',
      responsibilities: [
        'Develop 3D CAD models, detailed assembly drawings, and BOMs for custom packaging machinery',
        'Perform mechanical sizing calculations for motors, gearboxes, bearings, and pneumatic cylinders',
        'Collaborate with shopfloor fabrication and assembly teams during prototype builds and FAT runs',
        'Conduct design reviews with customers to validate mechanical interfaces and line layouts',
      ],
      qualifications: [
        'B.Tech / B.E. in Mechanical / Mechatronics Engineering from an accredited university',
        'Minimum 4 years of proven design experience in packaging machinery or conveyor automation',
        'Expert-level proficiency in SolidWorks, sheet metal design, and GD&T drafting standards',
      ],
      skills: ['SolidWorks', 'GD&T', 'Conveyor Design', 'Sheet Metal', 'BOM Management', 'Machine Sizing'],
      published: true,
      status: 'active',
      sortOrder: 1,
    },
    {
      title: 'PLC & Automation Systems Engineer',
      slug: 'plc-automation-systems-engineer',
      type: 'job',
      department: 'Electrical & Automation',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Full-Time (On-Site + Project Travel)',
      experience: '3-6 Years',
      shortDescription: 'Program Siemens and Allen-Bradley PLCs, servo motion axes, touchscreen HMIs, and variable frequency drives.',
      description:
        'We are hiring an Automation Engineer to program PLC logic, servo drive motion synchronization, and SCADA communications for high-speed automated packaging systems.',
      responsibilities: [
        'Develop PLC ladder logic, structured text, and function blocks on Siemens TIA Portal and Rockwell Studio 5000',
        'Configure multi-axis servo motion drives, VFD networks, and safety interlock circuits',
        'Design responsive HMI operator screens with structured alarm management and recipe storage',
        'Perform electrical commissioning, sensor tuning, and on-site customer SAT trials',
      ],
      qualifications: [
        'B.Tech / B.E. in Electrical / Electronics / Instrumentation & Control Engineering',
        '3+ years of hands-on experience programming industrial packaging or material handling equipment',
        'Strong knowledge of Profinet, Ethernet/IP, Modbus TCP, and industrial safety standards',
      ],
      skills: ['Siemens TIA Portal', 'Allen-Bradley', 'Servo Motion', 'HMI Design', 'Profinet', 'Safety PLCs'],
      published: true,
      status: 'active',
      sortOrder: 2,
    },
    {
      title: 'Field Service & Commissioning Specialist',
      slug: 'field-service-commissioning-specialist',
      type: 'job',
      department: 'Customer Service & Field Ops',
      location: 'Vadodara / Pan-India Client Sites',
      employmentType: 'Full-Time (Travel Required)',
      experience: '2-5 Years',
      shortDescription: 'Lead on-site mechanical erection, electrical hookup, dry/wet trials, and customer operator training.',
      description:
        'Deliver exceptional field execution by leading on-site machine commissioning, preventative maintenance audits, and rapid troubleshooting at client manufacturing plants across India.',
      responsibilities: [
        'Execute on-site mechanical assembly, laser conveyor alignment, and electrical hookups',
        'Conduct trial runs with live customer product packaging to achieve target cycle speeds',
        'Deliver practical hands-on machine operation and preventative maintenance training to plant staff',
        'Diagnose and resolve electrical sensor, pneumatic, and mechanical issues during commissioning',
      ],
      qualifications: [
        'Diploma / Degree in Mechanical / Electrical Engineering',
        '2+ years in field service, commissioning, or industrial plant maintenance',
        'Willingness to travel to manufacturing plants across India (approx. 50% travel)',
      ],
      skills: ['Field Commissioning', 'Machine Alignment', 'Pneumatics', 'Electrical Troubleshooting', 'Client Training'],
      published: true,
      status: 'active',
      sortOrder: 3,
    },
    {
      title: 'Industrial Sales & Technical Proposal Manager',
      slug: 'industrial-sales-technical-proposal-manager',
      type: 'job',
      department: 'Sales & Business Development',
      location: 'Vadodara / Mumbai Office',
      employmentType: 'Full-Time',
      experience: '4-8 Years',
      shortDescription: 'Drive technical equipment sales, evaluate customer RFQs, and formulate customized packaging machinery proposals.',
      description:
        'Manage high-value B2B packaging equipment sales across Food & Beverage, Chemical, and Pharmaceutical accounts. Formulate comprehensive engineering proposals and negotiate turnkey contracts.',
      responsibilities: [
        'Evaluate customer RFQs, packaging speed requirements, and plant layout drawings',
        'Collaborate with design engineering to configure tailored equipment solutions and pricing models',
        'Present technical machinery demonstrations and ROI proposals to plant heads and procurement teams',
        'Participate in national and international packaging trade exhibitions (PackTech, PlastIndia)',
      ],
      qualifications: [
        'B.E. / B.Tech (Mechanical / Industrial) + MBA in Marketing (preferred)',
        '4+ years of B2B capital machinery sales experience with proven track record',
        'Excellent verbal presentation, commercial negotiation, and technical estimation skills',
      ],
      skills: ['Capital Equipment Sales', 'Technical Proposals', 'RFQ Estimation', 'B2B Negotiation', 'CRM'],
      published: true,
      status: 'active',
      sortOrder: 4,
    },
    {
      title: 'Quality Assurance & FAT Testing Engineer',
      slug: 'quality-assurance-fat-testing-engineer',
      type: 'job',
      department: 'Quality & Assembly',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Full-Time (On-Site)',
      experience: '2-5 Years',
      shortDescription: 'Oversee factory quality inspections, mechanical dimensional verification, and Factory Acceptance Testing (FAT).',
      description:
        'Ensure every machine manufactured at AXION PackTech meets rigorous mechanical tolerances, weld quality standards, electrical safety regulations, and customer FAT requirements.',
      responsibilities: [
        'Perform incoming raw material and machined part dimensional verification with precision tools',
        'Inspect stainless steel sanitary weld finishes, paint/powder-coat thickness, and alignment',
        'Lead Factory Acceptance Testing (FAT) runs with customers, documenting speed and accuracy metrics',
        'Maintain ISO 9001:2015 quality documentation and drive continuous shopfloor quality improvements',
      ],
      qualifications: [
        'Degree / Diploma in Mechanical or Production Engineering',
        '2+ years QA/QC inspection experience in precision machine manufacturing',
        'Proficiency with CMM, micrometers, height gauges, torque wrenches, and ISO quality auditing',
      ],
      skills: ['QA/QC', 'FAT Testing', 'GD&T Inspection', 'ISO 9001', 'Weld Inspection', 'Documentation'],
      published: true,
      status: 'active',
      sortOrder: 5,
    },
    {
      title: 'Senior CNC Machine Shop Supervisor',
      slug: 'senior-cnc-machine-shop-supervisor',
      type: 'job',
      department: 'Manufacturing & Machining',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Full-Time (On-Site)',
      experience: '5-9 Years',
      shortDescription: 'Supervise precision CNC milling, turning, and VMC operations for high-tolerance machinery components.',
      description:
        'Oversee precision machining operations, tooling selection, VMC programming, and production scheduling for custom shafts, sprockets, cams, and capping chucks.',
      responsibilities: [
        'Manage daily machining schedules across 3-axis/4-axis VMC and CNC lathe centers',
        'Optimize cutting parameters, tool paths, and fixtures for stainless steel and engineering plastics',
        'Ensure dimensional accuracy within ±0.01mm tolerances on all critical machinery components',
        'Train junior machinists on safe operating practices and preventive machine maintenance',
      ],
      qualifications: [
        'Diploma / Degree in Mechanical / Production Engineering or ITI Machinist certification',
        '5+ years of supervisory experience in precision CNC/VMC machine shop operations',
        'Expert in Fanuc / Siemens CNC controls, Mastercam programming, and tooling selection',
      ],
      skills: ['CNC Programming', 'VMC Machining', 'Mastercam', 'Shopfloor Management', 'Tooling Optimization'],
      published: true,
      status: 'active',
      sortOrder: 6,
    },

    // --- Engineering Internships (3) ---
    {
      title: 'Robotics & Mechatronics Engineering Intern',
      slug: 'robotics-mechatronics-intern',
      type: 'internship',
      department: 'R&D & Robotics Lab',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Internship (6 Months)',
      experience: 'Final Year / Fresh Graduate',
      duration: '6 Months (Full-Time)',
      stipendOrBenefits: '₹18,000 / month + Subsidized Plant Canteen + Certificate',
      shortDescription: '6-month intensive engineering internship assisting in delta robot pick-and-place trials, machine vision, and servo tuning.',
      description:
        'Join our R&D robotics group for a structured 6-month internship working on real automated packaging systems, high-speed vision inspection, and multi-axis pick-and-place mechanisms.',
      responsibilities: [
        'Assist R&D engineers in setting up delta robot pick-and-place test cells and camera lighting',
        'Perform sensor calibration, optical vision testing, and image dataset logging',
        'Document prototype test data, cycle times, and mechanical assembly revisions',
      ],
      qualifications: [
        'Pursuing or recently completed B.Tech in Mechatronics, Robotics, or Electrical Engineering',
        'Basic familiarity with Python, PLC ladder logic, microcontrollers, or ROS',
        'Strong passion for industrial automation and hands-on laboratory experimentation',
      ],
      skills: ['Mechatronics', 'Machine Vision', 'Robotics Basics', 'Sensor Testing', 'Technical Documentation'],
      published: true,
      status: 'active',
      sortOrder: 7,
    },
    {
      title: 'Mechanical 3D CAD Design Intern',
      slug: 'mechanical-3d-cad-design-intern',
      type: 'internship',
      department: 'Engineering & R&D',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Internship (6 Months)',
      experience: 'Final Year Engineering Student',
      duration: '6 Months (Full-Time)',
      stipendOrBenefits: '₹15,000 / month + Mentorship + Direct Job Placement Opportunity',
      shortDescription: 'Hands-on CAD modeling internship assisting in conveyor detailing, sheet metal unfolding, and standard BOM drafting.',
      description:
        'Learn real-world machinery design under senior mentors. Convert conceptual engineering designs into detailed manufacturing drawings and sheet metal cut files.',
      responsibilities: [
        'Draft 2D fabrication drawings from 3D SolidWorks models adhering to company drafting standards',
        'Create sheet metal flat patterns for laser cutting and press brake bending',
        'Update parts catalogs, standard hardware libraries, and bill of materials (BOM)',
      ],
      qualifications: [
        'Pre-final or final year student in B.Tech / Diploma (Mechanical / Production)',
        'Proficiency in SolidWorks or Autodesk Inventor with strong drafting fundamentals',
      ],
      skills: ['SolidWorks', '2D Drafting', 'Sheet Metal Basics', 'BOM Drafting'],
      published: true,
      status: 'active',
      sortOrder: 8,
    },
    {
      title: 'Industrial Web Application Developer Intern',
      slug: 'web-application-developer',
      type: 'internship',
      department: 'Digital Systems & IT',
      location: 'Vadodara, Gujarat (Hybrid)',
      employmentType: 'Internship (6 Months)',
      experience: 'College Student / Fresh Graduate',
      duration: '6 Months',
      stipendOrBenefits: '₹20,000 / month + Project Mentorship',
      shortDescription: 'Develop web interfaces, IoT plant telemetry dashboards, and internal CMS portals using Next.js, Node.js, and TypeScript.',
      description:
        'Work on AXION PackTech digital web systems, telemetry dashboards, and cloud CMS applications using React, Next.js, TypeScript, and MongoDB.',
      responsibilities: [
        'Build responsive UI components and data management forms in Next.js & TailwindCSS',
        'Integrate REST APIs and assist in backend endpoint optimization with Express & MongoDB',
        'Write clean, typed TypeScript code and conduct browser automated verification testing',
      ],
      qualifications: [
        'Pursuing or completed B.Tech / BCA / MCA in Computer Science / IT',
        'Proficiency in JavaScript, TypeScript, React / Next.js, and REST APIs',
      ],
      skills: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs', 'TailwindCSS'],
      published: true,
      status: 'active',
      sortOrder: 9,
    },

    // --- Technical Apprenticeships (3) ---
    {
      title: 'CNC Machinist & Operator Apprentice',
      slug: 'cnc-machinist-operator-apprentice',
      type: 'apprenticeship',
      department: 'Manufacturing & Machining',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Apprenticeship (NAPS / NATS Certified)',
      experience: 'ITI / Diploma Fresher',
      duration: '1 Year Full-Time Apprenticeship',
      stipendOrBenefits: 'Government Stipend (₹12,500/mo) + Uniform + Plant Meals + National Trade Certificate',
      shortDescription: 'Government-recognized 1-year apprenticeship on VMC setup, tool setting, and CNC lathe operations.',
      description:
        'Gain comprehensive practical experience setting up 3-axis VMCs, checking precision part tolerances with digital verniers, and understanding machining G/M codes.',
      responsibilities: [
        'Perform raw material clamping, tool offsets, and workpiece zero setting under senior supervision',
        'Monitor cutting operations, chip evacuation, and coolant levels during machining runs',
        'Inspect finished components with vernier calipers, micrometers, and bore gauges',
      ],
      qualifications: [
        'ITI Machinist / Turner / Tool & Die Maker certificate from a recognized institute',
        'Age 18-24 with good mechanical aptitude and eagerness to learn precision engineering',
      ],
      skills: ['VMC Setup', 'Vernier & Micrometer', 'G-Code Basics', 'Shopfloor Safety'],
      published: true,
      status: 'active',
      sortOrder: 10,
    },
    {
      title: 'Industrial Electrical Panel Wiring Apprentice',
      slug: 'industrial-electrical-panel-wiring-apprentice',
      type: 'apprenticeship',
      department: 'Electrical Assembly',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Apprenticeship (1 Year)',
      experience: 'ITI Electrician Fresher',
      duration: '1 Year Full-Time',
      stipendOrBenefits: '₹12,000 / month + Safety Gear + NCVT Practical Certification',
      shortDescription: 'Learn industrial control panel fabrication, PLC terminal wiring, ferrule labeling, and electrical testing.',
      description:
        'Master industrial electrical assembly, cable tray routing, Din-rail component mounting, and wiring to international electrical schematic standards.',
      responsibilities: [
        'Mount MCBs, contactors, VFDs, and PLC modules onto electrical backplates following layout drawings',
        'Wire control circuits with proper wire stripping, crimping, and ferrule labeling standards',
        'Assist testing engineers in continuity checks, insulation resistance tests, and power-on safety checks',
      ],
      qualifications: [
        'ITI Electrician / Wireman certification from a recognized NCVT institute',
        'Ability to read basic electrical single-line diagrams and wire color codes',
      ],
      skills: ['Panel Wiring', 'Crimping & Ferruling', 'Electrical Schematics', 'Multimeter Testing'],
      published: true,
      status: 'active',
      sortOrder: 11,
    },
    {
      title: 'Sanitary TIG Welder & Fabricator Apprentice',
      slug: 'sanitary-tig-welder-fabricator-apprentice',
      type: 'apprenticeship',
      department: 'Fabrication & Welding',
      location: 'Vadodara, Gujarat (Plant HQ)',
      employmentType: 'Apprenticeship (1 Year)',
      experience: 'ITI Welder Fresher',
      duration: '1 Year Full-Time',
      stipendOrBenefits: '₹13,000 / month + Welding PPE Kit + Factory Meals + Certification',
      shortDescription: 'Specialize in stainless steel 304/316 sanitary purge TIG welding, sheet metal fit-up, and weld grinding/buffing.',
      description:
        'Develop specialized skills in sanitary food-grade TIG welding of stainless steel tubes, conveyor frames, and hoppers to mirror and matte finishes.',
      responsibilities: [
        'Perform Argon gas purged TIG welding on stainless steel sheet metal and tubing',
        'Fit up frames, brackets, and chutes using welding jigs and clamping fixtures',
        'Grind, deburr, and buff weld seams to achieve sanitary crevice-free finishes',
      ],
      qualifications: [
        'ITI Welder / Fitter certificate from an accredited institute',
        'Basic familiarity with TIG (GTAW) welding torch handling and safety standards',
      ],
      skills: ['Sanitary TIG Welding', 'SS 304/316', 'Purge Welding', 'Weld Grinding & Buffing', 'Fit-Up'],
      published: true,
      status: 'active',
      sortOrder: 12,
    },
  ];

  let carInserted = 0;
  let carSkipped = 0;
  for (const car of careersData) {
    const existing = await Career.findOne({ slug: car.slug });
    if (!existing) {
      await Career.create(car);
      carInserted++;
    } else {
      carSkipped++;
    }
  }
  results.push({
    module: 'Careers',
    inserted: carInserted,
    skipped: carSkipped,
    total: await Career.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 4. News Categories & Articles (4 Categories, 6 Articles)
  // --------------------------------------------------------------------------
  const newsCategoriesData = [
    {
      title: 'Company News',
      slug: 'company-news',
      badge: 'OFFICIAL ANNOUNCEMENTS',
      icon: '🏢',
      description: 'Corporate milestones, manufacturing plant expansions, and official company announcements.',
      sortOrder: 1,
    },
    {
      title: 'Product Launches',
      slug: 'product-launches',
      badge: 'NEW MACHINERY',
      icon: '🚀',
      description: 'Latest equipment innovations, automated packaging lines, and technological introductions.',
      sortOrder: 2,
    },
    {
      title: 'Events & Exhibitions',
      slug: 'events-exhibitions',
      badge: 'TRADE SHOWS',
      icon: '🎪',
      description: 'Meet the AXION PackTech engineering team at major national and international trade expos.',
      sortOrder: 3,
    },
    {
      title: 'Case Studies & Projects',
      slug: 'case-studies-projects',
      badge: 'CLIENT SUCCESS',
      icon: '📊',
      description: 'Turnkey packaging line installations, commissioning milestones, and engineering case studies.',
      sortOrder: 4,
    },
  ];

  let newsCatInserted = 0;
  let newsCatSkipped = 0;
  for (const ncat of newsCategoriesData) {
    const existing = await NewsCategory.findOne({ slug: ncat.slug });
    if (!existing) {
      await NewsCategory.create(ncat);
      newsCatInserted++;
    } else {
      newsCatSkipped++;
    }
  }
  results.push({
    module: 'News Categories',
    inserted: newsCatInserted,
    skipped: newsCatSkipped,
    total: await NewsCategory.countDocuments(),
  });

  const newsArticlesData = [
    {
      title: 'AXION PackTech Unveils Next-Gen High-Speed Automated Bagging Line',
      slug: 'next-gen-high-speed-bagging-line-launch',
      categorySlug: 'product-launches',
      categoryName: 'Product Launches',
      excerpt: 'Engineered for food and chemical processors, the new system achieves up to 1,200 bags per hour with multi-axis servo precision.',
      image: '/images/news/automated-bagging.jpg',
      featuredImage: '/images/news/automated-bagging.jpg',
      author: 'AXION Engineering Team',
      readTime: '4 min read',
      tags: ['Product Launch', 'Bagging Automation', 'Packaging Innovation'],
      published: true,
      publishedAt: new Date('2026-03-10'),
      featured: true,
      sortOrder: 1,
      content: {
        lead: 'AXION PackTech has officially launched its next-generation automated bagging system, setting new standards for cycle speed, weighing accuracy, and dust control.',
        sections: [
          {
            heading: 'Engineered for Harsh Industrial Demands',
            paragraphs: [
              'Designed from the ground up for continuous 24/7 duty cycles, the new line integrates direct servo-driven bag clamping, hermetic dust extraction hoods, and an automated continuous bag sewing station.',
              'With loadcell weighing resolution under ±0.2%, food and chemical manufacturers can significantly minimize raw material giveaway while accelerating line speeds.',
            ],
            bullets: [
              'Up to 1,200 bags per hour continuous throughput',
              'Quick-change clamping mechanism supporting 10kg to 50kg bags',
              'Touchscreen HMI with 100-recipe memory and OPC-UA connectivity',
            ],
          },
          {
            heading: 'Availability and Customer Demonstration Trials',
            paragraphs: [
              'Live demonstration units are currently operational at our Vadodara manufacturing headquarters. Client trials with actual packaging materials can be scheduled directly with our technical team.',
            ],
          },
        ],
        quote: {
          text: 'This system reflects our core engineering philosophy: maximum mechanical robustness paired with modern digital precision.',
          author: 'Chief Technical Officer',
          role: 'AXION PackTech Engineering Division',
        },
      },
    },
    {
      title: 'AXION PackTech to Showcase Advanced Packaging Automation at PackTech Expo',
      slug: 'packtech-expo-exhibition-showcase',
      categorySlug: 'events-exhibitions',
      categoryName: 'Events & Exhibitions',
      excerpt: 'Visit our interactive pavilion to witness live demonstrations of high-throughput rotary capping and modular sanitary conveyors.',
      image: '/images/news/packaging-automation.jpg',
      featuredImage: '/images/news/packaging-automation.jpg',
      author: 'Corporate Communications',
      readTime: '3 min read',
      tags: ['Trade Show', 'PackTech Expo', 'Live Machinery Demo'],
      published: true,
      publishedAt: new Date('2026-02-18'),
      featured: true,
      sortOrder: 2,
      content: {
        lead: 'AXION PackTech will be exhibiting its flagship automated packaging systems at the upcoming national PackTech Expo.',
        sections: [
          {
            heading: 'Live Machinery Demonstrations at Booth H4-22',
            paragraphs: [
              'Visitors will experience live demonstration runs of our Universal Rotary Capping System and Sanitary Cleated Belt Conveyor lines.',
              'Our senior mechanical designers and automation specialists will be on-site to discuss customized plant layout drawings and factory optimization proposals.',
            ],
          },
        ],
      },
    },
    {
      title: 'Vadodara Manufacturing Plant Expansion Increases Assembly Capacity by 40%',
      slug: 'vadodara-manufacturing-plant-expansion',
      categorySlug: 'company-news',
      categoryName: 'Company News',
      excerpt: 'Investment in dedicated heavy fabrication bays, CNC machining centers, and a climate-controlled clean assembly zone.',
      image: '/images/news/custom-engineering.jpg',
      featuredImage: '/images/news/custom-engineering.jpg',
      author: 'Operations Management',
      readTime: '4 min read',
      tags: ['Manufacturing Expansion', 'Infrastructure', 'Quality Control'],
      published: true,
      publishedAt: new Date('2026-01-25'),
      featured: false,
      sortOrder: 3,
      content: {
        lead: 'AXION PackTech has completed a major expansion of its primary manufacturing plant in Vadodara, Gujarat.',
        sections: [
          {
            heading: 'State-of-the-Art Machining and Assembly Bays',
            paragraphs: [
              'The expansion adds 25,000 sq. ft. of heavy equipment assembly space, new 4-axis VMC centers, and a dedicated testing bay for full-line integration runs.',
              'This capacity increase shortens customer delivery lead times by an average of 3 weeks for custom turnkey packaging machinery.',
            ],
          },
        ],
      },
    },
    {
      title: 'Successful Commissioning of 80 BPM Automated Capping Line for Agrochem Major',
      slug: 'agrochem-automated-capping-line-commissioning',
      categorySlug: 'case-studies-projects',
      categoryName: 'Case Studies & Projects',
      excerpt: 'Turnkey chemical-resistant rotary capping line delivered on schedule with 99.7% container closure reliability.',
      image: '/images/news/packaging-line-integration.jpg',
      featuredImage: '/images/news/packaging-line-integration.jpg',
      author: 'Field Engineering Division',
      readTime: '5 min read',
      tags: ['Case Study', 'Chemical Industry', 'Rotary Capping'],
      published: true,
      publishedAt: new Date('2026-01-10'),
      featured: false,
      sortOrder: 4,
      content: {
        lead: 'AXION PackTech field engineers have successfully completed SAT validation for an automated rotary capping system at a leading agrochemical production facility.',
        sections: [
          {
            heading: 'Project Challenges and Engineered Solutions',
            paragraphs: [
              'The client required high-speed hermetic capping of aggressive liquid formulation bottles without torque variability or chemical degradation.',
              'AXION installed an 8-head rotary capper with individual magnetic hysteresis torque heads and 316L stainless steel chemical-resistant washdown enclosures.',
            ],
          },
        ],
      },
    },
  ];

  let newsInserted = 0;
  let newsSkipped = 0;
  for (const n of newsArticlesData) {
    const existing = await News.findOne({ slug: n.slug });
    if (!existing) {
      await News.create(n);
      newsInserted++;
    } else {
      newsSkipped++;
    }
  }
  results.push({
    module: 'News Articles',
    inserted: newsInserted,
    skipped: newsSkipped,
    total: await News.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 5. Blog Categories & Articles (4 Categories, 6 Articles)
  // --------------------------------------------------------------------------
  const blogCategoriesData = [
    {
      title: 'Packaging Technology',
      slug: 'packaging-technology',
      icon: '⚙️',
      description: 'Technical deep-dives into bagging machinery, sealing mechanics, and automated packaging equipment.',
      sortOrder: 1,
    },
    {
      title: 'Automation & Industry 4.0',
      slug: 'automation-industry-4',
      icon: '🤖',
      description: 'PLC controls, servo synchronization, digital telemetry, and OEE optimization strategies.',
      sortOrder: 2,
    },
    {
      title: 'Maintenance & Operations',
      slug: 'maintenance-operations',
      icon: '🔧',
      description: 'Shopfloor best practices, preventative maintenance routines, and troubleshooting guides.',
      sortOrder: 3,
    },
    {
      title: 'Standards & Compliance',
      slug: 'standards-compliance',
      icon: '📋',
      description: 'FDA food-grade standards, cGMP validation, ATEX explosion safety, and hygienic design.',
      sortOrder: 4,
    },
  ];

  let blogCatInserted = 0;
  let blogCatSkipped = 0;
  for (const bcat of blogCategoriesData) {
    const existing = await BlogCategory.findOne({ slug: bcat.slug });
    if (!existing) {
      await BlogCategory.create(bcat);
      blogCatInserted++;
    } else {
      blogCatSkipped++;
    }
  }
  results.push({
    module: 'Blog Categories',
    inserted: blogCatInserted,
    skipped: blogCatSkipped,
    total: await BlogCategory.countDocuments(),
  });

  const blogArticlesData = [
    {
      title: 'How to Maximize Overall Equipment Effectiveness (OEE) in Automated Packaging Lines',
      slug: 'maximize-oee-automated-packaging-lines',
      categorySlug: 'automation-industry-4',
      categoryName: 'Automation & Industry 4.0',
      excerpt: 'Practical engineering strategies for minimizing minor stoppages, accelerating format changeovers, and balancing conveyor line accumulation buffers.',
      image: '/images/blog/automation-packaging.jpg',
      featuredImage: '/images/blog/automation-packaging.jpg',
      author: 'Parth Pawar',
      authorRole: 'Senior Automation Specialist',
      readTime: '6 min read',
      readingTime: '6 min read',
      publishedDate: 'February 24, 2026',
      tags: ['OEE', 'Automation', 'Packaging Efficiency', 'Conveyors'],
      published: true,
      publishedAt: new Date('2026-02-24'),
      featured: true,
      sortOrder: 1,
      introduction:
        'Overall Equipment Effectiveness (OEE) is the gold standard metric for measuring manufacturing productivity. In high-speed packaging lines, even brief 30-second micro-stops can degrade overall daily throughput by 15% or more.',
      content: 'Detailed technical guide on identifying packaging line micro-stoppages, optimizing accumulation buffer sizing, and implementing automated recipe changeovers.',
      sections: [
        {
          heading: '1. Sizing Dynamic Accumulation Buffers Between Machines',
          body: 'When upstream fillers stop briefly for roll changes or downstream cappers clear a minor sensor fault, lack of dynamic buffer accumulation forces the entire line to halt. Properly engineered bi-directional accumulation tables isolate machine cycles.',
          bulletPoints: [
            'Maintain a minimum 2 to 3-minute dynamic buffer between primary filler and secondary packaging',
            'Use low-friction acetal slat chains to prevent container scuffing and pressure building',
            'Implement variable frequency drive speed cascade controls to gently ramp line speeds',
          ],
        },
        {
          heading: '2. Tool-Less Rapid Size Changeovers (SMED Principles)',
          body: 'Format changeovers that require wrenches and manual trial-and-error adjustments represent the largest controllable source of downtime. Modern packaging machines must incorporate quick-release guide rails and calibrated digital position indicators.',
        },
      ],
      conclusion:
        'By systematically analyzing minor stoppages, optimizing conveyor accumulation buffer dynamics, and implementing servo-assisted recipe changeovers, packaging plants can routinely elevate line OEE from the low 60s into the 85%+ world-class bracket.',
    },
    {
      title: 'Sanitary Conveyor Design: Best Practices for FDA and 3-A Compliance',
      slug: 'sanitary-conveyor-design-fda-3a-compliance',
      categorySlug: 'standards-compliance',
      categoryName: 'Standards & Compliance',
      excerpt: 'Key mechanical design criteria for food and pharma washdown conveyors including crevice-free welding, standoff brackets, and CIP drainage.',
      image: '/images/blog/food-beverage-packaging.jpg',
      featuredImage: '/images/blog/food-beverage-packaging.jpg',
      author: 'AXION Mechanical Team',
      authorRole: 'Hygienic Design Engineers',
      readTime: '5 min read',
      readingTime: '5 min read',
      publishedDate: 'February 12, 2026',
      tags: ['Sanitary Design', 'Food Safety', 'FDA Compliance', 'Conveyors'],
      published: true,
      publishedAt: new Date('2026-02-12'),
      featured: true,
      sortOrder: 2,
      introduction:
        'In food and pharmaceutical manufacturing, equipment cleanliness directly impacts consumer safety and regulatory compliance. Sanitary conveyors must be engineered to prevent bacterial harborage points and allow thorough cleaning with minimal water and chemical usage.',
      content: 'Engineering review of sanitary conveyor design principles conforming to FDA, USDA, and 3-A sanitary guidelines.',
      sections: [
        {
          heading: 'Eliminating Hollow Tube Pockets and Sharp Corners',
          body: 'Traditional square tubing frames can develop micro-cracks over time, trapping water and organic matter. Sanitary conveyors utilize open-profile formed stainless steel channels or fully seal-welded round tubular designs.',
          bulletPoints: [
            'Continuous TIG welding ground smooth to a minimum Ra 0.8µm surface finish',
            'Minimum 45-degree slope on horizontal surfaces to facilitate self-draining washdown',
            'Standoff brackets separating motor mounts and bearings from the main conveyor frame',
          ],
        },
      ],
      conclusion:
        'Investing in certified sanitary conveyor construction protects food brands against costly product recalls and slashes daily sanitation washdown labor by over 40%.',
    },
    {
      title: 'Servo vs Pneumatic Capping: Comparing Speed, Precision, and Torque Control',
      slug: 'servo-vs-pneumatic-capping-comparison',
      categorySlug: 'packaging-technology',
      categoryName: 'Packaging Technology',
      excerpt: 'A comprehensive technical comparison of mechanical clutch, pneumatic, and digital servo-driven bottle capping systems.',
      image: '/images/blog/vffs-machine.jpg',
      featuredImage: '/images/blog/vffs-machine.jpg',
      author: 'Parth Pawar',
      authorRole: 'Lead Automation Engineer',
      readTime: '7 min read',
      readingTime: '7 min read',
      publishedDate: 'January 28, 2026',
      tags: ['Capping Technology', 'Servo Drives', 'Torque Control', 'Packaging'],
      published: true,
      publishedAt: new Date('2026-01-28'),
      featured: false,
      sortOrder: 3,
      introduction:
        'Container closure integrity is critical for preventing leakage and preserving product shelf life. As packaging line speeds increase, selecting the right capping mechanism becomes the primary factor in capping reliability.',
      content: 'Technical analysis of capping head technologies for liquid packaging and bottling operations.',
      sections: [
        {
          heading: 'Digital Servo Torque Precision vs Mechanical Hysteresis',
          body: 'While mechanical magnetic clutches provide reliable torque limiting, digital servo capping motors offer real-time torque angle monitoring, programmable deceleration curves, and individual bottle data logging for 100% CCIT compliance.',
        },
      ],
      conclusion:
        'For high-speed automated bottling lines requiring stringent torque audit trails, servo-driven capping heads offer unmatched accuracy and eliminate mechanical clutch wear.',
    },
    {
      title: 'Preventative Maintenance Guide for Industrial Belt Conveyors',
      slug: 'preventative-maintenance-guide-industrial-conveyors',
      categorySlug: 'maintenance-operations',
      categoryName: 'Maintenance & Operations',
      excerpt: 'Step-by-step maintenance checklist covering laser tracking alignment, motor thermal imaging, and bearing lubrication schedules.',
      image: '/images/blog/preventive-maintenance.jpg',
      featuredImage: '/images/blog/preventive-maintenance.jpg',
      author: 'Field Maintenance Group',
      authorRole: 'Service Engineering Division',
      readTime: '5 min read',
      readingTime: '5 min read',
      publishedDate: 'January 15, 2026',
      tags: ['Preventative Maintenance', 'Conveyors', 'Shopfloor Guide', 'Uptime'],
      published: true,
      publishedAt: new Date('2026-01-15'),
      featured: false,
      sortOrder: 4,
      introduction:
        'Industrial belt conveyors form the backbone of automated manufacturing plants. A structured weekly and monthly preventative maintenance checklist prevents costly belt tear and gearbox burnout.',
      content: 'Practical maintenance checklist and diagnostic guide for plant maintenance technicians.',
      sections: [
        {
          heading: 'Weekly Inspection Routines',
          body: 'Inspect belt tracking centering, check for edge fraying, verify scraper blade tension, and ensure emergency pull-cord switches operate freely.',
        },
      ],
      conclusion:
        'Consistent preventative maintenance doubles the service life of conveyor belting and preserves plant throughput reliability.',
    },
  ];

  let blogInserted = 0;
  let blogSkipped = 0;
  for (const b of blogArticlesData) {
    const existing = await Blog.findOne({ slug: b.slug });
    if (!existing) {
      await Blog.create(b);
      blogInserted++;
    } else {
      blogSkipped++;
    }
  }
  results.push({
    module: 'Blog Articles',
    inserted: blogInserted,
    skipped: blogSkipped,
    total: await Blog.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 6. Responsibility & Sustainability Page Singleton
  // --------------------------------------------------------------------------
  let respInserted = 0;
  let respSkipped = 0;
  const existingResp = await ResponsibilityPage.findOne();
  if (!existingResp) {
    await ResponsibilityPage.create({
      hero: {
        badge: 'SUSTAINABLE ENGINEERING',
        title: 'Committed to Sustainable Manufacturing and Environmental Stewardship',
        description: 'Engineering energy-efficient packaging machinery, promoting recyclable material compatibility, and prioritizing worker safety across every system we build.',
        image: '/images/resp_hero_facility.jpg',
      },
      pillars: [
        {
          title: 'Energy Efficient Automation',
          description: 'High-efficiency IE3/IE4 electric motors, regenerative braking servo drives, and smart sleep-mode line controllers.',
          icon: '🌱',
          details: ['Up to 25% lower energy consumption', 'Smart idle standby power management', 'Regenerative servo motion power recovery'],
        },
        {
          title: 'Recyclable Packaging Compatibility',
          description: 'Our filling, sealing, and wrapping machines are fully optimized for mono-material PE/PP, biodegradable films, and recyclable paper substrates.',
          icon: '♻️',
          details: ['Tested on 100% recyclable mono-PE films', 'Zero-waste precise bag cutoff mechanisms', 'Ultrasonic and low-temperature sealing technology'],
        },
        {
          title: 'Worker Safety & Ergonomics',
          description: 'Category 4 safety interlocks, light curtains, low-noise pneumatic exhausts, and ergonomic operator loading heights.',
          icon: '🛡️',
          details: ['Compliant with EN ISO 13849-1 safety standards', 'Noise levels maintained below 72 dBA', 'Pneumatic energy isolation dump valves'],
        },
      ],
      qualityCommitment: {
        title: 'Built to Last. Engineered to Perform.',
        description: 'We build heavy-duty industrial machinery designed for a 15+ year operational lifespan, eliminating disposable planned obsolescence.',
        image: '/images/resp_quality_testing.jpg',
      },
      workplaceCulture: {
        title: 'Empowering Engineering Talent',
        description: 'Fostering continuous technical learning, shopfloor apprentice mentorship, and an inclusive, safety-first engineering culture.',
        image: '/images/resp_team_workplace.jpg',
      },
    });
    respInserted = 1;
  } else {
    respSkipped = 1;
  }
  results.push({
    module: 'Responsibility Page',
    inserted: respInserted,
    skipped: respSkipped,
    total: await ResponsibilityPage.countDocuments(),
  });

  // --------------------------------------------------------------------------
  // 7. Invalidate Caches & Trigger Next.js Revalidation
  // --------------------------------------------------------------------------
  logger.info('Invalidating Redis caches and triggering Next.js ISR revalidation...');
  await cacheService.invalidateAllCatalogCaches();
  await Promise.all([
    cacheService.deleteByPattern('axion:*'),
    cacheService.deleteByPattern('*'),
  ]);

  await triggerNextjsRevalidation(
    ['/', '/about-us', '/products', '/catalogs', '/industries', '/services', '/careers', '/news', '/blog', '/contact'],
    ['home', 'about-page', 'pages', 'categories', 'products', 'models', 'catalog-nav', 'catalog-tree', 'industries', 'services', 'careers', 'news', 'news-categories', 'blogs', 'blog-categories', 'settings', 'site-settings', 'company-stats', 'contact']
  );

  logger.info('Idempotent data population completed successfully.');
  return results;
}

// Direct CLI execution
if (process.argv[1]?.includes('seed_complete_business_data')) {
  (async () => {
    try {
      await connectDB();
      const report = await seedCompleteBusinessData();
      console.log('\n======================================================');
      console.log('✅ COMPLETE AXION PACKTECH DATABASE POPULATION REPORT');
      console.log('======================================================');
      console.table(report);
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Seeding failed:', err);
      process.exit(1);
    }
  })();
}
