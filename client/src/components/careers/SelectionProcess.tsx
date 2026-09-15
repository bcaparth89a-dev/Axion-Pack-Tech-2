interface SelectionProcessProps {
  steps?: string[];
  title?: string;
  subtitle?: string;
}

const defaultSteps = [
  "Application & Resume Review",
  "Initial Technical Screening",
  "Practical / Technical Assessment",
  "Panel & HR Interview",
  "Final Selection & Offer Rollout",
];

export default function SelectionProcess({
  steps = defaultSteps,
  title = "Our Selection Process",
  subtitle = "A transparent, structured, and engineering-oriented recruitment process designed to evaluate your capabilities and mutual fit.",
}: SelectionProcessProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-sky-600 uppercase mb-2">
          <span>STEP-BY-STEP PATHWAY</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      {/* Timeline Steps Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((step, idx) => {
          const stepNumber = String(idx + 1).padStart(2, "0");
          return (
            <div
              key={idx}
              className="relative flex flex-col rounded-xl bg-slate-50 border border-slate-200/80 p-4 transition-all duration-200 hover:bg-sky-50/50 hover:border-sky-300"
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-amber-400 shadow-sm font-mono">
                  {stepNumber}
                </span>
                {idx < steps.length - 1 && (
                  <span className="hidden md:inline-block text-slate-300 text-sm font-bold">
                    →
                  </span>
                )}
              </div>

              {/* Step Title */}
              <div className="font-bold text-xs sm:text-sm text-slate-800 leading-snug flex-1">
                {step}
              </div>

              {/* Step Status Indicator */}
              <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <span>Stage {idx + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
