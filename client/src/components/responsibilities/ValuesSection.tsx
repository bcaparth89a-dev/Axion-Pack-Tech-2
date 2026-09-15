export default function ValuesSection() {
  const values = [
    {
      number: "01",
      title: "Familiar",
      tagline: "Partnership & Respect",
      description:
        "A culture rooted in mutual trust, teamwork, and transparent long-term relationships. We treat our clients, suppliers, and team members as valued, enduring partners.",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      borderColor: "hover:border-sky-500",
    },
    {
      number: "02",
      title: "Masterfully Crafted",
      tagline: "Precision & Longevity",
      description:
        "Uncompromising engineering precision, premium structural steel, meticulous manufacturing standards, and rigorous 100-point quality verification.",
      icon: (
        <svg
          className="w-7 h-7 text-brand-orange"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      borderColor: "hover:border-brand-orange",
    },
    {
      number: "03",
      title: "Inspiring",
      tagline: "Innovation & Future",
      description:
        "Pushing boundaries with cutting-edge robotic automation, creative packaging architectures, and pioneering eco-conscious packaging technology.",
      icon: (
        <svg
          className="w-7 h-7 text-sky-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      borderColor: "hover:border-sky-500",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-100/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
            Our Core Principles
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Our Guiding Values
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-orange" />
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            The foundation behind every machine we build, every decision we make,
            and every relationship we nurture.
          </p>
        </div>

        {/* 3 Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((val, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl bg-white p-8 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${val.borderColor}`}
            >
              {/* Top Row: Icon + Number */}
              <div className="flex items-center justify-between mb-6">
                <div className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200 group-hover:scale-110 transition-transform duration-300">
                  {val.icon}
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  VALUE {val.number}
                </span>
              </div>

              {/* Title & Tagline */}
              <h3 className="text-2xl font-extrabold text-slate-900 group-hover:text-sky-900 transition-colors">
                {val.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-sky-700 uppercase tracking-wider">
                {val.tagline}
              </p>

              {/* Accent Line */}
              <div className="my-4 h-0.5 w-10 bg-slate-200 group-hover:w-16 group-hover:bg-brand-orange transition-all duration-300" />

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
