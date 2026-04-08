/** Year Vision — long-form reflection. Server-safe. */
import { Sun } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { YearVisionWidget } from "./widget";

export const yearVisionSchema = z.object({
  theme: z.string().max(400),
  bigGoals: z.string().max(400),
  reflection: z.string().max(400),
});

export function periodKey(d = new Date()): string {
  // First-of-period key (month or year).
  const x = new Date(d);
  x.setMonth(0); x.setDate(1); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export const yearVision: ToolDefinition = {
  id: "year_vision", category: "reflection",
  name: { en: "Year Vision", th: "วิสัยทัศน์รายปี", zh: "年度愿景" },
  description: { en: "Sketch your year in one page.", th: "วาดภาพปีของคุณในหน้าเดียว", zh: "在一页上勾勒你的一年" },
  icon: Sun, color: "zen-amber",
  recommendedFor: ["eagle", "whale", "mountain"],
  recommendationReason: {
    en: "Longer-horizon planning keeps visionary archetypes on course.",
    th: "การวางแผนระยะยาวช่วยให้สายวิสัยทัศน์อยู่ในเส้นทาง",
    zh: "长期规划让远见型原型保持航向。",
  },
  schema: yearVisionSchema, defaultConfig: {}, Widget: YearVisionWidget,
  produces: ["year.currentYear"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Year Vision",
      headers: ["Period", "theme", "bigGoals", "reflection"],
      rows: entries.flatMap((e) => {
        const p = yearVisionSchema.safeParse(e.payload);
        if (!p.success) return [];
        return [[e.entry_date, p.data.theme, p.data.bigGoals, p.data.reflection]];
      }),
    }),
    buildDashboardSection: () => [
      { address: "B2", value: "Year Vision (current)", style: "label" },
    ],
  },
};
