/**
 * Brain Dump — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { Brain } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { BrainDumpWidget } from "./widget";

export const brainDumpSchema = z.object({
  content: z.string().max(2000),
});

export type BrainDumpPayload = z.infer<typeof brainDumpSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const brainDump: ToolDefinition = {
  id: "brain_dump",
  category: "creativity",
  name: {
    en: "Brain Dump",
    th: "เทสมอง",
    zh: "思维清空",
  },
  description: {
    en: "One big textarea. Dump everything on your mind. No structure needed.",
    th: "textarea ใหญ่ๆ เทความคิดทั้งหมดออกมา ไม่ต้องคิดรูปแบบ",
    zh: "一个大文本框，把脑中所有想法都倒出来。无需结构。",
  },
  icon: Brain,
  color: "zen-indigo",
  recommendedFor: ["octopus", "butterfly", "fox", "cat"],
  recommendationReason: {
    en: "Reactive minds need a no-structure space to unload bursts of thought.",
    th: "จิตใจที่ตอบสนองเร็วต้องการพื้นที่ไร้รูปแบบเพื่อปลดปล่อยความคิด",
    zh: "反应型思维者需要无结构的空间来释放瞬间的想法。",
  },
  schema: brainDumpSchema,
  defaultConfig: {},
  Widget: BrainDumpWidget,
  produces: ["braindump.wordCount", "braindump.loggedDays"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = brainDumpSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        const words = parsed.data.content.trim().split(/\s+/).filter(Boolean).length;
        rows.push([e.entry_date, words, parsed.data.content]);
      }
      return {
        name: "Brain Dump",
        headers: ["Date", "Word Count", "Content"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Brain dump days", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["braindump.loggedDays"] === "number"
            ? aggregates["braindump.loggedDays"]
            : 0,
        style: "metric",
      },
    ],
  },
};
