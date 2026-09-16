import React from 'react';
import Link from 'next/link';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { CategoryDetailResponse, CatalogChildItem } from '@/types/products';
import DynamicHero from '@/components/common/DynamicHero';
import PremiumGallery from '@/components/common/PremiumGallery';
import CatalogPdfSection from '@/components/common/CatalogPdfSection';
import CatalogChildrenSection from './CatalogChildrenSection';

interface CategoryPageTemplateProps {
  data: CategoryDetailResponse;
  currentPath: string;
}

export default function CategoryPageTemplate({ data, currentPath }: CategoryPageTemplateProps) {
  const { category, children, products, directChildren, breadcrumbs } = data;

  // Build unified children list (prefer directChildren from API, or fallback to combining children + products)
  const unifiedChildren: CatalogChildItem[] =
    Array.isArray(directChildren) && directChildren.length > 0
      ? directChildren
      : [
          ...(Array.isArray(children)
            ? children.map((c) => ({
                _id: c._id,
                name: c.name,
                slug: c.slug,
                type: 'category' as const,
                shortDescription: c.shortDescription,
                description: c.description,
                media: c.media,
                displayOrder: c.displayOrder,
                isActive: c.isActive,
              }))
            : []),
          ...(Array.isArray(products)
            ? products.map((p) => ({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                type: 'product' as const,
                shortDescription: p.shortDescription,
                description: p.description,
                media: p.media,
                displayOrder: p.displayOrder,
                isActive: p.isActive,
                modelCount: p.modelCount,
                isFeatured: p.isFeatured,
              }))
            : []),
        ];

  const hasChildren = unifiedChildren.length > 0;
  const hasFeatures = Array.isArray(category.features) && category.features.length > 0;
  const hasApplications = Array.isArray(category.applications) && category.applications.length > 0;
  const hasBenefits = Array.isArray(category.benefits) && category.benefits.length > 0;
  const hasHighlights = hasFeatures || hasApplications || hasBenefits;

  const highlightCount = [hasFeatures, hasApplications, hasBenefits].filter(Boolean).length;
  const highlightGridCols =
    highlightCount === 1
      ? 'grid-cols-1 max-w-3xl mx-auto'
      : highlightCount === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-3';

  return (
    <div className="min-h-screen bg-[#040911] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Breadcrumb Navigation - 94% Wide */}
      <div className="border-b border-slate-800/80 bg-[#061527]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="container-wide py-2.5">
          <ProductBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      {/* 1. Cinematic Dynamic Hero Section */}
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
          eyebrow: 'Machinery Division Overview',
          ctaText: hasChildren ? 'Explore Division Equipment ↓' : 'Browse Products',
          ctaLink: hasChildren ? '#catalog-content' : '#contact',
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

        {/* 2. Category Description (Clean editorial section) */}
        {(category.description || (category.shortDescription && category.shortDescription !== category.name)) && (
          <section className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#061527]/50">
            <div className="container-wide">
              <div className="max-w-4xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <span>Architecture &amp; Overview</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  About {category.name}
                </h2>
                {category.shortDescription && (
                  <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                    {category.shortDescription}
                  </p>
                )}
                {category.description && category.description !== category.shortDescription && (
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 3. Category Content / Catalog (Unified Section for all direct children: Categories, Products, Models) */}
        {hasChildren ? (
          <CatalogChildrenSection
            id="catalog-content"
            eyebrow="Explore This Division"
            title={`${category.name} Equipment Lineup`}
            subtitle="Browse direct subdivisions, automated machines, and specialized models configured under this division."
            childrenItems={unifiedChildren}
            parentPath={currentPath}
            badgeColor="amber"
            initialLimit={12}
          />
        ) : (
          /* Minimal Clean Empty State */
          <section className="py-16 border-b border-slate-800/80">
            <div className="container-wide text-center">
              <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 max-w-2xl mx-auto shadow-lg">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl mb-4">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Equipment Lineup Updating</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  We are configuring the machinery lineup for {category.name}. For specialized industrial parameters or custom engineering solutions, connect with our team.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Inquiry for ${category.name}`)}`}
                    className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  >
                    Request Custom Machinery
                  </Link>
                  <Link
                    href="/products"
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Engineering Features & Applications */}
        {hasHighlights && (
          <section className="py-16 sm:py-24 border-b border-slate-800/80">
            <div className="container-wide">
              <div className="mb-10">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                  Engineering Matrix
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Capabilities &amp; Operating Parameters
                </h2>
              </div>

              <div className={`grid ${highlightGridCols} gap-6`}>
                {/* Features */}
                {hasFeatures && (
                  <div className="p-8 rounded-3xl bg-[#061527] border border-slate-800 hover:border-slate-700 transition-colors shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <span>Engineering Capabilities</span>
                    </h3>
                    <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                      {category.features!.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-amber-400 font-bold shrink-0">✓</span>
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Applications */}
                {hasApplications && (
                  <div className="p-8 rounded-3xl bg-[#061527] border border-slate-800 hover:border-slate-700 transition-colors shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                      <span>Target Applications</span>
                    </h3>
                    <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                      {category.applications!.map((app, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-sky-400 font-bold shrink-0">•</span>
                          <span className="leading-relaxed">{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {hasBenefits && (
                  <div className="p-8 rounded-3xl bg-[#061527] border border-slate-800 hover:border-slate-700 transition-colors shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                      <span>Operational Benefits</span>
                    </h3>
                    <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                      {category.benefits!.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="text-emerald-400 font-bold shrink-0">★</span>
                          <span className="leading-relaxed">{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. Technical Documentation & Catalog PDF */}
        <CatalogPdfSection
          catalogPdf={category.catalogPdf}
          entityName={category.name}
          entityType="category"
          entitySlug={category.slug}
        />

        {/* 6. Premium Media Gallery */}
        <PremiumGallery
          media={category.galleryMedia}
          legacyGallery={category.media?.gallery}
          title={`${category.name} Media Gallery`}
          subtitle="High-resolution industrial photography & machinery showcase"
        />

        {/* 7. Bottom Call to Action */}
        <section className="py-20 sm:py-28">
          <div className="container-wide text-center">
            <div className="rounded-3xl bg-gradient-to-r from-[#040911] via-[#061527] to-[#040911] border border-slate-800 p-8 sm:p-14 shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-orange font-bold">
                  Bespoke Plant Configuration
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Require Custom Machinery for {category.name}?
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                  Our application engineers collaborate directly with plant managers and OEM integrators to configure line-specific speeds, layouts, and automation standards.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="px-8 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
                  >
                    Request Technical Consultation
                  </Link>
                  <Link
                    href="/catalogs"
                    className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
                  >
                    Download Engineering Datasheets
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
