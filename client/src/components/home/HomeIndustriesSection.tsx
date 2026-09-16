import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { getIndustries } from "@/lib/api/industries";

export default async function HomeIndustriesSection() {
  const industriesData = await getIndustries();
  const showcaseIndustries = Array.isArray(industriesData) ? industriesData.slice(0, 6) : [];

  // Strict zero empty space: if no industries exist, return null
  if (showcaseIndustries.length === 0) {
    return null;
  }

  const gridClass =
    showcaseIndustries.length === 1
      ? "grid-cols-1 max-w-3xl mx-auto"
      : showcaseIndustries.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="industries" className="py-20 sm:py-28 bg-[#F8FAFC] border-b border-slate-200 relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-grid-blueprint-dark" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-slate-200">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-[#0B192C] uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              <span>Target Manufacturing Sectors</span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B192C] leading-tight">
              Engineered for Specialized{" "}
              <span className="text-sky-600">
                Industry Requirements
              </span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              From food-grade sanitary standards to hazardous chemical explosion-proofing and heavy mineral bulk handling,
              our packaging and automation platforms are configured to operational realities.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/industries"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#061527] hover:bg-sky-950 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>View All {industriesData.length} Sectors</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Industry Cards Grid (94% Wide) */}
        <div className={`grid ${gridClass} gap-6 sm:gap-8 mt-12`}>
          {showcaseIndustries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-sky-400"
            >
              {/* Industry Image Visual */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <CmsImage
                  src={ind.image || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"}
                  alt={ind.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040911]/90 via-[#040911]/30 to-transparent" />

                {/* Floating Icon Badge */}
                <div className="absolute top-4 left-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md text-xl shadow-md border border-white/60 group-hover:scale-110 transition-transform duration-300">
                    {ind.icon}
                  </span>
                </div>

                {/* Title on Image overlay */}
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                    {ind.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 font-normal">
                  {ind.shortDescription}
                </p>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-700 group-hover:text-brand-orange transition-colors">
                  <span>Explore Engineered Solutions</span>
                  <span className="transition-transform group-hover:translate-x-1.5 font-bold">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
