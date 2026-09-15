import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact AXION PackTech | Packaging Engineering Solutions",
  description:
    "Contact AXION PackTech for packaging machinery, industrial automation, engineering, installation, technical support, and customized packaging solutions.",
};

export default function ContactPage() {
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
          className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 sm:px-8 lg:px-12 text-xs"
        >
          <div className="max-w-7xl mx-auto flex items-center space-x-2 text-slate-400">
            <Link
              href="/"
              className="hover:text-white transition-colors duration-150"
            >
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sky-400 font-semibold truncate">
              Contact Us
            </span>
          </div>
        </nav>

        {/* 3. Hero Header Section */}
        <section className="relative py-16 sm:py-20 bg-[#061527] text-white overflow-hidden border-b border-slate-800">
          {/* Engineering Background Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
              GET IN TOUCH
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Engineering Consultation{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
                &amp; Technical Support
              </span>
            </h1>

            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Connect with our systems engineers to discuss your packaging line,
              automation objectives, machinery specifications, or technical service needs.
            </p>
          </div>
        </section>

        {/* 4. Two-Column Contact System: Info Card (Left) & Form (Right) */}
        <ContactSection
          showHeading={false}
          className="bg-transparent border-t-0 py-8 sm:py-12 lg:py-16"
        />

        {/* 5. Facility & Headquarters Location Card */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20">
          <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-10 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold">
                Manufacturing &amp; Engineering Facility
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Headquartered in Vadodara, Gujarat, India
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                Serving manufacturing plants across Asia, Africa, Europe, and the Americas
                with heavy-duty packaging machinery and turnkey plant integration.
              </p>
            </div>

            <a
              href="https://maps.google.com/?q=Vadodara,Gujarat,India"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-950/80 border border-sky-700/60 px-6 py-3 text-xs sm:text-sm font-semibold text-sky-200 hover:text-white hover:bg-sky-900/80 hover:border-sky-500 transition-all shadow-md shrink-0 active:scale-95"
            >
              <span>View On Google Maps</span>
              <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
