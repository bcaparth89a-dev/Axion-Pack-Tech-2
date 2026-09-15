"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getCategoryTree } from "@/lib/api/products";
import { CategoryTreeNode } from "@/types/products";
import CmsImage from "@/components/common/CmsImage";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

interface ProductsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ProductsDropdown({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProductsDropdownProps) {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryTreeNode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTree() {
      try {
        const tree = await getCategoryTree();
        if (isMounted && Array.isArray(tree)) {
          setCategories(tree);
          setSelectedCategory((prev) => {
            if (prev && tree.some((t) => t._id === prev._id)) {
              return tree.find((t) => t._id === prev._id) || tree[0] || null;
            }
            return tree.length > 0 ? tree[0] : null;
          });
        }
      } catch (err) {
        console.warn("Failed to load category tree for navigation:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (isOpen || categories.length === 0) {
      loadTree();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSingleCategory = categories.length === 1;

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
        isSingleCategory ? "w-[720px] max-w-[95vw]" : "w-[940px] max-w-[95vw]"
      }`}
    >
      {/* Mega Menu Box */}
      <div className="relative overflow-hidden rounded-2xl bg-[#050c18] border border-slate-700/80 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.9),0_0_20px_rgba(14,165,233,0.15)] text-white backdrop-blur-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {isLoading ? (
          <div className="p-8 text-center space-y-3">
            <div className="h-6 w-32 bg-slate-800 animate-pulse rounded mx-auto" />
            <div className="h-20 bg-slate-900 animate-pulse rounded-xl" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-300">Catalog Updating</p>
            <p className="text-[11px] text-slate-500 mt-1">No active categories found</p>
            <div className="mt-4">
              <Link
                href="/products"
                onClick={onClose}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                Browse Equipment Overview →
              </Link>
            </div>
          </div>
        ) : isSingleCategory ? (
          /* =========================================================
             ADAPTIVE LAYOUT FOR SINGLE CATEGORY (NO DEAD SPACE)
             ========================================================= */
          <div className="relative z-10 p-6 space-y-5">
            {/* Category Banner */}
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-28 w-full group">
              <CmsImage
                src={
                  resolveMediaUrl(selectedCategory?.media?.image || selectedCategory?.media?.heroImage) ||
                  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                }
                alt={selectedCategory?.name || "Category"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                sizes="700px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050c18] via-[#050c18]/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Primary Machinery Division
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight truncate">
                    {selectedCategory?.name}
                  </h3>
                </div>
                <Link
                  href={`/products/${selectedCategory?.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                >
                  Explore Division →
                </Link>
              </div>
            </div>

            {/* Subcategories & Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subcategories */}
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                    Subcategories ({selectedCategory.children.length})
                  </div>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {selectedCategory.children.map((child) => (
                      <Link
                        key={child._id}
                        href={`/products/${selectedCategory.slug}/${child.slug}`}
                        onClick={onClose}
                        className="group p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-400/50 transition-all flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                          {child.name}
                        </span>
                        <span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Products */}
              {selectedCategory?.products && selectedCategory.products.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                    Equipment Solutions ({selectedCategory.products.length})
                  </div>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {selectedCategory.products.map((prod) => (
                      <Link
                        key={prod._id}
                        href={`/products/${selectedCategory.slug}/${prod.slug}`}
                        onClick={onClose}
                        className="group p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-400/50 transition-all flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors block truncate">
                            {prod.name}
                          </span>
                          {prod.modelCount !== undefined && prod.modelCount > 0 && (
                            <span className="text-[10px] text-sky-400 font-semibold block">
                              {prod.modelCount} Models Available
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sky-400 group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <Link
                href="/products"
                onClick={onClose}
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                Browse Full Catalog →
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
              >
                Request Custom Machinery Solution
              </Link>
            </div>
          </div>
        ) : (
          /* =========================================================
             STANDARD MULTI-CATEGORY SPLIT VIEW
             ========================================================= */
          <div className="relative z-10 grid grid-cols-12 min-h-[420px]">
            {/* LEFT COLUMN: Categories List (5 cols) */}
            <div className="col-span-5 border-r border-slate-800/80 bg-[#06101e]/80 p-4 flex flex-col justify-between">
              <div>
                <div className="px-3 py-2 mb-2 flex items-center justify-between border-b border-slate-800">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                    Product Divisions
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
                    {categories.length} Categories
                  </span>
                </div>

                <ul className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory?.slug === cat.slug;
                    return (
                      <li key={cat._id}>
                        <button
                          type="button"
                          onMouseEnter={() => setSelectedCategory(cat)}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 group ${
                            isSelected
                              ? "bg-slate-800/90 text-white border border-amber-400/40 shadow-sm"
                              : "text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 transition-all duration-200 ${
                                isSelected
                                  ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] scale-125"
                                  : "bg-slate-600 group-hover:bg-amber-400"
                              }`}
                            />
                            <span className="truncate text-xs font-semibold">{cat.name}</span>
                          </div>
                          <span
                            className={`text-xs transition-transform duration-200 shrink-0 ${
                              isSelected
                                ? "translate-x-0.5 text-amber-400 font-bold"
                                : "text-slate-500 group-hover:text-amber-400"
                            }`}
                          >
                            →
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Bottom Left Link */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 px-2">
                <Link
                  href="/products"
                  onClick={onClose}
                  className="flex items-center justify-between text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>Browse Full Machinery Catalog</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Selected Category Detail, Subcategories & Products (7 cols) */}
            <div className="col-span-7 p-6 flex flex-col justify-between bg-gradient-to-b from-[#050c18] to-[#071322]">
              {selectedCategory ? (
                <div className="space-y-4">
                  {/* Category Header Banner */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-28 w-full group">
                    <CmsImage
                      src={
                        resolveMediaUrl(selectedCategory.media?.image || selectedCategory.media?.heroImage) ||
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={selectedCategory.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                      sizes="500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050c18] via-[#050c18]/70 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                          Category Division
                        </span>
                        <h3 className="text-lg font-black text-white leading-tight truncate">
                          {selectedCategory.name}
                        </h3>
                      </div>
                      <Link
                        href={`/products/${selectedCategory.slug}`}
                        onClick={onClose}
                        className="text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 px-3.5 py-1.5 rounded-lg shadow-md transition-all active:scale-95 shrink-0"
                      >
                        View Category →
                      </Link>
                    </div>
                  </div>

                  {/* Subcategories (if any) */}
                  {selectedCategory.children && selectedCategory.children.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                        <span>Subcategories</span>
                        <span>{selectedCategory.children.length} Divisions</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {selectedCategory.children.map((child) => (
                          <Link
                            key={child._id}
                            href={`/products/${selectedCategory.slug}/${child.slug}`}
                            onClick={onClose}
                            className="group p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-amber-400/50 transition-all flex items-center justify-between"
                          >
                            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                              {child.name}
                            </span>
                            <span className="text-xs text-amber-400 group-hover:translate-x-0.5 transition-transform">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Products (if any) */}
                  {selectedCategory.products && selectedCategory.products.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-800">
                        <span>Equipment Solutions</span>
                        <span>{selectedCategory.products.length} Products</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {selectedCategory.products.map((product) => (
                          <Link
                            key={product._id}
                            href={`/products/${selectedCategory.slug}/${product.slug}`}
                            onClick={onClose}
                            className="group flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-400/40 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative h-8 w-10 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                                <CmsImage
                                  src={resolveMediaUrl(product.media?.image || product.media?.heroImage) || ""}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                                  {product.name}
                                </h4>
                                {product.modelCount !== undefined && product.modelCount > 0 ? (
                                  <p className="text-[10px] text-sky-400 font-semibold">
                                    {product.modelCount} Models Available
                                  </p>
                                ) : (
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {product.shortDescription || "View Machine"}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
                  <p>No products available.</p>
                </div>
              )}

              {/* Bottom Bar CTA */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Need engineering advice?</span>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4"
                >
                  Request Custom Solution
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
