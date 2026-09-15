'use client';

import React, { useState, useRef } from 'react';
import { CatalogPdf } from '@/types/products';
import { uploadFileDirectToR2 } from '@/lib/api/admin/media';
import { resolveMediaUrl } from '@/lib/utils/mediaUrl';
import { useToast } from '@/context/ToastContext';

export interface AdminPdfManagerProps {
  entityType: 'category' | 'product' | 'model';
  entityName: string;
  catalogPdf?: CatalogPdf;
  onChange: (updatedPdf: CatalogPdf | undefined) => void;
}

export const AdminPdfManager: React.FC<AdminPdfManagerProps> = ({
  entityType: _entityType,
  entityName,
  catalogPdf,
  onChange,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hasPdf = Boolean(catalogPdf && catalogPdf.url && catalogPdf.url.trim());
  const resolvedPdfUrl = hasPdf ? resolveMediaUrl(catalogPdf!.url) : '';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Please select a valid PDF file (*.pdf)', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploaded = await uploadFileDirectToR2(file, {
        category: 'catalog',
        title: `${entityName} Catalog`,
        onProgress: (percent) => setUploadProgress(percent),
      });

      onChange({
        url: uploaded.url,
        name: file.name,
        size: file.size,
        key: uploaded.key,
      });

      showToast('Catalog PDF uploaded successfully directly to R2!', 'success');
    } catch (err: unknown) {
      showToast(`Failed to upload PDF: ${(err as Error)?.message || 'Error'}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    showToast('Catalog PDF removed', 'info');
  };

  const formatSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'PDF Document';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Technical Documentation & Catalog PDF
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Attach an official technical catalog or engineering datasheet PDF. Binary stored directly in Cloudflare R2.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
        id="pdf-document-upload"
      />

      {/* Progress Bar */}
      {isUploading && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <span>Uploading PDF directly to Cloudflare R2...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current PDF State or Upload Box */}
      {hasPdf ? (
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div>
                <div className="text-sm font-bold text-white truncate max-w-md">
                  {catalogPdf?.name || `${entityName} Catalog.pdf`}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-0.5">
                  {formatSize(catalogPdf?.size)} • Stored in R2
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                View PDF ↗
              </a>
              <label
                htmlFor="pdf-document-upload"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors"
              >
                Replace
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-300">No Catalog PDF Attached</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upload a technical specification sheet or brochure PDF for visitors to download.
            </p>
          </div>
          <div>
            <label
              htmlFor="pdf-document-upload"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload PDF Document</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
