import Image from "next/image";

interface BlogHeroProps {
  badge?: string;
  title?: string;
  description?: string;
}

export default function BlogHero({
  badge = "AXION INSIGHTS",
  title = "Packaging, Automation & Industrial Insights",
  description = "Stay informed with the latest insights, technologies, engineering knowledge, and trends shaping modern packaging and industrial automation.",
}: BlogHeroProps) {
  return (
    <section className="relative w-full bg-[#061527] text-white overflow-hidden border-b border-sky-900/40 py-16 sm:py-24">
      {/* Background Hero Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/blog/blog-hero.jpg"
          alt="Axion PackTech Blog Hero"
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061527] via-[#061527]/90 to-[#061527]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-950/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-sky-800/60 shadow-sm mb-5">
          <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
          <span>{badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          {title}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
