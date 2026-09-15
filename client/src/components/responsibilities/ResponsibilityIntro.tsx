export default function ResponsibilityIntro() {
  const pillars = [
    {
      title: "People",
      badge: "Workforce & Community",
      description:
        "Workplace safety, continuous employee growth, and well-being across our entire engineering organization.",
      icon: (
        <svg
          className="w-6 h-6 text-sky-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      accent: "border-sky-200 hover:border-sky-500",
    },
    {
      title: "Market",
      badge: "Integrity & Standards",
      description:
        "Transparent partnerships, uncompromised build quality, and enduring customer trust worldwide.",
      icon: (
        <svg
          className="w-6 h-6 text-brand-orange"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      accent: "border-orange-200 hover:border-brand-orange",
    },
    {
      title: "Environment",
      badge: "Resource Efficiency",
      description:
        "Intelligent power conservation, circular material integration, and minimized manufacturing waste.",
      icon: (
        <svg
          className="w-6 h-6 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      accent: "border-emerald-200 hover:border-emerald-500",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Narrative Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-100/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              Our Core Philosophy
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Acting Responsibly —{" "}
              <span className="text-sky-800">
                For People, Market and Environment
              </span>
            </h2>

            <div className="h-1 w-16 rounded-full bg-brand-orange" />

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At AXION PackTech, responsibility is anchored deeply into our
              corporate philosophy. We believe that sustainable business success is
              achieved only when engineering excellence goes hand in hand with
              social awareness, market integrity, and environmental stewardship.
            </p>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Every automated packaging line we engineer, every client
              relationship we foster, and every production guideline we implement
              is measured against the positive impact it creates across these three
              critical dimensions.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-600" />
                Ethical Sourcing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-orange" />
                Zero Compromise Safety
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Circular Design
              </span>
            </div>
          </div>

          {/* Right Column: 3 Pillar Highlight Cards */}
          <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-5">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className={`group relative rounded-2xl bg-white p-6 sm:p-7 border ${pillar.accent} shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200 group-hover:scale-105 transition-transform duration-300">
                    {pillar.icon}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                        {pillar.title}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {pillar.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
