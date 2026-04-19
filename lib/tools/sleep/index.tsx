import { Moon } from "lucide-react";
import { z } from "zod";
import type {
  ToolDefinition,
  WorkbookSheet,
  DashboardCell,
} from "../types";
import { SleepWidget } from "./widget";

// ---------- Schema ----------

export const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const sleepSchema = z.object({
  bedtime: z.string().regex(timeRegex),
  wakeTime: z.string().regex(timeRegex),
  quality: z.number().int().min(1).max(5),
});

export type SleepPayload = z.infer<typeof sleepSchema>;

// ---------- Helpers (shared) ----------

function parseMinutes(time: string): number | null {
  if (!timeRegex.test(time)) return null;
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

export function computeSleepMinutes(bedtime: string, wakeTime: string): number | null {
  const b = parseMinutes(bedtime);
  const w = parseMinutes(wakeTime);
  if (b === null || w === null) return null;
  let diff = w - b;
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function formatHM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

// ---------- ToolDefinition ----------

export const sleep: ToolDefinition = {
  id: "sleep",
  category: "wellbeing",
  name: {
    en: "Sleep Log",
    th: "บันทึกการนอน",
    zh: "睡眠记录",
  },
  description: {
    en: "Track bedtime, wake time, and sleep quality.",
    th: "ติดตามเวลาเข้านอน เวลาตื่น และคุณภาพการนอน",
    zh: "记录就寝时间、起床时间与睡眠质量",
  },
  icon: Moon,
  color: "zen-blossom",
  recommendedFor: ["whale", "owl", "turtle", "bamboo", "sakura", "cat"],
  recommendationReason: {
    en: "Consistent rest is the foundation of your calm, reflective nature.",
    th: "การพักผ่อนสม่ำเสมอคือรากฐานของความสงบและการใคร่ครวญของคุณ",
    zh: "规律的休息是你宁静反思本性的基石",
  },
  schema: sleepSchema,
  defaultConfig: {},
  Widget: SleepWidget,
  produces: ["sleep.hoursAverage", "sleep.qualityAverage", "sleep.consistency"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const byDate = new Map<string, SleepPayload>();
      for (const e of entries) {
        const p = e.payload as Partial<SleepPayload>;
        if (
          typeof p.bedtime === "string" &&
          typeof p.wakeTime === "string" &&
          typeof p.quality === "number"
        ) {
          byDate.set(e.entry_date, {
            bedtime: p.bedtime,
            wakeTime: p.wakeTime,
            quality: p.quality,
          });
        }
      }
      const sorted = Array.from(byDate.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const rows = sorted.map(([date, p]) => {
        const mins = computeSleepMinutes(p.bedtime, p.wakeTime) ?? 0;
        const hours = Number((mins / 60).toFixed(2));
        return [date, p.bedtime, p.wakeTime, hours, p.quality];
      });
      return {
        name: "Sleep",
        headers: ["Date", "Bedtime", "Wake Time", "Hours Slept", "Quality"],
        rows,
        meta: {
          weeklyAverageHoursFormula: "=AVERAGE(D2:D8)",
          weeklyAverageQualityFormula: "=AVERAGE(E2:E8)",
        },
      };
    },
    buildDashboardSection: (aggregates): DashboardCell[] => [
      {
        address: "B4",
        value: "Sleep — avg hours (7d)",
        style: "label",
      },
      {
        address: "C4",
        value:
          typeof aggregates["sleep.hoursAverage"] === "number"
            ? (aggregates["sleep.hoursAverage"] as number)
            : 0,
        style: "metric",
      },
      {
        address: "B5",
        value: "Sleep — avg quality (7d)",
        style: "label",
      },
      {
        address: "C5",
        value:
          typeof aggregates["sleep.qualityAverage"] === "number"
            ? (aggregates["sleep.qualityAverage"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
