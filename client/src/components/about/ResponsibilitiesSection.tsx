import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import type { AboutPageData } from "@/lib/api/pages";

interface ResponsibilitiesSectionProps {
  data?: AboutPageData["responsibilitiesSection"];
}

export default function ResponsibilitiesSection({ data }: ResponsibilitiesSectionProps) {
  const badge = data?.badge || "Our Responsibility";
  const heading = data?.heading || "Our Responsibilities";
  const description =
    data?.description ||
    "At AXION PackTech, we believe engineering progress must go hand in hand with responsibility. We are committed to developing solutions that support efficient operations, responsible resource use, operator safety, and long-term sustainable growth.";
  const image = data?.image || "/images/about_sustainability.jpg";
  const badgeTitle = data?.badgeTitle || "Eco-Conscious Packaging Engineering";
  const badgeSubtitle =
    data?.badgeSubtitle || "Minimizing power consumption & eliminating packaging waste.";
  const points =
    Array.isArray(data?.points) && data.points.length > 0
      ? data.points
      : [
          "Energy-efficient drives engineered for reduced carbon footprint",
          "Sustainable, recyclable, and biodegradable bagging material support",
          "Uncompromising plant safety and ergonomically certified operator workflows",
        ];
  const ctaText = data?.ctaText || "Learn More";
  const ctaUrl = data?.ctaUrl || "/responsibilities";

  return (
    <section className="relative w-full bg-[#F8FAFC] py-20 sm:py-28 text-slate-800 border-b border-slate-200/80">
      {/* Background Subtle Blueprint Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0B192C 1px, transparent 1px), linear-gradient(90deg, #0B192C 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative container-wide">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ====================================================
              LEFT COLUMN: High-Quality Sustainability Image
          ==================================================== */}
          <div className="relative lg:col-span-6">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl">
              <div className="relative aspect-[4/3] w-full">
                <CmsImage
                  src={image}
                  alt="AXION PackTech Environmental Responsibility and Green Industrial Engineering"
                  fill
                  className="object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating Eco-Pledge Badge */}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 backdrop-blur-md p-4 border border-white/40 shadow-lg sm:bottom-6 sm:left-6 sm:right-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{badgeTitle}</p>
                    <p className="text-[11px] text-slate-500">{badgeSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              RIGHT COLUMN: Responsibility Narrative & Action
          ==================================================== */}
          <div className="space-y-6 lg:col-span-6">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              {badge}
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight">
              {heading}
            </h2>

            {/* Navy blue underline accent */}
            <div className="h-1 w-16 rounded-full bg-[#0B192C]" />

            {/* Description */}
            <p className="text-base sm:text-lg leading-relaxed text-slate-600">
              {description}
            </p>

            {/* Key Sustainability Points */}
            <div className="space-y-3 pt-2">
              {points.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs">✓</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            {ctaText && (
              <div className="pt-4">
                <Link
                  href={ctaUrl}
                  className="group inline-flex items-center gap-3 rounded-xl bg-[#0B192C] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-950 hover:shadow-lg active:scale-95"
                >
                  <span>{ctaText}</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
