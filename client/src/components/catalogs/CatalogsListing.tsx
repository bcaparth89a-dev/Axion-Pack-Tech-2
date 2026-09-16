'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { CatalogItem } from '@/types/products';
import BrochureCard from './BrochureCard';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';

const CatalogLeadModal = dynamic(() => import('@/components/common/CatalogLeadModal'), {
  ssr: false,
});

interface CatalogsListingProps {
  initialCatalogs: CatalogItem[];
}

export default function CatalogsListing({ initialCatalogs }: CatalogsListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogItem | null>(null);

  // Derive unique categories from active catalogs
  const categoryFilters = useMemo(() => {
    const cats = new Set<string>();
    for (const item of initialCatalogs) {
      if (item.categoryName) {
        cats.add(item.categoryName);
      }
    }
    return Array.from(cats).sort();
  }, [initialCatalogs]);

  // Filter catalogs by selected category tab and search query
  const filteredCatalogs = useMemo(() => {
    return initialCatalogs.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        item.name.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(q)) ||
        (item.productName && item.productName.toLowerCase().includes(q)) ||
        (item.modelNumber && item.modelNumber.toLowerCase().includes(q)) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(q)) ||
        (item.catalogPdf?.name && item.catalogPdf.name.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialCatalogs, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Top Architectural Filter & Search Toolbar */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-xl bg-white border border-slate-200 p-3 sm:p-4 shadow-sm">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Catalogs ({initialCatalogs.length})
            </button>

            {categoryFilters.map((cat) => {
              const count = initialCatalogs.filter(
                (c) => c.categoryName?.toLowerCase() === cat.toLowerCase()
              ).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-sky-800 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by machinery, model, spec..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Metadata Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
          <span>
            DISPLAYING <strong>{filteredCatalogs.length}</strong> OF {initialCatalogs.length} OFFICIAL BROCHURES
          </span>
          {searchQuery && (
            <span className="text-sky-700">
              FILTER: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Brochure Cards Grid or Clean Empty State */}
      {filteredCatalogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCatalogs.map((catalog) => (
            <BrochureCard
              key={`${catalog.entityType}-${catalog.id}`}
              catalog={catalog}
              onDownloadClick={(item) => setSelectedCatalog(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm max-w-2xl mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-3xl mx-auto mb-4">
            📄
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {initialCatalogs.length === 0
              ? 'No Catalogs Published Yet'
              : 'No Catalogs Match Your Search'}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            {initialCatalogs.length === 0
              ? 'Technical product catalogs and machine datasheets will appear here once uploaded via the Admin Portal.'
              : 'Try clearing your search query or selecting a different category tab to view all available technical brochures.'}
          </p>
          {initialCatalogs.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Existing Lead Form Modal for PDF Download */}
      {selectedCatalog && (
        <CatalogLeadModal
          isOpen={Boolean(selectedCatalog)}
          onClose={() => setSelectedCatalog(null)}
          pdfUrl={resolveMediaUrl(selectedCatalog.catalogPdf.url)}
          pdfName={selectedCatalog.catalogPdf.name || `${selectedCatalog.name} Catalog.pdf`}
          pdfSize={selectedCatalog.catalogPdf.size}
          catalogName={selectedCatalog.catalogPdf.name || `${selectedCatalog.name} Catalog`}
          entityType={selectedCatalog.entityType}
          entitySlug={selectedCatalog.slug}
        />
      )}
    </div>
  );
}
