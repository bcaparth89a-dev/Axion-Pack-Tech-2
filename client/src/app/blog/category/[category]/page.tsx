import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/blog/BlogCard";
import {
  getBlogCategoryBySlug,
  getBlogPostsByCategory,
} from "@/lib/api/blogs";

export const revalidate = 300;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}


export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = await getBlogCategoryBySlug(category);

  if (!categoryInfo) {
    return {
      title: "Category Not Found | Axion PackTech Blog",
    };
  }

  return {
    title: `${categoryInfo.title} | Axion PackTech Blog`,
    description: categoryInfo.description,
  };
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const categoryInfo = await getBlogCategoryBySlug(category);

  if (!categoryInfo) {
    notFound();
  }

  const posts = await getBlogPostsByCategory(category);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/blog" className="hover:text-white transition-colors">
            Blog
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sky-300 font-semibold">{categoryInfo.title}</span>
        </div>
      </div>

      {/* Category Hero Header */}
      <section className="bg-[#061527] text-white py-14 sm:py-20 border-b border-sky-900/40 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/80 px-4 py-1.5 text-xs font-bold text-sky-400 border border-sky-800/60 uppercase tracking-wider mb-4">
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {categoryInfo.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {categoryInfo.description}
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs text-slate-300">
            <span className="rounded-md bg-white/10 px-3 py-1 border border-white/10">
              {posts.length} {posts.length === 1 ? "Article" : "Articles"} Published
            </span>
          </div>
        </div>
      </section>

      {/* Category Articles Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {categoryInfo.title} Articles
          </h2>
          <Link
            href="/blog"
            className="text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors"
          >
            ← View All Topics
          </Link>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              No Articles in this Category Yet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              New articles for {categoryInfo.title} are currently being drafted by our
              engineering team. Check back soon!
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-600"
            >
              View All Articles
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
