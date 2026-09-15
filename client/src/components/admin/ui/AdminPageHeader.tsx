'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  badge?: string;
  description?: string;
  children?: React.ReactNode; // Action buttons
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  breadcrumbs = [],
  title,
  badge,
  description,
  children,
}) => {
  return (
    <div className="space-y-4 pb-2 border-b border-slate-800/80">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400" aria-label="Breadcrumb">
        <Link
          href="/admin"
          className="hover:text-sky-400 font-semibold uppercase tracking-wider text-[10px] text-slate-500 transition-colors"
        >
          AXION
        </Link>
        <span className="text-slate-700">/</span>
        <Link
          href="/admin"
          className="hover:text-sky-400 font-medium text-slate-400 transition-colors"
        >
          Admin
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.label + idx}>
            <span className="text-slate-700">/</span>
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-white text-slate-400 transition-colors truncate max-w-[150px] sm:max-w-none"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-200 font-semibold truncate max-w-[150px] sm:max-w-none">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* HEADER + ACTIONS ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950 text-sky-400 border border-sky-800/50">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-4xl">
              {description}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {children && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
