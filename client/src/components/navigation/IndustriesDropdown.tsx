"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useIndustriesData } from "@/hooks/useIndustriesData";

interface IndustriesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function IndustriesDropdown({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: IndustriesDropdownProps) {
  const { industries } = useIndustriesData();
  const dropdownRef = useRef<HTMLDivElement>(null);


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
      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[840px] max-w-[94vw] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Mega Menu Box */}
      <div className="relative overflow-hidden rounded-2xl bg-[#061527] border border-sky-500/30 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_25px_rgba(2,132,199,0.25)] text-white backdrop-blur-xl">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
                  Industries We Serve
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Engineering solutions customized across diverse manufacturing sectors.
              </p>
            </div>
            <Link
              href="/industries"
              onClick={onClose}
              className="text-xs font-bold text-sky-300 hover:text-white bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-700/40 hover:border-sky-400 transition-all"
            >
              View All Industries →
            </Link>
          </div>

          {/* Industries Grid (2 columns on desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                onClick={onClose}
                className="group flex items-start gap-3.5 p-3 rounded-xl bg-white/[0.03] hover:bg-sky-600/20 border border-slate-700/40 hover:border-sky-400/50 transition-all duration-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-lg border border-slate-700 group-hover:scale-110 group-hover:border-sky-400 transition-all duration-300">
                  {ind.icon || '🏭'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                      {ind.title}
                    </h4>
                    <span className="text-xs text-slate-500 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all">
                      →
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
                    {ind.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Bar: Quick Support */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Specialized material testing and line evaluations available.</span>
            <Link
              href="/contact"
              onClick={onClose}
              className="text-sky-300 hover:text-white font-medium underline-offset-4 hover:underline"
            >
              Discuss Your Industry Application →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
