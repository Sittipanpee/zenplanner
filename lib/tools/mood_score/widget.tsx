"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import type { MoodScorePayload } from "./index";

function getGradientColor(score: number): string {
  // score 1-10: red (1) → amber (5-6) → green (10)
  if (score <= 3) return "from-red-400 to-red-500";
  if (score <= 5) return "from-red-400 to-amber-400";
  if (score <= 7) return "from-amber-400 to-yellow-400";
  return "from-yellow-400 to-green-500";
}

function getScoreTextColor(score: number): string {
  if (score <= 3) return "text-red-500";
  if (score <= 5) return "text-amber-500";
  if (score <= 7) return "text-yellow-500";
  return "text-green-500";
}

export function MoodScoreWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.moodScore");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<number>(5);

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.entry_date === todayIso);
  const savedScore =
    todayEntry && typeof (todayEntry.payload as MoodScorePayload).score === "number"
      ? (todayEntry.payload as MoodScorePayload).score
      : null;

  const displayScore = savedScore ?? draft;

  const last7 = useMemo<Array<{ date: string; score: number | null }>>(() => {
    const out: Array<{ date: string; score: number | null }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const e = entries.find((x) => x.entry_date === iso);
      const s = e ? Number((e.payload as MoodScorePayload).score) : null;
      out.push({ date: iso, score: Number.isFinite(s as number) ? (s as number) : null });
    }
    return out;
  }, [entries]);

  const hasTrend = last7.some((d) => d.score !== null);

  const handleRelease = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: MoodScorePayload = { score: draft };
      await onEntryAdd(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-rose-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      {/* Score display */}
      <div className="flex items-center justify-center">
        <span className={`text-5xl font-bold tabular-nums ${getScoreTextColor(displayScore)}`}>
          {displayScore}
        </span>
        <span className="ml-1 text-xl text-zinc-400">/10</span>
      </div>

      {/* Gradient slider */}
      <div className="relative flex flex-col gap-1">
        <div
          className={`absolute inset-y-0 left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r ${getGradientColor(displayScore)} opacity-30`}
        />
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={savedScore !== null ? savedScore : draft}
          disabled={saving || savedScore !== null}
          onChange={(e) => {
            if (savedScore !== null) return;
            setDraft(Number(e.target.value));
          }}
          onMouseUp={savedScore === null ? handleRelease : undefined}
          onTouchEnd={savedScore === null ? handleRelease : undefined}
          className="relative w-full cursor-pointer appearance-none rounded-full bg-transparent accent-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            background: `linear-gradient(to right, #f87171 0%, #fbbf24 40%, #fbbf24 60%, #22c55e 100%)`,
            height: "8px",
          }}
          aria-label={t("scoreLabel")}
        />
        <div className="flex justify-between text-[10px] text-zinc-400">
          <span>{t("lowLabel")}</span>
          <span>{t("highLabel")}</span>
        </div>
      </div>

      {savedScore !== null && (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {t("savedLabel")}
        </p>
      )}

      {/* 7-day trend */}
      {hasTrend && (
        <div className="mt-1">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-500">
            {t("trendLabel")}
          </p>
          <div className="flex h-8 items-end gap-1">
            {last7.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-sm bg-rose-200 dark:bg-rose-800"
                style={{
                  height: d.score ? `${(d.score / 10) * 100}%` : "4%",
                  opacity: d.score ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
