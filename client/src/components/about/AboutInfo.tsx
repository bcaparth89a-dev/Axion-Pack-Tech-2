import React from 'react';
import Image from 'next/image';
import { AboutPageData } from '@/lib/api/pages';

const defaultCapabilities = [
  {
    title: 'Bagging & Stitching Systems',
    description: 'Complete range from portable to fully automated high-speed bagging solutions.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: 'Processing Solutions',
    description: 'Dosing, batching, mixing, sifting, and pneumatic conveying systems.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: 'Inspection Systems',
    description: 'Industrial inspection, metal detection, checkweighing, and quality monitoring.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Complete Line Integration',
    description: 'Integrated turnkey lines from raw material handling to robotic palletizing.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
];

function renderStatIcon(icon?: string) {
  switch (icon) {
    case 'wrench':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      );
    case 'factory':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'award':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    case 'shield':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case 'users':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case 'globe':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case 'cpu':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    case 'check':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case 'trending':
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    default:
      return null;
  }
}

interface AboutInfoProps {
  data?: AboutPageData['aboutInfo'];
}

export default function AboutInfo({ data }: AboutInfoProps) {
  const badge = data?.badge || 'About Us';
  const heading = data?.heading || 'About AXION PackTech';
  const tagline = data?.tagline || 'Engineering Packaging Excellence';
  const location = data?.location || 'Vadodara, Gujarat, India';
  const paragraphs =
    Array.isArray(data?.paragraphs) && data.paragraphs.length > 0
      ? data.paragraphs
      : [
          'AXION PackTech is an engineering-driven company specializing in packaging, bagging, material handling, processing, inspection, and end-of-line automation solutions.',
          'We are committed to delivering reliable, efficient, and innovative systems that help manufacturers improve productivity, product quality, and operational performance.',
          'At AXION PackTech, we combine practical engineering expertise with a customer-focused approach to develop solutions that meet the specific requirements of every application. Our systems are designed to deliver accuracy, reliability, safety, and long-term operational value.',
        ];

  const stats = (
    Array.isArray(data?.stats)
      ? data.stats
      : [
          { value: '25+', label: 'Machine Products', highlight: 'Engineered', icon: 'wrench', order: 0, enabled: true },
          { value: '4,000+', label: 'Industries & Lines', highlight: 'Served', icon: 'factory', order: 1, enabled: true },
          { value: 'Est. 2000', label: 'Founded Excellence', highlight: 'Proven', icon: 'award', order: 2, enabled: true },
        ]
  )
    .filter((st) => st.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const capabilities =
    Array.isArray(data?.capabilities) && data.capabilities.length > 0
      ? data.capabilities
      : defaultCapabilities;

  return (
    <section className="relative w-full bg-[#F8FAFC] py-20 sm:py-28 text-slate-800 border-b border-slate-200/80">
      {/* Background Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(#0B192C 1px, transparent 1px), linear-gradient(90deg, #0B192C 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="relative container-wide">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ====================================================
              LEFT COLUMN: Premium Dark Navy Brand Card
          ==================================================== */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl bg-gradient-to-b from-[#0B1E36] via-[#091B33] to-[#061527] p-8 sm:p-10 text-white shadow-xl border border-sky-500/20">
              {/* Official Logo in White Capsule */}
              <div className="rounded-2xl bg-white p-4 inline-block shadow-md border border-white/20">
                <Image
                  src="/logo.jpeg"
                  alt="AXION PackTech Official Logo"
                  width={180}
                  height={50}
                  className="h-10 w-auto object-contain"
                />
              </div>

              {/* Tagline & Location */}
              <div className="mt-6 space-y-2 border-b border-sky-900/50 pb-6">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  {tagline}
                </h3>
                <div className="flex items-center gap-2 text-sm text-sky-300">
                  <svg className="w-4 h-4 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{location}</span>
                </div>
              </div>

              {/* Key Statistics Grid */}
              <div className="mt-6 grid grid-cols-1 gap-3.5">
                {stats.map((st, idx) => {
                  const statIcon = renderStatIcon(st.icon);
                  return (
                    <div
                      key={st.label || idx}
                      className="flex items-center justify-between rounded-xl bg-sky-950/60 p-4 border border-sky-800/40 transition-all hover:bg-sky-900/50"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {statIcon && (
                          <div className="w-10 h-10 rounded-xl bg-sky-900/70 border border-sky-700/50 flex items-center justify-center text-sky-400 shrink-0 shadow-sm">
                            {statIcon}
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="font-mono text-2xl font-extrabold text-white block leading-tight">
                            {st.value}
                          </span>
                          <p className="text-xs text-slate-300 font-medium mt-0.5 truncate">{st.label}</p>
                        </div>
                      </div>
                      {st.highlight && (
                        <span className="text-xs font-semibold text-brand-orange uppercase tracking-wider shrink-0 ml-3 px-2.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20">
                          {st.highlight}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ====================================================
              RIGHT COLUMN: Company Narrative & Capabilities
          ==================================================== */}
          <div className="space-y-8 lg:col-span-7">
            {/* Small Label & Main Heading */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-brand-orange" />
                {badge}
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B192C] tracking-tight">
                {heading}
              </h2>
              {/* Navy blue underline accent */}
              <div className="h-1 w-16 rounded-full bg-[#0B192C]" />
            </div>

            {/* Narrative Paragraphs */}
            <div className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-600">
              {paragraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Company Capabilities 2x2 Grid */}
            <div className="pt-4 space-y-4">
              <h3 className="text-lg font-bold text-[#0B192C] tracking-tight">
                Core Capabilities &amp; Engineering Systems
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {capabilities.map((cap, idx) => (
                  <div
                    key={cap.title || idx}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-sky-400 hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
                      {'icon' in cap && typeof cap.icon !== 'string' ? (
                        cap.icon
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B192C]">{cap.title}</h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
