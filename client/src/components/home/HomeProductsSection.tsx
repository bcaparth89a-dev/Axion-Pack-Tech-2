import Link from "next/link";
import { getCategoryTree, getFeaturedProducts } from "@/lib/api/products";
import CmsImage from "@/components/common/CmsImage";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

export default async function HomeProductsSection() {
  const [categories, featuredProducts] = await Promise.all([
    getCategoryTree(),
    getFeaturedProducts(6),
  ]);

  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const hasFeatured = Array.isArray(featuredProducts) && featuredProducts.length > 0;

  // Strict zero empty space guard: return null if no categories and no featured products
  if (!hasCategories && !hasFeatured) {
    return null;
  }

  const categoryGridClass =
    categories && categories.length === 1
      ? "grid-cols-1 max-w-2xl mx-auto"
      : categories && categories.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="products" className="py-20 sm:py-28 bg-[#040911] text-white border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1 text-xs font-semibold tracking-wider text-sky-200 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Our Machinery Architecture
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Engineering Solutions for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-300 to-white">
              Every Stage of Production
            </span>
          </h2>

          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-amber-400" />

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            High-performance packaging, sanitary conveying, inspection, and standalone machinery engineered for precision, reliability, and continuous duty.
          </p>
        </div>

        {/* Categories Grid (Adaptive) */}
        {hasCategories && (
          <div className={`grid ${categoryGridClass} gap-8`}>
            {categories.map((cat) => {
              const catImage = resolveMediaUrl(
                cat.media?.heroImage ||
                cat.media?.image ||
                "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
              );

              return (
                <Link
                  key={cat._id}
                  href={`/products/${cat.slug}`}
                  className="group relative flex flex-col rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800/90 shadow-xl transition-all duration-300 hover:shadow-[0_16px_35px_rgba(245,158,11,0.15)] hover:-translate-y-1.5 hover:border-amber-400/50"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-[#040911]/40 to-transparent" />

                    {/* Badge on Image */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white border border-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {cat.children?.length ? `${cat.children.length} Subcategories` : "Direct Division"}
                      </span>
                    </div>

                    {/* Division Title overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 font-normal">
                      {cat.shortDescription || "Specialized automated industrial equipment."}
                    </p>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400">
                      <span className="group-hover:text-white transition-colors">Explore Equipment</span>
                      <span className="text-amber-400 group-hover:translate-x-1 transition-transform">→</span>
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
                  Highlighted Equipment
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Featured Machinery Systems
                </h3>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-sky-400 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>View Full Catalog</span>
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
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-400/40 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                      {prod.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate mt-0.5 font-normal">
                      {prod.shortDescription || "View Machine Details"}
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0">
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
