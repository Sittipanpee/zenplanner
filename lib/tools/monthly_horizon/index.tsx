/** Monthly Horizon — long-form reflection. Server-safe. */
import { CalendarDays } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { MonthlyHorizonWidget } from "./widget";

export const monthlyHorizonSchema = z.object({
  theme: z.string().max(400),
  targets: z.string().max(400),
  reflection: z.string().max(400),
});

export function periodKey(d = new Date()): string {
  // First-of-period key (month or year).
  const x = new Date(d);
  x.setDate(1); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export const monthlyHorizon: ToolDefinition = {
  id: "monthly_horizon", category: "reflection",
  name: { en: "Monthly Horizon", th: "มองเดือนหน้า", zh: "月度展望" },
  description: { en: "Plan and review the month ahead.", th: "วางแผนและทบทวนเดือนที่จะถึง", zh: "规划与回顾未来的一个月" },
  icon: CalendarDays, color: "zen-sky",
  recommendedFor: ["turtle", "mountain", "bamboo", "eagle"],
  recommendationReason: {
    en: "Longer-horizon planning keeps visionary archetypes on course.",
    th: "การวางแผนระยะยาวช่วยให้สายวิสัยทัศน์อยู่ในเส้นทาง",
    zh: "长期规划让远见型原型保持航向。",
  },
  schema: monthlyHorizonSchema, defaultConfig: {}, Widget: MonthlyHorizonWidget,
  produces: ["monthly.currentMonth"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Monthly Horizon",
      headers: ["Period", "theme", "targets", "reflection"],
      rows: entries.flatMap((e) => {
        const p = monthlyHorizonSchema.safeParse(e.payload);
        if (!p.success) return [];
        return [[e.entry_date, p.data.theme, p.data.targets, p.data.reflection]];
      }),
    }),
    buildDashboardSection: () => [
      { address: "B2", value: "Monthly Horizon (current)", style: "label" },
    ],
  },
};
