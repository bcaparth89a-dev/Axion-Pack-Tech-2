"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCategoryTree } from "@/lib/api/products";
import { CategoryTreeNode } from "@/types/products";
import { useIndustriesData } from "@/hooks/useIndustriesData";
import { useServicesData } from "@/hooks/useServicesData";

import { useNewsData } from "@/hooks/useNewsData";
import { useBlogsData } from "@/hooks/useBlogsData";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  activeItem = "",
}: MobileMenuProps) {
  const { industries } = useIndustriesData();
  const { services: servicesData } = useServicesData();
  const { categories: newsCategories } = useNewsData();
  const { categories: blogCategories } = useBlogsData();
  const [categoriesTree, setCategoriesTree] = useState<CategoryTreeNode[]>([]);
  const [isProductsExpanded, setIsProductsExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getCategoryTree().then((tree) => {
      if (Array.isArray(tree)) setCategoriesTree(tree);
    });
  }, [isOpen]);


  const [expandedCategorySlug, setExpandedCategorySlug] = useState<string | null>(null);
  const [isIndustriesExpanded, setIsIndustriesExpanded] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [isBlogExpanded, setIsBlogExpanded] = useState(false);

  // Close and reset accordion states
  const handleClose = useCallback(() => {
    setIsProductsExpanded(false);
    setExpandedCategorySlug(null);
    setIsIndustriesExpanded(false);
    setIsServicesExpanded(false);
    setIsNewsExpanded(false);
    setIsBlogExpanded(false);
    onClose();
  }, [onClose]);

  // Prevent background scrolling while menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const toggleCategory = (slug: string) => {
    setExpandedCategorySlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Right-Side Slide-Over Menu Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 flex w-[88vw] max-w-sm flex-col bg-[#061527] text-white border-l border-sky-900/40 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-sky-900/30 px-6 py-5">
          <Link
            href="/"
            onClick={handleClose}
            className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition-transform active:scale-95"
            aria-label="AXION PackTech Home"
          >
            <Image
              src="/logo.jpeg"
              alt="AXION PackTech"
              width={120}
              height={32}
              className="h-7 w-auto object-contain"
            />
          </Link>

          <button
            onClick={handleClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links Accordion */}
        <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-2 custom-scrollbar">
          {/* 1. About Us */}
          <div>
            <Link
              href="/about-us"
              onClick={handleClose}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${
                activeItem === "About Us"
                  ? "bg-sky-950/80 text-white border border-sky-600/30 shadow-inner"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>About Us</span>
              <span className="text-slate-500">→</span>
            </Link>
          </div>

          {/* 2. Products Nested Accordion */}
          <div className="rounded-xl border border-sky-900/30 bg-[#081B33]/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsProductsExpanded(!isProductsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                Products
              </span>
              <svg
                className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                  isProductsExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Level 1: Categories List */}
            {isProductsExpanded && (
              <div className="border-t border-sky-900/40 bg-[#061527]/90 px-3 py-2 space-y-1.5">
                <Link
                  href="/products"
                  onClick={handleClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 rounded-lg border border-sky-800/40"
                >
                  <span>All Products Overview</span>
                  <span>→</span>
                </Link>

                {categoriesTree.map((cat) => {
                  const isCatExpanded = expandedCategorySlug === cat.slug;
                  return (
                    <div
                      key={cat._id}
                      className="rounded-lg border border-slate-800/80 bg-white/[0.02] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.slug)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/5"
                      >
                        <span className="truncate text-left">{cat.name}</span>
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                            isCatExpanded ? "rotate-180 text-brand-orange" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Level 2: Subcategories & Equipment */}
                      {isCatExpanded && (
                        <div className="border-t border-slate-800/60 bg-[#081B33]/60 px-3 py-2 space-y-1">
                          <Link
                            href={`/products/${cat.slug}`}
                            onClick={handleClose}
                            className="block text-[11px] font-bold text-amber-400 hover:text-white py-1 mb-1 border-b border-slate-700/40"
                          >
                            Explore {cat.name} →
                          </Link>

                          {cat.children && cat.children.length > 0 && (
                            <div className="py-1 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block px-2">Subcategories</span>
                              {cat.children.map((child) => (
                                <Link
                                  key={child._id}
                                  href={`/products/${cat.slug}/${child.slug}`}
                                  onClick={handleClose}
                                  className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-white/5 text-[11px] text-slate-300 hover:text-amber-400 transition-colors"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                                  <span className="truncate">{child.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}

                          {cat.products && cat.products.length > 0 && (
                            <div className="py-1 space-y-1">
                              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block px-2">Equipment</span>
                              {cat.products.map((prod) => (
                                <Link
                                  key={prod._id}
                                  href={`/products/${cat.slug}/${prod.slug}`}
                                  onClick={handleClose}
                                  className="flex items-center gap-2.5 py-1 px-2 rounded hover:bg-sky-600/20 text-[11px] text-slate-300 hover:text-white transition-colors"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                                  <span className="truncate">{prod.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Industries Accordion (Immediately after Products) */}
          <div className="rounded-xl border border-sky-900/30 bg-[#081B33]/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsIndustriesExpanded(!isIndustriesExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                Industries
              </span>
              <svg
                className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                  isIndustriesExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded Industries List */}
            {isIndustriesExpanded && (
              <div className="border-t border-sky-900/40 bg-[#061527]/90 px-3 py-2 space-y-1">
                <Link
                  href="/industries"
                  onClick={handleClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 rounded-lg border border-sky-800/40 mb-1.5"
                >
                  <span>All Industries Overview</span>
                  <span>→</span>
                </Link>

                {industries.map((ind) => (
                  <Link
                    key={ind.slug}
                    href={`/industries/${ind.slug}`}
                    onClick={handleClose}
                    className="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-sky-600/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{ind.icon || '🏭'}</span>
                      <span className="font-medium">{ind.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4. Services Accordion */}
          <div className="overflow-hidden rounded-xl border border-sky-900/30 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsServicesExpanded(!isServicesExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                Services
              </span>
              <svg
                className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                  isServicesExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded Services List */}
            {isServicesExpanded && (
              <div className="border-t border-sky-900/40 bg-[#061527]/90 px-3 py-2 space-y-1">
                <Link
                  href="/services"
                  onClick={handleClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 rounded-lg border border-sky-800/40 mb-1.5"
                >
                  <span>All Services Overview</span>
                  <span>→</span>
                </Link>

                {servicesData.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    onClick={handleClose}
                    className="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-sky-600/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{service.icon}</span>
                      <span className="font-medium">{service.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 5. News Accordion */}
          <div className="overflow-hidden rounded-xl border border-sky-900/30 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsNewsExpanded(!isNewsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                News &amp; Media
              </span>
              <svg
                className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                  isNewsExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded News Categories List */}
            {isNewsExpanded && (
              <div className="border-t border-sky-900/40 bg-[#061527]/90 px-3 py-2 space-y-1">
                <Link
                  href="/news"
                  onClick={handleClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 rounded-lg border border-sky-800/40 mb-1.5"
                >
                  <span>All News &amp; Media Hub</span>
                  <span>→</span>
                </Link>

                {newsCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/news/${cat.slug}`}
                    onClick={handleClose}
                    className="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-sky-600/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 6. Careers */}
          <div>
            <Link
              href="/careers"
              onClick={handleClose}
              className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-all ${
                activeItem === "Careers"
                  ? "bg-sky-950/80 text-white border border-sky-600/30 shadow-inner"
                  : "text-slate-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                Careers
              </span>
              <span className="text-slate-500">→</span>
            </Link>
          </div>

          {/* 7. Blog & Insights Accordion */}
          <div className="overflow-hidden rounded-xl border border-sky-900/30 bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsBlogExpanded(!isBlogExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white transition-colors hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                Blog &amp; Insights
              </span>
              <svg
                className={`w-4 h-4 text-sky-400 transition-transform duration-200 ${
                  isBlogExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Expanded Blog Categories List */}
            {isBlogExpanded && (
              <div className="border-t border-sky-900/40 bg-[#061527]/90 px-3 py-2 space-y-1">
                <Link
                  href="/blog"
                  onClick={handleClose}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/40 rounded-lg border border-sky-800/40 mb-1.5"
                >
                  <span>Latest Articles &amp; Insights</span>
                  <span>→</span>
                </Link>

                {blogCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blog/category/${cat.slug}`}
                    onClick={handleClose}
                    className="flex items-center justify-between p-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-sky-600/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{cat.icon}</span>
                      <span className="font-medium">{cat.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 8. Contact Us */}
          <div>
            <Link
              href="/contact"
              onClick={handleClose}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-200 hover:bg-white/5 hover:text-white transition-all"
            >
              <span>Contact Us</span>
              <span className="text-slate-500">→</span>
            </Link>
          </div>

          {/* Quick CTA inside Mobile Menu */}
          <div className="mt-6 rounded-2xl border border-sky-800/40 bg-gradient-to-b from-sky-950/40 to-[#0B1E36]/40 p-4">
            <p className="text-xs font-semibold tracking-wider text-sky-400 uppercase">
              Engineering Advisory
            </p>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Consult with our systems engineers for customized packaging &amp; automation lines.
            </p>
            <Link
              href="/contact"
              onClick={handleClose}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-brand-orange px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-brand-orange-light active:scale-[0.98]"
            >
              Request a Technical Quote
            </Link>
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-sky-900/30 px-6 py-4 text-xs text-slate-400">
          <p>© 2026 AXION PackTech</p>
          <p className="mt-0.5 text-slate-500">Engineering for a Better Tomorrow</p>
        </div>
      </div>
    </>
  );
}
