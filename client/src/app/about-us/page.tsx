import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AboutHero from "@/components/about/AboutHero";
import AboutInfo from "@/components/about/AboutInfo";
import WhyChooseUs from "@/components/about/WhyChooseUs";
import VisionMission from "@/components/about/VisionMission";
import ResponsibilitiesSection from "@/components/about/ResponsibilitiesSection";
import { getAboutPage } from "@/lib/api/pages";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getAboutPage();
  return {
    title:
      pageData?.seo?.metaTitle ||
      "About Us | AXION PackTech — Engineering Packaging Excellence",
    description:
      pageData?.seo?.metaDescription ||
      "Learn about AXION PackTech's engineering pedigree, packaging & bagging automation capabilities, vision, mission, core values, and corporate responsibilities.",
    keywords: pageData?.seo?.keywords,
    alternates: pageData?.seo?.canonicalUrl
      ? { canonical: pageData.seo.canonicalUrl }
      : undefined,
    openGraph: {
      title:
        pageData?.seo?.ogTitle ||
        pageData?.seo?.metaTitle ||
        "About Us | AXION PackTech",
      description:
        pageData?.seo?.ogDescription || pageData?.seo?.metaDescription,
      images: pageData?.seo?.ogImage ? [{ url: pageData.seo.ogImage }] : undefined,
    },
  };
}

export default async function AboutUsPage() {
  const pageData = await getAboutPage();

  const showHero = pageData.sections?.hero !== false;
  const showAboutInfo = pageData.sections?.aboutInfo !== false;
  const showWhyChooseUs = pageData.sections?.whyChooseUs !== false;
  const showVisionMission = pageData.sections?.visionMission !== false;
  const showResponsibilities = pageData.sections?.responsibilities !== false;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      {/* 2. Main Page Content (5 Major Sections with visibility control) */}
      <main className="flex-1">
        {/* Section 1: Company Hero & Apple-style Media Slider */}
        {showHero && (
          <AboutHero
            hero={pageData.hero}
            mediaSlider={pageData.mediaSlider}
            showMediaSlider={pageData.sections?.mediaSlider !== false}
          />
        )}

        {/* Section 2: About AXION PackTech (Brand Card & Capabilities) */}
        {showAboutInfo && <AboutInfo data={pageData.aboutInfo} />}

        {/* Section 3: Why Choose Axion PackTech (8 Feature Cards) */}
        {showWhyChooseUs && <WhyChooseUs data={pageData.whyChooseUsSection} />}

        {/* Section 4: Vision & Mission (Vision, Mission & Core Values Grid) */}
        {showVisionMission && <VisionMission data={pageData.visionMission} />}

        {/* Section 5: Our Responsibilities (Sustainability Image & Info) */}
        {showResponsibilities && (
          <ResponsibilitiesSection data={pageData.responsibilitiesSection} />
        )}
      </main>

      {/* 3. Responsive Industrial Footer */}
      <Footer />
    </div>
  );
}

