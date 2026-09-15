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
      ? "grid-cols-1 max-w-2xl mx-auto"
      : displayPosts.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="relative w-full bg-slate-100 text-slate-800 py-16 sm:py-24 border-t border-slate-200 overflow-hidden">
      {/* Subtle background industrial pattern */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-950 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-4">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <span>OUR BLOG</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Insights from the World of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-700 via-sky-600 to-amber-600">
              Packaging &amp; Automation
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto font-light">
            Explore expert insights, industrial trends, packaging technologies, automation solutions,
            and practical knowledge from the AXION PackTech team.
          </p>
        </div>

        {/* Featured Blog Cards (Adaptive Grid) */}
        <div className={`grid ${gridClass} gap-6 sm:gap-8`}>
          {displayPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2.5 rounded-xl bg-slate-900 px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all duration-200 hover:bg-brand-orange hover:shadow-orange-600/30 active:scale-95"
          >
            <span>Explore All Articles</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
