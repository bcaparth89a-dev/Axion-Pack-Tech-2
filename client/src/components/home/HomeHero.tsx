import Link from "next/link";

export default function HomeHero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[90vh] sm:min-h-[92vh] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#040911] via-[#061527] to-[#0B1E36] text-white pt-20 sm:pt-28 pb-32 sm:pb-40"
    >
      {/* Background Industrial Video Layer / Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="h-full w-full object-cover object-center scale-105"
        >
          <source src="/landscape splash screen.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#040911] via-[#040911]/80 to-[#0B1E36]" />
      </div>

      {/* Subtle Industrial Grid Background Texture */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10 bg-grid-blueprint" />

      {/* Ambient Radial Accent Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[750px] sm:w-[750px] rounded-full bg-sky-600/15 blur-3xl" />

      {/* Hero Main Content - 94% Wide Container */}
      <div className="relative z-10 container-wide my-auto text-center">
        {/* Engineering Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-950/80 px-4 py-1.5 text-xs font-mono font-semibold tracking-widest text-sky-200 uppercase shadow-inner backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c] animate-pulse" />
          <span>AXION PackTech // Packaging &amp; Automation Engineering</span>
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.08] max-w-6xl mx-auto">
          Precision Engineering for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
            Industrial Packaging
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-slate-300">
          Turnkey bagging machinery, automated secondary packaging, sanitary washdown conveying,
          and intelligent line integrations engineered for continuous global manufacturing.
        </p>

        {/* Quick Machinery Division Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Divisions:
          </span>
          <Link
            href="/products/conveyor"
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            Conveyors &amp; Elevators
          </Link>
          <Link
            href="/products"
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            Automated Bagging
          </Link>
          <Link
            href="/products"
            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all"
          >
            Rotary Capping
          </Link>
          <Link
            href="/catalogs"
            className="px-3 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-400/30 text-xs font-mono text-sky-300 hover:text-white transition-all"
          >
            Technical Datasheets
          </Link>
        </div>

        {/* Quick Hero Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-brand-orange px-8 py-4 text-sm font-bold text-white shadow-xl shadow-orange-950/40 transition-all duration-200 hover:bg-brand-orange-light hover:shadow-orange-600/30 active:scale-95"
          >
            <span>Explore Machinery Catalog</span>
            <span className="ml-2">→</span>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-xl border border-sky-400/40 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/15 active:scale-95"
          >
            <span>Consult an Engineer</span>
          </Link>
        </div>
      </div>

      {/* Industrial Telemetry Strip (Bottom of Hero) */}
      <div className="relative z-10 container-wide mt-auto pt-8">
        <div className="rounded-2xl border border-white/10 bg-[#040911]/80 backdrop-blur-xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 shadow-2xl">
          <div className="border-r border-white/10 last:border-0 pr-4">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Installed Equipment
            </span>
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-white mt-0.5 block">
              1,500+ <span className="text-xs font-sans text-brand-orange">Units</span>
            </span>
          </div>
          <div className="border-r border-white/10 last:border-0 pr-4">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Global Presence
            </span>
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-white mt-0.5 block">
              35+ <span className="text-xs font-sans text-sky-400">Countries</span>
            </span>
          </div>
          <div className="border-r border-white/10 last:border-0 pr-4">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Commissioning SAT
            </span>
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 mt-0.5 block">
              99.8% <span className="text-xs font-sans text-slate-300">Success</span>
            </span>
          </div>
          <div className="pr-2">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Engineering Heritage
            </span>
            <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 mt-0.5 block">
              14+ <span className="text-xs font-sans text-slate-300">Years</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
