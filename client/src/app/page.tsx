import { Suspense } from "react";
import HomeHero from "@/components/home/HomeHero";
import CompanyIntroSection from "@/components/home/CompanyIntroSection";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import HomeIndustriesSection from "@/components/home/HomeIndustriesSection";
import CompanyStatsSection from "@/components/home/CompanyStatsSection";
import HomeServicesSection from "@/components/home/HomeServicesSection";
import HomeCareersSection from "@/components/home/HomeCareersSection";
import HomeBlogSection from "@/components/home/HomeBlogSection";
import HomeNewsSection from "@/components/home/HomeNewsSection";
import ContactSection from "@/components/contact/ContactSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionSkeleton from "@/components/common/SectionSkeleton";

// Enable Next.js ISR with a 5-minute cache TTL and on-demand revalidation
export const revalidate = 300;

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Home Page Exclusive Blue Hero Section (Above-the-fold, immediate) */}
      <HomeHero />

      {/* 2. Floating to Sticky Navbar: Positioned slightly above Hero bottom on desktop, clean top on mobile */}
      <div className="sticky top-0 lg:top-3 z-40 lg:-mt-24">
        <Navbar />
      </div>

      {/* 3. Second Section: Company Introduction Section (Above/near the fold, immediate) */}
      <CompanyIntroSection />

      {/* 4. Below-the-fold Sections: Streamed with Suspense skeletons */}
      <Suspense fallback={<SectionSkeleton dark cards={3} />}>
        <HomeProductsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <HomeIndustriesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={4} height="min-h-[250px]" />}>
        <CompanyStatsSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <HomeServicesSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <HomeCareersSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <HomeBlogSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton cards={3} />}>
        <HomeNewsSection />
      </Suspense>

      {/* Contact Section & Footer */}
      <ContactSection />
      <Footer />
    </div>
  );
}
