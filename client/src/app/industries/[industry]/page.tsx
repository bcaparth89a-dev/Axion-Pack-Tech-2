import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getIndustries, getIndustryBySlug } from "@/lib/api/industries";
import { ProductCategory } from "@/data/products";

export const revalidate = 300;
export const dynamicParams = true;

interface IndustryPageProps {
  params: Promise<{
    industry: string;
  }>;
}

export async function generateStaticParams() {
  const industries = await getIndustries();
  return industries.map((ind) => ({
    industry: ind.slug,
  }));
}

export async function generateMetadata({
  params,
}: IndustryPageProps): Promise<Metadata> {
  const { industry: industrySlug } = await params;
  const industry = await getIndustryBySlug(industrySlug);

  if (!industry) {
    return {
      title: "Industry Not Found | AXION PackTech",
    };
  }

  const seo = (industry as unknown as { seo?: { metaTitle?: string; metaDescription?: string } }).seo;
  const metaTitle = seo?.metaTitle || `${industry.title} Packaging Solutions | AXION PackTech`;
  const metaDescription = seo?.metaDescription || industry.shortDescription || industry.description;

  return {
    title: metaTitle,
    description: metaDescription,
  };
}


export default async function IndustryDetailPage({
  params,
}: IndustryPageProps) {
  const { industry: industrySlug } = await params;
  const industry = await getIndustryBySlug(industrySlug);

  if (!industry) {
    notFound();
  }

  const recommendedCategories: ProductCategory[] = [];

  const whyChooseReasons = [
    {
      title: "Engineering Expertise",
      desc: "Deep domain knowledge in mechatronics, PLC automation, and industrial powder and bulk material handling.",
      icon: "⚙️",
    },
    {
      title: "Customized Solutions",
      desc: "Bespoke machinery configurations tailored to your bulk density, factory footprints, and target cycle speeds.",
      icon: "📐",
    },
    {
      title: "Reliable Technology",
      desc: "Built with heavy-duty structural steel, top-tier components, and 24/7 continuous duty cycle resilience.",
      icon: "🛡️",
    },
    {
      title: "Integrated Systems",
      desc: "Turnkey line synchronizations linking upstream processing, filling, stitching, case packing, and conveyors.",
      icon: "🔄",
    },
    {
      title: "Industry-Focused Approach",
      desc: "Solutions tailored to specific sanitary, dust-containment, hazardous-area, and regulatory mandates.",
      icon: "🎯",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* Industry Hero Section */}
        <section className="relative min-h-[50vh] sm:min-h-[55vh] flex items-center bg-[#061527] text-white overflow-hidden">
          {/* Background Industry Hero Image */}
          <div className="absolute inset-0 z-0">
            <CmsImage
              src={industry.heroImage || industry.image}
              alt={industry.title}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#061527]/95 via-[#0B1E36]/85 to-[#061527]/90" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#061527] to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-20 w-full">
            {/* Breadcrumb */}
            <nav
              className="flex items-center gap-2 text-xs font-mono text-slate-300 mb-6"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/industries"
                className="hover:text-white transition-colors"
              >
                Industries
              </Link>
              <span>/</span>
              <span className="text-sky-400 font-semibold">
                {industry.title}
              </span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/80 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
                <span className="text-sm">{industry.icon}</span>
                <span>Industrial Sector</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {industry.title} Solutions
              </h1>

              <div className="h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-medium">
                {industry.heroSubtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Sections Container */}
        <div className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-20">
          {/* 1. Industry Overview */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                Industry Overview
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Engineered for {industry.title} Operational Excellence
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                {industry.description}
              </p>
            </div>
          </section>

          {/* 2. Key Industry Challenges */}
          <section className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-wider">
                Operating Realities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Key Industry Challenges
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Common production bottlenecks and environmental demands faced by {industry.title.toLowerCase()} processors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industry.challenges.map((challenge, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:border-sky-300"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-0.5">
                    !
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {challenge}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 3. AXION PackTech Engineered Solutions */}
          <section className="space-y-6">
            <div className="pb-3 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
                Engineered Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                AXION PackTech Solutions for {industry.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Targeted automation machinery designed to resolve {industry.title.toLowerCase()} operational hurdles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industry.solutions.map((sol, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 transition duration-200 hover:border-sky-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      ✓
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {sol.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
                    {sol.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Recommended Equipment / Product Categories (Direct cross-links to /products/[category]) */}
          {recommendedCategories.length > 0 && (
            <section className="space-y-6">
              <div className="pb-3 border-b border-slate-200">
                <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
                  Equipment Portfolio
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Recommended AXION PackTech Equipment
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Machinery divisions optimized for {industry.title.toLowerCase()} handling, weighing, and packaging workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products/${cat.slug}`}
                    className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-sky-300"
                  >
                    <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                      <CmsImage
                        src={cat.image}
                        alt={cat.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-[10px] font-mono text-sky-400 uppercase font-semibold">
                          {cat.products.length} Machines Available
                        </span>
                        <h4 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                          {cat.title}
                        </h4>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {cat.shortDescription}
                      </p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-brand-orange transition-colors">
                        <span>Explore Machinery Division</span>
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 5. Key Operational Benefits */}
          <section className="rounded-3xl bg-[#081B33] text-white p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider">
                Measurable Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Key Operational Benefits
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industry.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-slate-700/60"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white text-xs font-bold mt-0.5">
                    ✓
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Why Choose AXION PackTech */}
          <section className="space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold text-sky-700 uppercase tracking-wider">
                The AXION Standard
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Why Choose AXION PackTech?
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-brand-orange" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyChooseReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 transition duration-200 hover:border-sky-300 hover:shadow-md"
                >
                  <span className="text-2xl block">{reason.icon}</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {reason.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {reason.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Final Call to Action */}
          <section className="rounded-3xl bg-gradient-to-r from-[#061527] to-[#0A2244] p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 border border-sky-900/40">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-block rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-semibold text-brand-orange border border-brand-orange/30">
                Industry-Specific Advisory
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Looking for a Solution for Your Industry?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Talk with our engineering team to discuss your packaging, processing and automation requirements.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs px-6 py-3.5 shadow-lg transition-all active:scale-95 whitespace-nowrap"
              >
                Contact Our Team →
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 font-bold text-xs px-6 py-3.5 shadow transition-all active:scale-95 whitespace-nowrap"
              >
                Explore Products →
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
