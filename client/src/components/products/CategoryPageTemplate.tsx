import React from 'react';
import Link from 'next/link';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { CategoryDetailResponse } from '@/types/products';
import CmsImage from '@/components/common/CmsImage';
import DynamicHero from '@/components/common/DynamicHero';
import PremiumGallery from '@/components/common/PremiumGallery';
import CatalogPdfSection from '@/components/common/CatalogPdfSection';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

interface CategoryPageTemplateProps {
  data: CategoryDetailResponse;
  currentPath: string;
}

export default function CategoryPageTemplate({ data, currentPath }: CategoryPageTemplateProps) {
  const { category, children, products, breadcrumbs } = data;

  const hasChildren = Array.isArray(children) && children.length > 0;
  const hasProducts = Array.isArray(products) && products.length > 0;
  const hasFeatures = Array.isArray(category.features) && category.features.length > 0;
  const hasApplications = Array.isArray(category.applications) && category.applications.length > 0;
  const hasBenefits = Array.isArray(category.benefits) && category.benefits.length > 0;
  const hasHighlights = hasFeatures || hasApplications || hasBenefits;

  // Adaptive Grid Column Calculations
  const subcategoryGridClass =
    children && children.length === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : children && children.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const productGridClass =
    products && products.length === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : products && products.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  const highlightCount = [hasFeatures, hasApplications, hasBenefits].filter(Boolean).length;
  const highlightGridCols =
    highlightCount === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : highlightCount === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="min-h-screen bg-[#040911] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-[#050c18]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      {/* 1. Dynamic Hero Section */}
      <DynamicHero
        type="category"
        hero={category.hero}
        fallbackData={{
          title: category.name,
          subtitle: 'Advanced Industrial Machinery Systems',
          description:
            category.shortDescription ||
            category.description ||
            'Explore engineered packaging systems built for continuous uptime, high throughput, and seamless line integration.',
          eyebrow: 'Category Overview',
          ctaText: hasChildren ? 'Explore Subcategories ↓' : hasProducts ? 'Explore Equipment ↓' : 'Browse Catalog',
          ctaLink: hasChildren ? '#subcategories' : hasProducts ? '#products' : '#catalog',
          backgroundImage: category.media?.heroImage || category.media?.image,
          mediaItems: [
            ...(category.media?.heroImage ? [{ url: category.media.heroImage, type: 'image' as const, title: `${category.name} Industrial System` }] : []),
            ...(category.media?.image && category.media.image !== category.media.heroImage ? [{ url: category.media.image, type: 'image' as const, title: `${category.name} Primary View` }] : []),
            ...(Array.isArray(category.media?.gallery) ? category.media.gallery.map((g, i) => ({ url: g, type: 'image' as const, title: `${category.name} View ${i + 1}` })) : []),
            ...(Array.isArray(products) ? products.slice(0, 4).filter(p => p.media?.image).map(p => ({ url: p.media!.image!, type: 'image' as const, title: p.name })) : [])
          ],
        }}
      />

      {/* Continuous Content Stream */}
      <div className="relative">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-3/4 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 2. Overview Narrative (Rendered only when content exists) */}
        {(category.description || (category.shortDescription && category.shortDescription !== category.name)) && (
          <section className="py-14 sm:py-18 border-b border-slate-800/60 bg-[#050c18]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Architecture & Scope</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  About {category.name}
                </h2>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  {category.description || category.shortDescription}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 3. Empty State (Rendered only when category has no subcategories and no products) */}
        {!hasChildren && !hasProducts && (
          <section className="py-20 border-b border-slate-800/60">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-4">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Equipment Lineup Updating</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  We are currently updating the machinery lineup for {category.name}. For custom engineering parameters or technical specifications, please contact our team.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Inquiry for ${category.name}`)}`}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                  >
                    Request Custom Machine
                  </Link>
                  <Link
                    href="/products"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Subcategories Hierarchy (Adaptive Layout: 1, 2, or 3+ columns) */}
        {hasChildren && (
          <section id="subcategories" className="py-16 sm:py-20 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    Specialized Divisions
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {category.name} Subcategories
                  </h2>
                </div>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Select a category to view specialized machinery variants, technical parameters, and dedicated models.
                </p>
              </div>

              <div className={`grid ${subcategoryGridClass} gap-6`}>
                {children.map((child) => {
                  const childImage =
                    resolveMediaUrl(child.media?.image || child.media?.heroImage) ||
                    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
                  const subcategoryHref = `${currentPath}/${child.slug}`;

                  return (
                    <Link
                      key={child._id}
                      href={subcategoryHref}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_12px_35px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1"
                    >
                      <div className="aspect-[16/10] relative w-full overflow-hidden bg-slate-950">
                        <CmsImage
                          src={childImage}
                          alt={child.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-[#040911]/20 to-transparent" />
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-semibold text-slate-300">
                          Subcategory
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                            {child.name}
                          </h3>
                          {child.shortDescription && (
                            <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                              {child.shortDescription}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                            Explore Machinery Lineup
                          </span>
                          <span className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. Products in Category (Adaptive Layout: 1, 2, or 3+ columns) */}
        {hasProducts && (
          <section id="products" className="py-16 sm:py-20 border-b border-slate-800/60 bg-[#050c18]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest block mb-1">
                    Equipment Lineup
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Machinery in {category.name}
                  </h2>
                </div>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Individual packaging machines with specific model configurations, engineering specifications, and custom tooling.
                </p>
              </div>

              <div className={`grid ${productGridClass} gap-6`}>
                {products.map((prod) => {
                  const prodImage =
                    resolveMediaUrl(prod.media?.image || prod.media?.heroImage) ||
                    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
                  const productHref = `${currentPath}/${prod.slug}`;

                  return (
                    <Link
                      key={prod._id}
                      href={productHref}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/90 hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_12px_35px_-10px_rgba(14,165,233,0.2)] hover:-translate-y-1"
                    >
                      <div className="aspect-[16/10] relative w-full overflow-hidden bg-slate-950">
                        <CmsImage
                          src={prodImage}
                          alt={prod.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-[#040911]/20 to-transparent" />

                        {prod.modelCount !== undefined && prod.modelCount > 0 && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[11px] font-bold backdrop-blur-md">
                            {prod.modelCount} {prod.modelCount === 1 ? 'Model' : 'Models'} Available
                          </div>
                        )}

                        {prod.isFeatured && (
                          <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                            Featured
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                            {prod.name}
                          </h3>
                          {prod.shortDescription && (
                            <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                              {prod.shortDescription}
                            </p>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                            View Machine & Models
                          </span>
                          <span className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 6. Engineering Features & Applications (Rendered only if data exists) */}
        {hasHighlights && (
          <section className="py-16 sm:py-20 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Technical Matrix
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Capabilities & Specifications
                </h2>
              </div>

              <div className={`grid ${highlightGridCols} gap-6`}>
                {/* Features */}
                {hasFeatures && (
                  <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      Engineering Capabilities
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      {category.features!.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-amber-400 font-bold shrink-0">✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Applications */}
                {hasApplications && (
                  <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                      Target Applications
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      {category.applications!.map((app, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-sky-400 font-bold shrink-0">•</span>
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {hasBenefits && (
                  <div className="p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      Operational Benefits
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      {category.benefits!.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-emerald-400 font-bold shrink-0">★</span>
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 7. Technical Documentation & Catalog PDF (Auto-collapses if no PDF) */}
        <CatalogPdfSection
          catalogPdf={category.catalogPdf}
          entityName={category.name}
          entityType="category"
          entitySlug={category.slug}
        />

        {/* 8. Premium Media Gallery (Auto-collapses if no media) */}
        <PremiumGallery
          media={category.galleryMedia}
          legacyGallery={category.media?.gallery}
          title={`${category.name} Media Gallery`}
          subtitle="High-resolution industrial photography & machinery showcase"
        />

        {/* 9. Bottom Call to Action */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#091524] to-slate-900 border border-slate-800/90 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Require custom machinery for {category.name}?
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Our application engineers collaborate directly with plant managers and OEM integrators to configure line-specific speeds, layouts, and automation standards.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95"
                  >
                    Request Technical Consultation
                  </Link>
                  <Link
                    href="/products"
                    className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
