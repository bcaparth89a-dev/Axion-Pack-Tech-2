import Link from "next/link";
import { NewsArticle } from "@/data/news";
import CmsImage from "@/components/common/CmsImage";

interface NewsCardProps {
  article: NewsArticle;
  featured?: boolean;
  priority?: boolean;
}

export default function NewsCard({ article, featured = false, priority = false }: NewsCardProps) {
  const isVideo = Boolean(article.video || article.videoUrl);
  const articleUrl = `/news/${article.categorySlug}/${article.slug}`;
  const categoryUrl = `/news/${article.categorySlug}`;
  const displayDate = article.publishedDate;

  if (featured) {
    return (
      <article className="group relative flex flex-col lg:flex-row overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/60 hover:shadow-2xl">
        {/* Left / Top Featured Image */}
        <div className="relative aspect-[16/10] lg:aspect-auto lg:w-7/12 w-full overflow-hidden bg-slate-900">
          <Link href={articleUrl} className="block relative w-full h-full min-h-[260px] lg:min-h-[380px]">
            <CmsImage
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#061527]/70 via-transparent to-transparent lg:hidden" />
          </Link>

          {/* Featured Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Featured Story
            </span>
            {isVideo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white border border-white/20">
                <svg className="w-3 h-3 text-brand-orange fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Video
              </span>
            )}
          </div>
        </div>

        {/* Right / Bottom Content */}
        <div className="flex flex-1 flex-col justify-between p-7 sm:p-9 lg:p-10">
          <div className="space-y-4">
            {/* Category & Date */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <Link
                href={categoryUrl}
                className="rounded-md bg-sky-50 px-2.5 py-1 text-sky-800 uppercase tracking-wider border border-sky-200/80 hover:bg-sky-100 hover:text-sky-950 transition-colors"
              >
                {article.category}
              </Link>
              <span className="text-slate-400">•</span>
              <time className="text-slate-500">{displayDate}</time>
              {article.readTime && (
                <>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{article.readTime}</span>
                </>
              )}
            </div>

            {/* Headline */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] leading-snug tracking-tight group-hover:text-sky-700 transition-colors">
              <Link href={articleUrl} className="hover:underline decoration-brand-orange decoration-2 underline-offset-4">
                {article.title}
              </Link>
            </h3>

            {/* Excerpt */}
            <p className="text-base text-slate-600 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Action Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              href={articleUrl}
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 group-hover:text-brand-orange transition-colors"
            >
              <span>Read Full Story</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>

            {article.author && (
              <span className="text-xs text-slate-400 italic">By {article.author}</span>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/60 hover:shadow-xl">
      {/* Top Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <Link href={articleUrl} className="block relative w-full h-full">
          <CmsImage
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Category Pill Overlaid on top left */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <Link
            href={categoryUrl}
            className="inline-flex items-center rounded-md bg-white/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-900 shadow-sm border border-white/40 hover:bg-sky-50 transition-colors"
          >
            {article.category}
          </Link>
        </div>

        {/* Video Badge / Play Button Overlay */}
        {isVideo && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-md">
              <svg className="w-3 h-3 text-brand-orange fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Video
            </span>
          </div>
        )}

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
        <div className="space-y-3">
          {/* Date & Read Time */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <time>{displayDate}</time>
            {article.readTime && (
              <>
                <span>•</span>
                <span>{article.readTime}</span>
              </>
            )}
          </div>

          {/* Headline */}
          <h3 className="text-lg sm:text-xl font-bold text-[#0B192C] leading-snug tracking-tight group-hover:text-sky-700 transition-colors line-clamp-2">
            <Link href={articleUrl}>
              {article.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>
        </div>

        {/* Action Link */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={articleUrl}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-700 group-hover:text-brand-orange transition-colors"
          >
            <span>Read Full Story</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>

          <span className="text-[11px] text-slate-400 font-medium">AXION Media</span>
        </div>
      </div>
    </article>
  );
}
