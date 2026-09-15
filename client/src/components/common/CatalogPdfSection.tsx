'use client';

import React, { useState } from 'react';
import { CatalogPdf } from '@/types/products';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import CatalogLeadModal from './CatalogLeadModal';

export interface CatalogPdfSectionProps {
  catalogPdf?: CatalogPdf;
  legacyDocuments?: string[];
  entityName: string;
  entityType?: 'category' | 'product' | 'model' | 'general';
  entitySlug?: string;
  className?: string;
}

export default function CatalogPdfSection({
  catalogPdf,
  legacyDocuments,
  entityName,
  entityType = 'general',
  entitySlug = '',
  className = '',
}: CatalogPdfSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  let pdfUrl = '';
  let pdfName = '';
  let pdfSize = 0;

  if (catalogPdf && catalogPdf.url && catalogPdf.url.trim()) {
    pdfUrl = resolveMediaUrl(catalogPdf.url);
    pdfName = catalogPdf.name || `${entityName} - Technical Documentation.pdf`;
    pdfSize = catalogPdf.size || 0;
  } else if (Array.isArray(legacyDocuments) && legacyDocuments.length > 0 && legacyDocuments[0]?.trim()) {
    pdfUrl = resolveMediaUrl(legacyDocuments[0]);
    pdfName = `${entityName} - Technical Data Sheet.pdf`;
  }

  if (!pdfUrl) {
    return null;
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Technical Document (PDF)';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB PDF`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB PDF`;
  };

  return (
    <>
      <section id="catalog" className={`py-16 border-b border-slate-800/80 bg-[#081220]/60 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a1829] to-slate-900 border border-slate-800/90 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            {/* Subtle accent glow */}
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              {/* Left: Icon & Meta */}
              <div className="flex items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-bold tracking-widest uppercase">
                    <span>Official Catalog & Datasheet</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {pdfName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                    Contains certified mechanical layout schematics, electrical ratings, capacity ranges, and OEM dimension footprints.
                  </p>
                  <div className="pt-1 text-xs font-mono text-slate-500">
                    {formatFileSize(pdfSize)} • Cloudflare R2 Verified
                  </div>
                </div>
              </div>

              {/* Right: Download Lead Modal Trigger Button */}
              <div className="flex sm:shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download Catalog PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Lead Form Modal */}
      <CatalogLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pdfUrl={pdfUrl}
        pdfName={pdfName}
        pdfSize={pdfSize}
        catalogName={pdfName || `${entityName} Catalog`}
        entityType={entityType}
        entitySlug={entitySlug}
      />
    </>
  );
}
