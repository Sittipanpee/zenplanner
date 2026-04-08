/**
 * Daily Reflection — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { BookOpen } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { DailyReflectionWidget } from "./widget";

// ---------- Schema ----------

export const dailyReflectionSchema = z.object({
  highlight: z.string().max(400),
  challenge: z.string().max(400),
  tomorrowIntent: z.string().max(400),
});

export type DailyReflectionPayload = z.infer<typeof dailyReflectionSchema>;

/** Today as YYYY-MM-DD (local-day resolution). */
export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// ---------- ToolDefinition ----------

export const dailyReflection: ToolDefinition = {
  id: "daily_reflection",
  category: "reflection",
  name: {
    en: "Daily Reflection",
    th: "ทบทวนประจำวัน",
    zh: "每日反思",
  },
  description: {
    en: "Three short prompts to close the day mindfully.",
    th: "สามคำถามสั้นๆ ปิดท้ายวันอย่างมีสติ",
    zh: "三个简短的问题，用心结束一天",
  },
  icon: BookOpen,
  color: "zen-blossom",
  recommendedFor: [
    "whale",
    "sakura",
    "dove",
    "cat",
    "bamboo",
    "butterfly",
    "turtle",
  ],
  recommendationReason: {
    en: "Your archetype grows through gentle, reflective journaling.",
    th: "อาร์คีไทป์ของคุณเติบโตผ่านการเขียนทบทวนอย่างอ่อนโยน",
    zh: "你的原型通过温柔的反思式写作而成长",
  },
  schema: dailyReflectionSchema,
  defaultConfig: {},
  Widget: DailyReflectionWidget,
  produces: ["reflection.completedDays", "reflection.weeklyHighlights"],
  consumes: [],
  excel: {
    buildSheet: (entries) => ({
      name: "Daily Reflection",
      headers: ["Date", "Highlight", "Challenge", "Tomorrow intent"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<DailyReflectionPayload>;
        return [
          e.entry_date,
          p.highlight ?? "",
          p.challenge ?? "",
          p.tomorrowIntent ?? "",
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      {
        address: "B2",
        value: "Days reflected",
        style: "label",
      },
      {
        address: "C2",
        value:
          typeof aggregates["reflection.completedDays"] === "number"
            ? aggregates["reflection.completedDays"]
            : 0,
        style: "metric",
      },
    ],
  },
};
