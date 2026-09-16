import React from "react";
import { AboutPageData } from "@/lib/api/pages";

export function renderCoreValueIcon(icon?: string | React.ReactNode) {
  if (React.isValidElement(icon)) {
    return icon;
  }
  const iconKey = typeof icon === 'string' ? icon.toLowerCase().trim() : '';
  switch (iconKey) {
    case 'star':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case 'handshake':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case 'shield-check':
    case 'shield':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'award':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="8" r="6" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.2 0l-3.58 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
        </svg>
      );
    case 'heart':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case 'target':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'zap':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'globe':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'scale':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M12 3v18m-6-6l-3-6h6l-3 6zm12 0l-3-6h6l-3 6zM9 21h6" />
        </svg>
      );
    case 'badge-check':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'compass':
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
  }
}

const coreValues = [
  {
    title: "Quality",
    description: "Zero-compromise engineering standards, high-tolerance components, and certified manufacturing excellence.",
    icon: renderCoreValueIcon("star"),
  },
  {
    title: "Innovation",
    description: "Pioneering intelligent automation algorithms, high-speed bagging controls, and forward-looking robotics.",
    icon: renderCoreValueIcon("lightbulb"),
  },
  {
    title: "Integrity",
    description: "Transparent partnerships, honest technical specifications, and steadfast commitments to our global clients.",
    icon: renderCoreValueIcon("handshake"),
  },
  {
    title: "Customer Focus",
    description: "Tailoring every machine architecture to client throughput goals, space constraints, and material chemistry.",
    icon: renderCoreValueIcon("users"),
  },
  {
    title: "Safety",
    description: "Multi-layered operator safety interlocks, ISO/CE regulatory compliance, and emergency fail-safe designs.",
    icon: renderCoreValueIcon("shield-check"),
  },
  {
    title: "Sustainability",
    description: "Energy-efficient high-torque servo drives, reduced pneumatic air waste, and eco-friendly recyclable bag handling.",
    icon: renderCoreValueIcon("leaf"),
  },
];

interface VisionMissionProps {
  data?: AboutPageData['visionMission'];
}

export default function VisionMission({ data }: VisionMissionProps) {
  const badge = data?.badge || 'Our Direction';
  const heading = data?.heading || 'Vision & Mission';
  const visionBadge = data?.visionBadge || 'Our Vision';
  const visionTitle = data?.visionTitle || 'Global Packaging Partner';
  const visionText =
    data?.visionText ||
    'To become a trusted global partner for packaging, processing, and automation solutions by delivering innovative technologies, engineering excellence, and exceptional customer value.';

  const missionBadge = data?.missionBadge || 'Our Mission';
  const missionTitle = data?.missionTitle || 'Engineered for Impact';
  const missionText =
    data?.missionText ||
    'Deliver state-of-the-art engineering solutions with uncompromised quality, exceptional customer support, and continuous mechanical innovation.';

  const displayValues =
    Array.isArray(data?.coreValues)
      ? data.coreValues
          .filter((v) => v.enabled !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
      : coreValues;

  return (
    <section className="relative w-full bg-white py-20 sm:py-28 text-slate-800 border-b border-slate-200/80">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            {badge}
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight">
            {heading}
          </h2>

          <div className="h-1 w-16 rounded-full bg-[#0B192C] mx-auto" />
        </div>

        {/* Vision & Mission Cards (2 Cards Side-by-Side) */}
        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card 1: Our Vision */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1E36] via-[#091D38] to-[#061527] p-8 sm:p-12 text-white shadow-xl border border-sky-500/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
            {/* Decorative Corner Engineering Watermark */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 rounded-full border-8 border-sky-500/10" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-950/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                {visionBadge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {visionTitle}
              </h3>

              <p className="text-base sm:text-lg leading-relaxed text-slate-300">
                {visionText}
              </p>
            </div>
          </div>

          {/* Card 2: Our Mission */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A2244] via-[#071B33] to-[#051324] p-8 sm:p-12 text-white shadow-xl border border-sky-400/25 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
            {/* Decorative Corner Engineering Watermark */}
            <div className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 rounded-full border-8 border-brand-orange/10" />

            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-950/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                {missionBadge}
              </span>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {missionTitle}
              </h3>

              <p className="text-base sm:text-lg leading-relaxed text-slate-300">
                {missionText}
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Subheading */}
        <div className="mt-20 sm:mt-24 text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <span className="h-2 w-2 rounded-full bg-brand-orange" />
            Our Foundation
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B192C] tracking-tight">
            Core Values
          </h3>

          <div className="h-1 w-12 rounded-full bg-[#0B192C] mx-auto" />
        </div>

        {/* Core Values 6-Card Grid (3 Columns) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayValues.map((val, idx) => (
            <div
              key={val.title || idx}
              className="group relative flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400 hover:shadow-lg hover:shadow-slate-900/5"
            >
              {/* Icon Container */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 shadow-xs transition-colors group-hover:bg-sky-600 group-hover:text-white">
                {renderCoreValueIcon(val.icon)}
              </div>

              {/* Value Title */}
              <h4 className="mt-5 text-lg font-bold text-[#0B192C]">
                {val.title}
              </h4>

              {/* Description */}
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
