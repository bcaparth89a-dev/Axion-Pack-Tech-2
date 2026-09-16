import Link from "next/link";
import { getFeaturedNews } from "@/lib/api/news";
import NewsCard from "@/components/news/NewsCard";

export default async function HomeNewsSection() {
  const latestNews = await getFeaturedNews(3);

  // Strict zero empty space guard: return null if no news articles exist
  if (!latestNews || !Array.isArray(latestNews) || latestNews.length === 0) {
    return null;
  }

  const gridClass =
    latestNews.length === 1
      ? "grid-cols-1 max-w-3xl mx-auto"
      : latestNews.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="relative w-full bg-[#040911] py-20 sm:py-28 text-white border-b border-slate-800/80">
      {/* Background Blueprint Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-grid-blueprint" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-slate-800/80">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/80 px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-300 shadow-sm mb-3">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              <span>OFFICIAL ANNOUNCEMENTS &amp; MEDIA</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Latest from <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-white">AXION PackTech</span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              Stay updated with product releases, plant commissioning milestones, trade exhibition showcases,
              and official corporate developments.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>View All News &amp; Press</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 94% Wide News Grid */}
        <div className={`mt-12 grid ${gridClass} gap-6 lg:gap-8`}>
          {latestNews.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
