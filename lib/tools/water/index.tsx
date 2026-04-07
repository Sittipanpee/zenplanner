"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Droplet, Settings } from "lucide-react";
import { z } from "zod";
import type {
  ToolDefinition,
  ToolWidgetProps,
  WorkbookSheet,
  DashboardCell,
} from "../types";

// ---------- Schema ----------

export const waterSchema = z.object({
  glasses: z.number().int().min(0).max(20),
});

export type WaterPayload = z.infer<typeof waterSchema>;

// ---------- Helpers ----------

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function readGoal(config: Record<string, unknown>): number {
  const raw = config.dailyGoal;
  if (typeof raw === "number" && raw > 0 && raw <= 20) return Math.round(raw);
  return 8;
}

// ---------- Widget ----------

function WaterWidget({
  config,
  entries,
  onEntryAdd,
  onConfigChange,
}: ToolWidgetProps) {
  const t = useTranslations("tools.water");
  const goal = readGoal(config);

  const today = todayIso();
  const todayEntries = useMemo(
    () => entries.filter((e) => e.entry_date === today),
    [entries, today]
  );

  // Current glasses = max glasses logged today (monotonic tap-to-fill)
  const initialCount = useMemo(() => {
    let max = 0;
    for (const e of todayEntries) {
      const p = e.payload as Partial<WaterPayload>;
      if (typeof p.glasses === "number" && p.glasses > max) max = p.glasses;
    }
    return max;
  }, [todayEntries]);

  const [count, setCount] = useState<number>(initialCount);
  const [saving, setSaving] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [goalDraft, setGoalDraft] = useState<number>(goal);

  const total = Math.max(goal, 8);
  const displayCount = Math.min(count, 20);
  const percent = Math.min(100, Math.round((displayCount / goal) * 100));
  const goalReached = displayCount >= goal;

  const handleTap = async (targetIndex: number) => {
    if (saving) return;
    // Tap on a filled glass to unfill back to that index; tap empty to fill up to index+1
    const nextValue =
      targetIndex + 1 <= displayCount ? targetIndex : targetIndex + 1;
    if (nextValue === displayCount) return;
    setCount(nextValue);
    setSaving(true);
    try {
      const payload: WaterPayload = { glasses: nextValue };
      await onEntryAdd(payload);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGoal = async () => {
    const clamped = Math.max(1, Math.min(20, Math.round(goalDraft)));
    setGoalDraft(clamped);
    setShowGoalEditor(false);
    await onConfigChange({ ...config, dailyGoal: clamped });
  };

  const glasses = Array.from({ length: total }, (_, i) => i);

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-sky-500" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setGoalDraft(goal);
            setShowGoalEditor((v) => !v);
          }}
          aria-label={t("editGoal")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
          <span>{t("progressLabel", { current: displayCount, goal })}</span>
          {goalReached ? (
            <span className="flex items-center gap-1 text-sky-500">
              <Droplet className="h-3 w-3 animate-bounce" />
              {t("goalReached")}
            </span>
          ) : null}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Glasses grid — 4 cols on phones (360px safe), 8 cols on sm+ */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {glasses.map((i) => {
          const filled = i < displayCount;
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleTap(i)}
              disabled={saving}
              aria-label={`Glass ${i + 1}`}
              aria-pressed={filled}
              className="flex aspect-square items-center justify-center rounded-xl border transition active:scale-95 disabled:opacity-60 border-zinc-200 dark:border-zinc-700"
            >
              <Droplet
                className={
                  filled
                    ? "h-6 w-6 text-sky-500"
                    : "h-6 w-6 text-zinc-300 dark:text-zinc-600"
                }
                fill={filled ? "currentColor" : "none"}
              />
            </button>
          );
        })}
      </div>

      {/* Goal editor */}
      {showGoalEditor ? (
        <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            {t("goalLabel")}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGoalDraft((v) => Math.max(1, v - 1))}
              className="h-10 w-10 rounded-lg border border-zinc-200 bg-white text-lg font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              −
            </button>
            <div className="flex-1 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              {goalDraft}
            </div>
            <button
              type="button"
              onClick={() => setGoalDraft((v) => Math.min(20, v + 1))}
              className="h-10 w-10 rounded-lg border border-zinc-200 bg-white text-lg font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleSaveGoal}
              className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ---------- ToolDefinition ----------

export const water: ToolDefinition = {
  id: "water",
  category: "tracking",
  name: {
    en: "Water Tracker",
    th: "ติดตามการดื่มน้ำ",
    zh: "饮水追踪",
  },
  description: {
    en: "Tap to log each glass of water you drink today.",
    th: "แตะเพื่อบันทึกน้ำแต่ละแก้วที่คุณดื่มวันนี้",
    zh: "点击记录今天喝的每杯水",
  },
  icon: Droplet,
  color: "zen-sage",
  recommendedFor: ["lion", "wolf", "fox", "dolphin", "bamboo", "dove"],
  recommendationReason: {
    en: "A simple daily ritual to anchor your energy and focus.",
    th: "พิธีกรรมเล็กๆ รายวันที่ช่วยยึดพลังและสมาธิของคุณ",
    zh: "一个简单的每日仪式，稳固你的精力与专注",
  },
  schema: waterSchema,
  defaultConfig: {
    dailyGoal: 8,
  },
  Widget: WaterWidget,
  produces: ["water.todayCount", "water.goalMetDays"],
  consumes: [],
  excel: {
    buildSheet: (entries, config): WorkbookSheet => {
      const goal = readGoal(config);
      // Aggregate: last glasses value per date
      const byDate = new Map<string, number>();
      for (const e of entries) {
        const p = e.payload as Partial<WaterPayload>;
        const g = typeof p.glasses === "number" ? p.glasses : 0;
        byDate.set(e.entry_date, Math.max(byDate.get(e.entry_date) ?? 0, g));
      }
      const sorted = Array.from(byDate.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      return {
        name: "Water",
        headers: ["Date", "Glasses", "Goal", "Goal Met"],
        rows: sorted.map(([date, g]) => [date, g, goal, g >= goal]),
        meta: {
          weeklyGoalMetFormula: "=COUNTIF(D2:D8,TRUE)",
        },
      };
    },
    buildDashboardSection: (aggregates): DashboardCell[] => [
      {
        address: "B2",
        value: "Water — today",
        style: "label",
      },
      {
        address: "C2",
        value:
          typeof aggregates["water.todayCount"] === "number"
            ? (aggregates["water.todayCount"] as number)
            : 0,
        style: "metric",
      },
      {
        address: "B3",
        value: "Water — goal-met days (7d)",
        style: "label",
      },
      {
        address: "C3",
        value:
          typeof aggregates["water.goalMetDays"] === "number"
            ? (aggregates["water.goalMetDays"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
