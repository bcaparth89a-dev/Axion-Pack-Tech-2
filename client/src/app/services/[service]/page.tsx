import type { Metadata } from "next";
import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VideoPlayer from "@/components/common/VideoPlayer";
import { getServices, getServiceBySlug } from "@/lib/api/services";

export const revalidate = 300;
export const dynamicParams = true;

interface ServicePageProps {
  params: Promise<{
    service: string;
  }>;
}

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((svc) => ({
    service: svc.slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { service: serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);

  if (!service) {
    return {
      title: "Service Not Found | AXION PackTech",
    };
  }

  return {
    title: service.seo?.metaTitle || `${service.title} | AXION PackTech Services`,
    description: service.seo?.metaDescription || service.shortDescription,
    keywords: service.seo?.keywords,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { service: serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  // Other services for bottom navigation
  const allServices = await getServices();
  const otherServices = allServices.filter((s) => s.slug !== service.slug);

  // Combined capabilities & features list
  const displayFeatures = [
    ...(service.capabilities || []),
    ...(service.features || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Split description paragraphs
  const descriptionParagraphs = (service.description || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  const heroHeading = service.heroTitle || service.title;
  const heroSub = service.heroDescription || service.shortDescription;
  const heroImg = service.heroImage || service.image;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* 1. Sticky Navigation Bar */}
      <div className="sticky top-3 z-40 px-4 sm:px-6">
        <Navbar />
      </div>

      <main className="flex-1">
        {/* 2. Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="bg-slate-900 border-b border-slate-800 py-3.5 text-xs"
        >
          <div className="container-wide flex items-center space-x-2 text-slate-400">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-150"
            >
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <Link
              href="/services"
              className="hover:text-white transition-colors duration-150"
            >
              Services
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sky-400 font-semibold truncate">
              {service.title}
            </span>
          </div>
        </nav>

        {/* 3. Hero Section */}
        <section className="relative py-16 sm:py-24 bg-[#061527] text-white overflow-hidden border-b border-slate-800">
          {/* Engineering Background Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Details & Consultation CTA */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
                  <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                  AXION Industrial Services
                </div>

                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  {heroHeading}
                </h1>

                <div className="mt-4 h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

                <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {heroSub}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 rounded-xl bg-brand-orange px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all duration-200 hover:bg-brand-orange-light hover:-translate-y-0.5 active:scale-95"
                  >
                    <span>Request a Consultation</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-950/60 border border-sky-800/60 px-6 py-3.5 text-sm font-semibold text-sky-200 hover:text-white hover:bg-sky-900/60 transition-all duration-200"
                  >
                    <span>View All Services</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Visual Card */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-sky-500/30 shadow-2xl bg-slate-900">
                  <CmsImage
                    src={heroImg || service.image || "/images/services/engineering-design.webp"}
                    alt={service.title}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {service.icon && (
                    <div className="absolute top-4 left-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md text-2xl shadow-lg border border-white/60">
                        {service.icon}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 rounded-md bg-sky-950/80 backdrop-blur-md text-xs font-mono font-medium text-sky-300 border border-sky-700/50">
                      Reliable Turnkey Engineering
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Service Statistics Bar (If available) */}
        {service.stats && service.stats.length > 0 && (
          <section className="bg-[#0B1E36] border-b border-sky-900/40 py-8">
            <div className="container-wide grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {service.stats.map((stat, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{stat.value}</p>
                  <p className="text-xs text-sky-300 uppercase tracking-wider font-semibold">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. About the Service & Key Capabilities */}
        <section className="py-16 sm:py-24 container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: Full Narrative Information */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                  Service Overview
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                  About {service.title}
                </h2>
                <div className="mt-3 h-1 w-12 rounded-full bg-brand-orange" />
              </div>

              {/* Service Overview Callout if defined */}
              {service.overview && (
                <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-sm text-sky-950 leading-relaxed font-medium">
                  {service.overview}
                </div>
              )}

              {/* Formatted Content Blocks */}
              <div className="space-y-6 text-slate-700 leading-relaxed text-base">
                {descriptionParagraphs.map((para, pIdx) => {
                  // If paragraph has bullet items
                  if (para.includes("•")) {
                    const lines = para.split("\n");
                    const introLine = lines[0];
                    const bullets = lines.slice(1).map((l) => l.replace(/^•\s*/, "").trim());

                    return (
                      <div key={pIdx} className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        {introLine && (
                          <p className="font-semibold text-slate-900">{introLine}</p>
                        )}
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                          {bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                              <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-base text-slate-600 leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Service Video Demonstration (if configured) */}
              {service.heroVideo && (
                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md">
                  <div className="bg-[#0B1E36] px-6 py-4 text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-sky-400 tracking-wider">
                        Service Video Tour
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {service.title} in Action
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Engineering Demo
                    </span>
                  </div>
                  <div className="bg-black">
                    <VideoPlayer
                      url={service.heroVideo}
                      poster={heroImg || service.image}
                      title={`${service.title} Demonstration`}
                      containerClassName="rounded-none border-0 shadow-none"
                    />
                  </div>
                </div>
              )}

              {/* Solutions & Capabilities Cards (If defined in CMS) */}
              {service.solutions && service.solutions.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Engineered Solutions &amp; Scope
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.solutions.map((sol, solIdx) => (
                      <div
                        key={solIdx}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 hover:border-sky-300 transition-colors"
                      >
                        <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-brand-orange" />
                          {sol.title}
                        </h4>
                        {sol.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {sol.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Implementation Process Steps (If defined) */}
              {service.process && service.process.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    Implementation Process &amp; Workflow
                  </h3>
                  <div className="space-y-3">
                    {service.process.map((step, stepIdx) => (
                      <div
                        key={stepIdx}
                        className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-950 text-sky-300 font-mono text-xs font-bold">
                          0{stepIdx + 1}
                        </span>
                        <div className="text-sm font-medium text-slate-800 pt-0.5">
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dedicated Prominent Service Image */}
              <div className="pt-4">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
                  <CmsImage
                    src={service.image || "/images/services/engineering-design.webp"}
                    alt={`${service.title} Operations`}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-xs font-mono text-white/90 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    {service.title} Field Operations
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Key Capabilities Responsive Feature Grid */}
            <div className="lg:col-span-5 space-y-8">
              <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                  Technical Scope
                </div>
                <h3 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">
                  Key Capabilities
                </h3>
                <div className="mt-3 h-1 w-12 rounded-full bg-brand-orange" />

                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  Our comprehensive capabilities ensure precision, reliability, and continuous performance across every phase.
                </p>

                {/* Features Checklist */}
                <div className="mt-6 space-y-3">
                  {displayFeatures.map((feature, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition-colors hover:bg-sky-50/50 hover:border-sky-200"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold mt-0.5">
                        ✓
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Benefits List (If available) */}
                {service.benefits && service.benefits.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                      Core Advantages
                    </span>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="text-emerald-500 font-bold">★</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Consultation Card Inside Capabilities Box */}
                <div className="mt-8 rounded-2xl bg-[#061527] p-5 text-white">
                  <h4 className="text-sm font-bold text-sky-300">
                    Need Custom Specifications?
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    Our technical engineers can evaluate your factory layout and cycle constraints.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-brand-orange-light active:scale-[0.98]"
                  >
                    Speak with a Specialist
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Browse Other Services Quick Navigation */}
        {otherServices.length > 0 && (
          <section className="bg-slate-100/70 border-t border-slate-200 py-16">
            <div className="container-wide">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-700 font-bold">
                    Explore Complementary Offerings
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                    Other Industrial Services
                  </h3>
                </div>
                <Link
                  href="/services"
                  className="text-xs font-bold text-sky-700 hover:text-brand-orange transition-colors flex items-center gap-1"
                >
                  <span>View All Services</span>
                  <span>→</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherServices.slice(0, 4).map((other) => (
                  <Link
                    key={other.slug}
                    href={`/services/${other.slug}`}
                    className="group rounded-2xl bg-white border border-slate-200 p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-sky-300 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-900 mb-3">
                      <CmsImage
                        src={other.image || "/images/services/engineering-design.webp"}
                        alt={other.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, 25vw"
                      />
                      {other.icon && (
                        <span className="absolute top-2 left-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-xs shadow">
                          {other.icon}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-orange transition-colors">
                        {other.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {other.shortDescription}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-700">
                      <span>Explore</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. Bottom CTA Section */}
        <section className="container-wide py-16 sm:py-20">
          <div className="rounded-3xl bg-gradient-to-r from-[#061527] to-[#0A2244] p-8 sm:p-14 text-white shadow-xl border border-sky-900/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-semibold text-brand-orange border border-brand-orange/30">
                End-to-End Plant Integration
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-bold tracking-tight text-white">
                {service.cta?.title || "Need Support for Your Production System?"}
              </h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                {service.cta?.description ||
                  "Talk to our engineering team to discuss your production requirements and discover the right solution for your operation."}
              </p>
            </div>
            <Link
              href={service.cta?.buttonLink || "/contact"}
              className="inline-flex items-center justify-center rounded-xl bg-brand-orange px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95 whitespace-nowrap"
            >
              <span>{service.cta?.buttonText || "Request a Quote"}</span>
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}

