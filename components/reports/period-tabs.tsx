"use client";

/**
 * Segmented control for selecting a reporting period.
 * Keyboard-accessible (arrow keys + space/enter).
 */

import { useCallback } from "react";

export type ReportPeriod = "week" | "month" | "quarter" | "year";

export interface PeriodTabsProps {
  value: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
  labels: Record<ReportPeriod, string>;
}

const ORDER: ReportPeriod[] = ["week", "month", "quarter", "year"];

export function PeriodTabs({ value, onChange, labels }: PeriodTabsProps) {
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onChange(ORDER[(idx + 1) % ORDER.length]);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onChange(ORDER[(idx - 1 + ORDER.length) % ORDER.length]);
      }
    },
    [onChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Report period"
      className="inline-flex rounded-xl border border-zinc-200 bg-white/70 p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      {ORDER.map((p, idx) => {
        const active = p === value;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(p)}
            onKeyDown={(e) => handleKey(e, idx)}
            className={`min-h-10 rounded-lg px-3 text-sm font-medium transition-colors sm:px-4 ${
              active
                ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {labels[p]}
          </button>
        );
      })}
    </div>
  );
}
