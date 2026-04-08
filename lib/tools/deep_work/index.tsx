/** Deep Work — minimal log-style tool. Server-safe. */
import { Brain } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { DeepWorkWidget } from "./widget";

export const deepWorkSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const deepWork: ToolDefinition = {
  id: "deep_work", category: "productivity",
  name: { en: "Deep Work", th: "ทำงานเชิงลึก", zh: "深度工作" },
  description: { en: "Log long, undistracted focus sessions.", th: "บันทึกช่วงโฟกัสยาวที่ไม่ถูกรบกวน", zh: "记录长时间无干扰的专注时段" },
  icon: Brain, color: "zen-indigo",
  recommendedFor: ["owl", "whale", "mountain"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: deepWorkSchema, defaultConfig: {}, Widget: DeepWorkWidget,
  produces: ["deepWork.sessionsToday", "deepWork.hoursToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = deepWorkSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Deep Work", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
