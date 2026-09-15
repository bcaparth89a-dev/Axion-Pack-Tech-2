'use client';

import React from 'react';

interface AdminLoadingStateProps {
  type?: 'cards' | 'table' | 'tree' | 'form';
  count?: number;
  message?: string;
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  type = 'cards',
  count = 6,
  message = 'Loading data...',
}) => {
  if (type === 'table') {
    return (
      <div className="w-full bg-[#071524] border border-slate-800 rounded-2xl p-4 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-800/60 rounded-xl w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-800/40">
            <div className="w-10 h-10 bg-slate-800/70 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-800/80 rounded w-1/3" />
              <div className="h-3 bg-slate-800/50 rounded w-1/4" />
            </div>
            <div className="h-6 bg-slate-800/60 rounded-full w-20" />
            <div className="h-8 bg-slate-800/70 rounded-xl w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'tree') {
    return (
      <div className="w-full bg-[#071524] border border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 bg-[#050e18] rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-slate-800 rounded" />
              <div className="h-5 bg-slate-800 rounded w-1/4" />
              <div className="h-5 bg-slate-800/60 rounded w-16 ml-auto" />
            </div>
            <div className="pl-8 space-y-2">
              <div className="h-4 bg-slate-800/60 rounded w-1/3" />
              <div className="h-4 bg-slate-800/40 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="w-full bg-[#071524] border border-slate-800 rounded-2xl p-6 space-y-6 animate-pulse">
        <div className="h-6 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-12 bg-slate-800/70 rounded-xl" />
          <div className="h-12 bg-slate-800/70 rounded-xl" />
        </div>
        <div className="h-28 bg-slate-800/60 rounded-xl" />
        <div className="h-10 bg-slate-800/80 rounded-xl w-32 ml-auto" />
      </div>
    );
  }

  // Default: Cards Grid
  return (
    <div className="space-y-4">
      {message && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-3.5 h-3.5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-[#071524] border border-slate-800 rounded-2xl space-y-3 animate-pulse"
          >
            <div className="w-full h-36 bg-slate-800/70 rounded-xl" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-5 bg-slate-800/60 rounded-full w-16" />
              <div className="h-7 bg-slate-800 rounded-xl w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
