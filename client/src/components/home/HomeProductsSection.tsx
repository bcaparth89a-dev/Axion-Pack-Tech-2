import Link from "next/link";
import { getCategoryTree, getFeaturedProducts } from "@/lib/api/products";
import CmsImage from "@/components/common/CmsImage";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

export default async function HomeProductsSection() {
  const [categories, featuredProducts] = await Promise.all([
    getCategoryTree(),
    getFeaturedProducts(6),
  ]);

  const rootCategories = (categories || []).filter((c) => !c.type || c.type === 'category');
  const hasCategories = Array.isArray(rootCategories) && rootCategories.length > 0;
  const hasFeatured = Array.isArray(featuredProducts) && featuredProducts.length > 0;

  if (!hasCategories && !hasFeatured) {
    return null;
  }

  const categoryGridClass =
    rootCategories && rootCategories.length === 1
      ? "grid-cols-1 max-w-3xl mx-auto"
      : rootCategories && rootCategories.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";

  return (
    <section id="products" className="py-20 sm:py-28 bg-[#040911] text-white border-b border-slate-800/80 relative">
      {/* Subtle Background Grid Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-grid-blueprint" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-slate-800/80">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/40 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-amber-300 uppercase">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Machinery Divisions &amp; Systems</span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Engineering Solutions for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-white">
                Every Stage of Production
              </span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              High-performance packaging lines, sanitary washdown conveyors, inspection stations, and standalone machinery engineered for 24/7 industrial duty.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/catalogs"
              className="px-4 py-2.5 rounded-xl border border-sky-400/30 bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 text-xs font-mono font-semibold transition-all"
            >
              📄 Download Catalogs
            </Link>
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <span>Explore All Machinery</span>
              <span className="ml-1.5">→</span>
            </Link>
          </div>
        </div>

        {/* Categories Grid (Adaptive 94% Wide Layout) */}
        {hasCategories && (
          <div className={`grid ${categoryGridClass} gap-6 sm:gap-8 mt-12`}>
            {rootCategories.map((cat) => {
              const catImage = resolveMediaUrl(
                cat.media?.heroImage ||
                cat.media?.image ||
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
              );

              return (
                <Link
                  key={cat._id}
                  href={`/products/${cat.slug}`}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-[#061527] border border-slate-800 shadow-xl transition-all duration-300 hover:shadow-[0_16px_35px_rgba(234,88,12,0.2)] hover:-translate-y-1.5 hover:border-amber-400/60"
                >
                  {/* Category Image Visual Hero */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <CmsImage
                      src={catImage}
                      alt={cat.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-85"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061527] via-[#061527]/30 to-transparent" />

                    {/* Badge on Image */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-semibold text-white border border-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {cat.children?.length ? `${cat.children.length} Subcategories` : "Direct Machinery Division"}
                      </span>
                    </div>

                    {/* Division Title overlay */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 font-normal">
                      {cat.shortDescription || "Specialized automated industrial machinery engineered for high throughput."}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-amber-400 transition-colors">
                      <span>Explore Equipment Range</span>
                      <span className="transition-transform group-hover:translate-x-1.5">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Featured Machines Bar */}
        {hasFeatured && (
          <div className="mt-16 pt-12 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Flagship Machinery
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Featured Industrial Systems
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold font-mono text-sky-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>Full Machinery Index</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.map((prod) => (
                <Link
                  key={prod._id}
                  href={
                    prod.categoryId && typeof prod.categoryId === 'object' && prod.categoryId.slug
                      ? `/products/${prod.categoryId.slug}/${prod.slug}`
                      : `/products/${prod.slug}`
                  }
                  className="p-4 rounded-2xl bg-[#061527]/90 border border-slate-800/90 hover:border-amber-400/50 hover:bg-[#081B33] transition-all flex items-center justify-between group shadow-sm"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                      {prod.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5 font-normal">
                      {prod.shortDescription || "View Technical Specifications"}
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 font-bold">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
