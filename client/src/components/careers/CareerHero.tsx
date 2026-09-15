import Image from "next/image";
import Link from "next/link";
import { getCareerCounts } from "@/data/careers";

interface CareerHeroProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export default function CareerHero({
  title = "Build Your Career. Engineer the Future.",
  subtitle = "At Axion PackTech, we believe great engineering starts with great people. Join our team and become part of innovative packaging, automation, and industrial technology solutions.",
  badge = "CAREERS AT AXION PACKTECH",
}: CareerHeroProps) {
  const counts = getCareerCounts();

  return (
    <section className="relative w-full bg-[#061527] text-white overflow-hidden border-b border-sky-900/40">
      {/* Background Graphic & Hero Image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/careers/careers-hero.jpg"
          alt="Axion PackTech Careers"
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061527] via-[#061527]/90 to-[#061527]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
            <span>{badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {subtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#opportunities"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition-all duration-200 hover:bg-brand-orange-light hover:shadow-orange-600/30 active:scale-95"
            >
              <span>Explore Opportunities</span>
              <span>↓</span>
            </Link>

            <Link
              href="#why-axion"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3.5 text-sm font-semibold text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:bg-white/20 hover:border-white/30 active:scale-95"
            >
              <span>Why Work With Us</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Statistics Strip */}
        <div className="mt-14 sm:mt-18 pt-10 border-t border-sky-900/50 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              {counts.jobs}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              Engineering Careers
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Design, Production &amp; Service
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-sky-400">
              {counts.internships}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              Internship Programs
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hands-on Mentorship &amp; R&amp;D
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {counts.apprenticeships}+
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              Apprenticeship Tracks
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Shopfloor Technical Training
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl font-black text-white">
              100%
            </div>
            <div className="text-xs sm:text-sm font-bold text-white mt-1">
              Practical Exposure
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Real Packaging Machinery Systems
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
