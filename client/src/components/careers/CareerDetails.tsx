import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { CareerOpportunity, typeToCategorySlug } from "@/data/careers";
import SelectionProcess from "@/components/careers/SelectionProcess";

interface CareerDetailsProps {
  opportunity: CareerOpportunity;
}

export default function CareerDetails({ opportunity }: CareerDetailsProps) {
  const categorySlug = typeToCategorySlug(opportunity.type);
  const applyUrl = `/careers/${categorySlug}/${opportunity.slug}/apply`;

  const getCategoryLabel = () => {
    switch (opportunity.type) {
      case "job":
        return "Jobs";
      case "internship":
        return "Internships";
      case "apprenticeship":
        return "Apprenticeships";
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      {/* Top Breadcrumbs Strip */}
      <div className="bg-[#061527] border-b border-sky-900/40 text-xs text-slate-400 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/careers" className="hover:text-white transition-colors">
            Careers
          </Link>
          <span className="text-slate-600">/</span>
          <Link
            href={`/careers/${categorySlug}`}
            className="hover:text-white transition-colors capitalize"
          >
            {getCategoryLabel()}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sky-300 font-semibold truncate max-w-xs sm:max-w-sm">
            {opportunity.title}
          </span>
        </div>
      </div>

      {/* Opportunity Hero Header */}
      <section className="relative bg-[#061527] text-white py-12 sm:py-16 border-b border-sky-900/30 overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="rounded-md bg-brand-orange px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {opportunity.employmentType}
                </span>
                <span className="rounded-md bg-sky-950 px-3 py-1 text-xs font-bold text-sky-300 border border-sky-800/60">
                  {opportunity.department}
                </span>
                <span className="text-xs text-slate-400">
                  Posted on {opportunity.postedDate}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {opportunity.title}
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {opportunity.shortDescription}
              </p>

              {/* Quick Details Chips */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span>📍</span>
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                  <span>⏳</span>
                  <span>{opportunity.experience}</span>
                </div>
                {opportunity.duration && (
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span>⏱️</span>
                    <span>Duration: {opportunity.duration}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action in Header */}
            <div className="shrink-0 flex flex-col gap-3">
              <Link
                href={applyUrl}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-8 py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-orange-950/40 transition-all duration-200 hover:bg-brand-orange-light hover:shadow-orange-600/30 active:scale-95"
              >
                <span>APPLY NOW</span>
                <span>→</span>
              </Link>
              <span className="text-center text-xs text-slate-400">
                Deadline: <strong className="text-white">{opportunity.applicationDeadline}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Content: Two-column layout with sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Featured Image */}
            <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden shadow-md bg-slate-900">
              <CmsImage
                src={opportunity.image}
                alt={opportunity.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            {/* 1. About the Role */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <span className="text-sky-600">📋</span> About the Role
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                {opportunity.description}
              </p>
            </div>

            {/* 2. Key Responsibilities */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-5 flex items-center gap-2">
                <span className="text-sky-600">⚙️</span> Key Responsibilities
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                {opportunity.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Required Qualifications & Requirements */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-5 flex items-center gap-2">
                <span className="text-sky-600">🎓</span> Required Qualifications
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                {opportunity.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Eligibility Criteria */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-5 flex items-center gap-2">
                <span className="text-sky-600">📝</span> Eligibility Criteria
              </h2>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                {opportunity.eligibility.map((el, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-xs mt-0.5">
                      •
                    </span>
                    <span className="leading-relaxed">{el}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Skills & Competencies */}
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <span className="text-sky-600">💡</span> Required Skills &amp; Competencies
              </h2>
              <div className="flex flex-wrap gap-2 pt-2">
                {opportunity.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-xl bg-slate-100 border border-slate-200/80 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 6. Selection Process Timeline */}
            <SelectionProcess steps={opportunity.selectionProcess} />

            {/* Bottom Call to Action */}
            <div className="rounded-2xl bg-[#061527] text-white p-8 sm:p-10 text-center space-y-4 shadow-xl border border-sky-900/50">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Interested in this Opportunity?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Take the next step in your career with Axion PackTech. Complete our online
                candidate application form and upload your resume today.
              </p>
              <div className="pt-2">
                <Link
                  href={applyUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:bg-brand-orange-light active:scale-95"
                >
                  <span>Apply For This Opportunity</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Column (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Application Information Panel */}
              <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-lg">
                <div className="border-b border-slate-200 pb-4 mb-5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-600">
                    Application Information
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Role Summary
                  </h3>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                  <div>
                    <div className="font-semibold text-slate-400 text-xs">
                      Application Deadline
                    </div>
                    <div className="font-bold text-red-600 text-sm mt-0.5">
                      {opportunity.applicationDeadline}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-semibold text-slate-400 text-xs">
                      Location
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {opportunity.location}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-semibold text-slate-400 text-xs">
                      Employment Type
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {opportunity.employmentType}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-semibold text-slate-400 text-xs">
                      Experience Required
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {opportunity.experience}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <div className="font-semibold text-slate-400 text-xs">
                      Department
                    </div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {opportunity.department}
                    </div>
                  </div>

                  {opportunity.duration && (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="font-semibold text-slate-400 text-xs">
                        Program Duration
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {opportunity.duration}
                      </div>
                    </div>
                  )}

                  {opportunity.stipendOrBenefits && (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="font-semibold text-slate-400 text-xs">
                        Compensation &amp; Benefits
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {opportunity.stipendOrBenefits}
                      </div>
                    </div>
                  )}

                  {opportunity.certification && (
                    <div className="border-t border-slate-100 pt-3">
                      <div className="font-semibold text-slate-400 text-xs">
                        Certification
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {opportunity.certification}
                      </div>
                    </div>
                  )}
                </div>

                {/* Primary CTA Button */}
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <Link
                    href={applyUrl}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-brand-orange-light active:scale-[0.98]"
                  >
                    <span>APPLY NOW</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Have Questions Card */}
              <div className="rounded-2xl bg-slate-100 border border-slate-200/80 p-5 text-xs text-slate-600">
                <div className="font-bold text-slate-900 mb-1 text-sm">
                  Questions about this role?
                </div>
                <p className="leading-relaxed">
                  For recruitment inquiries or clarification on requirements, contact our
                  HR and Engineering Talent team.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-1 font-bold text-sky-700 hover:text-sky-900 underline"
                >
                  <span>Contact Axion PackTech</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
