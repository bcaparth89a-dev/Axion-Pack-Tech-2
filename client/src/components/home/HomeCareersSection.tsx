import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { careerCategories, getCareerCounts } from "@/lib/api/careers";

export default async function HomeCareersSection() {
  const counts = await getCareerCounts();

  // Strict zero empty space guard: return null if no active career postings exist in MongoDB
  if (!counts || counts.all === 0) {
    return null;
  }

  const getCountLabel = (slug: string) => {
    switch (slug) {
      case "jobs":
        return `${counts.jobs} Positions Open`;
      case "internships":
        return `${counts.internships} Programs Open`;
      case "apprenticeships":
        return `${counts.apprenticeships} Tracks Available`;
      default:
        return "Open Opportunities";
    }
  };

  const getButtonText = (slug: string) => {
    switch (slug) {
      case "jobs":
        return "Explore Jobs →";
      case "internships":
        return "Explore Internships →";
      case "apprenticeships":
        return "Explore Apprenticeships →";
      default:
        return "Explore →";
    }
  };

  return (
    <section className="relative w-full bg-[#040911] text-white py-20 sm:py-28 overflow-hidden border-t border-slate-800/80">
      {/* Background industrial grid & glow aesthetics */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-grid-blueprint" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-12 border-b border-slate-800/80">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/90 px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-3">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              <span>CAREERS &amp; ENGINEERING TALENT</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Build Your Engineering Future With{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-amber-300">
                Axion PackTech
              </span>
            </h2>

            <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Join a team of mechanical designers, PLC automation engineers, and industrial technicians.
              Explore full-time engineering careers, university internships, and technical trade apprenticeships.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>View All {counts.all} Opportunities</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* 3 Main Career Category Cards (94% Wide) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
          {careerCategories.map((category) => (
            <div
              key={category.slug}
              className="group relative flex flex-col rounded-3xl bg-gradient-to-b from-[#0B1E36] to-[#061527] border border-slate-800 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/60 hover:shadow-[0_16px_32px_-8px_rgba(2,132,199,0.3)]"
            >
              {/* Card Image Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                <CmsImage
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36] via-[#0B1E36]/30 to-transparent" />

                {/* Top Floating Badge & Icon */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/20 text-base shadow-sm">
                    {category.icon}
                  </span>
                  <span className="rounded-lg bg-sky-950/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold text-sky-300 border border-sky-800/60 uppercase tracking-wide">
                    {category.badge}
                  </span>
                </div>

                {/* Opportunity count pill */}
                <div className="absolute bottom-3.5 right-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/75 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold text-amber-300 border border-amber-400/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {getCountLabel(category.slug)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6 space-y-4">
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-sky-300">
                  {category.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2 font-normal flex-1">
                  {category.shortDescription}
                </p>

                {/* Button Action */}
                <div className="pt-3 border-t border-slate-800/80">
                  <Link
                    href={`/careers/${category.slug}`}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-sky-600/20 px-4 py-3 text-xs sm:text-sm font-bold text-sky-200 border border-sky-500/30 transition-all duration-200 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange active:scale-[0.98]"
                  >
                    <span>{getButtonText(category.slug)}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1 font-bold">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
