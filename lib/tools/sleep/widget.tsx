"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Moon, Star } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { computeSleepMinutes, formatHM, timeRegex, type SleepPayload } from "./index";

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function SleepWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.sleep");

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = useMemo(() => {
    const todays = entries.filter((e) => e.entry_date === today);
    return todays[todays.length - 1];
  }, [entries, today]);

  const initialPayload = (todayEntry?.payload ?? {}) as Partial<SleepPayload>;
  const [bedtime, setBedtime] = useState<string>(initialPayload.bedtime ?? "23:00");
  const [wakeTime, setWakeTime] = useState<string>(initialPayload.wakeTime ?? "07:00");
  const [quality, setQuality] = useState<number>(initialPayload.quality ?? 3);
  const [saving, setSaving] = useState(false);

  const sleepMinutes = computeSleepMinutes(bedtime, wakeTime);

  const save = async (next: Partial<SleepPayload>) => {
    const merged: SleepPayload = {
      bedtime: next.bedtime ?? bedtime,
      wakeTime: next.wakeTime ?? wakeTime,
      quality: next.quality ?? quality,
    };
    if (!timeRegex.test(merged.bedtime) || !timeRegex.test(merged.wakeTime)) return;
    setSaving(true);
    try {
      await onEntryAdd(merged);
    } finally {
      setSaving(false);
    }
  };

  const onBedtimeChange = (v: string) => {
    setBedtime(v);
    void save({ bedtime: v });
  };
  const onWakeChange = (v: string) => {
    setWakeTime(v);
    void save({ wakeTime: v });
  };
  const onQualityChange = (v: number) => {
    setQuality(v);
    void save({ quality: v });
  };

  const dates = lastNDates(7);
  const byDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const p = e.payload as Partial<SleepPayload>;
      if (!p.bedtime || !p.wakeTime) continue;
      const mins = computeSleepMinutes(p.bedtime, p.wakeTime);
      if (mins !== null) map.set(e.entry_date, mins);
    }
    return map;
  }, [entries]);

  const maxMinutes = 12 * 60;

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Moon className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t("title")}
        </span>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {t("bedtimeLabel")}
          </span>
          <input
            type="time"
            value={bedtime}
            onChange={(e) => onBedtimeChange(e.target.value)}
            disabled={saving}
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {t("wakeTimeLabel")}
          </span>
          <input
            type="time"
            value={wakeTime}
            onChange={(e) => onWakeChange(e.target.value)}
            disabled={saving}
            className="h-11 rounded-lg border border-zinc-200 bg-white px-3 text-base text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </div>

      {sleepMinutes !== null ? (
        <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {t("hoursSlept", { value: formatHM(sleepMinutes) })}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {t("qualityLabel")}
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= quality;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onQualityChange(star)}
                disabled={saving}
                aria-label={`${star}`}
                aria-pressed={filled}
                className="flex h-12 w-12 min-w-[48px] items-center justify-center rounded-xl transition active:scale-95"
              >
                <Star
                  className={
                    filled
                      ? "h-7 w-7 text-amber-400"
                      : "h-7 w-7 text-zinc-300 dark:text-zinc-600"
                  }
                  fill={filled ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {t("trendLabel")}
        </span>
        <div className="flex h-20 items-end gap-1">
          {dates.map((d) => {
            const mins = byDate.get(d) ?? 0;
            const pct = Math.min(100, Math.round((mins / maxMinutes) * 100));
            return (
              <div
                key={d}
                className="flex flex-1 flex-col items-center justify-end"
                title={mins > 0 ? formatHM(mins) : ""}
              >
                <div
                  className="w-full rounded-t bg-indigo-400 transition-all dark:bg-indigo-500"
                  style={{ height: `${pct}%`, minHeight: mins > 0 ? 2 : 0 }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
