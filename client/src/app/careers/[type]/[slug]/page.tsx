import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CareerDetails from "@/components/careers/CareerDetails";
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
      title: "Opportunity Not Found | Axion PackTech Careers",
    };
  }

  return {
    title: `${opportunity.title} | Axion PackTech Careers`,
    description: opportunity.shortDescription,
    openGraph: {
      title: `${opportunity.title} | Axion PackTech`,
      description: opportunity.shortDescription,
      images: [{ url: opportunity.image }],
    },
  };
}

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { type, slug } = await params;
  const opportunity = await getCareerBySlug(type, slug);

  if (!opportunity) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      <main className="flex-1">
        <CareerDetails opportunity={opportunity} />
      </main>

      <Footer />
    </div>
  );
}
