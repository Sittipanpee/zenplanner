/** Quarterly Vision — long-form reflection. Server-safe. */
import { Compass } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { QuarterlyVisionWidget } from "./widget";

export const quarterlyVisionSchema = z.object({
  objective: z.string().max(400),
  keyResults: z.string().max(400),
  reflection: z.string().max(400),
});

export function periodKey(d = new Date()): string {
  // First-of-period key (month or year).
  const x = new Date(d);
  const q = Math.floor(x.getMonth() / 3); x.setMonth(q * 3); x.setDate(1); x.setHours(0,0,0,0);
  return x.toISOString().slice(0, 10);
}

export const quarterlyVision: ToolDefinition = {
  id: "quarterly_vision", category: "reflection",
  name: { en: "Quarterly Vision", th: "วิสัยทัศน์รายไตรมาส", zh: "季度愿景" },
  description: { en: "90-day OKR-style planning.", th: "การวางแผนแบบ OKR 90 วัน", zh: "90 天 OKR 式规划" },
  icon: Compass, color: "zen-clay",
  recommendedFor: ["eagle", "lion", "crocodile"],
  recommendationReason: {
    en: "Longer-horizon planning keeps visionary archetypes on course.",
    th: "การวางแผนระยะยาวช่วยให้สายวิสัยทัศน์อยู่ในเส้นทาง",
    zh: "长期规划让远见型原型保持航向。",
  },
  schema: quarterlyVisionSchema, defaultConfig: {}, Widget: QuarterlyVisionWidget,
  produces: ["quarterly.currentQuarter"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Quarterly Vision",
      headers: ["Period", "objective", "keyResults", "reflection"],
      rows: entries.flatMap((e) => {
        const p = quarterlyVisionSchema.safeParse(e.payload);
        if (!p.success) return [];
        return [[e.entry_date, p.data.objective, p.data.keyResults, p.data.reflection]];
      }),
    }),
    buildDashboardSection: () => [
      { address: "B2", value: "Quarterly Vision (current)", style: "label" },
    ],
  },
};
