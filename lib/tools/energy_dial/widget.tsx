"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";
import type { ToolWidgetProps, ToolEntry } from "../types";
import type { EnergyDialPayload } from "./index";

// ---------- constants ----------

const LEVEL_COLORS: readonly string[] = [
  "#ef4444", // 1 — red
  "#f97316", // 2 — orange
  "#eab308", // 3 — yellow
  "#84cc16", // 4 — lime
  "#22c55e", // 5 — green
];

const LEVEL_LABELS: readonly string[] = ["1", "2", "3", "4", "5"];

// ---------- helpers ----------

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function toHHMM(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function countTodayCheckIns(entries: ToolEntry[]): number {
  const today = todayIso();
  return entries.filter((e) => e.entry_date === today).length;
}

function latestTodayEntry(
  entries: ToolEntry[]
): (EnergyDialPayload & { savedAt: string }) | null {
  const today = todayIso();
  const todayEntries = entries
    .filter((e) => e.entry_date === today)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (todayEntries.length === 0) return null;
  const top = todayEntries[0];
  const p = top.payload as Partial<EnergyDialPayload>;
  if (typeof p.level !== "number") return null;
  return {
    level: p.level,
    checkedAt: p.checkedAt ?? top.created_at,
    savedAt: top.created_at,
  };
}

// ---------- component ----------

export function EnergyDialWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.energyDial");
  const [saving, setSaving] = useState<boolean>(false);
  const [localLevel, setLocalLevel] = useState<number | null>(null);

  const latest = useMemo(() => latestTodayEntry(entries), [entries]);
  const checkInsToday = useMemo(() => countTodayCheckIns(entries), [entries]);

  const currentLevel = localLevel ?? latest?.level ?? null;

  const handleTap = async (level: number): Promise<void> => {
    if (saving) return;
    setLocalLevel(level);
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: EnergyDialPayload = { level, checkedAt: now };
      await onEntryAdd(payload);
    } finally {
      setSaving(false);
    }
  };

  const checkedAtLabel =
    localLevel !== null
      ? toHHMM(new Date().toISOString())
      : latest
        ? toHHMM(latest.checkedAt)
        : null;

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* header */}
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>

      {/* subtitle / prompt */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("prompt")}</p>

      {/* 5-button row */}
      <div className="grid grid-cols-5 gap-2">
        {LEVEL_LABELS.map((label, i) => {
          const level = i + 1;
          const isActive = currentLevel === level;
          const color = LEVEL_COLORS[i];
          return (
            <button
              key={level}
              type="button"
              onClick={() => void handleTap(level)}
              disabled={saving}
              aria-label={`${t("prompt")} ${level}`}
              aria-pressed={isActive}
              className={[
                "flex h-14 w-full flex-col items-center justify-center rounded-xl text-sm font-bold transition-all duration-150",
                "active:scale-95 disabled:opacity-50",
                isActive
                  ? "text-white shadow-md"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
              ].join(" ")}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* color legend strip */}
      <div className="flex overflow-hidden rounded-full" aria-hidden="true">
        {LEVEL_COLORS.map((c, i) => (
          <div
            key={i}
            className="h-1.5 flex-1"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* status line */}
      {checkedAtLabel !== null && currentLevel !== null ? (
        <p className="text-xs text-zinc-400">
          {t("checkedAt", { time: checkedAtLabel })}
          {checkInsToday > 1 && (
            <span className="ml-2 text-zinc-300">
              ({checkInsToday} {t("subtitle")})
            </span>
          )}
        </p>
      ) : (
        <p className="text-xs text-zinc-400">{t("subtitle")}</p>
      )}
    </div>
  );
}
