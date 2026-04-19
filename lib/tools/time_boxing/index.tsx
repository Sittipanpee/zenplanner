/**
 * Time Boxing — hour-by-hour block schedule for today.
 *
 * Server-safe module: ToolDefinition + Zod schema only. Widget lives in ./widget.
 */

import { Clock } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { TimeBoxingWidget } from "./widget";

// ---------- Schema ----------

export const timeBoxingSchema = z.object({
  blocks: z
    .array(
      z.object({
        id: z.string(),
        hour: z.number().int().min(0).max(23),
        label: z.string().min(1).max(200),
      })
    )
    .max(12),
});

export type TimeBoxingPayload = z.infer<typeof timeBoxingSchema>;

// ---------- ToolDefinition ----------

export const timeBoxing: ToolDefinition = {
  id: "time_boxing",
  category: "productivity",
  name: {
    en: "Time Boxing",
    th: "ไทม์บ็อกซิ่ง",
    zh: "时间盒",
  },
  description: {
    en: "Block your day hour by hour.",
    th: "บล็อกเวลาทีละชั่วโมง",
    zh: "按小时安排你的一天",
  },
  icon: Clock,
  color: "zen-sky",
  recommendedFor: ["owl", "mountain", "lion"],
  recommendationReason: {
    en: "Hour-by-hour control for structured days.",
    th: "ควบคุมเป็นรายชั่วโมงสำหรับวันที่มีโครงสร้าง",
    zh: "为结构化日子提供小时级控制",
  },
  schema: timeBoxingSchema,
  defaultConfig: {},
  Widget: TimeBoxingWidget,
  produces: ["timeBoxing.blocksToday"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Time Boxing",
      headers: ["Date", "Hour", "Label"],
      rows: entries.flatMap((e) => {
        const parsed = timeBoxingSchema.safeParse(e.payload);
        if (!parsed.success) return [];
        const sorted = [...parsed.data.blocks].sort((a, b) => a.hour - b.hour);
        return sorted.map((b) => [
          e.entry_date,
          b.hour,
          b.label,
        ]);
      }),
    }),
    buildDashboardSection: () => [],
  },
};
