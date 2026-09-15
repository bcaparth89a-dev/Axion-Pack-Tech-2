export type CareerType = "job" | "internship" | "apprenticeship";

export type CareerCategorySlug = "jobs" | "internships" | "apprenticeships";

export interface CareerCategoryInfo {
  type: CareerType;
  slug: CareerCategorySlug;
  title: string;
  badge: string;
  shortDescription: string;
  description: string;
  icon: string;
  image: string;
}

export interface CareerOpportunity {
  id: string;
  slug: string;
  title: string;
  type: CareerType;
  department: string;
  location: string;
  employmentType: string;
  experience: string;

  shortDescription: string;
  description: string;

  image: string;

  postedDate: string;
  applicationDeadline: string;

  eligibility: string[];
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  selectionProcess: string[];

  isActive: boolean;

  // Specific for internships & apprenticeships
  duration?: string;
  stipendOrBenefits?: string;
  mentorSupport?: string;
  certification?: string;
}

export const careerCategories: CareerCategoryInfo[] = [
  {
    type: "job",
    slug: "jobs",
    title: "Professional Opportunities",
    badge: "Full-Time Engineering & Corporate",
    shortDescription:
      "Build your career with Axion PackTech and work on innovative packaging, automation, engineering, manufacturing, sales, and service solutions.",
    description:
      "Join our multidisciplinary engineering team driving modern packaging automation, precision manufacturing, and customer-first technical support across global industries.",
    icon: "💼",
    image: "/images/careers/engineering-jobs.jpg",
  },
  {
    type: "internship",
    slug: "internships",
    title: "Internship Opportunities",
    badge: "Students & Recent Graduates",
    shortDescription:
      "Gain practical industry experience, work alongside experienced professionals, and develop real-world engineering and technical skills.",
    description:
      "Structured internship programs providing undergraduate and postgraduate engineering students hands-on immersion in mechanical design, automation, R&D, and manufacturing.",
    icon: "🎓",
    image: "/images/careers/internships.jpg",
  },
  {
    type: "apprenticeship",
    slug: "apprenticeships",
    title: "Apprenticeship & Training",
    badge: "Hands-On Technical Skills",
    shortDescription:
      "Start your professional journey with hands-on training, technical learning, practical exposure, and guidance from experienced industry professionals.",
    description:
      "Accredited shopfloor apprenticeships offering structured practical training in machine assembly, precision fabrication, electrical panel wiring, and industrial maintenance.",
    icon: "🔧",
    image: "/images/careers/apprenticeships.jpg",
  },
];

