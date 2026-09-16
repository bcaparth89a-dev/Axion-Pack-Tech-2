import React from "react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const features: FeatureCard[] = [
  {
    title: "Engineering Expertise",
    description:
      "Experienced in packaging, bagging, conveying, processing, and automation technologies for industrial applications.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="5" r="2" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.93 19 4.24-10.2M14.83 8.8 19.07 19M14.83 14.8H9.17"
        />
      </svg>
    ),
  },
  {
    title: "Customized Solutions",
    description:
      "Equipment tailored to customer-specific requirements and plant layouts for optimal efficiency.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <line x1="21" x2="14" y1="4" y2="4" strokeLinecap="round" />
        <line x1="10" x2="3" y1="4" y2="4" strokeLinecap="round" />
        <line x1="21" x2="12" y1="12" y2="12" strokeLinecap="round" />
        <line x1="8" x2="3" y1="12" y2="12" strokeLinecap="round" />
        <line x1="21" x2="16" y1="20" y2="20" strokeLinecap="round" />
        <line x1="12" x2="3" y1="20" y2="20" strokeLinecap="round" />
        <line x1="14" x2="14" y1="2" y2="6" strokeLinecap="round" />
        <line x1="8" x2="8" y1="10" y2="14" strokeLinecap="round" />
        <line x1="16" x2="16" y1="18" y2="22" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Quality & Reliability",
    description:
      "Robust systems built for long-term industrial operation with consistent performance and minimal downtime.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Technical Support",
    description:
      "Professional installation, commissioning, and dedicated after-sales service to keep your production lines running.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 18v-6a9 9 0 0 1 18 0v6"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
        />
      </svg>
    ),
  },
  {
    title: "Industry Experience",
    description:
      "Solutions for food, chemical, fertilizer, pharmaceutical, agricultural, and industrial manufacturing sectors.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H2z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 18h1M12 18h1M7 18h1" />
      </svg>
    ),
  },
  {
    title: "Complete Line Integration",
    description:
      "From raw material handling to final palletized product — seamless end-to-end packaging line solutions.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        />
      </svg>
    ),
  },
  {
    title: "Safety First",
    description:
      "All systems designed with operator safety, regulatory compliance, and workplace best practices in mind.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Innovation Driven",
    description:
      "Continuous R&D and engineering improvement to bring you the latest in packaging automation technology.",
    icon: (
      <svg
        className="w-7 h-7 sm:w-8 sm:h-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M10 22h4" />
      </svg>
    ),
  },
];

import { AboutPageData } from "@/lib/api/pages";

function renderFeatureIcon(icon?: string | React.ReactNode) {
  if (icon && typeof icon !== 'string' && React.isValidElement(icon)) {
    return icon;
  }
  const key = typeof icon === 'string' ? icon.toLowerCase().trim() : '';
  switch (key) {
    case 'compass':
    case 'engineering':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="5" r="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.93 19 4.24-10.2M14.83 8.8 19.07 19M14.83 14.8H9.17" />
        </svg>
      );
    case 'sliders':
    case 'custom':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <line x1="21" x2="14" y1="4" y2="4" strokeLinecap="round" />
          <line x1="10" x2="3" y1="4" y2="4" strokeLinecap="round" />
          <line x1="21" x2="12" y1="12" y2="12" strokeLinecap="round" />
          <line x1="8" x2="3" y1="12" y2="12" strokeLinecap="round" />
          <line x1="21" x2="16" y1="20" y2="20" strokeLinecap="round" />
          <line x1="12" x2="3" y1="20" y2="20" strokeLinecap="round" />
          <line x1="14" x2="14" y1="2" y2="6" strokeLinecap="round" />
          <line x1="8" x2="8" y1="10" y2="14" strokeLinecap="round" />
          <line x1="16" x2="16" y1="18" y2="22" strokeLinecap="round" />
        </svg>
      );
    case 'badge-check':
    case 'quality':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'headset':
    case 'support':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    case 'layers':
    case 'integration':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
    case 'globe':
    case 'standards':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'check-circle':
    case 'testing':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'award':
    case 'track-record':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'wrench':
    case 'turnkey':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'shield':
    case 'safety':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'cpu':
    case 'automation':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'clock':
    case 'sla':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'leaf':
    case 'sustainability':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'users':
    case 'team':
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return (
        <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
  }
}

interface WhyChooseUsProps {
  data?: AboutPageData['whyChooseUsSection'];
}

export default function WhyChooseUs({ data }: WhyChooseUsProps) {
  const badge = data?.badge || 'WHY US';
  const heading = data?.heading || 'Why Choose Axion PackTech';
  const displayItems =
    Array.isArray(data?.items)
      ? data.items
          .filter((i) => i.enabled !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      : features;

  return (
    <section className="relative w-full bg-slate-50/70 py-20 sm:py-28 text-slate-800 border-b border-slate-200/80">
      {/* Background Subtle Blueprint Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#0B192C 1px, transparent 1px), linear-gradient(90deg, #0B192C 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative container-wide">
        {/* ====================================================
            HEADER: Centered Badge, Title & Decorative Accent
        ==================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-800 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            {badge}
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {heading}
          </h2>

          {/* Small Navy Decorative Underline */}
          <div className="h-1 w-16 rounded-full bg-[#0B192C] mx-auto mt-4" />

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Delivering robust engineering, customized plant solutions, and dedicated
            long-term reliability across industrial packaging operations.
          </p>
        </div>

        {/* ====================================================
            FEATURE CARDS (4 Cols Desktop, 2 Tablet, 1 Mobile)
        ==================================================== */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {displayItems.map((feature, idx) => (
            <div
              key={feature.title || idx}
              className="group relative flex flex-col items-center text-center rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 lg:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-xl hover:shadow-slate-900/5"
            >
              {/* Large Icon inside Deep Navy rounded-square container */}
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#16395F] text-white shadow-md border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#0B1E36] group-hover:shadow-lg group-hover:shadow-sky-950/20">
                {renderFeatureIcon(feature.icon)}
              </div>

              {/* Feature Title */}
              <h3 className="mt-5 text-lg sm:text-xl font-bold text-[#0B192C] tracking-tight group-hover:text-sky-950 transition-colors">
                {feature.title}
              </h3>

              {/* Short Professional Description */}
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Subtle hover accent indicator */}
              <div className="mt-5 h-0.5 w-8 rounded-full bg-slate-100 transition-all duration-300 group-hover:w-12 group-hover:bg-brand-orange" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
