import Link from "next/link";
import { CmsImage } from "@/components/common/CmsImage";
import { NewsArticle } from "@/data/news";

interface RelatedNewsProps {
  articles: NewsArticle[];
}

export default function RelatedNews({ articles }: RelatedNewsProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="relative w-full border-t border-slate-200/80 bg-slate-50/70 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              RELATED STORIES
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Related News &amp; Updates
            </h2>
          </div>

          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-brand-orange transition-colors"
          >
            <span>View All News</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => {
            const isVideo = Boolean(article.video || article.videoUrl);
            const articleUrl = `/news/${article.categorySlug}/${article.slug}`;

            return (
              <article
                key={article.slug}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/60 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <Link href={articleUrl} className="block relative w-full h-full">
                    <CmsImage
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </Link>

                  <div className="absolute top-3 left-3 z-10">
                    <Link
                      href={`/news/${article.categorySlug}`}
                      className="rounded-md bg-white/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-900 shadow-sm border border-white/40 hover:bg-sky-50 transition-colors"
                    >
                      {article.category}
                    </Link>
                  </div>

                  {isVideo && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        ▶ Video
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-medium">
                      {article.publishedDate}
                    </p>
                    <h3 className="text-base sm:text-lg font-bold text-[#0B192C] leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
                      <Link href={articleUrl}>{article.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href={articleUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 group-hover:text-brand-orange transition-colors"
                    >
                      <span>Read Full Story</span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
