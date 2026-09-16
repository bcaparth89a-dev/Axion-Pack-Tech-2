import React from "react";
import { CatalogChildItem } from "@/types/products";
import CompactCatalogCard from "./CompactCatalogCard";
import CompactCardGrid from "./CompactCardGrid";

interface CatalogChildrenSectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  childrenItems?: CatalogChildItem[];
  parentPath: string;
  badgeColor?: "amber" | "sky" | "emerald";
  initialLimit?: number;
}

/**
 * Universal Catalog Children Section
 * Intelligently renders direct children (Categories, Products, Models) for any page type.
 * Automatically hidden when there are zero children.
 */
export default function CatalogChildrenSection({
  id = "catalog-children",
  eyebrow = "Explore Hierarchy",
  title,
  subtitle,
  childrenItems,
  parentPath,
  badgeColor = "amber",
  initialLimit = 12,
}: CatalogChildrenSectionProps) {
  if (!Array.isArray(childrenItems) || childrenItems.length === 0) {
    return null;
  }

  return (
    <CompactCardGrid
      id={id}
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      totalCount={childrenItems.length}
      initialLimit={initialLimit}
      badgeColor={badgeColor}
    >
      {childrenItems.map((item) => {
        const itemType = item.type || "product";
        const accent =
          itemType === "category" ? "amber" : itemType === "product" ? "sky" : "emerald";
        const badgeText =
          itemType === "category"
            ? "CATEGORY"
            : itemType === "product"
            ? "PRODUCT"
            : item.modelNumber || "MODEL";

        const itemHref = `${parentPath.replace(/\/$/, "")}/${item.slug}`;

        return (
          <CompactCatalogCard
            key={`${itemType}-${item._id}`}
            href={itemHref}
            name={item.name}
            type={itemType === "category" ? "subcategory" : itemType === "product" ? "product" : "model"}
            badge={badgeText}
            modelNumber={item.modelNumber}
            image={item.media?.image || item.media?.heroImage}
            shortDescription={item.shortDescription || item.description}
            modelCount={item.modelCount}
            isFeatured={item.isFeatured}
            accentColor={accent}
          />
        );
      })}
    </CompactCardGrid>
  );
}
