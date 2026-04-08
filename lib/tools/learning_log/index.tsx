/** Learning Log — minimal log-style tool. Server-safe. */
import { Briefcase } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { LearningLogWidget } from "./widget";

export const learningLogSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const learningLog: ToolDefinition = {
  id: "learning_log", category: "tracking",
  name: { en: "Learning Log", th: "บันทึกการเรียนรู้", zh: "学习日志" },
  description: { en: "Log courses, lessons, breakthroughs.", th: "บันทึกคอร์ส บทเรียน ความก้าวหน้า", zh: "记录课程、课堂与突破" },
  icon: Briefcase, color: "zen-sage",
  recommendedFor: ["owl", "octopus", "fox"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: learningLogSchema, defaultConfig: {}, Widget: LearningLogWidget,
  produces: ["learning.countToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = learningLogSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Learning Log", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
