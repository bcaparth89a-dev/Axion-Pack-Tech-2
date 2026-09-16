import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { getServices } from "@/lib/api/services";

export default async function HomeServicesSection() {
  const servicesData = await getServices();

  // Strict zero empty space: if no services exist, return null
  if (!servicesData || !Array.isArray(servicesData) || servicesData.length === 0) {
    return null;
  }

  return (
    <section
      id="services"
      className="relative py-20 sm:py-28 bg-white border-b border-slate-200 overflow-hidden"
    >
      {/* Background Engineering Blueprint Pattern Accent */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-grid-blueprint-dark" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Side: Industrial Lifecycle Narrative & Value Matrix (Col span 5) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-[#0B192C] uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-orange" />
              <span>Plant Lifecycle Support</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B192C] leading-tight">
              Comprehensive Engineering{" "}
              <span className="text-sky-600 block sm:inline">
                Services &amp; SLA
              </span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              From mechanical line conceptualization to factory SAT commissioning, Annual Maintenance Contracts (AMC),
              and emergency OEM spares — our certified engineers guarantee peak equipment availability.
            </p>

            {/* Value Highlights */}
            <div className="space-y-3 border-t border-slate-100 pt-6 text-xs sm:text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-semibold text-slate-800">Certified Field Service &amp; SAT Testing Engineers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-semibold text-slate-800">Guaranteed OEM Spare Parts Availability &amp; Dispatch</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-semibold text-slate-800">Comprehensive Preventative Maintenance (AMC) Agreements</span>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="group inline-flex items-center gap-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white px-7 py-3.5 text-sm font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <span>View All Services</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-sm font-bold transition-all"
              >
                <span>Request SLA Consultation</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Stacked High-Density Service Cards (Col span 7) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {servicesData.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm transition-all duration-300 hover:border-sky-400 hover:bg-white hover:shadow-xl hover:-translate-y-1"
              >
                {/* Visual Thumbnail & Icon Preview */}
                <div className="relative h-24 w-full sm:h-24 sm:w-36 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-200">
                  <CmsImage
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, 150px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Service Number Tag */}
                  <span className="absolute bottom-2 left-2.5 text-[11px] font-mono font-bold text-amber-400 tracking-wider">
                    0{index + 1}
                  </span>

                  {/* Icon Indicator */}
                  {service.icon && (
                    <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 backdrop-blur-sm text-sm shadow-sm">
                      {service.icon}
                    </span>
                  )}
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight group-hover:text-sky-800 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 font-normal">
                    {service.shortDescription}
                  </p>

                  {/* Feature preview bullets */}
                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {service.features.slice(0, 2).map((feat, i) => (
                        <span key={i} className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                          {feat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Arrow Button */}
                <div className="self-end sm:self-center shrink-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-200 shadow-sm group-hover:translate-x-1 font-bold">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
