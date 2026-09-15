import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsCard from "@/components/news/NewsCard";
import {
  getAllCategories,
  getNewsCategoryBySlug,
  getNewsByCategory,
  getNewsBySlug,
} from "@/lib/api/news";

export const revalidate = 300;
export const dynamicParams = true;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getNewsCategoryBySlug(categorySlug);

  if (category) {
    return {
      title: `${category.title} | AXION PackTech News & Media`,
      description: category.description,
    };
  }

  const article = await getNewsBySlug(categorySlug);
  if (article) {
    return {
      title: `${article.title} | AXION PackTech News`,
      description: article.excerpt,
    };
  }

  return {
    title: "News Category Not Found | AXION PackTech",
  };
}

export default async function CategoryNewsPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getNewsCategoryBySlug(categorySlug);

  if (!category) {
    // Check if the parameter is a direct news article slug
    const article = await getNewsBySlug(categorySlug);
    if (article) {
      redirect(`/news/${article.categorySlug}/${article.slug}`);
    }
    notFound();
  }


  const articles = await getNewsByCategory(categorySlug);
  const allCategories = await getAllCategories();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      {/* 2. Category Hero Header Section */}
      <section className="relative w-full bg-gradient-to-b from-[#0B1E36] via-[#091D38] to-[#061527] pt-24 pb-20 sm:pt-28 sm:pb-24 text-white -mt-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-8">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 mb-6 flex-wrap"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/news" className="hover:text-white transition-colors">
              News
            </Link>
            <span>/</span>
            <span className="text-sky-300">{category.title}</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-950/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-300 shadow-md">
              <span className="text-base">{category.icon}</span>
              <span>{category.badge}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
              {category.title}
            </h1>

            <div className="h-1 w-20 rounded-full bg-brand-orange mx-auto mt-4" />

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Main Content: Category Navigation Bar & Articles */}
      <main className="flex-1 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 space-y-10">
          {/* Other Categories Nav Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm">
            <Link
              href="/news"
              className="rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-sky-50 hover:text-sky-900 transition-all"
            >
              All News
            </Link>
            {allCategories.map((cat) => {
              const isCurrent = cat.slug === categorySlug;
              return (
                <Link
                  key={cat.slug}
                  href={`/news/${cat.slug}`}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    isCurrent
                      ? "bg-[#0B192C] text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-sky-50 hover:text-sky-900 transition-colors"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                </Link>
              );
            })}
          </div>

          {/* Section Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-4">
            <span>
              Showing <strong className="text-slate-900 font-bold">{articles.length}</strong> updates under {category.title}
            </span>
            <Link
              href="/news"
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              ← View All Categories
            </Link>
          </div>

          {/* Category Articles Grid */}
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {articles.map((article) => (
                <NewsCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                No articles yet in this category
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                New updates will be published soon.
              </p>
              <Link
                href="/news"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0B192C] px-5 py-2.5 text-xs font-semibold text-white shadow-sm"
              >
                Explore Other News
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}
