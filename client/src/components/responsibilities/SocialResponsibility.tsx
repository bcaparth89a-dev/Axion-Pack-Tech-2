import Image from "next/image";

export default function SocialResponsibility() {
  const points = [
    {
      title: "Safe and Ergonomic Workplaces",
      desc: "Strict adherence to international occupational health and safety standards across our workshops and testing floors.",
    },
    {
      title: "Continuous Technical Training",
      desc: "Regular upskilling programs in advanced mechatronics, PLC automation, and safety engineering for our technicians.",
    },
    {
      title: "Collaborative Engineering Culture",
      desc: "Transparent hierarchies where ideas, peer feedback, and engineering innovation thrive without barriers.",
    },
    {
      title: "Holistic Employee Well-being",
      desc: "Comprehensive health coverage, work-life balance initiatives, and supportive community engagement.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Column 1: Image of Engineers & Workplace */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/resp_team_workplace.jpg"
                  alt="AXION PackTech engineers and technicians collaborating in modern assembly facility"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-slate-200/80 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-800 font-bold text-lg">
                      100%
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Safety Protocol Compliance
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Zero-accident vision across all assembly lines
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Content */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-50 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              Social Responsibility
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              People at the Heart of{" "}
              <span className="text-sky-800">Engineering</span>
            </h2>

            <div className="h-1 w-16 rounded-full bg-brand-orange" />

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              At AXION PackTech, our greatest strength lies in our people. We
              foster an inclusive, safe, and motivating work environment where
              engineers, technicians, and specialists collaborate to solve
              complex industrial packaging challenges.
            </p>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              Continuous education, workplace safety, and mutual respect are
              non-negotiable principles. By investing in our team&apos;s growth, we
              empower the next generation of packaging engineering leaders.
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {points.map((pt, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition duration-200 hover:border-sky-300 hover:bg-sky-50/40"
                >
                  <div className="flex items-start gap-2.5">
                    <svg
                      className="w-5 h-5 text-sky-700 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {pt.title}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        {pt.desc}
                      </p>
                    </div>
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
