import { getCompanyStats } from "@/lib/api/settings";

export default async function CompanyStatsSection() {
  const statsData = await getCompanyStats();

  // Strict zero empty space: hide section if stats are inactive or empty
  if (!statsData || !statsData.isActive || !Array.isArray(statsData.stats) || statsData.stats.length === 0) {
    return null;
  }

  const stats = statsData.stats;

  const gridClass =
    stats.length === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : stats.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
      : stats.length === 3
      ? "grid-cols-1 sm:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="relative w-full bg-[#040911] py-16 md:py-20 lg:py-24 border-y border-slate-800/80 overflow-hidden">
      {/* Engineering Grid Accent Overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-5 bg-grid-blueprint" />

      {/* Ambient Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-[800px] bg-sky-600/10 rounded-full blur-3xl" />

      <div className="container-wide relative z-10">
        <div className={`grid ${gridClass} gap-6 sm:gap-8 lg:gap-8`}>
          {stats.map((stat, idx) => (
            <div
              key={stat.label || idx}
              className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#061527]/90 border border-slate-800/90 shadow-xl transition-all hover:border-amber-400/40 hover:-translate-y-1"
            >
              {/* Golden / Yellow Industrial Number with Prefix & Suffix */}
              <span className="text-5xl sm:text-5xl lg:text-6xl font-black tracking-tight text-amber-400 font-mono">
                {stat.prefix || ""}{stat.value}{stat.suffix || ""}
              </span>

              {/* Accent Divider Line */}
              <div className="my-3 h-1 w-12 rounded-full bg-gradient-to-r from-brand-orange to-amber-400" />

              {/* Uppercase Metric Label */}
              <span className="text-xs sm:text-sm font-bold tracking-[0.16em] text-slate-200 uppercase font-mono">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
