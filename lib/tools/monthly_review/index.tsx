/** Monthly Review — long-form reflection. Server-safe. */
import { BookOpen } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { MonthlyReviewWidget } from "./widget";

export const monthlyReviewSchema = z.object({
  wins: z.string().max(400),
  challenges: z.string().max(400),
  nextMonth: z.string().max(400),
});

export function periodKey(d = new Date()): string {
  // First-of-period key (month or year).
  const x = new Date(d);
  x.setDate(1); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export const monthlyReview: ToolDefinition = {
  id: "monthly_review", category: "reflection",
  name: { en: "Monthly Review", th: "ทบทวนรายเดือน", zh: "月度回顾" },
  description: { en: "Review what worked and what didn't.", th: "ทบทวนสิ่งที่ได้ผลและไม่ได้ผล", zh: "回顾哪些有效、哪些无效" },
  icon: BookOpen, color: "zen-sage",
  recommendedFor: ["whale", "owl", "mountain"],
  recommendationReason: {
    en: "Longer-horizon planning keeps visionary archetypes on course.",
    th: "การวางแผนระยะยาวช่วยให้สายวิสัยทัศน์อยู่ในเส้นทาง",
    zh: "长期规划让远见型原型保持航向。",
  },
  schema: monthlyReviewSchema, defaultConfig: {}, Widget: MonthlyReviewWidget,
  produces: ["monthly.reviewed"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Monthly Review",
      headers: ["Period", "wins", "challenges", "nextMonth"],
      rows: entries.flatMap((e) => {
        const p = monthlyReviewSchema.safeParse(e.payload);
        if (!p.success) return [];
        return [[e.entry_date, p.data.wins, p.data.challenges, p.data.nextMonth]];
      }),
    }),
    buildDashboardSection: () => [
      { address: "B2", value: "Monthly Review (current)", style: "label" },
    ],
  },
};
