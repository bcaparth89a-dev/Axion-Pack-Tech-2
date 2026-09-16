"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
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

export interface GenericNavNode {
  id: string;
  name: string;
  slug: string;
  type: "category" | "subcategory" | "product" | "model";
  href: string;
  badge: "CATEGORY" | "SUB-CATEGORY" | "PRODUCT" | "MODEL";
  shortDescription?: string;
  description?: string;
  image?: string;
  features?: string[];
  modelCount?: number;
  modelNumber?: string;
  hasChildren: boolean;
  children: GenericNavNode[];
}

/**
 * Recursively converts backend CategoryTreeNode hierarchy into a uniform GenericNavNode tree.
 * Automatically supports unlimited depth: Category -> Subcategory -> Nested Subcategory -> Product -> Model.
 * Handles standalone / parentless products & models gracefully at root.
 */
function buildNavHierarchy(
  nodes: CategoryTreeNode[],
  parentPath = "/products",
  depth = 0
): GenericNavNode[] {
  if (!Array.isArray(nodes)) return [];

  return nodes.map((node) => {
    const isExplicitProduct = node.type === "product";
    const isExplicitModel = node.type === "model";
    const isRoot = depth === 0;

    // 1. Root / Standalone Product or Product in Category
    if (isExplicitProduct) {
      const currentPath = `${parentPath}/${node.slug}`;

      // Direct Child Models under this product
      const modelNodes: GenericNavNode[] = (node.models || []).map((mod) => ({
        id: mod._id,
        name: mod.name,
        slug: mod.slug,
        type: "model",
        href: `${currentPath}/${mod.slug}`,
        badge: "MODEL",
        shortDescription: mod.shortDescription,
        image: resolveMediaUrl(mod.media?.image || mod.media?.heroImage),
        modelNumber: mod.modelNumber,
        hasChildren: false,
        children: [],
      }));

      // Any child sub-products or child categories if nested
      const childNodes =
        node.children && node.children.length > 0
          ? buildNavHierarchy(node.children, currentPath, depth + 1)
          : [];

      const allChildren = [...childNodes, ...modelNodes];

      return {
        id: node._id,
        name: node.name,
        slug: node.slug,
        type: "product",
        href: currentPath,
        badge: "PRODUCT",
        shortDescription: node.shortDescription,
        description: node.description,
        image: resolveMediaUrl(node.media?.image || node.media?.heroImage),
        features: node.features,
        modelCount: node.modelCount || modelNodes.length,
        hasChildren: allChildren.length > 0,
        children: allChildren,
      };
    }

    // 2. Standalone Model
    if (isExplicitModel) {
      const currentPath = `${parentPath}/${node.slug}`;
      return {
        id: node._id,
        name: node.name,
        slug: node.slug,
        type: "model",
        href: currentPath,
        badge: "MODEL",
        shortDescription: node.shortDescription,
        description: node.description,
        image: resolveMediaUrl(node.media?.image || node.media?.heroImage),
        hasChildren: false,
        children: [],
      };
    }

    // 3. Category / Subcategory
    const currentPath = `${parentPath}/${node.slug}`;

    // Recursive Subcategories
    const childCategories =
      node.children && node.children.length > 0
        ? buildNavHierarchy(node.children, currentPath, depth + 1)
        : [];

    // Direct Products under this Category
    const productNodes: GenericNavNode[] = (node.products || []).map((prod) => {
      const prodPath = `${currentPath}/${prod.slug}`;

      // Child Models under this Product
      const modelNodes: GenericNavNode[] = (prod.models || []).map((mod) => ({
        id: mod._id,
        name: mod.name,
        slug: mod.slug,
        type: "model",
        href: `${prodPath}/${mod.slug}`,
        badge: "MODEL",
        shortDescription: mod.shortDescription,
        image: resolveMediaUrl(mod.media?.image || mod.media?.heroImage),
        modelNumber: mod.modelNumber,
        hasChildren: false,
        children: [],
      }));

      return {
        id: prod._id,
        name: prod.name,
        slug: prod.slug,
        type: "product",
        href: prodPath,
        badge: "PRODUCT",
        shortDescription: prod.shortDescription,
        image: resolveMediaUrl(prod.media?.image || prod.media?.heroImage),
        modelCount: prod.modelCount || modelNodes.length,
        hasChildren: modelNodes.length > 0,
        children: modelNodes,
      };
    });

    const allChildren = [...childCategories, ...productNodes];

    return {
      id: node._id,
      name: node.name,
      slug: node.slug,
      type: isRoot ? "category" : "subcategory",
      href: currentPath,
      badge: isRoot ? "CATEGORY" : "SUB-CATEGORY",
      shortDescription: node.shortDescription,
      description: node.description,
      image: resolveMediaUrl(node.media?.image || node.media?.heroImage),
      features: node.features,
      hasChildren: allChildren.length > 0,
      children: allChildren,
    };
  });
}

