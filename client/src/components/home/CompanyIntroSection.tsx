import Link from "next/link";

export default function CompanyIntroSection() {
  return (
    <section
      id="company-intro"
      className="relative w-full overflow-hidden bg-[#F8FAFC] py-20 sm:py-28 lg:py-32 text-slate-800 border-b border-slate-200/80"
    >
      {/* Background: Subtle Industrial Engineering Blueprint Grid Lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-grid-blueprint-dark" />

      {/* Subtle Ambient Radial Tone in Top Right */}
      <div className="pointer-events-none absolute -top-24 right-0 h-[500px] w-[500px] rounded-full bg-sky-200/30 blur-3xl" />

      {/* 94% Wide Container */}
      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ====================================================
              LEFT COLUMN: Company Introduction Content (Col span 7)
          ==================================================== */}
          <div className="space-y-8 lg:col-span-7">
            {/* Small Top Label */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-[#0B192C] uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
              <span>Engineering Heritage &amp; Pedigree</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl font-black tracking-tight text-[#0B192C] sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.12]">
              Precision Engineering for{" "}
              <span className="text-sky-600 block sm:inline">
                Modern Packaging.
              </span>
            </h2>

            {/* Description */}
            <p className="max-w-3xl text-base font-normal leading-relaxed text-slate-600 sm:text-lg">
              AXION PackTech delivers high-reliability packaging, bagging, conveying, and automation
              solutions engineered for demanding industrial environments. We combine rigorous mechanical design,
              precision servo motion control, and customized plant integrations to help manufacturing operations
              maximize line OEE, eliminate bottlenecks, and scale output.
            </p>

            {/* Company Highlights (3 Items with Asymmetrical High-Density Design) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
              {/* Highlight 01 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-sky-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-brand-orange">
                    01 // FABRICATION
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
                </div>
                <h3 className="mt-2.5 text-base font-bold text-[#0B192C]">
                  High-Tolerance Machining
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                  Heavy-duty 304/316L stainless steel framing built for continuous 24/7 industrial duty cycles.
                </p>
              </div>

              {/* Highlight 02 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-sky-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-sky-600">
                    02 // AUTOMATION
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                </div>
                <h3 className="mt-2.5 text-base font-bold text-[#0B192C]">
                  Intelligent PLC Controls
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                  Siemens and Rockwell PLC architectures with intuitive multi-lingual HMI recipe management.
                </p>
              </div>

              {/* Highlight 03 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-sky-400 hover:shadow-md hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-wider text-slate-700">
                    03 // INTEGRATION
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                </div>
                <h3 className="mt-2.5 text-base font-bold text-[#0B192C]">
                  Turnkey Plant Lines
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed font-normal">
                  Seamless synchronization linking upstream feeding, weighing, capping, and secondary case packing.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/about-us"
                className="group inline-flex items-center gap-3 rounded-xl bg-brand-orange px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-orange-light hover:shadow-lg hover:shadow-orange-600/25 active:scale-95"
              >
                <span>Discover Company Pedigree</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/catalogs"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition-all"
              >
                <span>Download Brochures</span>
              </Link>
            </div>
          </div>

          {/* ====================================================
              RIGHT COLUMN: Technical Schematic & Machine Telemetry Area (Col span 5)
          ==================================================== */}
          <div className="relative lg:col-span-5">
            {/* Ambient Background Glow behind technical card */}
            <div className="pointer-events-none absolute inset-0 -m-4 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-300/15 to-transparent blur-2xl" />

            {/* Main Technical Schema Card */}
            <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(2,132,199,0.12)]">
              {/* Card Header: Schema title & live status indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                  <span className="font-mono text-xs font-semibold tracking-wider text-slate-700 uppercase">
                    SYSTEM ARCHITECTURE // AP-SERIES
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                  REV 2.6
                </span>
              </div>

              {/* Technical SVG Blueprint Illustration */}
              <div className="relative my-6 flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-900 to-[#040911] p-6 text-white overflow-hidden shadow-inner">
                {/* Blueprint Grid Watermark */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />

                {/* Industrial Machine Schematic Diagram */}
                <svg
                  className="relative z-10 h-48 w-full max-w-[300px]"
                  viewBox="0 0 280 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top Feed Hopper */}
                  <polygon
                    points="90,15 190,15 160,65 120,65"
                    fill="url(#hopperGrad)"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                  />
                  {/* Feed Flow Indicators */}
                  <line x1="140" y1="22" x2="140" y2="58" stroke="#F97316" strokeWidth="1.5" strokeDasharray="3 3" />
                  
                  {/* Dispensing Valve Collar */}
                  <rect x="125" y="65" width="30" height="15" rx="2" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />

                  {/* Main Bagging Chamber Frame */}
                  <rect x="70" y="80" width="140" height="85" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" opacity="0.9" />

                  {/* Internal Bag Profile with Brand Accent */}
                  <path
                    d="M105 95 L175 95 L165 155 L115 155 Z"
                    fill="#1E56A0"
                    stroke="#60A5FA"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M140 95 L165 155 L175 95 Z"
                    fill="#0284C7"
                    opacity="0.8"
                  />

                  {/* High-Precision Conveyor Base */}
                  <rect x="30" y="165" width="220" height="18" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
                  {/* Rollers */}
                  <circle cx="50" cy="174" r="5" fill="#38BDF8" />
                  <circle cx="95" cy="174" r="5" fill="#64748B" />
                  <circle cx="140" cy="174" r="5" fill="#38BDF8" />
                  <circle cx="185" cy="174" r="5" fill="#64748B" />
                  <circle cx="230" cy="174" r="5" fill="#38BDF8" />

                  {/* Technical Dimension & Laser Guide Lines */}
                  <line x1="15" y1="80" x2="60" y2="80" stroke="#F97316" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="12" y="75" fill="#F97316" fontSize="8" fontFamily="monospace">VALVE LVL</text>
                  
                  <line x1="220" y1="125" x2="265" y2="125" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
                  <text x="225" y="120" fill="#38BDF8" fontSize="8" fontFamily="monospace">LOAD CELL</text>

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="hopperGrad" x1="140" y1="15" x2="140" y2="65" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1E3A8A" />
                      <stop offset="1" stopColor="#0F172A" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Floating Real-Time Metric Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                    Line Reliability
                  </p>
                  <p className="mt-0.5 font-mono text-xl font-black text-[#0B192C]">
                    99.8<span className="text-sm text-sky-600">%</span>
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                    Max Bagging Speed
                  </p>
                  <p className="mt-0.5 font-mono text-xl font-black text-[#0B192C]">
                    1,200 <span className="text-xs font-sans text-slate-500 font-normal">Bags/Hr</span>
                  </p>
                </div>
              </div>

              {/* Engineering Certification Pill */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-sky-50 px-4 py-2.5 text-xs text-sky-900 border border-sky-200">
                <span className="font-semibold">Automation Architecture</span>
                <span className="font-mono text-[11px] font-bold text-sky-700">PLC &amp; HMI INTEGRATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
