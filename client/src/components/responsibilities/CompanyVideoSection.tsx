import React from 'react';
import VideoPlayer from '@/components/common/VideoPlayer';

export default function CompanyVideoSection() {
  return (
    <section className="relative py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Engineering In Action
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Experience AXION PackTech
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-orange" />
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Watch how our engineers combine innovation, quality, and
            responsibility in every packaging system we manufacture.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="relative mx-auto max-w-5xl rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-900/10 transition duration-300 hover:shadow-sky-950/20">
          {/* Top Bar Decoration (Engineered Terminal Accent) */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0B1E36] border-b border-slate-700/50 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-300 font-medium">
                AXION_PACKTECH_OVERVIEW.mp4
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-mono text-sky-400">
              HD 1080p • Engineering Precision
            </span>
          </div>

          {/* 16:9 Video Wrapper */}
          <VideoPlayer
            url="https://www.youtube.com/watch?v=0Mb-RVuwMBg"
            title="Experience AXION PackTech - Industrial Packaging & Automation Solutions"
            containerClassName="rounded-none border-0 shadow-none"
          />
        </div>

        {/* Video Sub-caption */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs sm:text-sm text-slate-500 max-w-5xl mx-auto px-2">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-sky-600 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>High-precision bagging, valve sealing & automated robotics in operation</span>
          </div>
          <span className="text-slate-400 text-xs">
            ISO 9001:2015 Certified Manufacturing Facility
          </span>
        </div>
      </div>
    </section>
  );
}
