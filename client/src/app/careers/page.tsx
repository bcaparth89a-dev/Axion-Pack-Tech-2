import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerHero from "@/components/careers/CareerHero";
import CareerListing from "@/components/careers/CareerListing";
import { getAllCareers, careerCategories, getCareerCounts } from "@/lib/api/careers";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Careers & Opportunities | Axion PackTech Industrial Packaging",
  description:
    "Explore career opportunities, engineering internships, and technical apprenticeships at Axion PackTech. Build your career in packaging automation and manufacturing.",
};

const whyWorkWithUs = [
  {
    icon: "🚀",
    title: "Career Growth",
    description:
      "Structured progression pathways, performance recognition, and opportunities to lead high-impact engineering projects across India and international markets.",
  },
  {
    icon: "⚙️",
    title: "Real Engineering Experience",
    description:
      "Work directly with industrial machinery, automated packaging lines, high-speed robotics, servo drives, and precision manufacturing systems.",
  },
  {
    icon: "🤝",
    title: "Collaborative Environment",
    description:
      "A culture of mutual respect, open knowledge exchange, and direct mentorship from industry-leading mechanical and automation specialists.",
  },
  {
    icon: "🧠",
    title: "Continuous Learning",
    description:
      "Ongoing technical training, shopfloor exposure, design workshops, and practical problem-solving on live customer manufacturing challenges.",
  },
];

export default async function CareersPage() {
  const allOpportunities = await getAllCareers();
  const counts = await getCareerCounts();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Sticky Header Navigation */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Hero Header */}
      <CareerHero />

      {/* 3 Main Career Categories Gateway Section */}
      <section className="py-14 sm:py-20 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 font-mono">
              OPPORTUNITY PATHWAYS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              Choose Your Career Track
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you are an experienced engineering professional, a university graduate,
              or an aspiring technician, Axion PackTech offers specialized pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {careerCategories.map((cat) => {
              const count =
                cat.slug === "jobs"
                  ? `${counts.jobs} Jobs Available`
                  : cat.slug === "internships"
                  ? `${counts.internships} Programs Open`
                  : `${counts.apprenticeships} Tracks Open`;

              return (
                <div
                  key={cat.slug}
                  className="group flex flex-col rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-sky-300"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-800">
                    <CmsImage
                      src={cat.image}
                      alt={cat.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-md text-lg shadow-sm">
                        {cat.icon}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="rounded-md bg-amber-400 px-2.5 py-0.5 text-xs font-black text-slate-950 shadow-sm">
                        {count}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                      {cat.shortDescription}
                    </p>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        href={`/careers/${cat.slug}`}
                        className="inline-flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 group-hover:bg-brand-orange active:scale-[0.98]"
                      >
                        <span>Explore {cat.title}</span>
                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Work With Axion PackTech */}
      <section id="why-axion" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 font-mono mb-2">
              WHY JOIN US
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Build Your Career at Axion PackTech?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              We engineer advanced automated packaging systems that power global manufacturing plants.
              Here is what defines our workplace culture and professional experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {whyWorkWithUs.map((pillar, i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-50 border border-slate-200/80 p-6 sm:p-7 transition-all duration-200 hover:bg-white hover:border-sky-300 hover:shadow-lg"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-2xl shadow-inner mb-4">
                  {pillar.icon}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Opportunities Listing Section */}
      <section id="opportunities" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-600 font-mono mb-1">
              CURRENT VACANCIES
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore All Open Opportunities
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Search by title, department, or career category and submit your application online.
            </p>
          </div>

          {/* Interactive Career Listing with Search & Filters */}
          <CareerListing initialOpportunities={allOpportunities} />
        </div>
      </section>

      {/* Spontaneous Application CTA */}
      <section className="bg-[#061527] text-white py-14 sm:py-18 border-t border-sky-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            GENERAL TALENT POOL
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Don&apos;t See the Exact Role You&apos;re Looking For?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            We are always on the lookout for talented mechanical design engineers, PLC automation
            programmers, shopfloor technicians, and industrial sales professionals.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95"
            >
              <span>Submit General Inquiry</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
