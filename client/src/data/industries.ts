export interface IndustrySolution {
  title: string;
  description: string;
}

export interface Industry {
  _id?: string;
  title: string;
  name?: string;
  slug: string;
  shortDescription: string;
  description: string;
  heroSubtitle?: string;
  image: string;
  heroImage: string;
  icon: string;
  challenges: string[];
  solutions: IndustrySolution[];
  benefits: string[];
  applications?: string[];
  relatedCategories?: string[];
  sortOrder?: number;
  published?: boolean;
}

export const industriesData: Industry[] = [
  {
    title: "Food & Beverage",
    slug: "food-beverage",
    shortDescription:
      "Packaging and processing solutions engineered for food manufacturers.",
    heroSubtitle:
      "Reliable packaging and processing technology for modern food production.",
    description:
      "The food and beverage industry demands efficiency, hygiene, consistency and reliable production performance. From powders and granules to snacks and packaged food products, manufacturers require equipment that supports accurate processing and dependable packaging. AXION PackTech provides engineered solutions for filling, bagging, sealing, inspection, conveying and packaging operations across a wide range of food and beverage applications.",
    image: "/images/industries/food-beverage.webp",
    heroImage: "/images/industries/food-beverage-hero.webp",
    icon: "🍽️",
    challenges: [
      "Maintaining strict food-grade hygiene and sanitation",
      "Accurate micro and bulk filling with minimal giveaway",
      "High-speed continuous production line demands",
      "Consistent seal integrity and package barrier quality",
      "Inline product inspection and contaminant detection",
      "Minimizing material loss and product spillage",
      "Reliable automation with rapid size changeovers",
    ],
    solutions: [
      {
        title: "Filling & Bagging Systems",
        description:
          "High-accuracy auger and gravimetric bag fillers for flours, spices, sugar, and granular food ingredients.",
      },
      {
        title: "VFFS Packaging Machines",
        description:
          "Continuous and intermittent vertical form fill seal systems for snacks, confectioneries, and dry foods.",
      },
      {
        title: "Sealing Equipment",
        description:
          "Continuous rotary band sealers and impulse heat sealing machines ensuring airtight, tamper-evident food pouches.",
      },
      {
        title: "Metal Detection & Checkweighing",
        description:
          "HACCP and BRC compliant inline contaminant detection and 100% weight verification.",
      },
      {
        title: "Carton Packaging & Case Packing",
        description:
          "Automated case packing and carton taping systems for shelf-ready retail delivery.",
      },
      {
        title: "Sanitary Processing & Sifting",
        description:
          "Rotary sifting screens and hygienic mixers for uniform recipe blending and agglomerate removal.",
      },
    ],
    benefits: [
      "Improved overall equipment effectiveness (OEE)",
      "Reliable hermetic package quality and extended shelf life",
      "Accurate product handling and legal-for-trade dosing",
      "Significant reduction in packaging film and product waste",
      "Flexible multi-format packaging on a single line",
      "Seamless integration with existing processing upstream",
    ],
    relatedCategories: [
      "filling-bagging",
      "packaging-machines",
      "sealing-machines",
      "processing-equipment",
    ],
  },
  {
    title: "Chemicals",
    slug: "chemicals",
    shortDescription:
      "Safe and accurate handling of powders, granules and chemical materials.",
    heroSubtitle:
      "Safe, accurate and reliable systems for chemical material handling and packaging.",
    description:
      "Chemical manufacturers require dependable equipment capable of handling powders, granules and other industrial materials with accuracy and consistency. AXION PackTech provides robust packaging and processing solutions designed to support efficient filling, weighing, bagging, sealing and material handling operations under stringent industrial safety standards.",
    image: "/images/industries/chemicals.webp",
    heroImage: "/images/industries/chemicals-hero.webp",
    icon: "🧪",
    challenges: [
      "Safe containment of hazardous and reactive chemical powders",
      "Comprehensive plant dust control and operator safety",
      "High-accuracy weighing tolerances for costly chemical active ingredients",
      "Total product containment preventing moisture infiltration",
      "Reliable sift-proof and chemical-resistant bag closures",
      "Corrosion-resistant equipment materials (AISI 316L / coatings)",
      "Consistent packaging quality for hazardous transit regulations",
    ],
    solutions: [
      {
        title: "Open Mouth Baggers",
        description:
          "Dust-tight clamp spout fillers with integrated aspiration manifolds for fine chemical powders.",
      },
      {
        title: "Jumbo Bulk Bagging Systems",
        description:
          "Heavy-duty FIBC stations with inflatable collar seals preventing airborne dust escape.",
      },
      {
        title: "Pinch & Heat Sealing Machines",
        description:
          "Sift-proof hot-melt pinch sealers and heavy-duty impulse barrier sealers.",
      },
      {
        title: "Industrial Mixing & Blending",
        description:
          "Homogeneous ribbon mixers with air-purged shaft seals for abrasive chemicals.",
      },
      {
        title: "Screw Conveyors & Dosing",
        description:
          "Totally enclosed dust-tight tubular screw feeders and micro-ingredient loss-in-weight batching.",
      },
    ],
    benefits: [
      "Substantially improved operator occupational safety",
      "Accurate dosing minimizing raw material waste",
      "Complete dust containment and cleaner plant environment",
      "Rugged construction withstanding corrosive exposure",
      "Compliance with international transport containment standards",
    ],
    relatedCategories: [
      "filling-bagging",
      "sealing-machines",
      "processing-equipment",
    ],
  },
  {
    title: "Pharmaceuticals",
    slug: "pharmaceuticals",
    shortDescription:
      "Precise dosing, inspection and packaging solutions for pharmaceutical production.",
    heroSubtitle:
      "Precision, consistency and reliability for pharmaceutical production.",
    description:
      "Pharmaceutical production requires high levels of accuracy, consistency and quality control. Packaging and processing equipment must support precise dosing, reliable inspection and controlled handling throughout production. AXION PackTech provides engineered systems that support precision packaging and inspection requirements for pharmaceutical manufacturing operations.",
    image: "/images/industries/pharmaceuticals.webp",
    heroImage: "/images/industries/pharmaceuticals-hero.webp",
    icon: "💊",
    challenges: [
      "Micro-dosing accuracy within fractions of a gram",
      "Batch-to-batch consistency and audit-trail compliance",
      "Complete foreign particle inspection and detection",
      "Cross-contamination prevention in cleanroom atmospheres",
      "Hermetic barrier bag sealing and tamper evidence",
      "Production batch serialization and traceability",
      "Sanitary clean-in-place (CIP) and washdown requirements",
    ],
    solutions: [
      {
        title: "Precision Micro-Dosing",
        description:
          "Loss-in-weight multi-hopper dosing with 0.1g resolution for active pharmaceutical ingredients (APIs).",
      },
      {
        title: "Cleanroom Packaging & Sealing",
        description:
          "Bi-active impulse sealers and pouch packaging systems in mirror-polished stainless steel 316L.",
      },
      {
        title: "Optical & Metal Inspection",
        description:
          "Multi-spectrum vision systems and ultra-sensitive metal detectors for packaged pharmaceuticals.",
      },
      {
        title: "Sanitary Rotary Sifting",
        description:
          "Enclosed pharmaceutical-grade rotary sifters for de-lumping and safety screening before packaging.",
      },
    ],
    benefits: [
      "Highest standard of product consistency and compliance",
      "Accurate material handling eliminating active ingredient loss",
      "Advanced audit-trail and data export for regulatory reporting",
      "Cleanroom compatibility with washdown stainless construction",
      "Minimized downtime through quick tool-free sanitization",
    ],
    relatedCategories: [
      "packaging-machines",
      "sealing-machines",
      "processing-equipment",
    ],
  },
  {
    title: "Agriculture",
    slug: "agriculture",
    shortDescription:
      "Reliable packaging systems for seeds, grains and agricultural products.",
    heroSubtitle:
      "Reliable systems for seeds, grains and agricultural products.",
    description:
      "Agricultural products often require efficient handling and packaging systems capable of managing different product sizes, weights and material characteristics. AXION PackTech provides dependable solutions for filling, bagging, sealing and conveying agricultural products including seeds, grains and other bulk materials.",
    image: "/images/industries/agriculture.webp",
    heroImage: "/images/industries/agriculture-hero.webp",
    icon: "🌾",
    challenges: [
      "Handling large volumes of bulk seasonal harvests",
      "Gentle grain handling to prevent kernel breakage and seed damage",
      "High-speed bag filling from 10 kg to 50 kg sacks",
      "Variable bulk densities and moisture content",
      "Heavy-duty bag closing that withstands rough logistics",
      "Dusty outdoor or silo environments requiring rugged mechanics",
    ],
    solutions: [
      {
        title: "Open Mouth Grain Baggers",
        description:
          "High-speed gross and net weigher baggers for woven PP, paper, and jute sacks.",
      },
      {
        title: "Pedestal & Dual Stitching Machines",
        description:
          "Industrial bag sewing columns synchronized with motorized slat conveyors for secure bag closure.",
      },
      {
        title: "FIBC Jumbo Bagging Stations",
        description:
          "High-capacity bulk bag fillers handling up to 2,000 kg bags for grain storage and exports.",
      },
      {
        title: "Bulk Material Conveyors",
        description:
          "Heavy-duty screw conveyors and bag flattener transport systems for palletizing lines.",
      },
    ],
    benefits: [
      "High peak-season throughput preventing processing bottlenecks",
      "Durable, tamper-proof stitched bag closures",
      "Accurate bag filling weights compliant with trade standards",
      "Reduced seed damage and preserved germination viability",
      "Extremely low maintenance requirements in dusty environments",
    ],
    relatedCategories: [
      "filling-bagging",
      "stitching-machines",
      "processing-equipment",
    ],
  },
  {
    title: "Fertilizer",
    slug: "fertilizer",
    shortDescription:
      "High-performance bagging, stitching, conveying and packaging solutions.",
    heroSubtitle:
      "Heavy-duty equipment for efficient fertilizer handling and packaging.",
    description:
      "Fertilizer production requires robust machinery capable of handling powders and granules efficiently in demanding industrial environments. AXION PackTech provides filling, bagging, stitching, conveying and processing solutions designed for reliable fertilizer production and packaging operations.",
    image: "/images/industries/fertilizer.webp",
    heroImage: "/images/industries/fertilizer-hero.webp",
    icon: "🏭",
    challenges: [
      "Corrosive chemical nature of chemical fertilizers (NPK, Urea, Phosphates)",
      "High ambient humidity causing caking and granule clumping",
      "Severe abrasive wear on mechanical scales and conveyor components",
      "Heavy 25 kg to 50 kg bag packaging duty cycles",
      "Requirement for sift-proof bag sewing with crepe tape reinforcement",
      "Continuous 24/7 operation with minimum unplanned downtime",
    ],
    solutions: [
      {
        title: "Heavy-Duty Open Mouth Baggers",
        description:
          "Corrosion-resistant stainless steel contact parts with anti-caking vibratory feed chutes.",
      },
      {
        title: "High-Speed Bag Stitching Columns",
        description:
          "Continuous oil-bath sewing heads with crepe tape feed and pneumatic thread trimmers.",
      },
      {
        title: "FIBC Bulk Bag Loaders",
        description:
          "Densification table jumbo baggers for 1-ton and 2-ton commercial fertilizer delivery.",
      },
      {
        title: "Rotary Lump Breakers & Screening",
        description:
          "Rotary sifters ensuring uniform granule sizing and removal of oversized cakes.",
      },
    ],
    benefits: [
      "Corrosion-protected construction ensuring 15+ year machine lifespans",
      "Sift-proof, heavy-duty sack closures preventing transport spillage",
      "High bagging speeds reaching up to 800 bags/hour per filling spout",
      "Integrated dust extraction ports for clean factory floors",
      "Heavy structural steel frame resisting continuous shock loads",
    ],
    relatedCategories: [
      "filling-bagging",
      "stitching-machines",
      "processing-equipment",
    ],
  },
  {
    title: "Minerals & Cement",
    slug: "minerals-cement",
    shortDescription:
      "Heavy-duty bagging and material handling solutions for demanding industries.",
    heroSubtitle:
      "Heavy-duty packaging and material handling for demanding industrial operations.",
    description:
      "Minerals and cement operations require robust, high-performance equipment capable of handling abrasive and heavy bulk materials. AXION PackTech provides industrial solutions for filling, bagging, stitching, sealing, conveying and processing bulk mineral and cement products.",
    image: "/images/industries/minerals-cement.webp",
    heroImage: "/images/industries/minerals-cement-hero.webp",
    icon: "⛏️",
    challenges: [
      "Highly abrasive bulk solids like silica, clinker, gypsum, and cement",
      "Severe airborne dust requiring airtight filling spout seals",
      "Continuous heavy-weight bag operations (20 kg to 50 kg sacks)",
      "Need for ultra-reliable bag closures to prevent moisture absorption",
      "Harsh operating environment with high vibration and thermal swings",
    ],
    solutions: [
      {
        title: "Pinch & Valve Bag Filling Stations",
        description:
          "Airtight clamp spouts with pneumatic de-aeration for dense cement packing.",
      },
      {
        title: "Hardened Heavy Slat Conveyors",
        description:
          "Reinforced structural conveyors with abrasion-resistant wear liners.",
      },
      {
        title: "Jumbo Bulk Bag Stations",
        description:
          "High-volume FIBC systems with hydraulic height adjustment and pallet handling.",
      },
      {
        title: "Hardox Screw Conveyors",
        description:
          "Abrasion-resistant helicoid flight screw conveyors for metered bulk transfers.",
      },
    ],
    benefits: [
      "Exceptional wear resistance against highly abrasive minerals",
      "Airtight bag closures preventing cement moisture hardening",
      "Significantly reduced dust emission meeting OSHA and environmental limits",
      "Engineered for round-the-clock continuous production without breakdown",
    ],
    relatedCategories: [
      "filling-bagging",
      "stitching-machines",
      "processing-equipment",
      "carton-case-erector",
    ],
  },
  {
    title: "Animal Feed",
    slug: "animal-feed",
    shortDescription:
      "Efficient processing, dosing and packaging systems for feed manufacturers.",
    heroSubtitle:
      "Efficient systems for feed processing, dosing and packaging.",
    description:
      "Animal feed manufacturers require reliable systems for ingredient handling, batching, mixing, processing and final packaging. AXION PackTech provides integrated solutions that support efficient feed production from raw ingredient handling through to bagging and packaging.",
    image: "/images/industries/animal-feed.webp",
    heroImage: "/images/industries/animal-feed-hero.webp",
    icon: "🐄",
    challenges: [
      "Accurate micro-dosing of vitamins, minerals, and growth supplements",
      "Rapid homogeneous blending of diverse density grains and liquids",
      "Cross-contamination prevention between medicated and regular feed batches",
      "High-throughput bag packing for 25 kg and 50 kg pellets and mash",
      "Insect and moisture-resistant bag stitching and bag sealing",
    ],
    solutions: [
      {
        title: "Micro-Ingredient Dosing & Batching",
        description:
          "Multi-hopper gravimetric dosing units for precise premix ingredient batching.",
      },
      {
        title: "Industrial Paddle & Ribbon Mixers",
        description:
          "Full-drop bomb-bay bottom mixers providing CV < 3% in under 4 minutes with zero residue.",
      },
      {
        title: "Automated Feed Bagging Lines",
        description:
          "High-speed bag placers and net weighers for pellet, crumble, and mash feed.",
      },
      {
        title: "Sewing & Slat Conveyors",
        description:
          "Synchronized stitching lines with bag top trimmers and thread monitoring.",
      },
    ],
    benefits: [
      "Precise feed nutritional consistency and exact recipe fulfillment",
      "Fast zero-residue mixer discharge preventing cross-batch contamination",
      "High bagging throughput reducing operational labor requirements",
      "Clean plant operation with integrated aspiration and dust collection",
    ],
    relatedCategories: [
      "processing-equipment",
      "filling-bagging",
      "stitching-machines",
    ],
  },
  {
    title: "Petrochemicals",
    slug: "petrochemicals",
    shortDescription:
      "Industrial packaging and processing solutions for petrochemical products.",
    heroSubtitle:
      "Reliable industrial packaging and material handling systems for petrochemical products.",
    description:
      "Petrochemical operations require dependable industrial equipment designed for demanding production environments and controlled material handling. AXION PackTech provides engineered packaging, processing and conveying solutions that support efficient and reliable industrial operations.",
    image: "/images/industries/petrochemicals.webp",
    heroImage: "/images/industries/petrochemicals-hero.webp",
    icon: "🛢️",
    challenges: [
      "Handling polymer resins, granules, masterbatches, and chemical compounds",
      "ATEX and NFPA explosion-proof electrical certification compliance",
      "Static electricity dissipation and earthing requirements",
      "Maintaining high purity without polymer cross-contamination",
      "Heavy bulk container handling and export logistics",
    ],
    solutions: [
      {
        title: "Automated Polymer Pellet Baggers",
        description:
          "High-speed FFS and open-mouth bagging lines for polyethylene and polypropylene pellets.",
      },
      {
        title: "Hermetic Band & Impulse Sealers",
        description:
          "Airtight polymer film welding ensuring zero moisture ingress during maritime export.",
      },
      {
        title: "Ex-Proof Industrial Screws & Mixers",
        description:
          "ATEX certified explosion-proof drives and grounded anti-static pneumatic conveyors.",
      },
      {
        title: "Automated Case & Pallet Automation",
        description:
          "Robotic palletizing and end-of-line carton packaging for petrochemical additives.",
      },
    ],
    benefits: [
      "Full compliance with hazardous industrial safety standards",
      "Hermetic bag sealing safeguarding polymer melt index quality",
      "Anti-static grounding preventing electrostatic discharge hazards",
      "High reliability for continuous chemical refinery production streams",
    ],
    relatedCategories: [
      "filling-bagging",
      "packaging-machines",
      "sealing-machines",
      "processing-equipment",
    ],
  },
];

export function getAllIndustries(): Industry[] {
  return industriesData;
}

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industriesData.find((industry) => industry.slug === slug);
}
