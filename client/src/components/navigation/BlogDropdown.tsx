"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useBlogsData } from "@/hooks/useBlogsData";

interface BlogDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function BlogDropdown({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: BlogDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { categories: blogCategories } = useBlogsData();


  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[740px] max-w-[94vw] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Mega Menu Box */}
      <div className="relative overflow-hidden rounded-2xl bg-[#061527] border border-sky-500/30 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_25px_rgba(2,132,199,0.25)] text-white backdrop-blur-xl">
        {/* Subtle engineering grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                  AXION INSIGHTS &amp; BLOG
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Expert insights, packaging technology trends, automation guides, and engineering knowledge.
              </p>
            </div>
            <Link
              href="/blog"
              onClick={onClose}
              className="text-xs font-bold text-sky-300 hover:text-white bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-700/40 hover:border-sky-400 transition-all flex items-center gap-1.5"
            >
              <span>Latest Articles</span>
              <span>→</span>
            </Link>
          </div>

          {/* 6 Blog Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {blogCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/blog/category/${category.slug}`}
                onClick={onClose}
                className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-sky-600/20 border border-slate-700/40 hover:border-sky-400/50 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Category Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 text-base border border-slate-700 group-hover:scale-110 group-hover:border-sky-400 group-hover:bg-sky-950 transition-all duration-300 shadow-sm">
                    {category.icon}
                  </div>

                  {/* Category Title & Badge */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                        {category.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Arrow */}
                <div className="shrink-0 flex items-center">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 text-[11px] text-slate-400 group-hover:bg-brand-orange group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200 shadow-sm">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Bar with "Explore All Articles →" Link */}
          <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              In-depth engineering articles published by AXION PackTech specialists.
            </span>
            <Link
              href="/blog"
              onClick={onClose}
              className="inline-flex items-center gap-2 font-bold text-brand-orange hover:text-amber-300 transition-colors"
            >
              <span>Explore All Articles &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
