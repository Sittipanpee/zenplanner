/**
 * Weekly Review — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { CalendarDays } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { WeeklyReviewWidget } from "./widget";

// ---------- Schema ----------

export const weeklyReviewSchema = z.object({
  wins: z.array(z.string().min(1).max(400)).max(5),
  losses: z.array(z.string().min(1).max(400)).max(5),
  nextWeekFocus: z.string().max(400),
  overallRating: z.number().int().min(1).max(5),
});

export type WeeklyReviewPayload = z.infer<typeof weeklyReviewSchema>;

// ---------- Shared helpers ----------

/** Monday of current ISO week, as YYYY-MM-DD. Exported for the route page. */
export function mondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

// ---------- ToolDefinition ----------

export const weeklyReview: ToolDefinition = {
  id: "weekly_review",
  category: "reflection",
  name: {
    en: "Weekly Review",
    th: "รีวิวประจำสัปดาห์",
    zh: "每周回顾",
  },
  description: {
    en: "Reflect on your week — wins, losses, focus, and rating.",
    th: "ทบทวนสัปดาห์ของคุณ — ชัยชนะ ความท้าทาย โฟกัส และคะแนน",
    zh: "回顾你的一周 — 成就、挑战、重点和评分",
  },
  icon: CalendarDays,
  color: "zen-sage",
  recommendedFor: ["mountain", "owl", "eagle", "lion", "crocodile", "turtle"],
  recommendationReason: {
    en: "Your archetype thrives on structured reflection and deliberate next-step planning.",
    th: "อาร์คีไทป์ของคุณเติบโตจากการทบทวนอย่างเป็นระบบและการวางแผนก้าวต่อไปอย่างตั้งใจ",
    zh: "你的原型善于通过结构化的回顾和有意识地规划下一步来成长。",
  },
  schema: weeklyReviewSchema,
  defaultConfig: {},
  Widget: WeeklyReviewWidget,
  produces: ["weeklyReview.winsCount", "weeklyReview.averageRating"],
  consumes: ["habit.completionRate", "priorities.doneCount"],
  excel: {
    buildSheet: (entries) => ({
      name: "Weekly Review",
      headers: [
        "Week of",
        "Wins",
        "Losses",
        "Next week focus",
        "Rating",
      ],
      rows: entries.map((e) => {
        const p = e.payload as Partial<WeeklyReviewPayload>;
        return [
          e.entry_date,
          (p.wins ?? []).join(" | "),
          (p.losses ?? []).join(" | "),
          p.nextWeekFocus ?? "",
          typeof p.overallRating === "number" ? p.overallRating : "",
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      {
        address: "B2",
        value: "Average weekly rating",
        style: "label",
      },
      {
        address: "C2",
        value:
          typeof aggregates.averageRating === "number"
            ? aggregates.averageRating
            : 0,
        style: "metric",
      },
    ],
  },
};
