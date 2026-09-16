'use client';

import React from 'react';
import { CatalogItem } from '@/types/products';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CmsImage from '@/components/common/CmsImage';

interface BrochureCardProps {
  catalog: CatalogItem;
  onDownloadClick: (catalog: CatalogItem) => void;
}

export default function BrochureCard({ catalog, onDownloadClick }: BrochureCardProps) {
  const thumbnailUrl = resolveMediaUrl(
    catalog.thumbnail || '/images/products/conveyor-default.jpg'
  );

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Technical PDF';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB PDF`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB PDF`;
  };

  const hierarchyBreadcrumb = [
    catalog.categoryName,
    catalog.productName && catalog.productName !== catalog.categoryName
      ? catalog.productName
      : null,
    catalog.modelNumber || (catalog.entityType === 'model' ? catalog.name : null),
  ]
    .filter(Boolean)
    .join('  ›  ');

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-xl border border-slate-200/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 overflow-hidden">
      {/* Physical brochure spine line on left edge */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-900 group-hover:bg-brand-orange transition-colors duration-300 z-10" />

      {/* Top Cover Image / Brochure Thumbnail */}
      <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden pl-1.5">
        <CmsImage
          src={thumbnailUrl}
          alt={`${catalog.name} Catalog Cover`}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Subtle Dark Matte Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Technical Document Code Badge */}
        <div className="absolute top-3 left-4 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-900/90 backdrop-blur-md text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 border border-white/10 shadow-sm">
            {catalog.entityType === 'category'
              ? 'CATEGORY BROCHURE'
              : catalog.entityType === 'model'
              ? 'MODEL SPEC SHEET'
              : 'PRODUCT CATALOG'}
          </span>
        </div>

        {/* PDF File Size Pill */}
        <div className="absolute bottom-2.5 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-medium text-amber-400 border border-amber-500/20 shadow-sm">
            <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{formatFileSize(catalog.catalogPdf?.size)}</span>
          </span>
        </div>
      </div>

      {/* Brochure Content Section */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 pl-6 sm:pl-7">
        {/* Hierarchy Breadcrumb Strip */}
        {hierarchyBreadcrumb && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700 font-mono mb-2 line-clamp-1">
            {hierarchyBreadcrumb}
          </div>
        )}

        {/* Catalog Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-sky-950 transition-colors leading-snug">
          {catalog.catalogPdf?.name && catalog.catalogPdf.name.endsWith('.pdf')
            ? catalog.catalogPdf.name.replace(/\.pdf$/i, '')
            : `${catalog.name} Catalog`}
        </h3>

        {/* Short Summary */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
          {catalog.shortDescription || 'Technical datasheet and engineered specifications brochure.'}
        </p>

        {/* Bottom Metadata & Action Strip */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>R2 Verified</span>
          </div>

          <button
            type="button"
            onClick={() => onDownloadClick(catalog)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-brand-orange text-white text-xs font-bold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Download Catalog</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
