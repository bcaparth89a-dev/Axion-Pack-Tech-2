import React from 'react';
import Link from 'next/link';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { ProductDetailResponse } from '@/types/products';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CmsImage from '@/components/common/CmsImage';
import DynamicHero from '@/components/common/DynamicHero';
import PremiumGallery from '@/components/common/PremiumGallery';
import CatalogPdfSection from '@/components/common/CatalogPdfSection';

interface ProductPageTemplateProps {
  data: ProductDetailResponse;
  currentPath: string;
}

export default function ProductPageTemplate({ data, currentPath }: ProductPageTemplateProps) {
  const { product, models, breadcrumbs } = data;

  const rawMainImage =
    product.media?.image ||
    product.media?.heroImage ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const mainImage = resolveMediaUrl(rawMainImage);

  const hasModels = Array.isArray(models) && models.length > 0;
  const hasSpecs = Array.isArray(product.specifications) && product.specifications.length > 0;
  const hasInfoPoints = Array.isArray(product.infoPoints) && product.infoPoints.length > 0;
  const hasFeatures = Array.isArray(product.features) && product.features.length > 0;

  // Group specifications by group category
  const groupedSpecs: Record<string, typeof product.specifications> = {};
  if (hasSpecs) {
    for (const spec of product.specifications!) {
      const groupName = spec.group?.trim() || 'General Parameters';
      if (!groupedSpecs[groupName]) {
        groupedSpecs[groupName] = [];
      }
      groupedSpecs[groupName]!.push(spec);
    }
  }
  const specGroupKeys = Object.keys(groupedSpecs);

  // Adaptive model grid configuration
  const modelGridClass =
    models && models.length === 1
      ? 'grid-cols-1 max-w-2xl mx-auto'
      : models && models.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-[#040911] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 bg-[#050c18]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      {/* 1. Dynamic Premium Product Hero Section */}
      <DynamicHero
        type="product"
        hero={product.hero}
        fallbackData={{
          title: product.name,
          subtitle: 'High-Throughput Industrial Machinery',
          description:
            product.shortDescription ||
            product.description ||
            'Explore engineered packaging machinery built for continuous uptime, high throughput, and seamless production line integration.',
          eyebrow: 'Equipment Specification',
          ctaText: hasModels ? 'Explore Models & Variants ↓' : hasSpecs ? 'Technical Specifications ↓' : 'Request Machine Quote',
          ctaLink: hasModels ? '#available-models' : hasSpecs ? '#specifications' : '#quote-section',
          backgroundImage: product.media?.heroImage || product.media?.image,
          mediaItems: [
            ...(product.media?.image ? [{ url: product.media.image, type: 'image' as const, title: `${product.name} Primary View` }] : []),
            ...(product.media?.heroImage && product.media.heroImage !== product.media.image ? [{ url: product.media.heroImage, type: 'image' as const, title: `${product.name} Showcase` }] : []),
            ...(Array.isArray(product.media?.gallery) ? product.media.gallery.map((g, i) => ({ url: g, type: 'image' as const, title: `${product.name} View ${i + 1}` })) : []),
            ...(product.media?.videoUrl ? [{ url: product.media.videoUrl, type: 'video' as const, title: `${product.name} Video Demonstration` }] : []),
            ...(hasModels ? models.slice(0, 4).filter(m => m.media?.image).map(m => ({ url: m.media!.image!, type: 'image' as const, title: `${m.name} (${m.modelNumber})` })) : [])
          ],
        }}
      />

      {/* Continuous Content Stream */}
      <div className="relative">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 2. Product Information: Image Showcase + Editorial Details & Numbered Info Points */}
        <section id="information" className="py-16 sm:py-20 border-b border-slate-800/60 bg-[#050c18]/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left: Product Image & Badges */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] shadow-2xl">
                  <CmsImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-300">
                      Industrial System
                    </span>
                    {hasModels && (
                      <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold backdrop-blur-md">
                        {models.length} {models.length === 1 ? 'Model' : 'Models'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Editorial Narrative */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
                    <span>Machine Architecture</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {product.name}
                  </h2>
                  {product.shortDescription && (
                    <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed font-normal">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                {product.description && (
                  <div className="text-slate-300/80 text-sm sm:text-base leading-relaxed border-t border-slate-800/80 pt-4 font-normal">
                    {product.description}
                  </div>
                )}

                {/* Numbered Engineering Highlights (01, 02, 03...) */}
                {hasInfoPoints && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-sky-400">
                      Engineering Highlights
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.infoPoints!.map((point, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 hover:border-sky-500/40 transition-colors"
                        >
                          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-300 leading-snug">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Quote Request: ${product.name}`)}`}
                    className="px-7 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <span>Request Machine Quote</span>
                    <span>→</span>
                  </Link>

                  {hasModels && (
                    <a
                      href="#available-models"
                      className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700 flex items-center gap-2"
                    >
                      <span>View All {models.length} Models</span>
                      <span>↓</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Specifications (Auto-collapses if no specs) */}
        {hasSpecs && (
          <section id="specifications" className="py-16 sm:py-20 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Technical Data Sheet</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {product.name} Specifications
                </h2>
              </div>

              <div className="space-y-8">
                {specGroupKeys.map((groupName, gIdx) => {
                  const specs = groupedSpecs[groupName] || [];
                  return (
                    <div key={gIdx} className="space-y-3">
                      {specGroupKeys.length > 1 && (
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {groupName}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {specs.map((spec, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/40 transition-colors"
                          >
                            <span className="text-xs text-slate-400 block mb-1">
                              {spec.label || spec.key}
                            </span>
                            <span className="text-sm font-bold text-amber-300 font-mono block">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 4. Core Engineering Features (Auto-collapses if no features) */}
        {hasFeatures && (
          <section id="features" className="py-16 sm:py-20 border-b border-slate-800/60 bg-[#050c18]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span>Core Capabilities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Engineering Features & Integration
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(product.features || []).map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] hover:-translate-y-1 group"
                  >
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-3 flex items-center justify-between">
                      <span>{String(idx + 1).padStart(2, '0')} — FEATURE</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-ping" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wide">
                      {feat}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Models & Variant Lineup (Adaptive Layout: 1, 2, or 3+ columns, Auto-collapses if no models) */}
        {hasModels && (
          <section id="available-models" className="py-16 sm:py-20 border-b border-slate-800/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                    Available Machine Configurations
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                    Models & Engineering Variants
                  </h2>
                </div>
                <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                  Every model has its own individual specifications and dedicated technical page. Click any model to view its detailed documentation.
                </p>
              </div>

              <div className={`grid ${modelGridClass} gap-6`}>
                {models.map((model) => {
                  const modelImage = resolveMediaUrl(
                    model.media?.image ||
                    model.media?.heroImage ||
                    mainImage
                  );
                  const modelHref = `${currentPath}/${model.slug}`;

                  return (
                    <Link
                      key={model._id}
                      href={modelHref}
                      className="group flex flex-col rounded-2xl overflow-hidden bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_12px_35px_-10px_rgba(245,158,11,0.2)] hover:-translate-y-1"
                    >
                      <div className="aspect-[16/10] relative w-full overflow-hidden bg-slate-950">
                        <CmsImage
                          src={modelImage}
                          alt={model.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-85"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#040911] via-[#040911]/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase shadow-lg">
                          {model.modelNumber}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                            {model.name}
                          </h3>
                          {model.shortDescription && (
                            <p className="mt-2 text-sm text-slate-400 line-clamp-2 leading-relaxed">
                              {model.shortDescription}
                            </p>
                          )}

                          {/* Top Specifications Preview */}
                          {model.specifications && model.specifications.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
                              {model.specifications.slice(0, 2).map((spec, sIdx) => (
                                <div key={sIdx} className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                                  <span className="text-slate-500 block truncate">{spec.label || spec.key}</span>
                                  <span className="text-amber-300 font-semibold block truncate">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                            View {model.modelNumber} Details
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

        {/* 6. Technical Documentation & Catalog PDF (Auto-collapses if no PDF) */}
        <CatalogPdfSection
          catalogPdf={product.catalogPdf}
          entityName={product.name}
          entityType="product"
          entitySlug={product.slug}
        />

        {/* 7. Premium Media Gallery (Auto-collapses if no media) */}
        <PremiumGallery
          media={product.galleryMedia}
          legacyGallery={product.media?.gallery}
          title={`${product.name} Visual Gallery`}
          subtitle="Machinery showcase, component engineering, and operational footage"
        />

        {/* 8. Bottom Call to Action */}
        <section id="quote-section" className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#091524] to-slate-900 border border-slate-800/90 p-8 sm:p-14 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Order or Configure {product.name}
                </h2>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Connect with our application specialists to receive technical drawings, line integration parameters, and factory delivery schedules.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Order Inquiry: ${product.name}`)}`}
                    className="px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-lg active:scale-95"
                  >
                    Request Official Quotation
                  </Link>
                  <Link
                    href="/products"
                    className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
                  >
                    Browse All Products
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
