/** Quarterly OKRs — long-form reflection. Server-safe. */
import { Target } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { QuarterlyOkrsWidget } from "./widget";

export const quarterlyOkrsSchema = z.object({
  objective: z.string().max(400),
  kr1: z.string().max(400),
  kr2: z.string().max(400),
});

export function periodKey(d = new Date()): string {
  // First-of-period key (month or year).
  const x = new Date(d);
  const q = Math.floor(x.getMonth() / 3); x.setMonth(q * 3); x.setDate(1); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export const quarterlyOkrs: ToolDefinition = {
  id: "quarterly_okrs", category: "reflection",
  name: { en: "Quarterly OKRs", th: "OKR รายไตรมาส", zh: "季度 OKR" },
  description: { en: "Objectives + Key Results, every 90 days.", th: "วัตถุประสงค์ + ผลลัพธ์หลัก ทุก 90 วัน", zh: "目标与关键结果，每 90 天" },
  icon: Target, color: "zen-clay",
  recommendedFor: ["eagle", "lion", "crocodile"],
  recommendationReason: {
    en: "Longer-horizon planning keeps visionary archetypes on course.",
    th: "การวางแผนระยะยาวช่วยให้สายวิสัยทัศน์อยู่ในเส้นทาง",
    zh: "长期规划让远见型原型保持航向。",
  },
  schema: quarterlyOkrsSchema, defaultConfig: {}, Widget: QuarterlyOkrsWidget,
  produces: ["okrs.currentQuarter"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Quarterly OKRs",
      headers: ["Period", "objective", "kr1", "kr2"],
      rows: entries.flatMap((e) => {
        const p = quarterlyOkrsSchema.safeParse(e.payload);
        if (!p.success) return [];
        return [[e.entry_date, p.data.objective, p.data.kr1, p.data.kr2]];
      }),
    }),
    buildDashboardSection: () => [
      { address: "B2", value: "Quarterly OKRs (current)", style: "label" },
    ],
  },
};
