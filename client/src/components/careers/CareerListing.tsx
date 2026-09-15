"use client";

import { useState, useMemo } from "react";
import { CareerOpportunity, CareerType } from "@/data/careers";
import CareerCard from "@/components/careers/CareerCard";

interface CareerListingProps {
  initialOpportunities: CareerOpportunity[];
  defaultType?: CareerType | "all";
  showFilters?: boolean;
}

export default function CareerListing({
  initialOpportunities,
  defaultType = "all",
  showFilters = true,
}: CareerListingProps) {
  const [selectedType, setSelectedType] = useState<CareerType | "all">(defaultType);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOpportunities = useMemo(() => {
    return initialOpportunities.filter((opp) => {
      const matchesType =
        selectedType === "all" ? true : opp.type === selectedType;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.department.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        opp.skills.some((s) => s.toLowerCase().includes(q));

      return matchesType && matchesSearch;
    });
  }, [initialOpportunities, selectedType, searchQuery]);

  return (
    <div className="w-full">
      {/* Search & Filter Toolbar */}
      {showFilters && (
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200/80 p-4 shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setSelectedType("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Opportunities
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("job")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === "job"
                  ? "bg-sky-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              💼 Jobs
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("internship")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === "internship"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🎓 Internships
            </button>

            <button
              type="button"
              onClick={() => setSelectedType("apprenticeship")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                selectedType === "apprenticeship"
                  ? "bg-amber-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              🔧 Apprenticeships
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, skill, dept..."
              className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-400">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Header Count */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>
          Showing {filteredOpportunities.length} of {initialOpportunities.length} opportunities
        </span>
        {searchQuery && (
          <span>
            Filtered by &ldquo;{searchQuery}&rdquo;
          </span>
        )}
      </div>

      {/* Opportunity Cards Grid or Empty State */}
      {filteredOpportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredOpportunities.map((opportunity) => (
            <CareerCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-3xl mx-auto mb-4">
            🔍
          </div>
          <h4 className="text-xl font-bold text-slate-900">
            No Opportunities Available Right Now
          </h4>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            We currently do not have an open position matching your search. Please check
            back later for new openings or clear your search filters.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedType("all");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-sky-600"
            >
              View All Careers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
