import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/news/NewsCard";
import { getAllNews, getAllCategories } from "@/lib/api/news";

export const revalidate = 300;

export const metadata: Metadata = {

  title: "Latest from Axion PackTech | News & Media Center",
  description:
    "Discover the latest developments, innovations, projects, events, and industry insights from Axion PackTech.",
};

export default async function NewsOverviewPage() {
  const allNews = await getAllNews();
  const categories = await getAllCategories();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      {/* 2. Hero Header Section */}
      <section className="relative w-full bg-gradient-to-b from-[#0B1E36] via-[#091D38] to-[#061527] pt-24 pb-20 sm:pt-28 sm:pb-24 text-white -mt-20">
        {/* Subtle Background Blueprint Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-center pt-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 shadow-md">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            NEWS &amp; MEDIA
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Latest from Axion PackTech
          </h1>

          <div className="h-1 w-20 rounded-full bg-brand-orange mx-auto mt-5" />

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Discover the latest developments, innovations, projects, events, and industry
            insights from Axion PackTech.
          </p>
        </div>
      </section>

      {/* 3. Main Content: Category Navigation & Full News Feed */}
      <main className="flex-1 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-12">
          {/* Category Quick Navigation Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <Link
              href="/news"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-bold bg-[#0B192C] text-white shadow-sm transition-all"
            >
              All News
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/news/${cat.slug}`}
                className="group flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-sky-50 hover:text-sky-900 hover:border-sky-300 transition-all duration-200"
              >
                <span>{cat.icon}</span>
                <span>{cat.title}</span>
              </Link>
            ))}
          </div>

          {/* Section Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-4">
            <span className="font-medium">
              Displaying all <strong className="text-slate-900 font-bold">{allNews.length}</strong> official news updates &amp; articles
            </span>
            <span className="hidden sm:inline text-sky-700 font-semibold">
              Filter by category above for specialized releases
            </span>
          </div>

          {/* News Grid (3 Columns Desktop, 2 Columns Tablet, 1 Column Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {allNews.map((article) => (
              <NewsCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
