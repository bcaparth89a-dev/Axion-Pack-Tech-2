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
      ? "grid-cols-1 max-w-2xl mx-auto"
      : showcaseIndustries.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <section id="industries" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-100/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Sectors We Serve
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Industries We Serve
          </h2>

          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-orange" />

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Our packaging, processing and automation solutions are engineered to
            meet the unique requirements of diverse manufacturing industries.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className={`grid ${gridClass} gap-8`}>
          {showcaseIndustries.map((ind) => (
            <Link
              key={ind.slug}
              href={`/industries/${ind.slug}`}
              className="group relative flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-sky-300"
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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Floating Icon Badge */}
                <div className="absolute top-4 left-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md text-xl shadow-md border border-white/60 group-hover:scale-110 transition-transform duration-300">
                    {ind.icon}
                  </span>
                </div>

                {/* Title on Image overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                    {ind.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {ind.shortDescription}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 group-hover:text-brand-orange transition-colors">
                    Explore Industry
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-orange group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Explore All Industries Bottom Action */}
        <div className="mt-14 text-center">
          <Link
            href="/industries"
            className="inline-flex items-center gap-3 rounded-2xl bg-[#061527] hover:bg-sky-950 text-white px-8 py-4 text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <span>Explore All Industries</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
