import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getIndustries } from "@/lib/api/industries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Industries We Serve | AXION PackTech Packaging Solutions",
  description:
    "AXION PackTech delivers reliable packaging, processing, material handling and automation solutions designed to meet the challenges of diverse manufacturing industries.",
};


export default async function IndustriesOverviewPage() {
  const industriesData = await getIndustries();
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 bg-[#061527] text-white overflow-hidden border-b border-slate-800">
          {/* Engineering Grid Accent */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
              Industries We Serve
            </div>

            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Engineering Solutions{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
                Across Industries
              </span>
            </h1>

            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              AXION PackTech delivers reliable packaging, processing, material handling
              and automation solutions designed to meet the challenges of diverse industries.
            </p>
          </div>
        </section>

        {/* 8 Industries Grid: 4 cols on desktop, 2 cols on tablet, 1 on mobile */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
                Specialized Manufacturing Sectors
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Customized Industrial Engineering
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              Showing all {industriesData.length} sectors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-10">
            {industriesData.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-sky-300"
              >
                {/* Industry Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                  <CmsImage
                    src={ind.image}
                    alt={ind.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />

                  {/* Icon Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 backdrop-blur-md text-base shadow border border-white/60 group-hover:scale-110 transition-transform">
                      {ind.icon}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                      {ind.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {ind.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-brand-orange transition-colors">
                    <span>Explore Industry</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Custom Advisory Banner */}
          <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#061527] to-[#0B1E36] p-8 sm:p-12 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-wider font-semibold">
                Industry-Specific Advisory
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">
                Operating in a Specialized Manufacturing Sector?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Our application engineers conduct granular material evaluations and configure bespoke automated handling, weighing, and packaging workflows.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs px-6 py-3.5 shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              Consult with an Engineer →
            </Link>
          </div>
        </section>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
