import Image from "next/image";

export default function MarketResponsibility() {
  const cards = [
    {
      number: "01",
      title: "Long-Life Machinery",
      desc: "Engineered with heavy-duty structural steel and top-tier mechatronics to perform reliably for decades with modular serviceability.",
    },
    {
      number: "02",
      title: "Transparent Partnerships",
      desc: "Honest technical advisory, fair cost structures, accurate lead times, and dedicated post-commissioning lifecycle support.",
    },
    {
      number: "03",
      title: "Global Safety & Compliance",
      desc: "Meeting and exceeding CE, ISO 9001, and international packaging machinery safety and ergonomics directives.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Column 1: Text & Features */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-100/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              Market Integrity
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Quality Without <span className="text-sky-800">Compromise</span>
            </h2>

            <div className="h-1 w-16 rounded-full bg-brand-orange" />

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              In industrial packaging, downtime is catastrophic. AXION PackTech
              designs and delivers robust bagging and automation systems
              engineered for extreme operational longevity, ensuring peak
              productivity and lasting customer trust across global markets.
            </p>

            <div className="space-y-4 pt-2">
              {cards.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl bg-white p-5 border border-slate-200 shadow-sm transition-all duration-300 hover:border-sky-400 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                      {item.number}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Precision Quality Testing Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/resp_quality_testing.jpg"
                  alt="AXION PackTech precision quality control, laser inspection, and machine calibration"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Stat Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-slate-900/90 backdrop-blur-md rounded-xl p-5 border border-slate-700/60 text-white shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                        Rigorous Quality Assurance
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-200">
                      100-Point Pre-Delivery Inspection on Every Machine
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-2xl font-black text-white font-mono">
                      99.8%
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase">
                      Reliability Rate
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
