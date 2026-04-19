import { Star } from "lucide-react";
import { z } from "zod";
import type {
  ToolDefinition,
  WorkbookSheet,
  DashboardCell,
} from "../types";
import { SleepQualityWidget } from "./widget";

// ---------- Schema ----------

export const sleepQualitySchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type SleepQualityPayload = z.infer<typeof sleepQualitySchema>;

// ---------- ToolDefinition ----------

export const sleepQuality: ToolDefinition = {
  id: "sleep_quality",
  category: "wellbeing",
  name: {
    en: "Sleep Quality",
    th: "คุณภาพการนอน",
    zh: "睡眠质量",
  },
  description: {
    en: "Rate how rested you feel.",
    th: "ให้คะแนนความสดชื่นที่ได้รับ",
    zh: "为你的休息感打分",
  },
  icon: Star,
  color: "zen-indigo",
  recommendedFor: ["whale", "bamboo", "turtle"],
  recommendationReason: {
    en: "Lightweight rest tracking.",
    th: "การติดตามการพักแบบเบา",
    zh: "轻量化的休息追踪",
  },
  schema: sleepQualitySchema,
  defaultConfig: {},
  Widget: SleepQualityWidget,
  produces: ["sleepQuality.weekAverage"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const byDate = new Map<string, SleepQualityPayload>();
      for (const e of entries) {
        const p = e.payload as Partial<SleepQualityPayload>;
        if (typeof p.rating === "number" && p.rating >= 1 && p.rating <= 5) {
          byDate.set(e.entry_date, { rating: p.rating });
        }
      }
      const sorted = Array.from(byDate.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const rows = sorted.map(([date, p]) => [date, p.rating]);
      return {
        name: "Sleep Quality",
        headers: ["Date", "Rating (1-5)"],
        rows,
        meta: {
          weeklyAverageFormula: "=AVERAGE(B2:B8)",
        },
      };
    },
    buildDashboardSection: (aggregates): DashboardCell[] => [
      {
        address: "B6",
        value: "Sleep Quality — avg rating (7d)",
        style: "label",
      },
      {
        address: "C6",
        value:
          typeof aggregates["sleepQuality.weekAverage"] === "number"
            ? (aggregates["sleepQuality.weekAverage"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
