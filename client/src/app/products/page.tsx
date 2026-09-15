import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CategoryMainHero from '@/components/products/CategoryMainHero';
import { getCategoryTree, getProducts } from '@/lib/api/products';
import { getCategoryHero } from '@/lib/api/pages';
import CmsImage from '@/components/common/CmsImage';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Machinery Catalog & Industrial Solutions | AXION PackTech',
  description:
    "Explore AXION PackTech's complete portfolio of industrial packaging machinery, automated conveyors, and specialized packaging equipment.",
};

export default async function ProductsOverviewPage() {
  const [categoriesTree, standaloneResult, heroData] = await Promise.all([
    getCategoryTree(),
    getProducts({ standalone: true }),
    getCategoryHero(),
  ]);

  const standaloneProducts = standaloneResult?.items || [];
  const hasCategories = Array.isArray(categoriesTree) && categoriesTree.length > 0;
  const hasStandalone = Array.isArray(standaloneProducts) && standaloneProducts.length > 0;

  return (
    <div className="relative min-h-screen bg-[#040911] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* Dynamic CMS-Controlled Hero Section */}
        <CategoryMainHero data={heroData} />

        {/* Categories Catalogue Stream — Continuous Flow */}
        <div id="categories" className="relative">
          {/* Subtle ambient light flows */}
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-2/3 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {!hasCategories && !hasStandalone ? (
            <section className="py-24 max-w-4xl mx-auto px-6 text-center">
              <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-4">
                  ⚙️
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Equipment Portfolio Updating</h2>
                <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                  Our machinery catalog is currently being updated with new engineering models. Please contact our engineering team directly for custom machinery specifications.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <span>Contact Engineering Team</span>
                  <span>→</span>
                </Link>
              </div>
            </section>
          ) : (
            <>
              {/* Category Showcase Stream */}
              {hasCategories && (
                <div className="divide-y divide-slate-800/60">
                  {categoriesTree.map((cat, idx) => {
                    const catImage = resolveMediaUrl(
                      cat.media?.heroImage ||
                      cat.media?.image ||
                      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80'
                    );
                    const isEven = idx % 2 === 0;

                    return (
                      <section
                        key={cat._id}
                        className={`py-16 sm:py-24 transition-colors ${
                          isEven ? 'bg-[#050c18]/50' : 'bg-[#040911]'
                        }`}
                      >
                        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                            {/* Visual Presentation (5 cols) */}
                            <div
                              className={`lg:col-span-5 ${
                                !isEven ? 'lg:order-2' : ''
                              }`}
                            >
                              <Link
                                href={`/products/${cat.slug}`}
                                className="group relative block rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 border border-slate-800/90 shadow-2xl hover:border-amber-500/50 transition-all duration-500"
                              >
                                <CmsImage
                                  src={catImage}
                                  alt={cat.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85"
                                  sizes="(max-width: 1024px) 100vw, 42vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-transparent to-transparent opacity-80" />
                                
                                <div className="absolute top-4 left-4">
                                  <span className="px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono font-bold text-amber-400">
                                    0{idx + 1} / DIVISION
                                  </span>
                                </div>

                                <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold backdrop-blur-md group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                                  <span>Explore Division</span>
                                  <span>→</span>
                                </div>
                              </Link>
                            </div>

                            {/* Editorial Details & Equipment List (7 cols) */}
                            <div
                              className={`lg:col-span-7 space-y-6 ${
                                !isEven ? 'lg:order-1' : ''
                              }`}
                            >
                              <div>
                                <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                                  Industrial Machinery Division
                                </span>
                                <h2 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
                                  <Link
                                    href={`/products/${cat.slug}`}
                                    className="hover:text-amber-400 transition-colors"
                                  >
                                    {cat.name}
                                  </Link>
                                </h2>
                                {cat.shortDescription && (
                                  <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-2xl font-normal">
                                    {cat.shortDescription}
                                  </p>
                                )}
                              </div>

                              {/* Subcategories (if any) */}
                              {cat.children && cat.children.length > 0 && (
                                <div className="pt-2">
                                  <div className="flex items-center gap-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span>Specialized Subcategories ({cat.children.length})</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                                    {cat.children.map((child) => (
                                      <Link
                                        key={child._id}
                                        href={`/products/${cat.slug}/${child.slug}`}
                                        className="group/sub p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-400/50 hover:bg-slate-900 transition-all flex items-center justify-between"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <span className="text-xs font-bold text-slate-200 group-hover/sub:text-amber-400 transition-colors block truncate">
                                            {child.name}
                                          </span>
                                          {child.shortDescription && (
                                            <span className="text-[11px] text-slate-400 line-clamp-1 block mt-0.5">
                                              {child.shortDescription}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-amber-400 group-hover/sub:translate-x-1 transition-transform shrink-0">
                                          →
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Direct Products in Category (if any) */}
                              {cat.products && cat.products.length > 0 && (
                                <div className="pt-2">
                                  <div className="flex items-center justify-between pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                      <span>Direct Machinery Lineup</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-sky-400">
                                      {cat.products.length} {cat.products.length === 1 ? 'Product' : 'Products'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                                    {cat.products.map((prod) => (
                                      <Link
                                        key={prod._id}
                                        href={`/products/${cat.slug}/${prod.slug}`}
                                        className="group/prod p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-400/50 hover:bg-slate-900 transition-all flex items-center justify-between"
                                      >
                                        <div className="min-w-0 pr-2">
                                          <span className="text-xs font-bold text-slate-200 group-hover/prod:text-sky-400 transition-colors block truncate">
                                            {prod.name}
                                          </span>
                                          {prod.modelCount !== undefined && prod.modelCount > 0 && (
                                            <span className="text-[10px] text-sky-400 font-semibold block mt-0.5">
                                              {prod.modelCount} Available Models
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-sky-400 group-hover/prod:translate-x-1 transition-transform shrink-0">
                                          →
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Action Footer */}
                              <div className="pt-4 flex items-center gap-4">
                                <Link
                                  href={`/products/${cat.slug}`}
                                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                                >
                                  <span>View Complete {cat.name} Series</span>
                                  <span>→</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}

              {/* Standalone Products Section */}
              {hasStandalone && (
                <section className="py-20 bg-[#061224]/70 border-t border-slate-800/80">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          <span>Autonomous Machinery</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                          Standalone Equipment Systems
                        </h2>
                      </div>
                      <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                        Independent packaging units engineered with integrated PLC controls, operating seamlessly as standalone stations or within integrated lines.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {standaloneProducts.map((prod) => (
                        <Link
                          key={prod._id}
                          href={`/products/${prod.slug}`}
                          className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-400/60 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_12px_35px_-10px_rgba(56,189,248,0.2)] hover:-translate-y-1"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-extrabold uppercase tracking-wider">
                                Standalone Unit
                              </span>
                              {prod.modelCount !== undefined && prod.modelCount > 0 && (
                                <span className="text-xs text-amber-400 font-semibold">
                                  {prod.modelCount} Models
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                              {prod.name}
                            </h3>
                            {prod.shortDescription && (
                              <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed font-normal">
                                {prod.shortDescription}
                              </p>
                            )}
                          </div>
                          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span>View Specifications</span>
                            <span className="text-sky-400 group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
