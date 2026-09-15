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
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#061527 1px, transparent 1px), linear-gradient(90deg, #061527 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Side: Industrial Info & CTA */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              WHAT WE OFFER
            </div>

            {/* Main Heading */}
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Our Services
            </h2>

            {/* Golden / Brand Accent Divider */}
            <div className="mt-4 h-1 w-16 rounded-full bg-brand-orange" />

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-light">
              From initial engineering design through to installation,
              commissioning, and ongoing after-sales support — we are your
              complete packaging solutions partner.
            </p>

            {/* Value Highlights */}
            <div className="mt-8 space-y-3.5 border-t border-slate-100 pt-6 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-medium">Factory-Trained Industrial Engineers</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-medium">24/7 Rapid Response &amp; Spares Availability</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  ✓
                </span>
                <span className="font-medium">Comprehensive Plant Lifecycle Integration</span>
              </div>
            </div>

            {/* Primary CTA Button */}
            <div className="mt-10">
              <Link
                href="/services"
                className="group inline-flex items-center gap-3 rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-orange-600/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                <span>Explore Our Services</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side: Stacked Service Cards */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {servicesData.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-sky-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
              >
                {/* Visual Thumbnail & Icon Preview */}
                <div className="relative h-20 w-full sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-200/80">
                  <CmsImage
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, 120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  {/* Service Number Tag */}
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-mono font-bold text-amber-400 tracking-wider">
                    0{index + 1}
                  </span>

                  {/* Icon Indicator */}
                  {service.icon && (
                    <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 backdrop-blur-sm text-xs shadow-sm">
                      {service.icon}
                    </span>
                  )}
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-sky-900 transition-colors">
                      {service.title}
                    </h3>
                  </div>

                  <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Right Arrow Button */}
                <div className="self-end sm:self-center shrink-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 group-hover:border-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-200 shadow-sm group-hover:translate-x-1">
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
