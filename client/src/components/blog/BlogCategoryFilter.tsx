"use client";

import { useState, useMemo } from "react";
import { BlogPost, blogCategories } from "@/data/blogs";
import BlogCard from "@/components/blog/BlogCard";

interface BlogCategoryFilterProps {
  initialPosts: BlogPost[];
  defaultCategory?: string;
}

export default function BlogCategoryFilter({
  initialPosts,
  defaultCategory = "all",
}: BlogCategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "all" ? true : post.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Category Tabs & Search Toolbar */}
      <div className="mb-10 space-y-4">
        {/* Top bar: Category tabs and search input */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Articles ({initialPosts.length})
            </button>

            {blogCategories.map((cat) => {
              const count = initialPosts.filter((p) => p.category === cat.slug).length;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedCategory === cat.slug
                      ? "bg-sky-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full lg:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <span className="absolute left-3 top-3 text-xs text-slate-400">
              🔍
            </span>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Results Count Line */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{filteredPosts.length}</strong> of {initialPosts.length} articles
          </span>
          {searchQuery && (
            <span>
              Searching for &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Blog Cards Grid or Empty State */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-3xl mx-auto mb-4">
            🔍
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            No Articles Found
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            We couldn&apos;t find any articles matching your search. Try adjusting your
            keywords or view all categories.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-sky-600"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
