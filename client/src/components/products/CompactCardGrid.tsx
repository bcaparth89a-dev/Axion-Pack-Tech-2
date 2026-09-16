"use client";

import React, { useState } from "react";

interface CompactCardGridProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  totalCount?: number;
  initialLimit?: number;
  badgeColor?: "amber" | "sky" | "emerald";
  children: React.ReactNode[];
}

export default function CompactCardGrid({
  id,
  eyebrow,
  title,
  subtitle,
  totalCount,
  initialLimit = 8,
  badgeColor = "amber",
  children,
}: CompactCardGridProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const items = React.Children.toArray(children);
  const count = totalCount !== undefined ? totalCount : items.length;
  const shouldPaginate = items.length > initialLimit;
  const visibleItems = isExpanded || !shouldPaginate ? items : items.slice(0, initialLimit);

  const isSky = badgeColor === "sky";
  const isEmerald = badgeColor === "emerald";

  const eyebrowColor = isSky
    ? "text-sky-400"
    : isEmerald
    ? "text-emerald-400"
    : "text-amber-400";

  const countBadge = isSky
    ? "bg-sky-950/60 border-sky-800/50 text-sky-300"
    : isEmerald
    ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
    : "bg-amber-950/60 border-amber-800/50 text-amber-300";

  return (
    <section id={id} className="py-12 sm:py-16 border-b border-slate-800/80">
      <div className="container-wide">
        {/* Compact Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            {eyebrow && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
                <span
                  className={`text-xs font-mono font-bold uppercase tracking-widest ${eyebrowColor}`}
                >
                  {eyebrow}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {title}
              </h2>
              {count > 0 && (
                <span
                  className={`px-2.5 py-0.5 rounded-lg border text-xs font-mono font-bold ${countBadge}`}
                >
                  {count} {count === 1 ? "Item" : "Items"}
                </span>
              )}
            </div>
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Responsive 94% Wide Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
          {visibleItems}
        </div>

        {/* Show More / Show Less Toggle (if large item count) */}
        {shouldPaginate && (
          <div className="mt-10 text-center pt-6 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
            >
              <span>
                {isExpanded
                  ? "Show Fewer Items ↑"
                  : `View All ${items.length} Items (+${items.length - initialLimit} more) ↓`}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
