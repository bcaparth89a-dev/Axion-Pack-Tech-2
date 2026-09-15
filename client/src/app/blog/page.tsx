import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogHero from "@/components/blog/BlogHero";
import BlogCategoryFilter from "@/components/blog/BlogCategoryFilter";
import { getAllBlogs } from "@/lib/api/blogs";

export const revalidate = 300;

export const metadata: Metadata = {

  title: "Blog & Insights | Industrial Packaging & Automation | Axion PackTech",
  description:
    "Explore engineering articles, packaging technology guides, automation trends, and technical best practices published by the AXION PackTech engineering team.",
};

export default async function BlogHubPage() {
  const allPosts = await getAllBlogs();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Sticky Header Navigation */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Strip */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sky-300 font-semibold">Blog &amp; Insights</span>
        </div>
      </div>

      {/* Hero Section */}
      <BlogHero />

      {/* Main Blog Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <BlogCategoryFilter initialPosts={allPosts} />
      </main>

      {/* Bottom Consultation Banner */}
      <section className="bg-[#061527] text-white py-14 sm:py-18 border-t border-sky-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            ENGINEERING CONSULTATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Looking for Customized Packaging Machinery?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Our engineering team designs turnkey bagging, sealing, case packaging, and automated
            conveyor lines tailored to your plant throughput.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95"
            >
              <span>Consult with Our Engineers</span>
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
