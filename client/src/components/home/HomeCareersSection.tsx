import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { careerCategories, getCareerCounts } from "@/lib/api/careers";

export default async function HomeCareersSection() {
  const counts = await getCareerCounts();

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
        return "Explore Opportunities →";
      default:
        return "Explore →";
    }
  };

  return (
    <section className="relative w-full bg-slate-900 text-white py-16 sm:py-24 overflow-hidden border-t border-sky-900/40">
      {/* Background industrial grid & glow aesthetics */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-4">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <span>CAREERS AT AXION PACKTECH</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Build Your Future With{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-amber-300">
              Axion PackTech
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Join a growing team of engineers, technicians, innovators, and industry
            professionals. Explore exciting opportunities to build your career,
            gain practical experience, and grow with modern industrial packaging
            technology.
          </p>
        </div>

        {/* 3 Main Career Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {careerCategories.map((category) => (
            <div
              key={category.slug}
              className="group relative flex flex-col rounded-2xl bg-gradient-to-b from-[#0B1E36] to-[#07172A] border border-sky-900/50 overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-400/50 hover:shadow-[0_16px_32px_-8px_rgba(2,132,199,0.25)]"
            >
              {/* Card Image Banner */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-800">
                <CmsImage
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E36] via-[#0B1E36]/30 to-transparent" />

                {/* Top Floating Badge & Icon */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-lg shadow-sm">
                    {category.icon}
                  </span>
                  <span className="rounded-lg bg-sky-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-sky-300 border border-sky-800/60 uppercase tracking-wide">
                    {category.badge}
                  </span>
                </div>

                {/* Opportunity count pill */}
                <div className="absolute bottom-3 right-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {getCountLabel(category.slug)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-sky-300">
                  {category.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 flex-1">
                  {category.shortDescription}
                </p>

                {/* Button Action */}
                <div className="mt-6 pt-4 border-t border-sky-900/40">
                  <Link
                    href={`/careers/${category.slug}`}
                    className="inline-flex w-full items-center justify-between rounded-xl bg-sky-600/20 px-4 py-2.5 text-xs sm:text-sm font-bold text-sky-200 border border-sky-500/30 transition-all duration-200 group-hover:bg-brand-orange group-hover:text-white group-hover:border-brand-orange active:scale-[0.98]"
                  >
                    <span>{getButtonText(category.slug)}</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Home Page Career Section Bottom CTA */}
        <div className="mt-14 sm:mt-18 rounded-2xl border border-sky-800/50 bg-gradient-to-r from-[#081B33] via-[#0D2444] to-[#081B33] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-brand-orange/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Ready to Build Your Future?
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Explore current opportunities and discover where your skills can take you at
                Axion PackTech. We empower engineers, technicians, and apprentices with
                industry-leading training and growth.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/50 transition-all duration-200 hover:bg-brand-orange-light hover:shadow-orange-600/30 active:scale-95"
              >
                <span>View All Opportunities</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
