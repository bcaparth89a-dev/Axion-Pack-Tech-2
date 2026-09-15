export default function VisionSection() {
  return (
    <section className="relative py-24 sm:py-32 bg-[#061527] text-white overflow-hidden border-b border-slate-800">
      {/* Engineering Grid Line Watermark */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Subtle radial ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-600/10 blur-[120px] rounded-full" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
          <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
          Our Guiding Vision
        </div>

        {/* Central Vision Statement */}
        <div className="mt-8 sm:mt-10">
          <p className="text-xs sm:text-sm font-mono tracking-widest text-sky-400 uppercase">
            The Core Engineering Principle
          </p>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-tight">
            &ldquo;FASCINATING ENGINEERING.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
              AS ONE.
            </span>
            &rdquo;
          </h2>
        </div>

        {/* Orange Accent Bar */}
        <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-brand-orange shadow-[0_0_12px_#ea580c]" />

        {/* Narrative Paragraph */}
        <p className="mt-8 text-base sm:text-lg lg:text-xl font-normal text-slate-300 leading-relaxed max-w-3xl mx-auto">
          Our vision is to shape the future of packaging automation through
          intelligent engineering, modular design, and sustainable performance.
          We unite state-of-the-art robotics with human craftsmanship to deliver
          machinery that elevates industries worldwide.
        </p>

        {/* Core Vision Metrics / Anchors */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-slate-800/80 pt-10">
          <div className="p-4 rounded-xl bg-[#0B1E36]/60 border border-slate-800">
            <span className="text-xs font-mono text-sky-400 block mb-1">
              01 // INTELLIGENCE
            </span>
            <h4 className="text-sm font-bold text-white">Smart Automation</h4>
            <p className="mt-1 text-xs text-slate-400">
              Integrating IoT sensors, remote diagnostics, and AI-driven precision
              dosing.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B1E36]/60 border border-slate-800">
            <span className="text-xs font-mono text-sky-400 block mb-1">
              02 // RELIABILITY
            </span>
            <h4 className="text-sm font-bold text-white">Continuous Uptime</h4>
            <p className="mt-1 text-xs text-slate-400">
              Engineered with heavy structural standards ensuring 24/7 industrial
              rigor.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B1E36]/60 border border-slate-800">
            <span className="text-xs font-mono text-sky-400 block mb-1">
              03 // SUSTAINABILITY
            </span>
            <h4 className="text-sm font-bold text-white">Green Lifecycle</h4>
            <p className="mt-1 text-xs text-slate-400">
              Lowering kilowatt consumption and supporting 100% recyclable
              packaging materials.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
