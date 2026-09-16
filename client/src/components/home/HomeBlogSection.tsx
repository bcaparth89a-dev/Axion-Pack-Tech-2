import Link from "next/link";
import { getFeaturedBlogs, getAllBlogs } from "@/lib/api/blogs";
import BlogCard from "@/components/blog/BlogCard";

export default async function HomeBlogSection() {
  const featured = await getFeaturedBlogs(3);
  const displayPosts =
    featured.length >= 3 ? featured : (await getAllBlogs()).slice(0, 3);

  // Strict zero empty space guard: return null if no posts exist
  if (!displayPosts || !Array.isArray(displayPosts) || displayPosts.length === 0) {
    return null;
  }

  const gridClass =
    displayPosts.length === 1
      ? "grid-cols-1 max-w-3xl mx-auto"
      : displayPosts.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="relative w-full bg-[#F8FAFC] text-slate-800 py-20 sm:py-28 border-t border-slate-200 overflow-hidden">
      {/* Subtle background industrial pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-grid-blueprint-dark" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-slate-200">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-800 border border-sky-300 shadow-sm mb-3">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              <span>TECHNICAL BLOG &amp; PACKAGING INSIGHTS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B192C] leading-tight">
              Engineering Guides &amp;{" "}
              <span className="text-sky-600">
                Industry Best Practices
              </span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Technical whitepapers, OEE optimization guides, sanitary design compliance standards,
              and automation technology reviews authored by AXION application specialists.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#061527] hover:bg-sky-950 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>Explore All Technical Guides</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Featured Blog Cards (94% Wide Adaptive Grid) */}
        <div className={`grid ${gridClass} gap-6 sm:gap-8 mt-12`}>
          {displayPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
