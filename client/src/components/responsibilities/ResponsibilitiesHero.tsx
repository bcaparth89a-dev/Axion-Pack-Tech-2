import Image from "next/image";

export default function ResponsibilitiesHero() {
  return (
    <section className="relative min-h-[70vh] sm:min-h-[75vh] w-full flex items-center overflow-hidden bg-[#061527] text-white">
      {/* Background Facility Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/resp_hero_facility.jpg"
          alt="AXION PackTech Advanced Industrial Automation & Engineering Facility"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Deep Navy Gradient Overlay for optimal contrast & brand aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061527]/95 via-[#0B1E36]/85 to-[#061527]/90" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#061527] to-transparent" />
      </div>

      {/* Engineering Grid Line Watermark */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-24 sm:py-32 w-full">
        <div className="max-w-3xl space-y-6 text-left">
          {/* Small Label */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-950/70 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-200 uppercase shadow-inner">
            <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
            Our Responsibilities
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Engineering Responsibility{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-white block sm:inline">
              For a Better Tomorrow
            </span>
          </h1>

          {/* Accent Line */}
          <div className="h-1 w-20 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl font-normal text-slate-300 leading-relaxed max-w-2xl">
            At AXION PackTech, responsibility is not just a commitment. It is built
            into the way we think, engineer, innovate, and deliver solutions for
            people, industries, and the future.
          </p>
        </div>
      </div>
    </section>
  );
}
