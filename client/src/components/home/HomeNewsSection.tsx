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
      ? "grid-cols-1 max-w-2xl mx-auto"
      : latestNews.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="relative w-full bg-slate-50/70 py-20 sm:py-28 text-slate-800 border-b border-slate-200/80">
      {/* Background Blueprint Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0B192C 1px, transparent 1px), linear-gradient(90deg, #0B192C 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* ====================================================
            HEADER: Badge, Title & Editorial Description
        ==================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            LATEST UPDATES
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            News From <span className="text-[#0B192C]">Axion PackTech</span>
          </h2>

          <div className="h-1 w-16 rounded-full bg-[#0B192C] mx-auto mt-4" />

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            Stay updated with the latest company developments, engineering innovations,
            projects, industry insights, events, and technology from Axion PackTech.
          </p>
        </div>

        {/* ====================================================
            HOME PAGE NEWS GRID: Adaptive Layout
        ==================================================== */}
        <div className={`mt-14 grid ${gridClass} gap-6 lg:gap-8`}>
          {latestNews.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>

        {/* ====================================================
            BOTTOM ACTION: VIEW ALL NEWS BUTTON
        ==================================================== */}
        <div className="mt-14 text-center">
          <Link
            href="/news"
            className="group inline-flex items-center gap-3 rounded-xl bg-[#0B192C] px-8 py-4 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-950 hover:shadow-xl active:scale-95 border border-sky-500/20"
          >
            <span className="tracking-wide">View All News</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
