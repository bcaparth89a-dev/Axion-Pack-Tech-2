import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CatalogsListing from '@/components/catalogs/CatalogsListing';
import { getAllCatalogs } from '@/lib/api/catalogs';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Engineering Catalogs & Technical Datasheets | AXION PackTech',
  description:
    'Download certified technical documentation, mechanical layouts, machine dimensions, and official brochures for AXION PackTech industrial packaging systems and conveyor solutions.',
  openGraph: {
    title: 'Product Catalogs & Technical Datasheets | AXION PackTech',
    description:
      'Explore official equipment brochures, mechanical drawings, and engineering specifications for automated packaging machinery and sanitary conveyors.',
  },
};

export default async function CatalogsPage() {
  const catalogs = await getAllCatalogs();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-600 selection:text-white">
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-40">
        <Navbar />
      </div>

      {/* Breadcrumb Navigation Strip */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3">
        <div className="container-wide flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/products" className="hover:text-white transition-colors">
            Products
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sky-300 font-semibold">Catalogs &amp; Datasheets</span>
        </div>
      </div>

      {/* Industrial Video Hero Header Section */}
      <section className="relative w-full bg-[#061527] text-white py-16 sm:py-24 border-b border-sky-900/40 overflow-hidden">
        {/* Full-width Industrial Motion Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="w-full h-full object-cover opacity-25"
          >
            <source src="/landscape splash screen.mp4" type="video/mp4" />
          </video>
          {/* Subtle Industrial Blueprint Gradient & Grid Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#061527] via-[#061527]/90 to-[#061527]/75" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 container-wide">
          <div className="max-w-3xl">
            {/* Technical Stamp Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-5">
              <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
              <span>OFFICIAL PRODUCT CATALOGS &amp; DATASHEETS</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Explore Our Catalogs
            </h1>

            {/* Professional Industrial Description */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Download certified mechanical layout schematics, electrical ratings, capacity
              ranges, and OEM dimension footprints for AXION PackTech automated packaging
              machinery and conveyor systems.
            </p>

            {/* Quick Document Guarantee Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <span className="rounded-md bg-white/10 px-3 py-1 border border-white/10">
                {catalogs.length} Documents Available
              </span>
              <span>•</span>
              <span>Cloudflare R2 Stored</span>
              <span>•</span>
              <span>Instant PDF Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalogs Content Body */}
      <main className="container-wide py-12 sm:py-16 flex-1 w-full">
        <CatalogsListing initialCatalogs={catalogs} />
      </main>

      {/* Consultation Banner */}
      <section className="bg-[#061527] text-white py-14 sm:py-16 border-t border-sky-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
            CUSTOM ENGINEERING
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
            Need Custom Machine Specifications or Drawings?
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Our engineering team prepares bespoke plant layout drawings, 3D CAD models, and custom
            technical proposals tailored to your factory throughput requirements.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95"
            >
              <span>Contact Engineering Team</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
