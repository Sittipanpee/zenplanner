"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps, ToolEntry } from "../types";

// ---------- Schema ----------

export const energyLevelSchema = z.object({
  level: z.number().int().min(1).max(10),
  timeOfDay: z.string().optional(),
});

export type EnergyLevelPayload = z.infer<typeof energyLevelSchema>;

// ---------- Helpers ----------

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function levelColor(level: number): string {
  // 1 = red, 5 = amber, 10 = emerald
  if (level <= 3) return "#ef4444";
  if (level <= 5) return "#f59e0b";
  if (level <= 7) return "#84cc16";
  return "#10b981";
}

interface DayPoint {
  date: string;
  avg: number;
}

function buildLast7DayAverages(entries: ToolEntry[]): DayPoint[] {
  const byDate = new Map<string, number[]>();
  for (const e of entries) {
    const p = e.payload as Partial<EnergyLevelPayload>;
    if (typeof p.level !== "number") continue;
    const arr = byDate.get(e.entry_date) ?? [];
    arr.push(p.level);
    byDate.set(e.entry_date, arr);
  }
  const result: DayPoint[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const arr = byDate.get(iso) ?? [];
    const avg = arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    result.push({ date: iso, avg });
  }
  return result;
}

function buildTodayCurve(entries: ToolEntry[]): Array<{ ts: number; level: number }> {
  const today = todayIso();
  return entries
    .filter((e) => e.entry_date === today)
    .map((e) => {
      const p = e.payload as Partial<EnergyLevelPayload>;
      const ts = p.timeOfDay ? new Date(p.timeOfDay).getTime() : new Date(e.created_at).getTime();
      return { ts, level: typeof p.level === "number" ? p.level : 0 };
    })
    .filter((p) => Number.isFinite(p.ts) && p.level > 0)
    .sort((a, b) => a.ts - b.ts);
}

// ---------- Widget ----------

function EnergyLevelWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.energyLevel");
  const [level, setLevel] = useState<number>(5);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const todayCurve = useMemo(() => buildTodayCurve(entries), [entries]);
  const last7 = useMemo(() => buildLast7DayAverages(entries), [entries]);
  const showCurve = todayCurve.length >= 2;

  const handleSave = async (newLevel: number) => {
    setLevel(newLevel);
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await onEntryAdd({ level: newLevel, timeOfDay: now } satisfies EnergyLevelPayload);
      setLastSavedAt(now);
    } catch {
      // swallow
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-zinc-500">{t("currentLabel")}</span>
          <span
            className="text-2xl font-bold tabular-nums"
            style={{ color: levelColor(level) }}
          >
            {level}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          onPointerUp={() => void handleSave(level)}
          onKeyUp={(e) => {
            if (e.key === "Enter" || e.key === " ") void handleSave(level);
          }}
          disabled={saving}
          className="energy-slider h-3 w-full cursor-pointer appearance-none rounded-full"
          style={{
            background:
              "linear-gradient(to right, #ef4444 0%, #f59e0b 40%, #84cc16 70%, #10b981 100%)",
          }}
          aria-label={t("currentLabel")}
        />
        <style jsx>{`
          .energy-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 44px;
            height: 44px;
            border-radius: 9999px;
            background: white;
            border: 4px solid ${levelColor(level)};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            cursor: pointer;
          }
          .energy-slider::-moz-range-thumb {
            width: 44px;
            height: 44px;
            border-radius: 9999px;
            background: white;
            border: 4px solid ${levelColor(level)};
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            cursor: pointer;
          }
        `}</style>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-zinc-400">
          <span>{t("lowLabel")}</span>
          <span>{t("highLabel")}</span>
        </div>
        <div className="mt-2 grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => void handleSave(n)}
              className={`h-9 rounded-md text-xs font-semibold transition active:scale-95 ${
                n === level
                  ? "text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
              style={n === level ? { background: levelColor(n) } : undefined}
              aria-label={`${t("currentLabel")} ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        {lastSavedAt && (
          <p className="mt-2 text-[10px] text-zinc-400">
            {t("loggedAt")} {new Date(lastSavedAt).toLocaleTimeString()}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs text-zinc-500">{t("trendLabel")}</p>
        {showCurve ? (
          <TodayCurveChart points={todayCurve} />
        ) : (
          <WeekBarChart days={last7} />
        )}
      </div>
    </div>
  );
}

function TodayCurveChart({ points }: { points: Array<{ ts: number; level: number }> }) {
  const w = 280;
  const h = 70;
  const pad = 4;
  const minTs = points[0].ts;
  const maxTs = points[points.length - 1].ts;
  const span = Math.max(1, maxTs - minTs);
  const path = points
    .map((p, i) => {
      const x = pad + ((p.ts - minTs) / span) * (w - pad * 2);
      const y = h - pad - ((p.level - 1) / 9) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full">
      <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      {points.map((p, i) => {
        const x = pad + ((p.ts - minTs) / span) * (w - pad * 2);
        const y = h - pad - ((p.level - 1) / 9) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={levelColor(p.level)} />;
      })}
    </svg>
  );
}

function WeekBarChart({ days }: { days: DayPoint[] }) {
  return (
    <div className="flex h-16 items-end gap-1">
      {days.map((d) => {
        const pct = (d.avg / 10) * 100;
        return (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(4, pct)}%`,
                  background: d.avg > 0 ? levelColor(d.avg) : "#e4e4e7",
                }}
                title={`${d.date}: ${d.avg.toFixed(1)}`}
              />
            </div>
            <span className="text-[9px] text-zinc-400">{d.date.slice(8)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- ToolDefinition ----------

export const energyLevel: ToolDefinition = {
  id: "energy_level",
  category: "wellbeing",
  name: {
    en: "Energy Level",
    th: "ระดับพลังงาน",
    zh: "能量水平",
  },
  description: {
    en: "Log your energy from 1 to 10 throughout the day.",
    th: "บันทึกระดับพลังงาน 1 ถึง 10 ตลอดทั้งวัน",
    zh: "记录一天中 1 到 10 的能量水平。",
  },
  icon: Zap,
  color: "zen-gold",
  recommendedFor: ["dolphin", "fox", "butterfly", "octopus", "dove", "cat", "bamboo"],
  recommendationReason: {
    en: "Flow-state archetypes benefit from tracking their natural energy rhythms.",
    th: "สัตว์สายโฟลว์เรียนรู้จังหวะพลังงานตามธรรมชาติของตนได้ดีขึ้น",
    zh: "心流型原型通过追踪自然能量节律而受益。",
  },
  schema: energyLevelSchema,
  defaultConfig: {},
  Widget: EnergyLevelWidget,
  produces: ["energy.currentLevel", "energy.dailyAverage", "energy.weekPattern"],
  consumes: [],
  excel: {
    buildSheet: (entries) => {
      const rows: Array<Array<string | number | boolean | null>> = entries.map((e) => {
        const p = e.payload as Partial<EnergyLevelPayload>;
        return [e.entry_date, p.timeOfDay ?? e.created_at, p.level ?? 0];
      });
      const lastRow = rows.length + 1;
      rows.push(["Daily Average", "", `=AVERAGE(C2:C${lastRow})`]);
      return {
        name: "Energy Level",
        headers: ["Date", "Time", "Level"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Current energy", style: "label" },
      {
        address: "C2",
        value: typeof aggregates["energy.currentLevel"] === "number"
          ? aggregates["energy.currentLevel"]
          : 0,
        style: "metric",
      },
      { address: "B3", value: "Daily average", style: "label" },
      {
        address: "C3",
        value: typeof aggregates["energy.dailyAverage"] === "number"
          ? aggregates["energy.dailyAverage"]
          : 0,
        style: "metric",
      },
    ],
  },
};
