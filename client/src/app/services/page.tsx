import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getServices } from "@/lib/api/services";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Services | AXION PackTech Packaging & Automation Solutions",
  description:
    "From system design and installation to long-term technical support, AXION PackTech provides complete services to support your production journey.",
};

export default async function ServicesPage() {
  const servicesData = await getServices();
  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-28 bg-[#061527] text-white overflow-hidden border-b border-slate-800">
          {/* Engineering Blueprint Grid Pattern Accent */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 container-wide text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
              OUR EXPERTISE
            </div>

            {/* Heading */}
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Engineering Support{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
                Beyond the Machine
              </span>
            </h1>

            {/* Accent Bar */}
            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              From system design and installation to long-term technical support,
              AXION PackTech provides complete services to support your production journey.
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-16 sm:py-24 container-wide">
          {/* Section Subheading / Counter Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
                End-to-End Industrial Packaging Lifecycle
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Comprehensive Engineering Services
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              Showing all {servicesData.length} core services
            </span>
          </div>

          {/* Grid Layout: 1 col mobile, 2 cols tablet, 3 cols desktop */}
          {servicesData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {servicesData.map((service, idx) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-sky-300"
                >
                  {/* Service Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                    <CmsImage
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Icon Badge */}
                    {service.icon && (
                      <div className="absolute top-4 left-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md text-xl shadow-md border border-white/60 group-hover:scale-110 transition-transform duration-300">
                          {service.icon}
                        </span>
                      </div>
                    )}

                    {/* Numerical Tag */}
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-xs font-mono font-bold text-amber-400 border border-slate-700/60">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>

                    {/* Key Features Preview */}
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        Key Capabilities
                      </span>
                      <ul className="space-y-1.5">
                        {service.features.slice(0, 4).map((feat) => (
                          <li
                            key={feat}
                            className="flex items-center gap-2 text-xs text-slate-700"
                          >
                            <span className="text-amber-500 font-bold">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Learn More Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700 group-hover:text-brand-orange transition-colors">
                        Learn More
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 group-hover:bg-brand-orange group-hover:text-white group-hover:translate-x-1 transition-all duration-200 shadow-sm">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-2xl mx-auto shadow-sm">
              <span className="text-4xl block mb-3">🔧</span>
              <h3 className="text-lg font-bold text-slate-900">Engineering Services</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                From plant design and line integration to preventative maintenance and retrofits, our engineering specialists support your operations.
              </p>
              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3 text-xs font-bold text-white hover:bg-brand-orange-light transition-all shadow-md active:scale-95"
                >
                  <span>Request Engineering Support</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Global Services CTA Banner */}
        <section className="container-wide pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-[#061527] to-[#0A2244] p-8 sm:p-14 text-white shadow-xl border border-sky-900/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-semibold text-brand-orange border border-brand-orange/30">
                End-to-End Plant Integration
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Need Support for Your Production System?
              </h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Talk to our engineering team to discuss your production requirements and
                discover the right solution for your operation.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-brand-orange px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95 whitespace-nowrap"
            >
              <span>Request a Quote</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
