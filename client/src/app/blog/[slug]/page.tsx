import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RelatedBlogs from "@/components/blog/RelatedBlogs";
import {
  getBlogBySlug,
  getRelatedBlogs,
  getBlogCategoryBySlug,
} from "@/lib/api/blogs";
import { getSafeImageSrc } from "@/lib/utils/mediaUrl";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Axion PackTech Blog",
    };
  }

  return {
    title: `${post.title} | AXION PackTech`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: `${post.title} | AXION PackTech`,
      description: post.excerpt,
      images: [{ url: post.image }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const category = await getBlogCategoryBySlug(post.category);
  const related = await getRelatedBlogs(post.slug, 3);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span className="text-slate-600">/</span>
          {category && (
            <>
              <Link
                href={`/blog/category/${category.slug}`}
                className="hover:text-white transition-colors"
              >
                {category.title}
              </Link>
              <span className="text-slate-600">/</span>
            </>
          )}
          <span className="text-sky-300 font-semibold truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </div>
      </div>

      {/* Article Header & Hero */}
      <article className="flex-1 w-full pb-16">
        <header className="bg-[#061527] text-white py-14 sm:py-20 border-b border-sky-900/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Pill */}
            {category && (
              <div className="mb-4">
                <Link
                  href={`/blog/category/${category.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-sky-950 px-3 py-1 text-xs font-bold text-sky-300 border border-sky-800/70 uppercase tracking-wider hover:bg-sky-900 transition-colors"
                >
                  <span>{category.icon}</span>
                  <span>{category.title}</span>
                </Link>
              </div>
            )}

            {/* Main Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            {/* Article Metadata Strip */}
            <div className="mt-6 pt-6 border-t border-sky-900/60 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-base font-bold text-amber-400 border border-slate-700">
                  AP
                </div>
                <div>
                  <div className="font-bold text-white">{post.author}</div>
                  <div className="text-xs text-slate-400">{post.authorRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>📅 {post.publishedDate}</span>
                <span>•</span>
                <span>⏱ {post.readingTime}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700/50">
            <CmsImage
              src={getSafeImageSrc(
                post.image,
                post.slug?.includes('ai') || post.slug?.includes('warehouse')
                  ? '/images/blog/ai-smart-warehouse.jpg'
                  : '/images/blog/blog-default.jpg'
              )}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        </div>

        {/* Article Body Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          {/* Introduction Lead */}
          <div className="rounded-2xl bg-sky-50/70 border border-sky-200/80 p-6 sm:p-8 mb-10 text-slate-800">
            <p className="text-base sm:text-lg leading-relaxed font-medium">
              {post.introduction}
            </p>
          </div>

          {/* Structured Sections */}
          <div className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
            {post.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="text-sky-600 font-mono text-lg font-bold">#</span>
                  <span>{section.heading}</span>
                </h2>

                <p>{section.body}</p>

                {/* Bullet Points if present */}
                {section.bulletPoints && section.bulletPoints.length > 0 && (
                  <ul className="space-y-2.5 my-4 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
                    {section.bulletPoints.map((bp, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs mt-0.5">
                          ✓
                        </span>
                        <span className="leading-relaxed">{bp}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Callout Box if present */}
                {section.callout && (
                  <div className="rounded-xl border-l-4 border-brand-orange bg-amber-50/70 p-5 text-xs sm:text-sm text-slate-800 shadow-sm">
                    <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <span>💡</span> Key Engineering Insight
                    </div>
                    <p className="italic leading-relaxed">{section.callout}</p>
                  </div>
                )}
              </section>
            ))}

            {/* Conclusion Section */}
            <section className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
              <h3 className="text-lg font-bold text-slate-900">
                Conclusion &amp; Moving Forward
              </h3>
              <p>{post.conclusion}</p>
            </section>

            {/* Tags Strip */}
            <div className="pt-6 border-t border-slate-200 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tags:
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Consultation CTA Banner */}
          <div className="mt-14 rounded-2xl bg-gradient-to-r from-[#061527] via-[#0B1E36] to-[#061527] text-white p-8 sm:p-10 text-center space-y-4 shadow-xl border border-sky-900/50">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              CUSTOM ENGINEERING ADVISORY
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Looking for the Right Packaging Solution?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Our engineering team can help you identify the right packaging, automation, and processing
              solution for your production requirements.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95"
              >
                <span>Speak With a Specialist</span>
                <span>→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white border border-white/20 transition-all hover:bg-white/20 active:scale-95"
              >
                <span>Request a Consultation</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Related Articles Section */}
          <RelatedBlogs relatedPosts={related} />
        </div>
      </article>

      <Footer />
    </div>
  );
}
