"use client";

/**
 * CategoryFilter — segmented pill chips for filtering the catalog by category.
 * Mobile-first: horizontal scroll on overflow. Keyboard nav with arrow keys.
 */

import { useTranslations } from "next-intl";
import type { ToolCategory } from "@/lib/tools/types";
import { useRef } from "react";

export type CategoryFilterValue = "all" | ToolCategory;

const ORDER: CategoryFilterValue[] = [
  "all",
  "productivity",
  "wellbeing",
  "reflection",
  "tracking",
  "creativity",
];

interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (next: CategoryFilterValue) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const t = useTranslations("tools.catalog");
  const containerRef = useRef<HTMLDivElement>(null);

  const labelFor = (cat: CategoryFilterValue): string => {
    if (cat === "all") return t("filterAll");
    if (cat === "productivity") return t("categoryProductivity");
    if (cat === "wellbeing") return t("categoryWellbeing");
    if (cat === "reflection") return t("categoryReflection");
    if (cat === "tracking") return t("categoryTracking");
    return t("categoryCreativity");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (idx + 1) % ORDER.length : (idx - 1 + ORDER.length) % ORDER.length;
    onChange(ORDER[next]);
    const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>("button[role=tab]");
    buttons?.[next]?.focus();
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Tool category filter"
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin"
    >
      {ORDER.map((cat, idx) => {
        const active = cat === value;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(cat)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={[
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-sage",
              active
                ? "bg-zen-sage text-white shadow"
                : "bg-zen-surface text-zen-text-secondary border border-zen-border hover:border-zen-sage",
            ].join(" ")}
          >
            {labelFor(cat)}
          </button>
        );
      })}
    </div>
  );
}
