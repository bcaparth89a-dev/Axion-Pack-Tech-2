import Link from "next/link";

export default function HomeHero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[85vh] sm:min-h-[88vh] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#051324] via-[#091D38] to-[#0A2244] text-white pt-16 sm:pt-24 pb-28 sm:pb-36"
    >
      {/* Subtle Industrial Grid Background Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient Radial Accent Glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] sm:h-[600px] sm:w-[600px] rounded-full bg-sky-600/10 blur-3xl" />

      {/* Hero Main Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center my-auto">
        {/* Engineering Badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
          <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
          Packaging, Bagging &amp; Automation Solutions
        </div>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
          Engineering Precision For{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white">
            Industrial Packaging
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-slate-300 sm:text-lg">
          High-speed bagging systems, secondary packaging automation, and custom
          end-of-line integration engineered for modern global industries.
        </p>

        {/* Quick Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#products"
            className="inline-flex items-center justify-center rounded-xl bg-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/30 transition-all duration-200 hover:bg-brand-orange-light hover:shadow-orange-600/20 active:scale-95"
          >
            Explore Solutions
          </Link>
          <Link
            href="#about"
            className="inline-flex items-center justify-center rounded-xl border border-sky-400/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 active:scale-95"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
