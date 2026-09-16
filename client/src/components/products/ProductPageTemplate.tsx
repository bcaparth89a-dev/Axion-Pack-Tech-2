import React from 'react';
import Link from 'next/link';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { ProductDetailResponse, CatalogChildItem } from '@/types/products';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CmsImage from '@/components/common/CmsImage';
import DynamicHero from '@/components/common/DynamicHero';
import PremiumGallery from '@/components/common/PremiumGallery';
import CatalogPdfSection from '@/components/common/CatalogPdfSection';
import CatalogChildrenSection from './CatalogChildrenSection';

interface ProductPageTemplateProps {
  data: ProductDetailResponse;
  currentPath: string;
}

export default function ProductPageTemplate({ data, currentPath }: ProductPageTemplateProps) {
  const { product, models, directChildren, breadcrumbs } = data;

  const rawMainImage =
    product.media?.image ||
    product.media?.heroImage ||
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
  const mainImage = resolveMediaUrl(rawMainImage);

  // Build unified children list (prefer directChildren from API, or fallback to models)
  const unifiedChildren: CatalogChildItem[] =
    Array.isArray(directChildren) && directChildren.length > 0
      ? directChildren
      : Array.isArray(models)
      ? models.map((m) => ({
          _id: m._id,
          name: m.name,
          slug: m.slug,
          type: 'model' as const,
          modelNumber: m.modelNumber,
          shortDescription: m.shortDescription,
          description: m.description,
          media: m.media,
          displayOrder: m.displayOrder,
          isActive: m.isActive,
        }))
      : [];

  const hasChildren = unifiedChildren.length > 0;
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

  return (
    <div className="min-h-screen bg-[#040911] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Top Breadcrumb Bar - 94% Wide */}
      <div className="border-b border-slate-800/80 bg-[#061527]/90 backdrop-blur-md sticky top-16 z-30">
        <div className="container-wide py-2.5">
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
          ctaText: hasChildren ? 'Explore Range & Variants ↓' : hasSpecs ? 'Technical Specifications ↓' : 'Request Machine Quote',
          ctaLink: hasChildren ? '#product-children' : hasSpecs ? '#specifications' : '#quote-section',
          backgroundImage: product.media?.heroImage || product.media?.image,
          mediaItems: [
            ...(product.media?.image ? [{ url: product.media.image, type: 'image' as const, title: `${product.name} Primary View` }] : []),
            ...(product.media?.heroImage && product.media.heroImage !== product.media.image ? [{ url: product.media.heroImage, type: 'image' as const, title: `${product.name} Showcase` }] : []),
            ...(Array.isArray(product.media?.gallery) ? product.media.gallery.map((g, i) => ({ url: g, type: 'image' as const, title: `${product.name} View ${i + 1}` })) : []),
            ...(product.media?.videoUrl ? [{ url: product.media.videoUrl, type: 'video' as const, title: `${product.name} Video Demonstration` }] : []),
            ...(Array.isArray(models) ? models.slice(0, 4).filter(m => m.media?.image).map(m => ({ url: m.media!.image!, type: 'image' as const, title: `${m.name} (${m.modelNumber})` })) : [])
          ],
        }}
      />

      {/* Continuous Content Stream */}
      <div className="relative">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* 2. Product Information: Image Showcase + Editorial Narrative & Numbered Info Points */}
        <section id="information" className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#061527]/50">
          <div className="container-wide relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Left: Product Image & Badges (Col span 5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 aspect-[4/3] shadow-2xl">
                  <CmsImage
                    src={mainImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono font-semibold text-slate-300">
                      Industrial Machine
                    </span>
                    {hasChildren && (
                      <span className="px-3 py-1 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-mono font-bold backdrop-blur-md">
                        {unifiedChildren.length} {unifiedChildren.length === 1 ? 'Variant' : 'Variants & Options'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Editorial Narrative (Col span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-semibold uppercase tracking-wider">
                    <span>Machine Architecture &amp; Integration</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {product.name}
                  </h2>
                  {product.shortDescription && (
                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                      {product.shortDescription}
                    </p>
                  )}
                </div>

                {product.description && (
                  <div className="text-slate-300/90 text-sm sm:text-base leading-relaxed border-t border-slate-800/80 pt-4 font-normal">
                    {product.description}
                  </div>
                )}

                {/* Numbered Engineering Highlights (01, 02, 03...) */}
                {hasInfoPoints && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
                      Engineering Highlights
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.infoPoints!.map((point, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 hover:border-sky-500/40 transition-colors"
                        >
                          <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20 shrink-0">
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
                    className="px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2"
                  >
                    <span>Request Official Quotation</span>
                    <span>→</span>
                  </Link>

                  {hasChildren && (
                    <a
                      href="#product-children"
                      className="px-6 py-3.5 rounded-xl bg-[#0B1E36] hover:bg-sky-950 text-white font-semibold text-xs sm:text-sm transition-colors border border-sky-800/60 flex items-center gap-2"
                    >
                      <span>View Range &amp; Models ({unifiedChildren.length})</span>
                      <span>↓</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Product Children / Related Catalog (Universal Section: Categories, Products, Models) */}
        {hasChildren && (
          <CatalogChildrenSection
            id="product-children"
            eyebrow="Product Range & Variants"
            title={`Explore Range for ${product.name}`}
            subtitle="Browse available model designations, system extensions, and modular sub-equipment."
            childrenItems={unifiedChildren}
            parentPath={currentPath}
            badgeColor="sky"
            initialLimit={12}
          />
        )}

        {/* 4. Specific Features (Points Only with Checkmarks) */}
        {hasFeatures && (
          <section id="features" className="py-14 sm:py-20 border-b border-slate-800/80 bg-[#061527]/30">
            <div className="container-wide">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                  <span>Key Engineering Features</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Core Machine Capabilities
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.features!.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-emerald-400 font-bold shrink-0 text-base">✓</span>
                    <span className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 5. Product Specifications (Auto-collapses if no specs) */}
        {hasSpecs && (
          <section id="specifications" className="py-14 sm:py-20 border-b border-slate-800/80">
            <div className="container-wide">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                  <span>Technical Data Sheet</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {product.name} Engineering Specifications
                </h2>
              </div>

              <div className="space-y-6">
                {specGroupKeys.map((groupName, gIdx) => {
                  const specs = groupedSpecs[groupName] || [];
                  return (
                    <div key={gIdx} className="space-y-3">
                      {specGroupKeys.length > 1 && (
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {groupName}
                        </h3>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                        {specs.map((spec, sIdx) => (
                          <div
                            key={sIdx}
                            className="p-4 rounded-2xl bg-[#061527] border border-slate-800 hover:border-amber-400/40 transition-colors"
                          >
                            <span className="text-[11px] font-mono text-slate-400 block mb-1">
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

        {/* 6. Technical Documentation & Catalog PDF */}
        <CatalogPdfSection
          catalogPdf={product.catalogPdf}
          entityName={product.name}
          entityType="product"
          entitySlug={product.slug}
        />

        {/* 7. Premium Media Gallery */}
        <PremiumGallery
          media={product.galleryMedia}
          legacyGallery={product.media?.gallery}
          title={`${product.name} Visual Gallery`}
          subtitle="Machinery showcase, component engineering, and operational footage"
        />

        {/* 8. Bottom Call to Action */}
        <section id="quote-section" className="py-16 sm:py-24">
          <div className="container-wide text-center">
            <div className="rounded-3xl bg-gradient-to-r from-[#040911] via-[#061527] to-[#040911] border border-slate-800 p-8 sm:p-14 shadow-2xl relative overflow-hidden max-w-5xl mx-auto">
              <div className="relative z-10 space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-brand-orange font-bold">
                  Custom Engineering Support
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Configure or Integrate {product.name}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                  Connect with our application specialists to receive CAD footprint drawings, electrical schematics,
                  line integration parameters, and factory delivery schedules.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href={`/contact?subject=${encodeURIComponent(`Order Inquiry: ${product.name}`)}`}
                    className="px-8 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
                  >
                    Request Quotation &amp; Drawings
                  </Link>
                  <Link
                    href="/catalogs"
                    className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm transition-colors border border-slate-700"
                  >
                    Download Technical Datasheet
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
