import React from "react";
import Link from "next/link";
import CmsImage from "@/components/common/CmsImage";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

export interface CompactCatalogCardProps {
  href: string;
  name: string;
  type: "subcategory" | "product" | "model" | "related";
  badge?: string;
  image?: string;
  fallbackImage?: string;
  shortDescription?: string;
  description?: string;
  modelCount?: number;
  modelNumber?: string;
  isFeatured?: boolean;
  specsPreview?: Array<{ label: string; value: string }>;
  actionLabel?: string;
  accentColor?: "amber" | "sky" | "emerald";
}

export default function CompactCatalogCard({
  href,
  name,
  type,
  badge,
  image,
  fallbackImage = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  shortDescription,
  description,
  modelCount,
  modelNumber,
  isFeatured,
  specsPreview,
  actionLabel,
  accentColor = "amber",
}: CompactCatalogCardProps) {
  const imageUrl = resolveMediaUrl(image) || fallbackImage;
  const snippet = shortDescription || description;

  const defaultAction =
    actionLabel ||
    (type === "subcategory"
      ? "Explore Division"
      : type === "product"
      ? "View Machinery"
      : type === "model"
      ? "View Specifications"
      : "View Details");

  const isSky = accentColor === "sky";
  const isEmerald = accentColor === "emerald";

  const hoverBorder = isSky
    ? "hover:border-sky-400/60 hover:shadow-[0_12px_28px_-8px_rgba(14,165,233,0.22)]"
    : isEmerald
    ? "hover:border-emerald-400/60 hover:shadow-[0_12px_28px_-8px_rgba(16,185,129,0.22)]"
    : "hover:border-amber-400/60 hover:shadow-[0_12px_28px_-8px_rgba(245,158,11,0.22)]";

  const titleHoverColor = isSky
    ? "group-hover:text-sky-300"
    : isEmerald
    ? "group-hover:text-emerald-300"
    : "group-hover:text-amber-400";

  const arrowBadge = isSky
    ? "bg-sky-500/10 border-sky-500/20 text-sky-400 group-hover:bg-sky-400 group-hover:text-slate-950"
    : isEmerald
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-950"
    : "bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950";

  return (
    <Link
      href={href}
      className={`group flex flex-col rounded-xl overflow-hidden bg-[#071324]/85 hover:bg-[#0a1b33] border border-slate-800/90 transition-all duration-200 hover:-translate-y-0.5 ${hoverBorder} h-full shadow-sm`}
    >
      {/* Compact Image Header */}
      <div className="aspect-[16/10] relative w-full overflow-hidden bg-slate-950 shrink-0">
        <CmsImage
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-85 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-transparent to-transparent opacity-80" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {modelNumber ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md">
              {modelNumber}
            </span>
          ) : badge ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono font-bold text-amber-400">
              {badge}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-semibold text-slate-300">
              {type === "subcategory" ? "Division" : type === "product" ? "Equipment" : "Model"}
            </span>
          )}

          {modelCount !== undefined && modelCount > 0 ? (
            <span className="px-2 py-0.5 rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-300 text-[10px] font-mono font-bold backdrop-blur-md">
              {modelCount} {modelCount === 1 ? "Model" : "Models"}
            </span>
          ) : isFeatured ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            className={`text-sm sm:text-base font-bold text-white transition-colors line-clamp-1 leading-snug ${titleHoverColor}`}
            title={name}
          >
            {name}
          </h3>

          {snippet && (
            <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {snippet}
            </p>
          )}

          {/* Optional Compact 2-Item Specifications Preview */}
          {specsPreview && specsPreview.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              {specsPreview.slice(0, 2).map((s, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80 truncate"
                >
                  <span className="text-slate-400 block truncate">{s.label}</span>
                  <span className="text-amber-300 font-semibold block truncate">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400 group-hover:text-slate-200 transition-colors text-[11px] truncate">
            {defaultAction}
          </span>
          <span
            className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold transition-all shrink-0 ${arrowBadge}`}
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
