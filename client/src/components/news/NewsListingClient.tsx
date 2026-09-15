"use client";

import { useState, useMemo } from "react";
import { NewsArticle } from "@/data/news";
import NewsCard from "@/components/news/NewsCard";

interface NewsListingClientProps {
  initialNews: NewsArticle[];
  categories: string[];
}

export default function NewsListingClient({
  initialNews,
  categories,
}: NewsListingClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All News");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNews = useMemo(() => {
    return initialNews.filter((article) => {
      const matchesCategory =
        selectedCategory === "All News" ||
        article.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        searchQuery.trim() === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [initialNews, selectedCategory, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Category Pills & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        {/* Category Pills Horizontal Scroll */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isSelected
                    ? "bg-[#0B192C] text-white shadow-md shadow-sky-950/20 scale-[1.02]"
                    : "bg-white text-slate-600 border border-slate-200/90 hover:border-sky-400 hover:text-sky-900 hover:bg-sky-50/50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news & updates..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-xs focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Count / Filter Status */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800 font-semibold">{filteredNews.length}</strong>{" "}
          {filteredNews.length === 1 ? "article" : "articles"}
          {selectedCategory !== "All News" && (
            <span>
              {" "}
              in <span className="font-semibold text-sky-800">{selectedCategory}</span>
            </span>
          )}
        </span>

        {(selectedCategory !== "All News" || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory("All News");
              setSearchQuery("");
            }}
            className="text-brand-orange hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Articles Responsive Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredNews.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No articles found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            No news matches your selected filter or query. Try selecting another category or resetting filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All News");
              setSearchQuery("");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B192C] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-sky-950 transition-colors"
          >
            Show All News
          </button>
        </div>
      )}
    </div>
  );
}
