import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RelatedNews from "@/components/news/RelatedNews";
import VideoPlayer from "@/components/common/VideoPlayer";
import {
  getNewsBySlug,
  getNewsCategoryBySlug,
  getRelatedNews,
} from "@/lib/api/news";

export const revalidate = 300;
export const dynamicParams = true;

interface NewsArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}


export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return {
      title: "News Article Not Found | AXION PackTech",
    };
  }

  return {
    title: `${article.title} | AXION PackTech News`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedDate,
      authors: article.author ? [article.author] : ["AXION PackTech"],
    },
  };
}

export default async function NewsArticleDetailPage({
  params,
}: NewsArticlePageProps) {
  const { category: categorySlug, slug } = await params;
  const article = await getNewsBySlug(slug);

  // Validate article exists and matches the category route
  if (!article || article.categorySlug !== categorySlug) {
    notFound();
  }

  const category = await getNewsCategoryBySlug(categorySlug);
  const relatedArticles = await getRelatedNews(article.slug, 3);
  const isVideo = Boolean(article.video || article.videoUrl);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      {/* 2. Main Article Content Container */}
      <main className="flex-1">
        {/* Article Header & Breadcrumbs */}
        <section className="relative w-full bg-gradient-to-b from-[#0B1E36] via-[#091D38] to-[#061527] pt-24 pb-16 sm:pt-28 sm:pb-20 text-white -mt-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <div className="relative mx-auto max-w-4xl px-6 sm:px-8 pt-8">
            {/* 1. Breadcrumbs */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6 flex-wrap"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/news" className="hover:text-white transition-colors">
                News
              </Link>
              <span>/</span>
              <Link
                href={`/news/${article.categorySlug}`}
                className="hover:text-white transition-colors"
              >
                {category ? category.title : article.category}
              </Link>
              <span>/</span>
              <span className="text-sky-300 truncate max-w-xs sm:max-w-md">
                {article.title}
              </span>
            </nav>

            {/* 2. Category Badge */}
            <div className="flex items-center gap-3">
              <Link
                href={`/news/${article.categorySlug}`}
                className="inline-flex items-center rounded-md bg-sky-500/20 border border-sky-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300 hover:bg-sky-500/30 transition-colors"
              >
                {article.category}
              </Link>
              {article.readTime && (
                <span className="text-xs text-slate-300 font-medium">
                  • {article.readTime}
                </span>
              )}
            </div>

            {/* 3. Large Headline */}
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-tight">
              {article.title}
            </h1>

            {/* 4. News Metadata Bar */}
            <div className="mt-6 pt-6 border-t border-sky-900/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-6">
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase tracking-wider">
                    Published
                  </span>
                  <span className="font-medium text-white">
                    {article.publishedDate}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase tracking-wider">
                    Source
                  </span>
                  <span className="font-medium text-white">
                    {article.author || "AXION PackTech Editorial Desk"}
                  </span>
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-sky-950/80 px-2.5 py-0.5 text-[10px] font-medium text-sky-300 border border-sky-800/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Hero Media Section */}
        <section className="relative -mt-8 sm:-mt-12 mx-auto max-w-4xl px-6 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-900 shadow-2xl">
            <div className="relative aspect-[16/9] w-full">
              <CmsImage
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </section>

        {/* 6. Article Body */}
        <article className="mx-auto max-w-4xl px-6 sm:px-8 py-12 sm:py-16">
          {/* Lead Paragraph */}
          <div className="rounded-2xl bg-sky-50/70 border border-sky-100 p-6 sm:p-8 mb-10">
            <p className="text-lg sm:text-xl font-medium text-slate-800 leading-relaxed">
              {article.content.lead}
            </p>
          </div>

          {/* Video Section (if article has video) */}
          {isVideo && (
            <div className="my-10 rounded-3xl overflow-hidden border border-slate-200/90 bg-black shadow-xl">
              <div className="bg-[#061527] px-6 py-4 border-b border-sky-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    WATCH THE UPDATE
                  </span>
                </div>
                <span className="text-xs text-sky-400">1080p High Definition</span>
              </div>

              <VideoPlayer
                url={article.video?.url || article.videoUrl}
                embedUrl={article.video?.embedUrl}
                poster={article.video?.posterUrl || article.image}
                title={article.title}
                className="w-full h-full object-contain"
                containerClassName="rounded-none border-0 shadow-none"
              />
            </div>
          )}

          {/* Structured Content Sections */}
          <div className="space-y-10 text-base sm:text-lg text-slate-700 leading-relaxed">
            {article.content.sections.map((sec, idx) => (
              <div key={idx} className="space-y-4">
                {sec.heading && (
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight pt-4">
                    {sec.heading}
                  </h2>
                )}

                {sec.paragraphs.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}

                {sec.bullets && sec.bullets.length > 0 && (
                  <ul className="my-4 space-y-2.5 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
                    {sec.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-3 text-sm sm:text-base text-slate-700"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs mt-0.5 font-bold">
                          ✓
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Pull Quote */}
            {article.content.quote && (
              <blockquote className="my-10 border-l-4 border-brand-orange bg-white p-6 sm:p-8 rounded-r-2xl shadow-sm border-y border-r border-slate-200/60">
                <p className="text-lg sm:text-xl italic font-serif text-slate-800 leading-relaxed">
                  &ldquo;{article.content.quote.text}&rdquo;
                </p>
                <footer className="mt-4 text-xs sm:text-sm font-semibold text-slate-900">
                  <span>{article.content.quote.author}</span>
                  <span className="block text-xs font-normal text-slate-500 mt-0.5">
                    {article.content.quote.role}
                  </span>
                </footer>
              </blockquote>
            )}
          </div>

          {/* Social Share / Return Links */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-4">
            <Link
              href={`/news/${article.categorySlug}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-brand-orange transition-colors"
            >
              <span>← Back to {category ? category.title : "Category"}</span>
            </Link>

            <Link
              href="/news"
              className="text-xs font-semibold text-slate-500 hover:text-sky-800 transition-colors"
            >
              All News &amp; Media Hub →
            </Link>
          </div>
        </article>

        {/* 7. Bottom Packaging Solution CTA */}
        <section className="relative w-full bg-gradient-to-br from-[#0B1E36] via-[#091D38] to-[#061527] py-16 text-white border-t border-sky-900/40">
          <div className="relative mx-auto max-w-4xl px-6 sm:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-300 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              ENGINEERING CONSULTATION
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Looking for a Packaging Solution?
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Speak with the Axion PackTech team to discuss your production requirements
              and find the right engineering solution for your operation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition-all hover:bg-brand-orange-light hover:-translate-y-0.5 active:scale-95"
              >
                Consult Our Experts
              </Link>
              <Link
                href="/products"
                className="w-full sm:w-auto rounded-xl bg-white/10 border border-white/20 px-8 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </section>

        {/* 8. Related News Articles */}
        <RelatedNews articles={relatedArticles} />
      </main>

      {/* 9. Footer */}
      <Footer />
    </div>
  );
}
