import { Droplet } from "lucide-react";
import { z } from "zod";
import type {
  ToolDefinition,
  WorkbookSheet,
  DashboardCell,
} from "../types";
import { WaterWidget } from "./widget";

// ---------- Schema ----------

export const waterSchema = z.object({
  glasses: z.number().int().min(0).max(20),
});

export type WaterPayload = z.infer<typeof waterSchema>;

// ---------- Helpers (shared with widget) ----------

export function readGoal(config: Record<string, unknown>): number {
  const raw = config.dailyGoal;
  if (typeof raw === "number" && raw > 0 && raw <= 20) return Math.round(raw);
  return 8;
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
