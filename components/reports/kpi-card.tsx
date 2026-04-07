"use client";

/**
 * KPI display card — big number, label, optional trend arrow.
 * Mobile-first; min-height 48px enforced via min-h-12.
 */

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export interface KpiCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat" | null;
  hint?: string;
}

export function KpiCard({ label, value, trend, hint }: KpiCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-500"
      : trend === "down"
        ? "text-rose-500"
        : "text-zinc-400";

  const TrendIcon =
    trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : trend === "flat" ? Minus : null;

  return (
    <div className="min-h-12 flex flex-col justify-center rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {value}
        </span>
        {TrendIcon && (
          <span className={`inline-flex items-center ${trendColor}`}>
            <TrendIcon className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <span className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {hint && (
        <span className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">{hint}</span>
      )}
    </div>
  );
}