export default function ProductsDropdown({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProductsDropdownProps) {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Active selection path: stores selected item IDs at each level [level0Id, level1Id, level2Id, ...]
  const [activePathIds, setActivePathIds] = useState<string[]>([]);
  // Focus column index for keyboard navigation
  const [activeColumnIndex, setActiveColumnIndex] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    async function loadTree() {
      try {
        const tree = await getCategoryTree();
        if (isMounted && Array.isArray(tree)) {
          setCategories(tree);
        }
      } catch (err) {
        console.warn("[ProductsDropdown] Failed to load category tree:", err);
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
  }, [isOpen, categories.length]);

  // Transform raw hierarchy to uniform tree
  const navTree = useMemo(() => {
    return buildNavHierarchy(categories);
  }, [categories]);

  // Initialize or maintain active path when tree loads
  useEffect(() => {
    if (navTree.length > 0) {
      setActivePathIds((prev) => {
        if (prev.length === 0 || !navTree.some((node) => node.id === prev[0])) {
          return [navTree[0].id];
        }
        return prev;
      });
    }
  }, [navTree]);

  // Compute active nodes path from activePathIds
  const activeNodesPath = useMemo(() => {
    const nodes: GenericNavNode[] = [];
    let currentLevelNodes = navTree;

    for (const id of activePathIds) {
      const match = currentLevelNodes.find((n) => n.id === id);
      if (match) {
        nodes.push(match);
        currentLevelNodes = match.children;
      } else {
        break;
      }
    }
    return nodes;
  }, [navTree, activePathIds]);

  // Active item for the Showcase Preview card (the deepest selected node)
  const previewNode = useMemo(() => {
    if (activeNodesPath.length > 0) {
      return activeNodesPath[activeNodesPath.length - 1];
    }
    return navTree[0] || null;
  }, [activeNodesPath, navTree]);

  // Columns to display: Column 0 (Root items: categories + products), Column 1 (Selected Level 0 children), Column 2 (Selected Level 1 children), etc.
  const columnsData = useMemo(() => {
    const cols: Array<{
      level: number;
      title: string;
      parentName?: string;
      items: GenericNavNode[];
      selectedId?: string;
    }> = [];

    // Column 0: Root Catalog Items (Categories AND Root Products)
    cols.push({
      level: 0,
      title: "All Categories & Products",
      items: navTree,
      selectedId: activePathIds[0],
    });

    // Subsequent columns for selected nodes that have children
    for (let i = 0; i < activeNodesPath.length; i++) {
      const parent = activeNodesPath[i];
      if (parent && parent.children && parent.children.length > 0) {
        let colTitle = "Sub-Divisions & Equipment";
        if (parent.type === "category") colTitle = `${parent.name} Catalog`;
        else if (parent.type === "subcategory") colTitle = `${parent.name} Equipment`;
        else if (parent.type === "product") colTitle = `${parent.name} Models`;

        cols.push({
          level: i + 1,
          title: colTitle,
          parentName: parent.name,
          items: parent.children,
          selectedId: activePathIds[i + 1],
        });
      }
    }

    return cols;
  }, [navTree, activeNodesPath, activePathIds]);

  // Handler for hovering an item at a specific level
  const handleItemHover = useCallback((level: number, item: GenericNavNode) => {
    setActiveColumnIndex(level);
    setActivePathIds((prev) => {
      const next = prev.slice(0, level);
      next[level] = item.id;
      return next;
    });
  }, []);

  // Keyboard navigation & Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (columnsData.length === 0) return;

      const currentCol = columnsData[Math.min(activeColumnIndex, columnsData.length - 1)];
      if (!currentCol || currentCol.items.length === 0) return;

      const currentIndex = currentCol.items.findIndex(
        (it) => it.id === currentCol.selectedId
      );

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex =
          currentIndex < 0
            ? 0
            : (currentIndex + 1) % currentCol.items.length;
        handleItemHover(currentCol.level, currentCol.items[nextIndex]);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex =
          currentIndex <= 0
            ? currentCol.items.length - 1
            : currentIndex - 1;
        handleItemHover(currentCol.level, currentCol.items[prevIndex]);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (activeColumnIndex + 1 < columnsData.length) {
          setActiveColumnIndex(activeColumnIndex + 1);
          const nextCol = columnsData[activeColumnIndex + 1];
          if (nextCol && nextCol.items.length > 0 && !nextCol.selectedId) {
            handleItemHover(nextCol.level, nextCol.items[0]);
          }
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (activeColumnIndex > 0) {
          setActiveColumnIndex(activeColumnIndex - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, columnsData, activeColumnIndex, handleItemHover]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200 w-[1160px] max-w-[96vw]"
      role="menu"
      aria-label="Products Catalog Menu"
    >
      {/* Mega Menu Container */}
      <div className="relative overflow-hidden rounded-2xl bg-[#050c18]/95 border border-sky-500/30 shadow-[0_28px_60px_-15px_rgba(0,0,0,0.95),0_0_30px_rgba(14,165,233,0.18)] text-white backdrop-blur-2xl">
        {/* Subtle Industrial Grid Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* TOP BAR: Interactive Breadcrumbs & Catalog Status */}
        <div className="relative z-10 px-6 py-3 border-b border-slate-800/90 bg-[#071324]/80 flex items-center justify-between text-xs">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap text-slate-400">
            <span className="font-mono text-[10px] uppercase text-sky-400 tracking-wider font-semibold">
              EXPLORING:
            </span>
            <Link
              href="/products"
              onClick={onClose}
              className="text-slate-300 hover:text-white transition-colors"
            >
              All Products
            </Link>
            {activeNodesPath.map((crumb, idx) => (
              <span key={crumb.id} className="flex items-center gap-1.5">
                <span className="text-slate-600">/</span>
                <Link
                  href={crumb.href}
                  onClick={onClose}
                  className={`transition-colors truncate max-w-[140px] ${
                    idx === activeNodesPath.length - 1
                      ? "text-amber-400 font-semibold"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title={crumb.name}
                >
                  {crumb.name}
                </Link>
              </span>
            ))}
          </div>

          {/* Quick Direct Link to Catalog */}
          <Link
            href="/products"
            onClick={onClose}
            className="shrink-0 font-medium text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900/60 px-3 py-1 rounded-lg border border-sky-800/50 hover:border-sky-400 transition-all ml-4 text-[11px]"
          >
            All Machinery Index →
          </Link>
        </div>

        {isLoading ? (
          /* Loading State Skeleton */
          <div className="p-8 grid grid-cols-12 gap-4">
            <div className="col-span-4 space-y-2.5">
              <div className="h-4 w-28 bg-slate-800 animate-pulse rounded" />
              <div className="h-10 bg-slate-900/80 animate-pulse rounded-xl" />
              <div className="h-10 bg-slate-900/80 animate-pulse rounded-xl" />
              <div className="h-10 bg-slate-900/80 animate-pulse rounded-xl" />
            </div>
            <div className="col-span-4 space-y-2.5">
              <div className="h-4 w-32 bg-slate-800 animate-pulse rounded" />
              <div className="h-10 bg-slate-900/80 animate-pulse rounded-xl" />
              <div className="h-10 bg-slate-900/80 animate-pulse rounded-xl" />
            </div>
            <div className="col-span-4">
              <div className="h-56 bg-slate-900/80 animate-pulse rounded-2xl" />
            </div>
          </div>
        ) : navTree.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-300 text-sm">
              Industrial Catalog Syncing
            </p>
            <p className="text-slate-500 mt-1">
              Active machinery categories and products will appear here shortly.
            </p>
            <div className="mt-4">
              <Link
                href="/products"
                onClick={onClose}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                Browse Equipment Directory →
              </Link>
            </div>
          </div>
        ) : (
          /* =========================================================
             CASCADING MULTI-LEVEL TREE PANELS + LIVE SHOWCASE CARD
             ========================================================= */
          <div className="relative z-10 grid grid-cols-12 min-h-[420px]">
            {/* LEFT / CENTER: Dynamic Cascading Columns (8 cols) */}
            <div
              className="col-span-8 grid divide-x divide-slate-800/80 bg-[#06101e]/90"
              style={{
                gridTemplateColumns: `repeat(${Math.max(
                  columnsData.length,
                  1
                )}, minmax(0, 1fr))`,
              }}
            >
              {columnsData.map((col) => (
                <div
                  key={col.level}
                  className="p-3.5 flex flex-col justify-between animate-in fade-in slide-in-from-left-2 duration-150"
                >
                  <div>
                    {/* Column Header */}
                    <div className="px-2.5 pb-2 mb-2 flex items-center justify-between border-b border-slate-800/90">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold truncate">
                        {col.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                        {col.items.length}
                      </span>
                    </div>

                    {/* Column Items List with Clean Scrollable Container */}
                    <ul className="space-y-1 max-h-[330px] overflow-y-auto pr-1 custom-scrollbar">
                      {col.items.map((item) => {
                        const isSelected = col.selectedId === item.id;
                        const hasChildren = item.hasChildren;

                        return (
                          <li key={item.id}>
                            <div
                              onMouseEnter={() => handleItemHover(col.level, item)}
                              onClick={() => {
                                if (!hasChildren) {
                                  onClose();
                                }
                              }}
                              className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 transition-all duration-150 cursor-pointer ${
                                isSelected
                                  ? "bg-gradient-to-r from-sky-950/90 to-[#0c223c] text-white border border-sky-400/40 shadow-sm"
                                  : "text-slate-300 hover:bg-slate-900/70 hover:text-white border border-transparent"
                              }`}
                            >
                              {/* Left: Item Type Indicator Dot & Name */}
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center gap-2 min-w-0 flex-1 pr-1.5"
                              >
                                <span
                                  className={`h-2 w-2 rounded-full shrink-0 transition-all duration-200 ${
                                    isSelected
                                      ? "bg-amber-400 shadow-[0_0_8px_#f59e0b] scale-125"
                                      : item.type === "product"
                                      ? "bg-amber-400/80 group-hover:bg-amber-300"
                                      : item.type === "model"
                                      ? "bg-orange-400/80 group-hover:bg-orange-300"
                                      : "bg-sky-400/80 group-hover:bg-sky-300"
                                  }`}
                                />
                                <span
                                  className={`truncate text-xs ${
                                    isSelected
                                      ? "font-bold text-white"
                                      : "font-medium text-slate-200 group-hover:text-white"
                                  }`}
                                >
                                  {item.name}
                                </span>
                              </Link>

                              {/* Right: Badges & Child indicator / Direct Action Chevron */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Type Badge */}
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    item.type === "category"
                                      ? "bg-sky-950/70 text-sky-400 border border-sky-800/40"
                                      : item.type === "subcategory"
                                      ? "bg-sky-900/50 text-sky-300 border border-sky-700/40"
                                      : item.type === "product"
                                      ? "bg-amber-950/70 text-amber-400 border border-amber-800/40"
                                      : "bg-orange-950/70 text-orange-400 border border-orange-800/40"
                                  }`}
                                >
                                  {item.type === "category"
                                    ? "CAT"
                                    : item.type === "subcategory"
                                    ? "SUB"
                                    : item.type === "product"
                                    ? "PROD"
                                    : "MODEL"}
                                </span>

                                {/* Model Count Badge */}
                                {item.modelCount !== undefined && item.modelCount > 0 && (
                                  <span className="hidden xl:inline text-[9px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                                    {item.modelCount}M
                                  </span>
                                )}

                                {hasChildren ? (
                                  <span
                                    className={`text-xs transition-transform duration-150 ${
                                      isSelected
                                        ? "translate-x-0.5 text-amber-400 font-bold"
                                        : "text-slate-500 group-hover:text-slate-300"
                                    }`}
                                  >
                                    ›
                                  </span>
                                ) : (
                                  <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`text-xs transition-transform duration-150 ${
                                      isSelected
                                        ? "translate-x-0.5 text-sky-400 font-bold"
                                        : "text-slate-500 group-hover:text-sky-300"
                                    }`}
                                    title={`View ${item.name}`}
                                  >
                                    →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Column Bottom Contextual Link */}
                  {col.level === 0 && (
                    <div className="pt-2.5 mt-2 border-t border-slate-800/80 px-2">
                      <Link
                        href="/products"
                        onClick={onClose}
                        className="flex items-center justify-between text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <span>Full Equipment Catalog</span>
                        <span>→</span>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT COLUMN: Live Interactive Showcase Card (4 cols) */}
            <div className="col-span-4 p-5 flex flex-col justify-between bg-gradient-to-b from-[#061224] via-[#050e1c] to-[#040914] border-l border-slate-800/80">
              {previewNode ? (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  {/* Entity Media Showcase Header */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-slate-950 h-36 w-full group shadow-md">
                    <CmsImage
                      src={
                        previewNode.image ||
                        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={previewNode.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                      sizes="400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050c18] via-[#050c18]/60 to-transparent" />

                    {/* Overlay Badges */}
                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-bold shadow-sm ${
                          previewNode.type === "product"
                            ? "text-amber-400 bg-amber-950/80 border border-amber-500/40"
                            : previewNode.type === "model"
                            ? "text-orange-400 bg-orange-950/80 border border-orange-500/40"
                            : "text-sky-300 bg-sky-950/80 border border-sky-500/40"
                        }`}
                      >
                        {previewNode.type === "category"
                          ? "CATEGORY"
                          : previewNode.type === "subcategory"
                          ? "SUB-CATEGORY"
                          : previewNode.type === "product"
                          ? "PRODUCT"
                          : "MODEL"}
                      </span>
                      {previewNode.modelCount !== undefined && previewNode.modelCount > 0 && (
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold shadow-sm">
                          {previewNode.modelCount} Models Available
                        </span>
                      )}
                    </div>

                    {/* Bottom Title in Banner */}
                    <div className="absolute bottom-2.5 left-3 right-3">
                      <h3 className="text-base font-black text-white leading-tight truncate">
                        {previewNode.name}
                      </h3>
                    </div>
                  </div>

                  {/* Summary Description */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {previewNode.shortDescription ||
                      previewNode.description ||
                      "Precision engineered industrial packaging equipment built for high duty-cycle performance, maximum reliability, and strict compliance standards."}
                  </p>

                  {/* Key Features Pill Tags (if available) */}
                  {previewNode.features && previewNode.features.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Key Capabilities:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {previewNode.features.slice(0, 3).map((feat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-900/90 text-slate-300 border border-slate-700/60 rounded-md px-2 py-0.5 truncate max-w-[200px]"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct Action Link */}
                  <div className="pt-1">
                    <Link
                      href={previewNode.href}
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-brand-orange hover:from-amber-400 hover:to-orange-500 text-slate-950 px-4 py-2.5 text-xs font-bold tracking-wide shadow-[0_4px_14px_rgba(234,88,12,0.3)] transition-all active:scale-98 group"
                    >
                      <span>
                        {previewNode.type === "model"
                          ? `Explore Model ${previewNode.modelNumber || ""}`
                          : previewNode.type === "product"
                          ? "View Equipment & Models"
                          : "Explore Category Specifications"}
                      </span>
                      <span className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
                  <p>Select any category or equipment on the left to preview specifications.</p>
                </div>
              )}

              {/* Bottom Consultation CTA */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">Custom System Design?</span>
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 text-[11px]"
                >
                  Request Consultation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM GLOBAL FOOTER BAR */}
        <div className="relative z-10 px-6 py-2.5 border-t border-slate-800/90 bg-[#040a14] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              onClick={onClose}
              className="text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Browse Full Catalog</span>
              <span>→</span>
            </Link>
            <span className="text-slate-700">|</span>
            <Link
              href="/contact"
              onClick={onClose}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Request Custom Machinery RFQ
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>[↑ / ↓] Navigate</span>
            <span>[→] Children</span>
            <span>[Esc] Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

