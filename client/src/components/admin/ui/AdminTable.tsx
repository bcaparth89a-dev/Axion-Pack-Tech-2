'use client';

import React from 'react';

export interface AdminTableProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filterComponent?: React.ReactNode;
  children: React.ReactNode;
  totalCount?: number;
  isLoading?: boolean;
}

export const AdminTable: React.FC<AdminTableProps> = ({
  title,
  description,
  actionButton,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterComponent,
  children,
  totalCount,
  isLoading,
}) => {
  return (
    <div className="bg-[#071524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#040d18] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>
            {totalCount !== undefined && (
              <span className="px-2 py-0.5 bg-[#071524] text-sky-400 text-xs font-mono font-bold rounded-full border border-sky-800/40">
                {totalCount}
              </span>
            )}
          </div>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onSearchChange && (
            <div className="relative">
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-48 sm:w-64 pl-9 pr-3 py-1.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              <svg
                className="w-4 h-4 text-slate-500 absolute left-2.5 top-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}

          {filterComponent}

          {actionButton}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">Loading data records...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
