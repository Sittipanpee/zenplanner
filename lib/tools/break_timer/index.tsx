/** Break Timer — log breaks taken throughout the day. */
import { Coffee } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { BreakTimerWidget } from "./widget";

export const breakTimerSchema = z.object({
  breaks: z.array(z.object({
    id: z.string().min(1),
    minutes: z.number().int().min(1).max(60),
    at: z.string(),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const breakTimer: ToolDefinition = {
  id: "break_timer", category: "productivity",
  name: { en: "Break Timer", th: "ตัวจับเวลาพัก", zh: "休息计时" },
  description: {
    en: "Log breaks taken throughout the day. 5/10/15/20 min presets.",
    th: "บันทึกเวลาพักตลอดวัน ค่าสำเร็จรูป 5/10/15/20 นาที",
    zh: "记录一天中的休息时间，5/10/15/20 分钟预设",
  },
  icon: Coffee, color: "zen-amber",
  recommendedFor: ["sakura", "dove", "cat", "bamboo"],
  recommendationReason: {
    en: "Gentle pacing for sustainable energy — log every break you take.",
    th: "จังหวะอ่อนโยนเพื่อพลังงานที่ยั่งยืน บันทึกทุกการพัก",
    zh: "为可持续能量提供温和节奏，记录你的每次休息。",
  },
  schema: breakTimerSchema, defaultConfig: {}, Widget: BreakTimerWidget,
  produces: ["breakTimer.minutesToday", "breakTimer.countToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = breakTimerSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const b of p.data.breaks) rows.push([e.entry_date, b.minutes, b.at]);
      }
      return { name: "Break Timer", headers: ["Date", "Minutes", "At"], rows };
    },
    buildDashboardSection: (a) => [
      { address: "B2", value: "Break minutes today", style: "label" },
      { address: "C2", value: typeof a["breakTimer.minutesToday"] === "number" ? a["breakTimer.minutesToday"] : 0, style: "metric" },
    ],
  },
};