export const careerOpportunities: CareerOpportunity[] = [
  // ==========================================
  // JOBS (4 Opportunities)
  // ==========================================
  {
    id: "job-01",
    slug: "mechanical-design-engineer",
    title: "Mechanical Design Engineer",
    type: "job",
    department: "Engineering & Design",
    location: "Vadodara, Gujarat, India",
    employmentType: "Full-Time",
    experience: "1–4 Years",
    shortDescription:
      "Design and develop advanced automated packaging machines, rotary baggers, and custom material handling mechanisms using 3D CAD platforms.",
    description:
      "As a Mechanical Design Engineer at Axion PackTech, you will take ownership of machine design projects from conceptualization through 3D CAD modeling, detailed drafting, prototype validation, and manufacturing handoff. You will collaborate closely with manufacturing, automation, and assembly teams to deliver high-performance packaging systems engineered for global industrial environments.",
    image: "/images/careers/engineering-jobs.jpg",
    postedDate: "20 August 2026",
    applicationDeadline: "30 October 2026",
    eligibility: [
      "Bachelor's Degree in Mechanical Engineering / Production Engineering (B.E. / B.Tech).",
      "1 to 4 years of proven hands-on experience in machine design, industrial automation, or packaging machinery.",
      "Proficient in 3D CAD software (SolidWorks / Inventor / Creo) with strong kinematic simulation skills.",
      "Comprehensive understanding of sheet metal fabrication, machining tolerances (GD&T), and material selection.",
      "Strong analytical mindset and practical problem-solving aptitude.",
    ],
    responsibilities: [
      "Create detailed 3D CAD models, assembly drawings, and manufacturing blueprints for industrial packaging equipment.",
      "Perform mechanical calculations, component sizing (bearings, motors, pneumatic cylinders, linear guides), and stress analysis.",
      "Collaborate with shopfloor fabrication and assembly technicians during machine build and prototype testing.",
      "Generate Bill of Materials (BOM) and technical documentation compliant with ISO 9001:2015 engineering standards.",
      "Participate in design reviews and value engineering initiatives to optimize machine durability and production cost.",
    ],
    requirements: [
      "Demonstrated experience designing high-speed conveyors, dosing systems, or case packing mechanisms.",
      "Working knowledge of pneumatic circuits, servo drive integration, and mechanical safety guarding.",
      "Familiarity with sanitary design standards for food, pharmaceutical, and chemical packaging machinery.",
      "Good verbal and written technical communication skills.",
    ],
    skills: [
      "SolidWorks 3D",
      "GD&T & Tolerancing",
      "Pneumatic Sizing",
      "BOM Management",
      "Sheet Metal Design",
      "Value Engineering",
    ],
    selectionProcess: [
      "Application & Portfolio Review",
      "Initial Technical Screening Call",
      "CAD Design Modeling Assessment",
      "Technical Panel & Engineering Interview",
      "Final HR Discussion & Offer Rollout",
    ],
    isActive: true,
  },
  {
    id: "job-02",
    slug: "service-engineer",
    title: "Technical Service & Commissioning Engineer",
    type: "job",
    department: "Technical Service & Commissioning",
    location: "Vadodara, Gujarat, India (with site travel)",
    employmentType: "Full-Time",
    experience: "1–3 Years",
    shortDescription:
      "Execute on-site installation, commissioning, calibration, and preventive maintenance of packaging lines across customer facilities in India and overseas.",
    description:
      "The Technical Service & Commissioning Engineer is the trusted frontline ambassador of Axion PackTech engineering. You will lead on-site assembly, electrical hookup, mechanical alignment, PLC I/O checks, line commissioning, and operator training at fertilizer, chemical, food, and cement manufacturing plants.",
    image: "/images/careers/careers-hero.jpg",
    postedDate: "25 August 2026",
    applicationDeadline: "15 November 2026",
    eligibility: [
      "Diploma or Bachelor's Degree in Mechanical / Mechatronics / Electrical Engineering.",
      "1 to 3 years of hands-on experience in field service, machinery commissioning, or plant maintenance.",
      "Willingness to travel to client industrial facilities across domestic and international locations (approx. 50-60% travel).",
      "Strong troubleshooting acumen for electromechanical drives, pneumatics, and PLC control sequences.",
      "Valid Indian passport or eligibility to obtain travel documentation.",
    ],
    responsibilities: [
      "Lead turnkey installation, mechanical leveling, pneumatic piping, and electrical integration of packaging machinery at customer sites.",
      "Conduct thorough dry-run trials, dynamic product test runs, and speed calibration to achieve specified operational parameters.",
      "Diagnose and resolve electromechanical faults, sensor misalignments, and drive errors promptly during commissioning phases.",
      "Conduct professional training sessions for customer plant supervisors and line operators on machine operation and daily preventive maintenance.",
      "Submit detailed site commissioning reports, punch-lists, and customer handover documentation.",
    ],
    requirements: [
      "Knowledge of PLC architectures (Siemens / Allen Bradley / Delta) and basic ladder logic fault tracing.",
      "Practical experience with industrial weighing load cells, VFD parameter tuning, and optical sensors.",
      "Customer-centric attitude with strong diplomatic communication skills under industrial plant conditions.",
    ],
    skills: [
      "Machine Commissioning",
      "PLC Fault Diagnosis",
      "Sensor Calibration",
      "Pneumatics & Hydraulics",
      "Preventive Maintenance",
      "Customer Training",
    ],
    selectionProcess: [
      "Resume & Field Experience Review",
      "Technical Diagnostics Tele-Interview",
      "Practical Troubleshooting & Wiring Test",
      "Senior Management & HR Interview",
      "Offer & Site Safety Briefing",
    ],
    isActive: true,
  },
  {
    id: "job-03",
    slug: "production-engineer",
    title: "Production & Assembly Engineer",
    type: "job",
    department: "Manufacturing & Production",
    location: "Vadodara, Gujarat, India",
    employmentType: "Full-Time",
    experience: "2–5 Years",
    shortDescription:
      "Oversee shopfloor machinery fabrication, assembly workflows, quality gate inspections, and on-time project execution in our Vadodara manufacturing plant.",
    description:
      "We are seeking an experienced Production & Assembly Engineer to coordinate workshop operations for custom packaging equipment and standard machinery batches. In this role, you will bridge design engineering and shopfloor fabrication, ensuring lean assembly, precision alignment, strict safety adherence, and timely delivery.",
    image: "/images/careers/manufacturing-career.jpg",
    postedDate: "28 August 2026",
    applicationDeadline: "30 November 2026",
    eligibility: [
      "Bachelor's Degree or Diploma in Production / Mechanical / Industrial Engineering.",
      "2 to 5 years of shopfloor production, assembly planning, or manufacturing operations experience.",
      "Demonstrated ability to interpret complex mechanical assemblies, pneumatic diagrams, and fabrication drawings.",
      "Proficient in production scheduling, resource allocation, and shopfloor 5S management.",
      "Working knowledge of ISO 9001 quality management systems.",
    ],
    responsibilities: [
      "Supervise machine assembly lines, assigning daily tasks to fitters, welders, and technicians to meet dispatch milestones.",
      "Implement stage-wise quality inspections (in-process verification, shaft concentricity, drive alignments, pneumatic leak tests).",
      "Liaise with procurement and stores to ensure timely availability of raw materials, bought-out components, and hardware.",
      "Identify assembly bottlenecks and implement lean manufacturing improvements to reduce build lead times.",
      "Coordinate factory acceptance tests (FAT) with design engineers and client representatives.",
    ],
    requirements: [
      "Experience with heavy industrial machinery assembly or packaging automation lines.",
      "Strong leadership skills to guide and motivate workshop technicians and fitters.",
      "Familiarity with ERP / inventory tracking systems.",
    ],
    skills: [
      "Production Scheduling",
      "Stage Quality Control",
      "Assembly Workflow",
      "FAT Coordination",
      "Lean 5S",
      "BOM Verification",
    ],
    selectionProcess: [
      "Application Screening",
      "Shopfloor Operations Technical Round",
      "Manufacturing Case Study & Blueprint Reading",
      "Director Level & HR Discussion",
      "Final Selection",
    ],
    isActive: true,
  },
  {
    id: "job-04",
    slug: "sales-business-development-executive",
    title: "Sales & Business Development Executive",
    type: "job",
    department: "Sales & Marketing",
    location: "Vadodara, Gujarat, India (Regional coverage)",
    employmentType: "Full-Time",
    experience: "2–5 Years",
    shortDescription:
      "Drive B2B technical sales for packaging machinery, turnkey automated lines, and retrofit solutions across chemical, food, and agricultural sectors.",
    description:
      "Axion PackTech is expanding market outreach across key industrial manufacturing hubs. As a Sales & Business Development Executive, you will identify prospective industrial clients, understand their bulk bagging and end-of-line packaging requirements, collaborate with our application engineering team to formulate technical proposals, and negotiate project contracts.",
    image: "/images/careers/team-axion.jpg",
    postedDate: "01 September 2026",
    applicationDeadline: "Open Until Filled",
    eligibility: [
      "B.E. / B.Tech in Mechanical / Electrical / Industrial Engineering, or MBA in Marketing with technical background.",
      "2 to 5 years in capital equipment sales, industrial packaging machinery, or processing plant B2B business development.",
      "Strong understanding of packaging line economics, project payback calculations, and client techno-commercial evaluations.",
      "Excellent presentation, negotiation, and relationship-building capabilities.",
    ],
    responsibilities: [
      "Generate and qualify inbound and outbound B2B leads across target verticals (fertilizers, chemicals, grains, food, pharmaceuticals).",
      "Conduct site visits, technical plant assessments, and consultative meetings with plant heads and procurement directors.",
      "Work with design engineers to configure optimal machine layouts, prepare detailed technical quotes, and present commercial tenders.",
      "Participate in national and international packaging exhibitions, industry summits, and business expos.",
      "Manage client relationships through project execution, fostering long-term after-sales and upgrade partnerships.",
    ],
    requirements: [
      "Proven track record of closing high-value industrial equipment contracts.",
      "Willingness to travel across regional manufacturing clusters as per business opportunities.",
      "Proficiency in CRM platforms and professional sales forecasting.",
    ],
    skills: [
      "B2B Machinery Sales",
      "Techno-Commercial Proposals",
      "Key Account Management",
      "Client Negotiations",
      "CRM Systems",
      "Industrial Expo Representation",
    ],
    selectionProcess: [
      "Profile & Track Record Assessment",
      "Commercial & Technical Sales Interview",
      "Mock Client Presentation & Solution Pitch",
      "Executive Committee Interview",
      "Final Offer",
    ],
    isActive: true,
  },

  // ==========================================
  // INTERNSHIPS (4 Opportunities)
  // ==========================================
  {
    id: "intern-01",
    slug: "mechanical-engineering-intern",
    title: "Mechanical Engineering Intern",
    type: "internship",
    department: "Engineering & Design / R&D",
    location: "Vadodara, Gujarat, India",
    employmentType: "Internship",
    experience: "Final Year Student / Fresh Graduate",
    duration: "6 Months",
    stipendOrBenefits: "Competitive Monthly Stipend + Travel Allowance",
    mentorSupport: "Dedicated Senior Mechanical Design Mentor",
    certification: "Official Internship Completion Certificate & Pre-Placement Offer (PPO) Eligibility",
    shortDescription:
      "Gain deep practical design exposure working alongside senior CAD engineers on live industrial packaging machinery projects.",
    description:
      "Our Mechanical Engineering Internship is designed for aspiring mechanical engineers eager to bridge academic theory with high-impact industrial machine manufacturing. You will be assigned to live packaging machinery design projects, learning kinematics, component selection, tolerance stacks, and prototype testing under senior engineering mentorship.",
    image: "/images/careers/internships.jpg",
    postedDate: "15 August 2026",
    applicationDeadline: "15 October 2026",
    eligibility: [
      "Current final year student or recent graduate in B.E. / B.Tech / Diploma in Mechanical or Production Engineering.",
      "Academic coursework in Machine Design, Strength of Materials, Kinematics, and Manufacturing Processes.",
      "Basic familiarity with 3D CAD modeling (SolidWorks / Creo / AutoCAD).",
      "Curiosity, eagerness to learn, and commitment to full-time 6-month on-site internship.",
    ],
    responsibilities: [
      "Assist design engineers in drafting 2D fabrication drawings, part models, and sub-assemblies.",
      "Perform dimensional verification and inspection of incoming machined components against CAD blueprints.",
      "Participate in physical prototype assembly, recording kinematic observations and vibration/noise characteristics.",
      "Update standard engineering libraries and Bill of Materials (BOM) documentation.",
      "Present an end-of-internship technical case study on a machine sub-assembly optimization project.",
    ],
    requirements: [
      "Strong mechanical fundamentals and spatial visualization skills.",
      "Proficient computer skills (MS Office / CAD tools).",
      "Team collaboration mindset and discipline in shopfloor safety.",
    ],
    skills: [
      "3D CAD Modeling",
      "Engineering Drawing Standards",
      "Dimensional Metrology",
      "Technical Documentation",
      "Shopfloor Safety",
    ],
    selectionProcess: [
      "Academic Profile & Project Evaluation",
      "Online Technical Aptitude Test",
      "Design Mentor Technical Interview",
      "HR Onboarding Briefing",
    ],
    isActive: true,
  },
  {
    id: "intern-02",
    slug: "industrial-automation-intern",
    title: "Industrial Automation & Controls Intern",
    type: "internship",
    department: "Automation & Electrical Systems",
    location: "Vadodara, Gujarat, India",
    employmentType: "Internship",
    experience: "Final Year Student / Fresh Graduate",
    duration: "6 Months",
    stipendOrBenefits: "Competitive Monthly Stipend + Subsidized Lunch",
    mentorSupport: "Dedicated Automation Lead & Systems Engineer Mentor",
    certification: "Official Industrial Automation Certificate with PPO Consideration",
    shortDescription:
      "Learn PLC programming, HMI screen design, sensor integration, and industrial motor drive tuning on automated packaging lines.",
    description:
      "Step into the world of Industry 4.0 automation. As an Industrial Automation Intern at Axion PackTech, you will work with PLC control architectures, touch-screen HMI interfaces, optical sensors, safety light curtains, and variable frequency drives powering modern packaging machines.",
    image: "/images/careers/internships.jpg",
    postedDate: "20 August 2026",
    applicationDeadline: "31 October 2026",
    eligibility: [
      "B.E. / B.Tech / Diploma in Electrical, Electronics, Instrumentation, or Mechatronics Engineering.",
      "Fundamental understanding of PLC ladder logic, digital/analog I/O, and industrial sensors.",
      "Enthusiasm for industrial automation, robotics, and industrial electrical panels.",
      "Available for full-time 6 months on-site at our Vadodara facility.",
    ],
    responsibilities: [
      "Assist in writing and debugging PLC ladder logic routines for bag filling, case indexing, and sealing sequences.",
      "Help design intuitive HMI graphics and operational recipe screens for packaging machine touchscreens.",
      "Conduct electrical I/O loop checks, wire continuity testing, and sensor alignment verification during assembly.",
      "Assist service engineers during machine dry runs and simulation testing.",
      "Document electrical schematics and panel layout drawings.",
    ],
    requirements: [
      "Familiarity with Siemens / Schneider / Delta / Omron PLC basics.",
      "Understanding of industrial electrical safety norms and wiring color codes.",
      "Proactive attitude toward hands-on troubleshooting.",
    ],
    skills: [
      "PLC Ladder Logic",
      "HMI Development",
      "Sensor Testing",
      "Electrical Loop Checks",
      "Industrial Wiring Diagrams",
    ],
    selectionProcess: [
      "Resume & Academic Project Review",
      "Basic Logic & Electrical Aptitude Test",
      "Technical Interview with Automation Lead",
      "Selection Notification",
    ],
    isActive: true,
  },
  {
    id: "intern-03",
    slug: "sales-marketing-intern",
    title: "Industrial Sales & Marketing Intern",
    type: "internship",
    department: "Sales & Marketing",
    location: "Vadodara, Gujarat, India",
    employmentType: "Internship",
    experience: "MBA / BBA / Engineering Student",
    duration: "3–6 Months",
    stipendOrBenefits: "Competitive Monthly Stipend + Performance Incentives",
    mentorSupport: "Senior Business Development Director",
    certification: "Professional B2B Marketing Certificate",
    shortDescription:
      "Learn industrial B2B marketing, market research across chemical/food manufacturing sectors, and client technical proposal management.",
    description:
      "Discover the dynamics of high-value industrial machinery sales. You will assist our marketing and business development team in mapping target manufacturing clusters, executing lead research, managing digital technical content, and organizing customer communications for packaging automation systems.",
    image: "/images/careers/team-axion.jpg",
    postedDate: "25 August 2026",
    applicationDeadline: "15 November 2026",
    eligibility: [
      "Currently pursuing or completed MBA (Marketing/Operations), BBA, or B.E. with interest in B2B sales.",
      "Strong verbal and written communication in English and Hindi.",
      "Proficient in Microsoft Excel, PowerPoint, and online market research techniques.",
      "High energy, customer curiosity, and strong organizational skills.",
    ],
    responsibilities: [
      "Research and build database directories of processing and packaging facilities in Gujarat, Maharashtra, and North India.",
      "Support marketing campaigns for industry trade fairs, product showcases, and technical seminars.",
      "Assist in preparing brochures, technical specification sheets, and client presentation decks.",
      "Coordinate customer feedback surveys following machine commissioning.",
    ],
    requirements: [
      "Keen interest in heavy machinery and manufacturing industries.",
      "Ability to articulate technical product value clearly.",
    ],
    skills: [
      "B2B Market Research",
      "Lead Prospecting",
      "Presentation Design",
      "CRM Data Entry",
      "Customer Outreach",
    ],
    selectionProcess: [
      "Application Screening",
      "Marketing Case Assignment",
      "Personal Interview with Sales Head",
      "Onboarding",
    ],
    isActive: true,
  },
  {
    id: "intern-04",
    slug: "manufacturing-production-intern",
    title: "Manufacturing & Assembly Intern",
    type: "internship",
    department: "Manufacturing & Assembly",
    location: "Vadodara, Gujarat, India",
    employmentType: "Internship",
    experience: "Diploma / Degree Student in Mechanical",
    duration: "6 Months",
    stipendOrBenefits: "Monthly Stipend + Personal Protective Equipment (PPE) Kit",
    mentorSupport: "Plant Assembly Supervisor & Chief Quality Inspector",
    certification: "Industrial Manufacturing Practices Certificate",
    shortDescription:
      "Get real shopfloor exposure to precision machining, CNC fabrication, pneumatic assembly, and quality testing of packaging machinery.",
    description:
      "This internship provides complete hands-on immersion in physical machine assembly. Working directly on the shopfloor alongside seasoned fitters and assembly supervisors, you will experience the complete life cycle of building high-speed baggers, sealers, and case packers.",
    image: "/images/careers/manufacturing-career.jpg",
    postedDate: "28 August 2026",
    applicationDeadline: "30 November 2026",
    eligibility: [
      "Diploma or Degree student in Mechanical, Production, or Automobile Engineering.",
      "Understanding of basic mechanical tools, metrology instruments (vernier calipers, micrometers, dial gauges).",
      "Comfortable with active shopfloor environment and physical machine assembly.",
    ],
    responsibilities: [
      "Work with assembly technicians on mechanical sub-assemblies (conveyor rollers, drive shafts, gearbox couplings).",
      "Learn and apply pneumatic circuit routing, tube fittings, and air regulator installations.",
      "Assist in dimensional inspection and incoming raw material quality records.",
      "Help maintain shopfloor 5S standards, tooling stations, and assembly checklists.",
    ],
    requirements: [
      "Physical stamina and dedication to manufacturing safety standards.",
      "Willingness to learn practical tool handling and mechanical fitting.",
    ],
    skills: [
      "Mechanical Fitting",
      "Pneumatics Assembly",
      "Precision Measurement",
      "Quality Checklists",
      "Workshop 5S",
    ],
    selectionProcess: [
      "Application Review",
      "Basic Shopfloor Practical & Safety Test",
      "Plant Supervisor Interview",
      "Offer Notification",
    ],
    isActive: true,
  },

  // ==========================================
  // APPRENTICESHIPS (4 Opportunities)
  // ==========================================
  {
    id: "appr-01",
    slug: "machine-assembly-apprentice",
    title: "Machine Assembly Apprentice",
    type: "apprenticeship",
    department: "Machine Assembly Workshop",
    location: "Vadodara, Gujarat, India",
    employmentType: "Apprenticeship",
    experience: "ITI Fresher / Practical Trainee",
    duration: "1 Year",
    stipendOrBenefits: "Govt-Compliant Apprenticeship Stipend + Overtime & Safety PPE",
    mentorSupport: "Master Assembly Technician & Workshop Head",
    certification: "National Apprenticeship Certificate (NAC) / Axion PackTech Certified Assembly Technician",
    shortDescription:
      "Develop specialized technical skills in precision machinery assembly, mechanical alignment, pneumatic piping, and drive assembly.",
    description:
      "Our 1-year Machine Assembly Apprenticeship transforms ITI trainees and young technicians into skilled machine builders. You will be trained in precision fitment of mechanical drives, bearing installations, linear guides, pneumatic systems, and final equipment run-ins.",
    image: "/images/careers/apprenticeships.jpg",
    postedDate: "10 August 2026",
    applicationDeadline: "31 October 2026",
    eligibility: [
      "ITI Certificate in Fitter / Machinist / Turner trade, or 3-year Diploma in Mechanical Engineering.",
      "Age: 18–25 years at the time of application.",
      "Passion for mechanical tools, machinery construction, and precision workmanship.",
      "Good physical fitness and adherence to workshop discipline and safety norms.",
    ],
    responsibilities: [
      "Assemble structural frames, stainless steel guards, and mechanical brackets according to engineering drawings.",
      "Mount and align motor gearboxes, timing pulleys, sprockets, and modular conveyor chains.",
      "Route and crimp pneumatic hoses, valve manifolds, and air preparation units.",
      "Participate in machine dry runs, assisting with speed tests and noise inspection.",
      "Maintain tooling stations, calibration records, and clean work areas.",
    ],
    requirements: [
      "Proficient in reading engineering blueprints and dimensional tolerances.",
      "Safe handling of hand tools, power tools, and torque wrenches.",
      "Reliable attendance and collaborative teamwork.",
    ],
    skills: [
      "Precision Fitting",
      "Drive Alignment",
      "Pneumatic Tubing",
      "Blueprint Reading",
      "Workshop Safety Protocol",
    ],
    selectionProcess: [
      "Trade Certificate Verification",
      "Practical Fitting & Measurement Trade Test",
      "Workshop Interview with Assembly Head",
      "Medical Fitness & Apprenticeship Agreement",
    ],
    isActive: true,
  },
  {
    id: "appr-02",
    slug: "welding-fabrication-apprentice",
    title: "Precision Welding & Fabrication Apprentice",
    type: "apprenticeship",
    department: "Fabrication & Sheet Metal Division",
    location: "Vadodara, Gujarat, India",
    employmentType: "Apprenticeship",
    experience: "ITI Welder Fresher / Trainee",
    duration: "1 Year",
    stipendOrBenefits: "Full Apprenticeship Stipend + Protective Welding Gear & Healthcare Coverage",
    mentorSupport: "Certified Welding Specialist & Fabrication Supervisor",
    certification: "Axion PackTech Certified Industrial Welder (TIG / MIG / SS)",
    shortDescription:
      "Master TIG, MIG, and sanitary stainless steel welding for high-grade packaging machine hoppers, chutes, and structural chassis.",
    description:
      "Specialized for young welders eager to master sanitary food-grade stainless steel fabrication. You will receive expert hands-on training in precision TIG and MIG welding, sheet metal bending, surface finishing, and bead grinding required for sanitary packaging machinery.",
    image: "/images/careers/apprenticeships.jpg",
    postedDate: "12 August 2026",
    applicationDeadline: "15 November 2026",
    eligibility: [
      "ITI Certificate in Welder / Fabricator trade.",
      "Basic foundational training in TIG (GTAW) and MIG (GMAW) welding.",
      "Attention to weld aesthetics, penetration, and safety guidelines.",
      "Good eyesight and hand-eye coordination for precision bead application.",
    ],
    responsibilities: [
      "Perform precision TIG welding on SS304 and SS316 stainless steel machine hoppers, dosing chutes, and enclosures.",
      "Operate sheet metal shearing machines, hydraulic press brakes, and angle grinders.",
      "Perform post-weld descaling, pickling, passivation, and cosmetic mirror/matte polishing.",
      "Inspect weld joints for porosity, undercuts, and dimensional distortion.",
      "Follow strict workshop safety, fume extraction, and eye protection protocols.",
    ],
    requirements: [
      "Knowledge of metal gauges, filler wire selection, and shielding gas flow regulation.",
      "Discipline in maintaining welding machines and replacement of consumables.",
    ],
    skills: [
      "TIG Welding (SS304/SS316)",
      "MIG Welding",
      "Sheet Metal Bending",
      "Passivation & Polishing",
      "Weld Inspection",
    ],
    selectionProcess: [
      "Document Verification",
      "Practical Welding Sample Test on SS Plate",
      "Interview with Fabrication Head",
      "Selection & Apprentice Contract",
    ],
    isActive: true,
  },
  {
    id: "appr-03",
    slug: "electrical-technician-apprentice",
    title: "Electrical Technician Apprentice",
    type: "apprenticeship",
    department: "Electrical & Control Panel Division",
    location: "Vadodara, Gujarat, India",
    employmentType: "Apprenticeship",
    experience: "ITI Electrician Fresher / Trainee",
    duration: "1 Year",
    stipendOrBenefits: "Govt-Approved Stipend + Tools Allowance",
    mentorSupport: "Senior Electrical Engineer",
    certification: "Industrial Control Panel Technician Certification",
    shortDescription:
      "Learn industrial control panel wiring, cable ferrule dressing, circuit breaker sizing, and PLC terminal connections.",
    description:
      "Become an expert in industrial electrical systems powering high-speed automated packaging machinery. Under senior electrical engineers, you will learn to build, wire, test, and troubleshoot IP54/IP65 electrical control panels, VFD drive banks, sensor cables, and safety relays.",
    image: "/images/careers/internships.jpg",
    postedDate: "18 August 2026",
    applicationDeadline: "30 November 2026",
    eligibility: [
      "ITI Certificate in Electrician / Wireman trade, or Diploma in Electrical Engineering.",
      "Basic understanding of 3-phase AC power, DC control circuits, relays, contactors, and MCBs.",
      "Ability to read electrical schematic drawings and wiring schedules.",
      "Safety-conscious approach to electrical testing.",
    ],
    responsibilities: [
      "Layout and mount DIN rails, wire ducts, contactors, VFDs, and PLC racks inside electrical cabinets.",
      "Cut, strip, ferrule, and terminate control cables cleanly following wiring numbering standards.",
      "Wire external field sensors, emergency stop pushbuttons, and interlock limit switches.",
      "Conduct insulation resistance tests (megger), continuity checks, and grounding verification.",
      "Assist in electrical fault simulation and testing before machine dispatch.",
    ],
    requirements: [
      "Neatness and precision in wire dressing and terminal crimping.",
      "Safe handling of multimeters, clamp meters, and electrical test instruments.",
    ],
    skills: [
      "Control Panel Wiring",
      "Ferrule Dressing",
      "Electrical Schematic Reading",
      "Insulation Testing",
      "VFD Termination",
    ],
    selectionProcess: [
      "Trade Certificate Verification",
      "Wiring Blueprint Reading & Crimping Test",
      "Electrical Lead Interview",
      "Onboarding",
    ],
    isActive: true,
  },
  {
    id: "appr-04",
    slug: "industrial-maintenance-apprentice",
    title: "Industrial Machinery Maintenance Apprentice",
    type: "apprenticeship",
    department: "Plant Maintenance & Machine Testing",
    location: "Vadodara, Gujarat, India",
    employmentType: "Apprenticeship",
    experience: "ITI / Diploma Trainee",
    duration: "1 Year",
    stipendOrBenefits: "Full Apprenticeship Stipend + Protective Equipment Kit",
    mentorSupport: "Maintenance Superintendent",
    certification: "Plant Maintenance & Machinery Overhaul Certificate",
    shortDescription:
      "Gain extensive hands-on experience in preventive maintenance, bearing lubrication, pneumatic servicing, and machinery overhaul.",
    description:
      "Learn the art and engineering of machinery uptime. As an Industrial Maintenance Apprentice, you will support internal test bays and customer overhaul programs, learning preventive maintenance schedules, gearbox lubrication, belt tensioning, pneumatic cylinder seal replacement, and sensor alignment.",
    image: "/images/careers/manufacturing-career.jpg",
    postedDate: "20 August 2026",
    applicationDeadline: "Open Until Filled",
    eligibility: [
      "ITI Certificate in Millwright Fitter / Mechanic or Diploma in Mechanical Engineering.",
      "Knowledge of basic machine maintenance principles, lubrication grades, and mechanical fasteners.",
      "Disciplined, meticulous attitude toward equipment care and preventative routines.",
    ],
    responsibilities: [
      "Execute scheduled lubrication, oil changes, and grease replenishment on test-run packaging lines.",
      "Inspect conveyor chains, sprockets, timing belts, and replace worn seals and pneumatic packings.",
      "Log operating parameters (motor temperatures, vibration levels, pneumatic pressures) during endurance runs.",
      "Assist in disassembling and overhauling return-to-base machines and refurbished equipment.",
      "Maintain clean maintenance bays, spare parts bins, and inspection tools.",
    ],
    requirements: [
      "Good mechanical troubleshooting mindset.",
      "Punctuality, safety awareness, and willingness to learn complex automated machinery.",
    ],
    skills: [
      "Preventive Maintenance",
      "Bearing Lubrication",
      "Pneumatic Cylinder Servicing",
      "Belt Tensioning",
      "Vibration Monitoring",
    ],
    selectionProcess: [
      "Certificate Review",
      "Basic Mechanical Overhaul Assessment",
      "Interview with Maintenance Superintendent",
      "Final Selection",
    ],
    isActive: true,
  },
];

