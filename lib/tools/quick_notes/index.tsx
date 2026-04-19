/**
 * Quick Notes — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { NotebookPen } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { QuickNotesWidget } from "./widget";

export const quickNotesSchema = z.object({
  notes: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1).max(200),
        created_at: z.string(),
      })
    )
    .max(20),
});

export type QuickNotesPayload = z.infer<typeof quickNotesSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const quickNotes: ToolDefinition = {
  id: "quick_notes",
  category: "creativity",
  name: {
    en: "Quick Notes",
    th: "โน้ตเร็ว",
    zh: "速记",
  },
  description: {
    en: "Capture short notes throughout the day. Frictionless.",
    th: "จดโน้ตสั้นๆ ได้ตลอดวัน ไม่ต้องคิดมาก",
    zh: "全天快速记录灵感，零摩擦。",
  },
  icon: NotebookPen,
  color: "zen-sky",
  recommendedFor: ["fox", "butterfly", "octopus", "cat"],
  recommendationReason: {
    en: "Frictionless capture for fast, adaptive minds that think in bursts.",
    th: "บันทึกแบบไร้รอยต่อสำหรับคนคิดเร็วและปรับตัวเร็ว",
    zh: "为灵活快速的思维者提供零摩擦的灵感捕捉。",
  },
  schema: quickNotesSchema,
  defaultConfig: {},
  Widget: QuickNotesWidget,
  produces: ["notes.todayCount"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = quickNotesSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        const concat = parsed.data.notes.map((n) => n.text).join(" | ");
        rows.push([e.entry_date, parsed.data.notes.length, concat]);
      }
      return {
        name: "Quick Notes",
        headers: ["Date", "Notes Count", "Notes"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Quick notes today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["notes.todayCount"] === "number" ? aggregates["notes.todayCount"] : 0,
        style: "metric",
      },
    ],
  },
};
