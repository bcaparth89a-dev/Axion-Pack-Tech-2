import Image from "next/image";

export default function EcologicalResponsibility() {
  const ecoHighlights = [
    {
      title: "Energy-Efficient Drives & Systems",
      desc: "Up to 30% lower energy consumption achieved through regenerative servo drives and intelligent stand-by power management.",
      metric: "-30% kWh",
    },
    {
      title: "Sustainable Material Compatibility",
      desc: "Engineered specifically to process ultra-thin gauge films, mono-material polyolefins, and 100% recyclable paper barriers.",
      metric: "100% Recyclable",
    },
    {
      title: "Waste Reduction & Precision Dosing",
      desc: "Micro-calibrated weighing scales and precision heat sealing eliminate product spillage and trim excess packaging scrap.",
      metric: "Zero Waste Goal",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Column 1: Sustainable Packaging Image */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/about_sustainability.jpg"
                  alt="Sustainable industrial packaging, recyclable materials, and eco-friendly automation"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
              </div>

              {/* Eco Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-emerald-200/80 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-base">
                      🌱
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Circular Packaging Ready
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Compatible with next-generation bio-resins & paper
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Eco Certified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Content */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-emerald-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ecological Responsibility
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Protecting Tomorrow&apos;s{" "}
              <span className="text-emerald-700">Resources</span>
            </h2>

            <div className="h-1 w-16 rounded-full bg-brand-orange" />

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              We are dedicated to minimizing the environmental impact of
              industrial packaging. By developing high-efficiency machinery that
              consumes less energy and seamlessly processes recyclable,
              biodegradable, and post-consumer recycled films, we help our partners
              reach aggressive sustainability targets.
            </p>

            <div className="space-y-4 pt-2">
              {ecoHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md border border-emerald-200">
                      {item.metric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
