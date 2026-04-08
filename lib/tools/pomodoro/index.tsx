import { Timer } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { PomodoroWidget } from "./widget";

// ---------- Schema ----------

export const pomodoroSchema = z.object({
  sessions: z.number().int().min(0).max(20),
  focus: z.number().int().min(0).max(240),
});

export type PomodoroPayload = z.infer<typeof pomodoroSchema>;

export interface PomodoroConfig {
  sessionLength: number;
  breakLength: number;
}

export const DEFAULT_POMODORO_CONFIG: PomodoroConfig = { sessionLength: 25, breakLength: 5 };

// ---------- ToolDefinition ----------

export const pomodoro: ToolDefinition = {
  id: "pomodoro",
  category: "productivity",
  name: {
    en: "Pomodoro Timer",
    th: "ตัวจับเวลาโพโมโดโร",
    zh: "番茄钟",
  },
  description: {
    en: "Focus in 25-minute sessions with short breaks.",
    th: "โฟกัสครั้งละ 25 นาทีพร้อมพักสั้นๆ",
    zh: "以 25 分钟为单位专注，配合短暂休息。",
  },
  icon: Timer,
  color: "zen-gold",
  recommendedFor: ["owl", "eagle", "mountain", "crocodile", "lion", "turtle"],
  recommendationReason: {
    en: "Deep-focus archetypes thrive on structured, uninterrupted work sessions.",
    th: "สัตว์ประจำตัวสายโฟกัสลึกเติบโตได้ดีในเซสชันทำงานที่มีโครงสร้างชัดเจน",
    zh: "深度专注型原型在结构化、不被打断的工作时段中表现最佳。",
  },
  schema: pomodoroSchema,
  defaultConfig: { ...DEFAULT_POMODORO_CONFIG },
  Widget: PomodoroWidget,
  produces: [
    "pomodoro.sessionsToday",
    "pomodoro.focusMinutesToday",
    "pomodoro.weeklyFocusHours",
  ],
  consumes: [],
  excel: {
    buildSheet: (entries) => {
      const byDate = new Map<string, { sessions: number; focus: number }>();
      for (const e of entries) {
        const p = e.payload as Partial<PomodoroPayload>;
        const cur = byDate.get(e.entry_date) ?? { sessions: 0, focus: 0 };
        cur.sessions += p.sessions ?? 0;
        cur.focus += p.focus ?? 0;
        byDate.set(e.entry_date, cur);
      }
      const rows: Array<Array<string | number | boolean | null>> = Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => [date, v.sessions, v.focus]);
      const lastRow = rows.length + 1;
      rows.push(["Weekly Total", `=SUM(B2:B${lastRow})`, `=SUM(C2:C${lastRow})/60`]);
      return {
        name: "Pomodoro",
        headers: ["Date", "Sessions", "Focus Minutes"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Pomodoro sessions today", style: "label" },
      {
        address: "C2",
        value: typeof aggregates["pomodoro.sessionsToday"] === "number"
          ? aggregates["pomodoro.sessionsToday"]
          : 0,
        style: "metric",
      },
      { address: "B3", value: "Focus minutes today", style: "label" },
      {
        address: "C3",
        value: typeof aggregates["pomodoro.focusMinutesToday"] === "number"
          ? aggregates["pomodoro.focusMinutesToday"]
          : 0,
        style: "metric",
      },
    ],
  },
};
