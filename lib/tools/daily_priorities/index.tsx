/**
 * Daily Priorities — top 3 priorities for today.
 *
 * Server-safe module: ToolDefinition + Zod schema only. Widget lives in ./widget.
 */

import { Target } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { DailyPrioritiesWidget } from "./widget";

// ---------- Schema ----------

export const dailyPrioritiesSchema = z.object({
  priorities: z
    .array(
      z.object({
        text: z.string().min(1).max(140),
        done: z.boolean(),
      })
    )
    .max(3),
});

export type DailyPrioritiesPayload = z.infer<typeof dailyPrioritiesSchema>;

// ---------- ToolDefinition ----------

export const dailyPriorities: ToolDefinition = {
  id: "daily_priorities",
  category: "productivity",
  name: {
    en: "Daily Priorities",
    th: "ลำดับความสำคัญวันนี้",
    zh: "今日要务",
  },
  description: {
    en: "Pick your top 3 priorities for today.",
    th: "เลือก 3 สิ่งสำคัญที่สุดสำหรับวันนี้",
    zh: "选择今天最重要的 3 件事",
  },
  icon: Target,
  color: "zen-sage",
  recommendedFor: ["lion", "eagle", "wolf", "mountain", "fox", "crocodile"],
  recommendationReason: {
    en: "Three clear priorities each day keep goal-driven minds focused on what actually moves the needle.",
    th: "สามสิ่งสำคัญต่อวันช่วยให้ผู้มุ่งเป้าหมายโฟกัสกับสิ่งที่สร้างผลลัพธ์จริง",
    zh: "每天三个清晰的要务，让目标驱动者专注于真正推动进展的事情。",
  },
  schema: dailyPrioritiesSchema,
  defaultConfig: {},
  Widget: DailyPrioritiesWidget,
  produces: ["priorities.doneCount", "priorities.total"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Daily Priorities",
      headers: [
        "Date",
        "Priority 1",
        "Done?",
        "Priority 2",
        "Done?",
        "Priority 3",
        "Done?",
      ],
      rows: entries.map((e) => {
        const parsed = dailyPrioritiesSchema.safeParse(e.payload);
        const list = parsed.success ? parsed.data.priorities : [];
        const slot = (i: number) => {
          const p = list[i];
          return p
            ? ([p.text, p.done] as [string, boolean])
            : (["", false] as [string, boolean]);
        };
        const [t1, d1] = slot(0);
        const [t2, d2] = slot(1);
        const [t3, d3] = slot(2);
        return [e.entry_date, t1, d1, t2, d2, t3, d3];
      }),
    }),
    buildDashboardSection: () => [
      {
        address: "B2",
        value: "Priorities Done This Week",
        style: "label",
      },
      {
        address: "C2",
        value: "=SUM(...)",
        style: "metric",
      },
    ],
  },
};
