import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerApplicationForm from "@/components/careers/CareerApplicationForm";
import {
  getAllCareers,
  getCareerBySlug,
  typeToCategorySlug,
} from "@/lib/api/careers";

interface PageProps {
  params: Promise<{
    type: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const opportunities = await getAllCareers();
  return opportunities.map((opp) => ({
    type: typeToCategorySlug(opp.type),
    slug: opp.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const opportunity = await getCareerBySlug(type, slug);

  if (!opportunity) {
    return {
      title: "Apply for Opportunity | Axion PackTech Careers",
    };
  }

  return {
    title: `Apply: ${opportunity.title} | Axion PackTech Careers`,
    description: `Submit your online candidate application for ${opportunity.title} at Axion PackTech Vadodara.`,
  };
}

export default async function OpportunityApplyPage({ params }: PageProps) {
  const { type, slug } = await params;
  const opportunity = await getCareerBySlug(type, slug);

  if (!opportunity) {
    notFound();
  }

  const categorySlug = typeToCategorySlug(opportunity.type);
  const detailUrl = `/careers/${categorySlug}/${opportunity.slug}`;

  const getCategoryLabel = () => {
    switch (opportunity.type) {
      case "job":
        return "Jobs";
      case "internship":
        return "Internships";
      case "apprenticeship":
        return "Apprenticeships";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/careers" className="hover:text-white transition-colors">
            Careers
          </Link>
          <span className="text-slate-600">/</span>
          <Link
            href={`/careers/${categorySlug}`}
            className="hover:text-white transition-colors capitalize"
          >
            {getCategoryLabel()}
          </Link>
          <span className="text-slate-600">/</span>
          <Link
            href={detailUrl}
            className="hover:text-white transition-colors truncate max-w-xs"
          >
            {opportunity.title}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-brand-orange font-bold">Apply</span>
        </div>
      </div>

      {/* Header Info Strip */}
      <section className="bg-slate-900 text-white py-8 border-b border-sky-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono font-bold text-sky-400 uppercase">
              Position Application
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {opportunity.title}
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {opportunity.department} • {opportunity.location}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={detailUrl}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10"
            >
              <span>← View Job Specifications</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Application Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full">
        <CareerApplicationForm opportunity={opportunity} />
      </main>

      <Footer />
    </div>
  );
}
