/**
 * Weekly Intentions — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { Flag } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolEntry } from "../types";
import { WeeklyIntentionsWidget } from "./widget";

// ---------- Schema ----------

export const weeklyIntentionsSchema = z.object({
  intentions: z.array(z.string().max(300)).max(3),
  setAt: z.string(),
});

export type WeeklyIntentionsPayload = z.infer<typeof weeklyIntentionsSchema>;

// ---------- Shared helpers ----------

/** Monday of current ISO week, as YYYY-MM-DD. Shared with widget. */
export function mondayOfCurrentWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

// ---------- ToolDefinition ----------

export const weeklyIntentions: ToolDefinition = {
  id: "weekly_intentions",
  category: "reflection",
  name: {
    en: "Weekly Intentions",
    th: "เจตนารายสัปดาห์",
    zh: "每周意图",
  },
  description: {
    en: "Set 3 intentions for the week.",
    th: "ตั้งเจตนา 3 ข้อสำหรับสัปดาห์",
    zh: "为本周设定 3 个意图",
  },
  icon: Flag,
  color: "zen-sage",
  recommendedFor: ["dove", "sakura", "whale", "bamboo", "cat", "turtle"],
  recommendationReason: {
    en: "Soft commitments for gentle progress.",
    th: "พันธสัญญานุ่มนวลสำหรับความก้าวหน้าที่อ่อนโยน",
    zh: "为温和的进步设定轻柔承诺",
  },
  schema: weeklyIntentionsSchema,
  defaultConfig: {},
  Widget: WeeklyIntentionsWidget,
  produces: ["weeklyIntentions.current"],
  consumes: [],
  excel: {
    buildSheet: (entries: ToolEntry[]) => ({
      name: "Weekly Intentions",
      headers: ["Week of", "Intention 1", "Intention 2", "Intention 3"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<WeeklyIntentionsPayload>;
        const intentions = p.intentions ?? [];
        return [
          e.entry_date,
          intentions[0] ?? "",
          intentions[1] ?? "",
          intentions[2] ?? "",
        ];
      }),
    }),
    buildDashboardSection: () => [],
  },
};
