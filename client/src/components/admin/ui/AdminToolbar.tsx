'use client';

import React from 'react';

interface AdminToolbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  totalCount?: number;
  filteredCount?: number;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  onClearFilters,
  hasActiveFilters,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-[#071524] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Search + Dropdown Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
          {/* Search Input */}
          {onSearchChange !== undefined && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg
                className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-[#040c16] border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Additional Filter Selects */}
          {filters}

          {/* Reset / Clear Button */}
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1"
            >
              <span>✕</span>
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Total Count + View Switcher + Custom Actions */}
        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
          {/* Count Indicator */}
          {totalCount !== undefined && (
            <span className="text-[11px] font-mono text-slate-400">
              {filteredCount !== undefined && filteredCount !== totalCount ? (
                <span>
                  Showing <strong className="text-white">{filteredCount}</strong> of {totalCount}
                </span>
              ) : (
                <span>
                  Total: <strong className="text-white">{totalCount}</strong>
                </span>
              )}
            </span>
          )}

          {/* Grid / Table Toggle */}
          {onViewModeChange && viewMode && (
            <div className="flex items-center bg-[#040c16] border border-slate-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table view"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          )}

          {/* Custom Action Buttons */}
          {actions}
        </div>
      </div>
    </div>
  );
};
