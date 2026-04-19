"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import type { SleepQualityPayload } from "./index";

export function SleepQualityWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.sleepQuality");

  const today = new Date().toISOString().slice(0, 10);

  const todayRating = useMemo(() => {
    const todays = entries.filter((e) => e.entry_date === today);
    if (todays.length === 0) return null;
    const last = todays[todays.length - 1];
    const p = last.payload as Partial<SleepQualityPayload>;
    return typeof p.rating === "number" ? p.rating : null;
  }, [entries, today]);

  const [saving, setSaving] = useState(false);
  const [localRating, setLocalRating] = useState<number | null>(todayRating);

  const activeRating = localRating ?? todayRating;

  const handleTap = async (star: number) => {
    if (saving) return;
    setLocalRating(star);
    setSaving(true);
    try {
      await onEntryAdd({ rating: star } satisfies SleepQualityPayload);
    } finally {
      setSaving(false);
    }
  };

  const ratingLabel = activeRating !== null
    ? t(`ratings.${activeRating}` as `ratings.${1 | 2 | 3 | 4 | 5}`)
    : null;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>

      <div className="flex items-center justify-center gap-2 py-1">
        {([1, 2, 3, 4, 5] as const).map((star) => {
          const filled = activeRating !== null && star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => void handleTap(star)}
              disabled={saving}
              aria-label={`${star}`}
              aria-pressed={filled}
              className="flex h-14 w-14 min-w-[56px] items-center justify-center rounded-2xl transition active:scale-95 disabled:opacity-60"
            >
              <Star
                className={
                  filled
                    ? "h-9 w-9 text-indigo-400"
                    : "h-9 w-9 text-zinc-300 dark:text-zinc-600"
                }
                fill={filled ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>

      {ratingLabel !== null ? (
        <p className="text-center text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t("youFeel")} {ratingLabel}
        </p>
      ) : null}
    </div>
  );
}