// Query Helpers
export function getAllCareers(): CareerOpportunity[] {
  return careerOpportunities.filter((c) => c.isActive);
}

export function getCareersByType(type: CareerType): CareerOpportunity[] {
  return careerOpportunities.filter((c) => c.isActive && c.type === type);
}

export function getCategoryBySlug(slug: string): CareerCategoryInfo | undefined {
  return careerCategories.find((cat) => cat.slug === slug);
}

export function typeToCategorySlug(type: CareerType): CareerCategorySlug {
  switch (type) {
    case "job":
      return "jobs";
    case "internship":
      return "internships";
    case "apprenticeship":
      return "apprenticeships";
  }
}

export function categorySlugToType(slug: string): CareerType | null {
  switch (slug) {
    case "jobs":
      return "job";
    case "internships":
      return "internship";
    case "apprenticeships":
      return "apprenticeship";
    default:
      return null;
  }
}

export function getCareerBySlug(
  typeSlug: string,
  opportunitySlug: string
): CareerOpportunity | undefined {
  const type = categorySlugToType(typeSlug);
  if (!type) return undefined;
  return careerOpportunities.find(
    (c) => c.isActive && c.type === type && c.slug === opportunitySlug
  );
}

export function getFeaturedCareers(limit: number = 3): CareerOpportunity[] {
  return careerOpportunities.filter((c) => c.isActive).slice(0, limit);
}

export function getCareerCounts(): {
  jobs: number;
  internships: number;
  apprenticeships: number;
  total: number;
} {
  const jobs = careerOpportunities.filter(
    (c) => c.isActive && c.type === "job"
  ).length;
  const internships = careerOpportunities.filter(
    (c) => c.isActive && c.type === "internship"
  ).length;
  const apprenticeships = careerOpportunities.filter(
    (c) => c.isActive && c.type === "apprenticeship"
  ).length;

  return {
    jobs,
    internships,
    apprenticeships,
    total: jobs + internships + apprenticeships,
  };
}
