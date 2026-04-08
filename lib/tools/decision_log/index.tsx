/** Decision Log — minimal log-style tool. Server-safe. */
import { ScrollText } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { DecisionLogWidget } from "./widget";

export const decisionLogSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const decisionLog: ToolDefinition = {
  id: "decision_log", category: "tracking",
  name: { en: "Decision Log", th: "บันทึกการตัดสินใจ", zh: "决策日志" },
  description: { en: "Record decisions and their context.", th: "บันทึกการตัดสินใจและบริบท", zh: "记录决策及其背景" },
  icon: ScrollText, color: "zen-indigo",
  recommendedFor: ["owl", "crocodile", "octopus"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: decisionLogSchema, defaultConfig: {}, Widget: DecisionLogWidget,
  produces: ["decisions.countToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = decisionLogSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Decision Log", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
