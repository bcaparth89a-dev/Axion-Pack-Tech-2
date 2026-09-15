import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerCard from "@/components/careers/CareerCard";
import { getCareersByType, getCareerCategoryInfo } from "@/lib/api/careers";

export const metadata: Metadata = {
  title: "Internship Opportunities | Axion PackTech Careers",
  description:
    "Explore engineering and industrial automation internships at Axion PackTech. Practical hands-on training, senior mentorship, and live machinery projects in Vadodara.",
};

export default async function InternshipsPage() {
  const internships = await getCareersByType("internship");
  const categoryInfo = getCareerCategoryInfo("internships");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/careers" className="hover:text-white transition-colors">
            Careers
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-300 font-semibold">Internships</span>
        </div>
      </div>

      {/* Category Hero Header */}
      <section className="bg-[#061527] text-white py-14 sm:py-20 border-b border-sky-900/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-4 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-800/60 uppercase tracking-wider mb-4">
            <span>🎓</span>
            <span>{categoryInfo?.badge || "Students & Recent Graduates"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {categoryInfo?.title || "Internship Opportunities"}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {categoryInfo?.description ||
              "Gain practical industry experience, work alongside experienced professionals, and develop real-world engineering and technical skills."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="rounded-md bg-white/10 px-3 py-1 border border-white/10">
              {internships.length} Internship Programs Open
            </span>
            <span>•</span>
            <span>3–6 Months Duration</span>
            <span>•</span>
            <span>Stipend + Completion Certificate</span>
          </div>
        </div>
      </section>

      {/* Internship Opportunities Grid */}
      <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Available Internship Programs
          </h2>
          <Link
            href="/careers"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors"
          >
            ← View All Career Tracks
          </Link>
        </div>

        {internships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {internships.map((internship) => (
              <CareerCard key={internship.id} opportunity={internship} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              No Opportunities Available Right Now
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              We currently do not have an open position in this category. Please check
              back later for new opportunities.
            </p>
            <Link
              href="/careers"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-600"
            >
              View All Careers
            </Link>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
