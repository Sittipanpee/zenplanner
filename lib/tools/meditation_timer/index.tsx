import { Sparkles } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { MeditationTimerWidget } from "./widget";

// ---------- Schema ----------

export const meditationTimerSchema = z.object({
  duration: z.number().int().min(1).max(60),
  completedAt: z.string(),
});

export type MeditationTimerPayload = z.infer<typeof meditationTimerSchema>;

export interface MeditationTimerConfig {
  lastLength: number;
}

export const DEFAULT_MEDITATION_CONFIG: MeditationTimerConfig = { lastLength: 10 };

// ---------- ToolDefinition ----------

export const meditationTimer: ToolDefinition = {
  id: "meditation_timer",
  category: "wellbeing",
  name: {
    en: "Meditation Timer",
    th: "ตัวจับเวลานั่งสมาธิ",
    zh: "冥想计时",
  },
  description: {
    en: "Time your meditation sessions with presets and a soft bell.",
    th: "จับเวลานั่งสมาธิด้วยพรีเซ็ตและเสียงระฆังเบาๆ",
    zh: "用预设和柔和的钟声为冥想计时。",
  },
  icon: Sparkles,
  color: "zen-indigo",
  recommendedFor: ["whale", "sakura", "dove", "bamboo"],
  recommendationReason: {
    en: "Stillness practice for reflective souls.",
    th: "การฝึกความนิ่งสำหรับจิตวิญญาณที่ใคร่ครวญ",
    zh: "为内省灵魂提供静心练习。",
  },
  schema: meditationTimerSchema,
  defaultConfig: { ...DEFAULT_MEDITATION_CONFIG },
  Widget: MeditationTimerWidget,
  produces: ["meditation.minutesToday", "meditation.streakDays"],
  consumes: [],
  excel: {
    buildSheet: (entries) => {
      const byDate = new Map<string, number>();
      for (const e of entries) {
        const p = e.payload as Partial<MeditationTimerPayload>;
        const cur = byDate.get(e.entry_date) ?? 0;
        byDate.set(e.entry_date, cur + (p.duration ?? 0));
      }
      const rows: Array<Array<string | number | boolean | null>> = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, minutes]) => [date, minutes]);
      const lastRow = rows.length + 1;
      rows.push(["Weekly Total", `=SUM(B2:B${lastRow})`]);
      return {
        name: "Meditation",
        headers: ["Date", "Minutes"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Meditation minutes today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["meditation.minutesToday"] === "number"
            ? aggregates["meditation.minutesToday"]
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Meditation streak (days)", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["meditation.streakDays"] === "number"
            ? aggregates["meditation.streakDays"]
            : 0,
        style: "metric",
      },
    ],
  },
};
