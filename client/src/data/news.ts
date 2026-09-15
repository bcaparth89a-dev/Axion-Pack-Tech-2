export interface NewsCategory {
  title: string;
  slug: string;
  description: string;
  badge: string;
  icon: string;
  sortOrder?: number;
}

export interface ArticleSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface NewsArticle {
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  categoryName?: string;
  excerpt: string;
  content: {
    lead: string;
    sections: ArticleSection[];
    quote?: {
      text: string;
      author: string;
      role: string;
    };
  };
  image: string;
  featuredImage?: string;
  video?: {
    type?: "local" | "embed" | string;
    url: string;
    embedUrl?: string;
    posterUrl?: string;
  };
  videoUrl?: string;
  publishedDate: string;
  publishedAt?: string;
  published?: boolean;
  author?: string;
  featured?: boolean;
  readTime?: string;
  tags?: string[];
  sortOrder?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export const newsCategories: NewsCategory[] = [
  {
    title: "Company News",
    slug: "company-news",
    badge: "COMPANY NEWS",
    description:
      "Announcements, milestones, partnerships and company developments from AXION PackTech.",
    icon: "🏢",
  },
  {
    title: "Product & Technology",
    slug: "product-technology",
    badge: "PRODUCT & TECHNOLOGY",
    description:
      "Machine launches, engineering innovations and packaging technology updates.",
    icon: "🏭",
  },
  {
    title: "Projects & Installations",
    slug: "projects-installations",
    badge: "PROJECTS & INSTALLATIONS",
    description:
      "Successful installations, commissioning and turnkey industrial engineering projects.",
    icon: "🚀",
  },
  {
    title: "Events & Media",
    slug: "events-media",
    badge: "EVENTS & MEDIA",
    description:
      "Exhibitions, trade shows, product demonstrations and factory machinery videos.",
    icon: "🎥",
  },
  {
    title: "Industry Insights",
    slug: "industry-insights",
    badge: "INDUSTRY INSIGHTS",
    description:
      "Packaging trends, automation knowledge, best practices and manufacturing developments.",
    icon: "💡",
  },
];

export const newsArticles: NewsArticle[] = [
  // ==========================================
  // 1. COMPANY NEWS (2 Articles)
  // ==========================================
  {
    slug: "axion-packtech-expands-packaging-engineering-capabilities",
    title: "Axion PackTech Expands Packaging Engineering Capabilities with New Manufacturing Wing",
    excerpt:
      "Axion PackTech inaugurates an expanded precision fabrication wing in Vadodara to scale up production of turnkey packaging, bagging, and robotic conveying automation lines.",
    category: "Company News",
    categorySlug: "company-news",
    publishedDate: "September 05, 2026",
    author: "Corporate Communications Desk",
    image: "/images/news/company/engineering-wing-expansion.jpg",
    featured: true,
    readTime: "4 min read",
    tags: ["Expansion", "Engineering", "Manufacturing", "Corporate"],
    content: {
      lead:
        "Vadodara, Gujarat — In response to burgeoning domestic and international demand for high-speed automated packaging systems, AXION PackTech has formally commissioned an expanded manufacturing and assembly wing at its Vadodara engineering facility.",
      sections: [
        {
          heading: "Scaling Turnkey Machine Building Capacity",
          paragraphs: [
            "The expanded 25,000 sq. ft. infrastructure integrates heavy-duty CNC laser cutting systems, precision multi-axis press brakes, and a dedicated clean-room test cell for food-grade and pharmaceutical bagging machinery. This capability enhancement enables the company to construct and dry-cycle complete 40-meter packaging lines prior to customer site delivery.",
            "Modern processors require synchronized turnkey systems rather than disparate standalone equipment. By uniting mechanical design, control cabinet fabrication, and software integration under one roof, AXION PackTech drastically compresses delivery lead times while maintaining strict manufacturing tolerances.",
          ],
        },
        {
          heading: "Dedicated Automation R&D & Test Facility",
          paragraphs: [
            "A key highlight of the new facility is an advanced Robotics & Automation proving ground. Here, multi-axis delta robots, Cartesian gantry stackers, and servo-driven bag placers undergo rigorous multi-day endurance runs using client-provided packaging substrates and bulk materials.",
          ],
          bullets: [
            "Equipped with 10-ton overhead cranes for large-scale gantry palletizer assembly.",
            "Dedicated stainless steel (SS304/SS316L) passivation and bead-blasting bays for sanitary machinery builds.",
            "Integrated dust-extraction test loops to simulate fine chemical and mineral handling.",
            "Expanded apprentice and field technician training laboratory.",
          ],
        },
        {
          heading: "Future-Ready Commitment to Client Productivity",
          paragraphs: [
            "This capital investment reaffirms AXION PackTech's dedication to engineering dependable, long-life industrial machinery capable of 24/7 continuous operation across harsh industrial environments.",
          ],
        },
      ],
      quote: {
        text:
          "Our new facility empowers our engineers to push the boundaries of packaging speed, structural durability, and energy efficiency. It is built to serve our clients' growth for the next two decades.",
        author: "Managing Director",
        role: "AXION PackTech Leadership",
      },
    },
  },
  {
    slug: "axion-packtech-achieves-iso-9001-certification",
    title: "Axion PackTech Achieves ISO 9001:2015 Certification for Machinery Quality Management",
    excerpt:
      "Official audit confirms AXION PackTech's engineering design, component sourcing, fabrication, and testing protocols adhere to international quality and safety benchmarks.",
    category: "Company News",
    categorySlug: "company-news",
    publishedDate: "August 20, 2026",
    author: "Quality Assurance Department",
    image: "/images/news/company/iso-certification.jpg",
    featured: false,
    readTime: "3 min read",
    tags: ["Certification", "Quality Standards", "ISO 9001", "Compliance"],
    content: {
      lead:
        "AXION PackTech has officially received ISO 9001:2015 certification following an extensive independent audit of its machinery engineering, fabrication, and post-commissioning service workflows.",
      sections: [
        {
          heading: "Standardized Engineering from Design to Commissioning",
          paragraphs: [
            "The certification validates AXION PackTech's end-to-end quality management framework. Every packaging machine product undergoes standardized stage-gate verification: finite element analysis (FEA) on structural frames, component traceability certificates for all stainless steel contact parts, and comprehensive 72-hour factory endurance trials.",
            "By formalizing our continuous quality improvement protocols, we provide our industrial customers with verifiable documentation that our bagging, conveying, and sealing equipment consistently meets international standards.",
          ],
        },
        {
          heading: "Key Quality Pillars Audited",
          paragraphs: [
            "The international audit team evaluated all core business workflows, identifying exceptional rigor in our electrical panel wiring standards and pre-shipment mechanical alignment procedures.",
          ],
          bullets: [
            "100% digital component traceability for electrical, pneumatic, and mechanical sub-assemblies.",
            "Standardized weld inspection and non-destructive testing for pressure and vacuum vessels.",
            "Formal customer feedback and responsive engineering corrective action loops.",
            "Strict adherence to CE machine safety directives and ISO 13849 safety circuit validation.",
          ],
        },
      ],
      quote: {
        text:
          "ISO certification is not merely a plaque on the wall — it represents the operational discipline embedded in every bolt tightened and every PLC program verified at AXION PackTech.",
        author: "Head of Quality & Compliance",
        role: "AXION PackTech Quality Assurance",
      },
    },
  },

  // ==========================================
  // 2. PRODUCT & TECHNOLOGY (2 Articles)
  // ==========================================
  {
    slug: "advanced-bagging-systems-efficiency",
    title: "Advanced Automatic Bagging Systems Designed for High-Throughput Operations",
    excerpt:
      "New developments in automated bagging technology are helping manufacturers achieve unprecedented filling accuracy, higher volumetric rates, and minimal giveaway.",
    category: "Product & Technology",
    categorySlug: "product-technology",
    publishedDate: "August 28, 2026",
    author: "Product Engineering Team",
    image: "/images/news/products/automated-bagging-systems.jpg",
    featured: true,
    readTime: "4 min read",
    tags: ["Bagging", "Filling Systems", "Automation", "Product Launch"],
    content: {
      lead:
        "Industrial processors handling grains, fertilizers, chemical pellets, and mineral powders face increasing pressure to eliminate filling giveaway and minimize manual bag hanging labor. AXION PackTech's latest generation of automated bagging systems delivers a breakthrough solution.",
      sections: [
        {
          heading: "Precision Gravimetric Dosing Accuracy",
          paragraphs: [
            "Minor weight variances accumulate into thousands of kilograms of giveaway material each month. Our redesigned electronic net-weight scales utilize digital high-speed load cells paired with intelligent feed-gate modulation (bulk, intermediate, and dribble flow).",
            "This achieves repeatable filling accuracy within ±0.2% at continuous speeds of up to 1,200 bags per hour, even when bulk density fluctuates due to atmospheric humidity or silo head pressure changes.",
          ],
        },
        {
          heading: "Ergonomic & Automated Bag Handling",
          paragraphs: [
            "The system incorporates high-speed robotic suction arms that automatically retrieve open-mouth or valve bags from multi-cassette magazines, open the bag mouth, and position it securely onto a dust-tight inflatable clamp spout.",
          ],
          bullets: [
            "Compatible with woven polypropylene (PP), multi-wall kraft paper, polyethylene (PE), and barrier films.",
            "Quick-release clamp tooling enabling complete bag size changeovers in under 10 minutes.",
            "Integrated dust-exhaust shroud preventing airborne powder dispersion during bag filling.",
            "Motorized bottom bag conveyor with synchronized height adjustment.",
          ],
        },
        {
          heading: "Built for Severe Duty",
          paragraphs: [
            "Constructed from heavy structural box tubing with sealed IP66 electrical enclosures, these bagging machines withstand corrosive fertilizers, abrasive quartz sand, and continuous multi-shift operations.",
          ],
        },
      ],
      quote: {
        text:
          "This new bagging platform bridges the gap between raw machine speed and micro-gram accuracy, helping clients recoup capital investment within months.",
        author: "Chief Design Engineer",
        role: "Bagging Systems Division",
      },
    },
  },
  {
    slug: "next-gen-high-speed-checkweighers-inspection",
    title: "Next-Generation High-Speed Checkweighers with Integrated Vision Inspection",
    excerpt:
      "AXION PackTech introduces continuous inline dynamic checkweighers coupled with high-resolution vision systems for simultaneous weight compliance and package integrity checks.",
    category: "Product & Technology",
    categorySlug: "product-technology",
    publishedDate: "August 10, 2026",
    author: "Inspection Systems R&D",
    image: "/images/news/products/checkweighers-inspection.jpg",
    featured: false,
    readTime: "3 min read",
    tags: ["Checkweighers", "Vision Inspection", "Quality Control", "Hardware"],
    content: {
      lead:
        "Quality assurance on modern packaging lines requires multi-layered verification at full operating velocity. AXION PackTech's new dynamic checkweighing system unifies weight verification with optical barcode and seal integrity inspection into a single compact conveyor footprint.",
      sections: [
        {
          heading: "Dynamic In-Motion Weight Verification",
          paragraphs: [
            "Operating at belt speeds up to 60 meters per minute, the electromagnetic force restoration (EMFR) weigh cell delivers milligram-precision weight readings without slowing line conveyor flow. Non-compliant packs are automatically diverted via high-speed pneumatic flipper or air-blast reject mechanisms.",
          ],
        },
        {
          heading: "Simultaneous Optical Seal & Code Inspection",
          paragraphs: [
            "Positioned immediately above the weighing deck, twin industrial cameras inspect package tops and printed labels for essential quality metrics:",
          ],
          bullets: [
            "1D and 2D datamatrix code verification for batch traceability and expiry dates.",
            "Seal skew and trapped product detection in heat-sealed pouches.",
            "Automatic data logging with direct integration into plant MES and SCADA systems.",
            "Tool-free hygienic conveyor belt removal for rapid sanitary washdowns.",
          ],
        },
      ],
      quote: {
        text:
          "Combining dynamic weight monitoring and optical verification on one chassis saves valuable plant floor space and guarantees 100% outgoing quality compliance.",
        author: "Inspection Systems Specialist",
        role: "Quality Instrumentation Division",
      },
    },
  },

  // ==========================================
  // 3. PROJECTS & INSTALLATIONS (2 Articles)
  // ==========================================
  {
    slug: "turnkey-fertilizer-packaging-line-commissioned",
    title: "Turnkey Fertilizer Packaging Line Successfully Commissioned in Gujarat",
    excerpt:
      "AXION PackTech completes installation and commissioning of a fully automated 50 kg bulk fertilizer bagging, stitching, and gantry palletizing line for a major agro-chemical manufacturer.",
    category: "Projects & Installations",
    categorySlug: "projects-installations",
    publishedDate: "August 15, 2026",
    author: "Project Commissioning Bureau",
    image: "/images/news/projects/fertilizer-plant-commissioning.jpg",
    featured: false,
    readTime: "4 min read",
    tags: ["Fertilizer", "Commissioning", "Turnkey Line", "Palletizing"],
    content: {
      lead:
        "Dahej, Gujarat — AXION PackTech has successfully commissioned a complete turnkey fertilizer bagging and automated palletizing installation for an agro-chemical producer, delivering a sustained output of 45 metric tons per hour.",
      sections: [
        {
          heading: "Overcoming Corrosive Agro-Chemical Operating Conditions",
          paragraphs: [
            "Fertilizer manufacturing environments are notoriously hostile to machinery. Granular urea, diammonium phosphate (DAP), and potassium chloride generate corrosive airborne dust that rapidly oxidizes conventional mild-steel equipment and degrades electrical connections.",
            "To safeguard operational longevity, all material-contact hoppers, chutes, and scale bodies were fabricated from passivated SS316L stainless steel. Electrical cabinets were pressurized with dry filtered air to prevent corrosive gas ingress.",
          ],
        },
        {
          heading: "Complete End-to-End System Synchronization",
          paragraphs: [
            "The commissioned project encompasses bucket elevators from bulk storage hoppers, dual gross weighers, automatic bag mouth clamp dispensers, heavy-duty sewing heads with crepe tape binding, bag flattening conveyors, and a robotic gantry palletizer.",
          ],
          bullets: [
            "Rated throughput: 900 bags (50 kg) per hour with single-operator supervision.",
            "Automated bag flattener expelling trapped air for tight, stable pallet stacks.",
            "Heavy-duty pallet magazine dispensing empty wooden pallets automatically.",
            "Inline stretch hooding system providing 5-sided weather protection for open-yard storage.",
          ],
        },
        {
          heading: "Immediate Production Benefits",
          paragraphs: [
            "Following 72 hours of uninterrupted validation trials, the client reported an immediate 40% reduction in labor requirements and a complete elimination of dust emissions in the packaging hall.",
          ],
        },
      ],
      quote: {
        text:
          "The AXION PackTech engineering team delivered on time and within specifications. The line operates like clockwork despite the highly abrasive fertilizer material.",
        author: "Plant Operations Director",
        role: "Agro-Chemical Manufacturing Facility",
      },
    },
  },
  {
    slug: "customized-sanitary-chemical-packing-system",
    title: "Customized Sanitary Chemical Packing System Deployed for Global Processor",
    excerpt:
      "AXION PackTech engineers a custom low-profile packaging and dust-free sealing solution designed for strict hygiene standards and challenging plant headroom constraints.",
    category: "Projects & Installations",
    categorySlug: "projects-installations",
    publishedDate: "July 12, 2026",
    author: "Systems Integration Group",
    image: "/images/news/projects/chemical-packing-line.jpg",
    featured: false,
    readTime: "4 min read",
    tags: ["Chemicals", "Custom Engineering", "Sanitary", "Installation"],
    content: {
      lead:
        "When an international specialty chemicals manufacturer needed to package a hygroscopic, fine pharmaceutical-grade powder within an existing 4.1-meter ceiling mezzanine, off-the-shelf equipment was completely non-viable. AXION PackTech designed and installed a custom low-profile solution.",
      sections: [
        {
          heading: "Tailored Low-Headroom Mechanical Architecture",
          paragraphs: [
            "Our mechanical design team modeled an inverted horizontal dosing auger coupled with an offset gravimetric weigh cell, compressing the vertical envelope by over 1.4 meters without sacrificing flow velocity or weighing precision.",
            "To prevent the fine powder from adsorbing atmospheric moisture during the packaging cycle, the bagging spout features a positive nitrogen purge and continuous pneumatic dust seal.",
          ],
        },
        {
          heading: "Commissioning & Safety Compliance",
          paragraphs: [
            "The system was fully pre-assembled and dry-cycled at AXION PackTech's facility before deployment, allowing the installation team to complete on-site commissioning within a brief 48-hour scheduled maintenance shutdown.",
          ],
          bullets: [
            "Full mirror-polished stainless steel finish with internal welds ground to Ra < 0.4 µm.",
            "Hermetic continuous band heat sealing with integrated water cooling.",
            "Complete ATEX/IECEx compliance for combustible dust zones.",
            "Zero dust leakage achieved during 48-hour continuous client audit.",
          ],
        },
      ],
      quote: {
        text:
          "AXION PackTech listened to our engineering constraints and delivered a tailor-made machine that fit our tight plant dimensions perfectly.",
        author: "Project Engineering Manager",
        role: "Global Specialty Chemicals Group",
      },
    },
  },

  // ==========================================
  // 4. EVENTS & MEDIA (2 Articles)
  // ==========================================
  {
    slug: "inside-integrated-packaging-line-motion",
    title: "Inside an Integrated Packaging Line: Engineering in Motion",
    excerpt:
      "Take an exclusive behind-the-scenes video walkthrough of an AXION PackTech complete packaging automation line operating under realistic high-speed factory conditions.",
    category: "Events & Media",
    categorySlug: "events-media",
    publishedDate: "June 25, 2026",
    author: "Media & Technical Showcase",
    image: "/images/news/events/machinery-in-motion-video.jpg",
    video: {
      type: "local",
      url: "/videos/news/packaging-line-motion.mp4",
    },
    videoUrl: "/videos/news/packaging-line-motion.mp4",
    featured: false,
    readTime: "2 min watch",
    tags: ["Video", "Machinery In Motion", "Packaging Line", "Showcase"],
    content: {
      lead:
        "Experience engineering excellence in action. In this high-definition media feature, AXION PackTech presents a comprehensive walkthrough of a synchronized industrial packaging line operating at our advanced testing facility.",
      sections: [
        {
          heading: "Watch Synchronized Automation in Real-Time",
          paragraphs: [
            "Witness how each mechanical module communicates seamlessly with upstream feeding silos and downstream pallet stacking systems. The video demonstrates continuous high-speed bag placement, gravimetric dosing, precision crepe-tape stitching, checkweighing, and automated palletizing.",
            "Special attention is focused on the smooth acceleration profiles of our servo drives, which prevent product sloshing and maintain bag top integrity throughout transfer zones.",
          ],
        },
        {
          heading: "Key Stations Highlighted in the Video",
          paragraphs: [
            "Follow the journey of a package from empty bag magazine to finished pallet:",
          ],
          bullets: [
            "Automatic bag presenter extracting multi-wall kraft bags from storage cassettes.",
            "High-accuracy electronic net weigher discharging 25 kg batches in under 2.8 seconds.",
            "Continuous stitcher with pneumatic thread trimmer and crepe tape binding.",
            "Heavy-duty incline belt flattener expelling air for rigid pallet stabilization.",
          ],
        },
      ],
      quote: {
        text:
          "Seeing a line run live under full production velocity provides prospective clients with complete confidence in our mechanical build quality and control logic.",
        author: "Head of Systems Commissioning",
        role: "AXION PackTech Media Desk",
      },
    },
  },
  {
    slug: "axion-packtech-showcases-innovations-packtech-expo",
    title: "Axion PackTech Showcases High-Speed Bagging Innovations at PackTech India Expo",
    excerpt:
      "AXION PackTech to demonstrate its latest servo-driven bag placers, compact case erectors, and smart industrial inspection systems at the upcoming international packaging exhibition.",
    category: "Events & Media",
    categorySlug: "events-media",
    publishedDate: "June 10, 2026",
    author: "Events & Exhibitions Team",
    image: "/images/news/events/packtech-expo-showcase.jpg",
    featured: false,
    readTime: "3 min read",
    tags: ["Exhibition", "Trade Show", "PackTech Expo", "Live Demo"],
    content: {
      lead:
        "Mumbai, India — AXION PackTech will be participating in the forthcoming PackTech India Industrial Exhibition, presenting live machinery demonstrations of its new servo-driven bag placers and compact carton erectors at Booth H4-B12.",
      sections: [
        {
          heading: "Live Machinery Demonstrations",
          paragraphs: [
            "Visitors to the AXION PackTech pavilion will experience live, full-cycle machinery demonstrations running throughout all four days of the expo. Our systems engineers will showcase 10-minute recipe changeovers between varying bag dimensions and packaging materials.",
            "In addition, our technical team will be available to review plant layout drawings and conduct complimentary packaging line optimization assessments for attending manufacturers.",
          ],
        },
        {
          heading: "Technologies on Display",
          paragraphs: [
            "The AXION PackTech booth will feature three fully functional machinery platforms:",
          ],
          bullets: [
            "High-Speed Automatic Open-Mouth Bagging System with integrated dust suppression.",
            "Compact Automatic Case Erector with bottom hot-melt glue sealing.",
            "Dynamic Inline Checkweigher with integrated reject pushers and statistical reporting.",
          ],
        },
      ],
      quote: {
        text:
          "We welcome all plant managers, project engineers, and operations directors to visit our booth and discuss how customized packaging automation can transform their production economics.",
        author: "Director of Marketing & Events",
        role: "AXION PackTech Commercial Team",
      },
    },
  },

  // ==========================================
  // 5. INDUSTRY INSIGHTS (2 Articles)
  // ==========================================
  {
    slug: "automation-trends-industrial-packaging",
    title: "Automation Trends Transforming Bulk Material Handling and Bagging in 2026",
    excerpt:
      "An in-depth analysis of emerging technologies reshaping industrial packaging lines — from direct-drive servo kinematics and machine vision to energy recovery drives.",
    category: "Industry Insights",
    categorySlug: "industry-insights",
    publishedDate: "July 30, 2026",
    author: "Technical Insights Division",
    image: "/images/news/insights/bulk-handling-automation.jpg",
    featured: false,
    readTime: "5 min read",
    tags: ["Industry Trends", "Automation", "Industry 4.0", "Engineering Analysis"],
    content: {
      lead:
        "Rising labor costs, stringent workplace safety regulations, and the imperative for absolute weight accuracy are driving heavy industrial manufacturing facilities to re-evaluate their end-of-line packaging operations.",
      sections: [
        {
          heading: "1. The Ascendance of Servo-Driven Kinematics",
          paragraphs: [
            "Traditional mechanical cam linkages and purely pneumatic actuators are rapidly being replaced by multi-axis direct-drive servo motors. Servos provide programmable motion curves, gentle bag acceleration without material sloshing, lower acoustic noise, and massive reductions in pneumatic air consumption.",
            "For case packers and bag placers, servo positioning allows single-button recipe recall on the touchscreen HMI without requiring manual mechanical spanner adjustments.",
          ],
        },
        {
          heading: "2. Native Machine Vision & Total Inspection",
          paragraphs: [
            "Inspection is no longer a downstream afterthought. Modern industrial lines integrate optical cameras and dynamic weighing within the primary conveyor structure.",
          ],
          bullets: [
            "Continuous monitoring of heat-seal uniformity and detection of trapped product granules.",
            "Optical verification of 1D/2D barcodes for track-and-trace compliance.",
            "Automated reject sorting preventing defective units from reaching palletizers.",
          ],
        },
        {
          heading: "3. Predictive Maintenance via Sensorized Components",
          paragraphs: [
            "Vibration sensors on heavy bearing housings, thermal probes on sealing jaws, and cycle monitors on pneumatic valves alert maintenance managers well before a critical wear part triggers costly downtime.",
          ],
        },
      ],
      quote: {
        text:
          "The most successful manufacturing plants are those that invest in automated lines capable of adapting dynamically to material variations while maintaining zero downtime.",
        author: "Principal Automation Consultant",
        role: "AXION PackTech Technical Insights",
      },
    },
  },
  {
    slug: "energy-efficient-drive-systems-packaging-plants",
    title: "Energy-Efficient Drive Systems: Reducing Operating Costs in Packaging Plants",
    excerpt:
      "How intelligent variable-frequency drives, regenerative braking, and optimized pneumatic circuits slash utility expenses across continuous packaging operations.",
    category: "Industry Insights",
    categorySlug: "industry-insights",
    publishedDate: "July 05, 2026",
    author: "Sustainability & Efficiency Bureau",
    image: "/images/news/insights/energy-efficient-drives.jpg",
    featured: false,
    readTime: "4 min read",
    tags: ["Energy Efficiency", "Sustainability", "VFD Drives", "Cost Reduction"],
    content: {
      lead:
        "Electric motors and compressed air systems account for up to 65% of the total electrical energy consumed in packaging facilities. Implementing modern energy-recovery drives and leak-free pneumatic circuits provides substantial financial and environmental dividends.",
      sections: [
        {
          heading: "Eliminating Pneumatic Inefficiency",
          paragraphs: [
            "Compressed air is one of the most expensive utility forms in industrial plants. Converting high-frequency pneumatic reciprocating cylinders to electromechanical linear servo drives reduces energy consumption by up to 70% while providing superior positioning repeatability.",
            "Where pneumatic systems remain necessary — such as bag clamping collars — AXION PackTech implements localized air reservoirs and smart solenoid manifolds that vent exhaust air into regenerative circuits.",
          ],
        },
        {
          heading: "Variable Frequency Drives & Regenerative Deceleration",
          paragraphs: [
            "Continuous running conveyors traditionally operate at fixed speeds regardless of actual product feed rates. Integrating IE4 super-premium efficiency motors with variable frequency drives allows conveyor belts to modulate speed automatically based on upstream line flow.",
          ],
          bullets: [
            "IE4/IE5 ultra-efficient motor windings reducing thermal dissipation and power draw.",
            "Regenerative braking modules capturing kinetic energy during palletizer deceleration.",
            "Automatic sleep modes during temporary upstream material shortages.",
            "Lower carbon footprint supporting client corporate sustainability ESG commitments.",
          ],
        },
      ],
      quote: {
        text:
          "Designing packaging machinery with energy efficiency at its core isn't just an ecological duty — it is a powerful economic advantage that drops directly to the plant's bottom line.",
        author: "Lead Electrical Architect",
        role: "Power & Systems Engineering",
      },
    },
  },
];

// ==========================================
// Helper Functions
// ==========================================

export function getAllNews(): NewsArticle[] {
  return newsArticles;
}

export function getAllCategories(): NewsCategory[] {
  return newsCategories;
}

export function getNewsCategoryBySlug(slug: string): NewsCategory | undefined {
  return newsCategories.find((cat) => cat.slug === slug);
}

export function getNewsByCategory(categorySlug: string): NewsArticle[] {
  return newsArticles.filter((article) => article.categorySlug === categorySlug);
}

export function getFeaturedNews(limit = 3): NewsArticle[] {
  const featured = newsArticles.filter((article) => article.featured);
  if (featured.length >= limit) {
    return featured.slice(0, limit);
  }
  // If fewer featured articles, fill with latest
  const rest = newsArticles.filter((article) => !article.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find((article) => article.slug === slug);
}

export function getRelatedNews(currentSlug: string, count = 3): NewsArticle[] {
  const current = getNewsBySlug(currentSlug);
  if (!current) {
    return newsArticles.slice(0, count);
  }

  // Prioritize same category, then other categories
  const sameCategory = newsArticles.filter(
    (a) => a.slug !== currentSlug && a.categorySlug === current.categorySlug
  );
  const otherCategory = newsArticles.filter(
    (a) => a.slug !== currentSlug && a.categorySlug !== current.categorySlug
  );

  return [...sameCategory, ...otherCategory].slice(0, count);
}
