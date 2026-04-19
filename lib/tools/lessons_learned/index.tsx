/** Lessons Learned — minimal log-style tool. Server-safe. */
import { Lightbulb } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { LessonsLearnedWidget } from "./widget";

export const lessonsLearnedSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const lessonsLearned: ToolDefinition = {
  id: "lessons_learned", category: "reflection",
  name: { en: "Lessons Learned", th: "บทเรียนที่ได้", zh: "经验教训" },
  description: { en: "Capture what you learned today.", th: "บันทึกสิ่งที่คุณเรียนรู้วันนี้", zh: "记录你今天学到了什么" },
  icon: Lightbulb, color: "zen-amber",
  recommendedFor: ["owl", "whale", "octopus"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: lessonsLearnedSchema, defaultConfig: {}, Widget: LessonsLearnedWidget,
  produces: ["lessons.countToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = lessonsLearnedSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Lessons Learned", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
