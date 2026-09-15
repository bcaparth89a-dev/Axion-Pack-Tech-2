import React from 'react';
import Link from 'next/link';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { ModelDetailResponse } from '@/types/products';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CmsImage from '@/components/common/CmsImage';
import DynamicHero from '@/components/common/DynamicHero';
import PremiumGallery from '@/components/common/PremiumGallery';
import CatalogPdfSection from '@/components/common/CatalogPdfSection';

interface ModelPageTemplateProps {
  data: ModelDetailResponse;
  currentPath?: string;
}

export default function ModelPageTemplate({ data, currentPath }: ModelPageTemplateProps) {
  const { model, product, breadcrumbs } = data;
  const canonicalPath = currentPath || `/products/${product.slug}/${model.slug}`;

  const rawMainImage =
    model.media?.image ||
    model.media?.heroImage ||
    product.media?.image ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const mainImage = resolveMediaUrl(rawMainImage);

  // Specifications: 2-Row Table Columns
  const tableColumns =
    Array.isArray(model.specificationsTable?.columns) && model.specificationsTable!.columns.length > 0
      ? model.specificationsTable!.columns
      : Array.isArray(model.specifications) && model.specifications.length > 0
      ? model.specifications.map((s, idx) => ({
          key: s.key || `col_${idx}`,
          label: s.label || s.key || `PARAM ${idx + 1}`,
          value: s.value,
          order: idx,
        }))
      : [];

  const hasSpecsTable = tableColumns.length > 0;
  const hasFeatures = Array.isArray(model.features) && model.features.length > 0;

  // Find parent product path from breadcrumbs
  const parentProductBreadcrumb = breadcrumbs.find((b) => b.type === 'product');
  const parentProductHref = parentProductBreadcrumb ? parentProductBreadcrumb.path : `/products/${product.slug}`;

  return (
    <div className="min-h-screen bg-[#040911] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-800/80 bg-[#050c18]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      {/* 1. Dynamic Premium Model Hero Section */}
      <DynamicHero
        type="model"
        hero={model.hero}
        fallbackData={{
          title: model.name,
          subtitle: model.modelNumber ? `Model Series: ${model.modelNumber}` : 'High-Performance Machinery Variant',
          description:
            model.shortDescription ||
            model.description ||
            product.shortDescription ||
            'Complete technical parameters, capacity, and operational specifications for high-reliability manufacturing.',
          eyebrow: model.modelNumber ? `Model Variant • ${model.modelNumber}` : 'Model Specification',
          ctaText: hasSpecsTable ? 'Technical Specifications ↓' : 'Request Machine Quote',
          ctaLink: hasSpecsTable ? '#specifications' : '#quote-section',
          backgroundImage: model.media?.heroImage || model.media?.image || product.media?.heroImage || product.media?.image,
          mediaItems: [
            ...(model.media?.image ? [{ url: model.media.image, type: 'image' as const, title: `${model.name} (${model.modelNumber})` }] : []),
            ...(model.media?.heroImage && model.media.heroImage !== model.media.image ? [{ url: model.media.heroImage, type: 'image' as const, title: `${model.name} In-Line` }] : []),
            ...(Array.isArray(model.media?.gallery) ? model.media.gallery.map((g, i) => ({ url: g, type: 'image' as const, title: `${model.name} Detail ${i + 1}` })) : []),
            ...(model.media?.videoUrl ? [{ url: model.media.videoUrl, type: 'video' as const, title: `${model.name} Operation Video` }] : []),
            ...(product.media?.image && product.media.image !== model.media?.image ? [{ url: product.media.image, type: 'image' as const, title: product.name }] : [])
          ],
        }}
      />

      {/* Continuous Content Stream */}
      <div className="relative">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 2. Short Description / Model Overview */}
        <section id="overview" className="py-16 sm:py-20 border-b border-slate-800/60 bg-[#050c18]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left: Model Media Showcase */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-950 aspect-[4/3] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                  <CmsImage
                    src={mainImage}
                    alt={model.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase shadow-lg">
                      {model.modelNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-300">
                      Model Variant
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Model Overview & Ordering */}
              <div className="lg:col-span-7 space-y-6">
                {/* Parent Product Link */}
                <Link
                  href={parentProductHref}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-all group"
                >
                  <span>← Parent Series:</span>
                  <span className="text-white font-bold group-hover:text-amber-400">{product.name}</span>
                </Link>

                <div className="space-y-2">
                  <div className="text-amber-400 font-mono text-xs tracking-widest uppercase font-bold">
                    MODEL OVERVIEW • {model.modelNumber}
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {model.name}
                  </h1>
                  {model.shortDescription && (
                    <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal">
                      {model.shortDescription}
                    </p>
                  )}
                </div>

                {model.description && (
                  <div className="text-slate-300/80 text-sm sm:text-base leading-relaxed border-t border-slate-800/80 pt-4 font-normal">
                    {model.description}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Quote for Model: ${model.modelNumber} (${model.name})`)}`}
                    className="px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <span>Request Quote for {model.modelNumber}</span>
                    <span>→</span>
                  </Link>

                  <Link
                    href={parentProductHref}
                    className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
                  >
                    View All {product.name} Models
                  </Link>
                </div>

                {/* Technical summary cards */}
                <div className="pt-6 border-t border-slate-800/60 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1 font-medium">Model Designation</span>
                    <span className="text-white font-mono font-bold text-sm">{model.modelNumber}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                    <span className="text-slate-400 block mb-1 font-medium">Parent Machinery</span>
                    <span className="text-amber-400 font-bold truncate block">{product.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Technical Specifications: Flexible 2-Row Table Builder Render (Auto-collapses if no specs) */}
        {hasSpecsTable && (
          <section id="specifications" className="py-16 sm:py-20 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                    <span>Technical Data Sheet</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    {model.modelNumber} Specifications
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Swipe horizontally on small screens to view all parameters →
                </p>
              </div>

              {/* 2-ROW SPECIFICATION TABLE (Row 1: Labels, Row 2: Values) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-900 via-[#0a1829] to-slate-900 border-b border-slate-800">
                      {tableColumns.map((col, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-xs font-extrabold text-slate-200 tracking-wider uppercase whitespace-nowrap border-r border-slate-800/80 last:border-r-0"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-slate-950/90 divide-x divide-slate-800/80">
                      {tableColumns.map((col, idx) => (
                        <td
                          key={idx}
                          className="px-6 py-5 text-sm font-bold text-amber-300 font-mono whitespace-nowrap"
                        >
                          {col.value}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* 4. Model Specific Features (Auto-collapses if no features) */}
        {hasFeatures && (
          <section className="py-16 sm:py-20 border-b border-slate-800/60 bg-[#050c18]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Model Specifics</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {model.modelNumber} Capabilities & Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {model.features!.map((feat, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:border-emerald-500/40 transition-colors">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span className="text-sm text-slate-300 leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. Technical Documentation & Catalog PDF (Auto-collapses if no PDF) */}
        <CatalogPdfSection
          catalogPdf={model.catalogPdf || product.catalogPdf}
          entityName={`${model.modelNumber} (${model.name})`}
          entityType="model"
          entitySlug={model.slug}
        />

        {/* 6. Premium Media Gallery (Auto-collapses if no media) */}
        <PremiumGallery
          media={model.galleryMedia}
          legacyGallery={model.media?.gallery}
          title={`${model.modelNumber} Visual Gallery`}
          subtitle="Individual model mechanical layout, tooling integration, and operational views"
        />

        {/* 7. Bottom Call to Action */}
        <section id="quote-section" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#091524] to-slate-900 border border-slate-800/90 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Order Model {model.modelNumber}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Contact our engineering sales team with your exact container dimensions, speed requirements, and factory layout to receive custom pricing and delivery lead times.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Order Model: ${model.modelNumber} (${model.name})`)}`}
                    className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95"
                  >
                    Request Quotation for {model.modelNumber}
                  </Link>
                  <Link
                    href={parentProductHref}
                    className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
                  >
                    Back to {product.name}
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
