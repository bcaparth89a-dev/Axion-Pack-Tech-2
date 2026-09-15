import React from "react";

interface SectionSkeletonProps {
  dark?: boolean;
  cards?: number;
  height?: string;
}

export default function SectionSkeleton({
  dark = false,
  cards = 3,
  height = "min-h-[400px]",
}: SectionSkeletonProps) {
  const bg = dark ? "bg-[#061527] text-white" : "bg-slate-50 text-slate-800";
  const pulseBg = dark ? "bg-slate-800/60" : "bg-slate-200/80";

  return (
    <section className={`py-16 sm:py-24 ${bg} border-b ${dark ? "border-slate-800" : "border-slate-200"} ${height}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 animate-pulse">
        {/* Header Skeleton */}
        <div className="mx-auto max-w-2xl text-center space-y-3 mb-12">
          <div className={`mx-auto h-4 w-32 rounded-full ${pulseBg}`} />
          <div className={`mx-auto h-8 w-3/4 rounded-xl ${pulseBg}`} />
          <div className={`mx-auto h-3 w-16 rounded-full ${dark ? "bg-amber-400/40" : "bg-brand-orange/40"}`} />
          <div className={`mx-auto h-4 w-5/6 rounded-lg ${pulseBg}`} />
        </div>

        {/* Cards Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: cards }).map((_, i) => (
            <div
              key={i}
              className={`rounded-3xl overflow-hidden border ${
                dark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"
              } p-4 space-y-4`}
            >
              <div className={`aspect-[16/10] w-full rounded-2xl ${pulseBg}`} />
              <div className="space-y-2 pt-2">
                <div className={`h-5 w-3/4 rounded-md ${pulseBg}`} />
                <div className={`h-3.5 w-full rounded-md ${pulseBg}`} />
                <div className={`h-3.5 w-2/3 rounded-md ${pulseBg}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
