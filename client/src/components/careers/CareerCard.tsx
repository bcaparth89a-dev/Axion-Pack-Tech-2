import { CmsImage } from "@/components/common/CmsImage";
import Link from "next/link";
import { CareerOpportunity, typeToCategorySlug } from "@/data/careers";

interface CareerCardProps {
  opportunity: CareerOpportunity;
}

export default function CareerCard({ opportunity }: CareerCardProps) {
  const categorySlug = typeToCategorySlug(opportunity.type);
  const detailUrl = `/careers/${categorySlug}/${opportunity.slug}`;

  const getTypeBadge = () => {
    switch (opportunity.type) {
      case "job":
        return {
          label: "FULL-TIME",
          classes: "bg-sky-950/80 text-sky-300 border-sky-700/60",
        };
      case "internship":
        return {
          label: "INTERNSHIP",
          classes: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
        };
      case "apprenticeship":
        return {
          label: "APPRENTICESHIP",
          classes: "bg-amber-950/80 text-amber-300 border-amber-700/60",
        };
    }
  };

  const badge = getTypeBadge();

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-300/80">
      {/* Top Banner Image with Overlay Badge */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        <CmsImage
          src={opportunity.image}
          alt={opportunity.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Opportunity Type Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-extrabold tracking-wider border backdrop-blur-md shadow-sm ${badge.classes}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Department tag at bottom left */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="font-semibold truncate bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-md border border-white/10">
            {opportunity.department}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Title */}
        <Link href={detailUrl} className="group-hover:text-sky-700 transition-colors">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug line-clamp-2">
            {opportunity.title}
          </h3>
        </Link>

        {/* Short summary */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
          {opportunity.shortDescription}
        </p>

        {/* Metadata Details Grid */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sky-600 shrink-0">📍</span>
            <span className="truncate">{opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sky-600 shrink-0">💼</span>
            <span>{opportunity.employmentType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sky-600 shrink-0">⏳</span>
            <span>{opportunity.experience}</span>
          </div>
        </div>

        {/* Deadline Notice */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 border border-slate-200/60 text-xs">
          <span className="font-medium text-slate-500">Apply Before:</span>
          <span className="font-bold text-slate-800">{opportunity.applicationDeadline}</span>
        </div>

        {/* Card Action Link */}
        <div className="mt-5 pt-3">
          <Link
            href={detailUrl}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all duration-200 group-hover:bg-sky-600 active:scale-[0.98]"
          >
            <span>View Opportunity</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
