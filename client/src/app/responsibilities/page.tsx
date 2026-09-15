import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ResponsibilitiesHero from "@/components/responsibilities/ResponsibilitiesHero";
import CompanyVideoSection from "@/components/responsibilities/CompanyVideoSection";
import ResponsibilityIntro from "@/components/responsibilities/ResponsibilityIntro";
import SocialResponsibility from "@/components/responsibilities/SocialResponsibility";
import MarketResponsibility from "@/components/responsibilities/MarketResponsibility";
import EcologicalResponsibility from "@/components/responsibilities/EcologicalResponsibility";
import VisionSection from "@/components/responsibilities/VisionSection";
import ValuesSection from "@/components/responsibilities/ValuesSection";
import LeadershipQuote from "@/components/responsibilities/LeadershipQuote";

export const metadata: Metadata = {
  title: "Our Responsibilities | AXION PackTech — Engineering For a Better Tomorrow",
  description:
    "Explore AXION PackTech's corporate responsibilities across People, Market, and Environment. Discover our engineering vision, values, social impact, and sustainable packaging solutions.",
};

export default function ResponsibilitiesPage() {
  return (
    <div className="relative min-h-screen bg-white text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      {/* 2. Main Page Content: 9 Dedicated Sections */}
      <main className="flex-1">
        {/* Section 1: Hero Section */}
        <ResponsibilitiesHero />

        {/* Section 2: Company Video Section */}
        <CompanyVideoSection />

        {/* Section 3: Responsibility Introduction */}
        <ResponsibilityIntro />

        {/* Section 4: Social Responsibility (People & Culture) */}
        <SocialResponsibility />

        {/* Section 5: Responsibility in the Market (Quality & Integrity) */}
        <MarketResponsibility />

        {/* Section 6: Ecological Responsibility (Sustainability & Materials) */}
        <EcologicalResponsibility />

        {/* Section 7: Our Vision ("Fascinating Engineering. As One.") */}
        <VisionSection />

        {/* Section 8: Our Values (Familiar, Masterfully Crafted, Inspiring) */}
        <ValuesSection />

        {/* Section 9: Leadership / CEO Quote */}
        <LeadershipQuote />
      </main>

      {/* 3. Responsive Industrial Footer */}
      <Footer />
    </div>
  );
}
