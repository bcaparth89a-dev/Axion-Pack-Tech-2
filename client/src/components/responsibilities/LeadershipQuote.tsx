export default function LeadershipQuote() {
  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#061527] via-[#0B1E36] to-[#061527] p-8 sm:p-14 lg:p-16 text-white shadow-2xl overflow-hidden border border-slate-700/60">
          {/* Engineering Grid Accent */}
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Decorative Quote Mark Watermark */}
          <div className="pointer-events-none absolute -right-6 -bottom-10 select-none text-[160px] sm:text-[220px] font-serif font-black text-white/[0.04] leading-none">
            ”
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/80 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
              Executive Perspective
            </div>

            {/* Quote Icon */}
            <div className="flex justify-center pt-2">
              <svg
                className="w-10 h-10 text-brand-orange/80"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Quote Body */}
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-white leading-relaxed italic">
              &ldquo;True engineering is not only about building better machines;
              it is about taking responsibility for the impact those machines have
              on our clients&apos; success, our employees&apos; safety, and the
              planet&apos;s future.&rdquo;
            </blockquote>

            {/* Divider Accent */}
            <div className="mx-auto h-0.5 w-16 bg-brand-orange/80" />

            {/* Attribution */}
            <div className="pt-2 space-y-1">
              <p className="text-base sm:text-lg font-bold text-white tracking-wide">
                Chief Executive Officer
              </p>
              <p className="text-xs sm:text-sm font-mono text-sky-300 uppercase tracking-widest">
                AXION PackTech Management Board
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
