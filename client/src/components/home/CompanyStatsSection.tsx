import { getCompanyStats } from "@/lib/api/settings";

interface StatItem {
  value: string;
  label: string;
}

const defaultStats: StatItem[] = [
  {
    value: "2000",
    label: "ESTABLISHED",
  },
  {
    value: "25+",
    label: "PRODUCTS",
  },
  {
    value: "4000+",
    label: "INDUSTRIES SERVED",
  },
  {
    value: "2500+",
    label: "PROJECTS EXECUTED",
  },
];

export default async function CompanyStatsSection() {
  const statsData = await getCompanyStats();
  const stats = statsData.stats && statsData.stats.length > 0 ? statsData.stats : defaultStats;
  return (
    <section className="relative w-full bg-[#061527] py-16 md:py-20 lg:py-24 border-y border-slate-800/80 overflow-hidden">
      {/* Engineering Grid Accent Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8 lg:gap-6 divide-y sm:divide-y-0 divide-slate-800/60">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center text-center ${
                idx !== 0 ? "pt-8 sm:pt-0 sm:border-l sm:border-slate-800/60" : ""
              }`}
            >
              {/* Golden / Yellow Industrial Number */}
              <span className="text-5xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-amber-400 font-mono">
                {stat.value}
              </span>

              {/* Accent Divider Line */}
              <div className="my-3 h-0.5 w-10 rounded-full bg-amber-400/40" />

              {/* Uppercase Metric Label */}
              <span className="text-xs sm:text-sm font-bold tracking-[0.18em] text-slate-200 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
