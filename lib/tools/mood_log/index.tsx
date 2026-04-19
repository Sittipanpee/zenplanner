import { Smile } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolEntry } from "../types";
import { MoodLogWidget } from "./widget";

// ---------- Schema ----------

export const moodLogSchema = z.object({
  mood: z.number().int().min(1).max(5),
  note: z.string().max(200).optional(),
});

export type MoodLogPayload = z.infer<typeof moodLogSchema>;

// ---------- ToolDefinition ----------

export const moodLog: ToolDefinition = {
  id: "mood_log",
  category: "wellbeing",
  name: {
    en: "Mood Log",
    th: "บันทึกอารมณ์",
    zh: "心情记录",
  },
  description: {
    en: "Tap an emoji to log how you feel today.",
    th: "แตะอีโมจิเพื่อบันทึกอารมณ์ของวันนี้",
    zh: "点击表情记录今天的心情",
  },
  icon: Smile,
  color: "zen-gold",
  recommendedFor: ["whale", "butterfly", "dove", "sakura", "cat", "bamboo", "octopus"],
  recommendationReason: {
    en: "A gentle daily check-in for reflective and sensitive souls.",
    th: "การเช็คอินรายวันที่อ่อนโยนสำหรับจิตใจที่ละเอียดอ่อน",
    zh: "为细腻心灵设计的温柔每日心情记录",
  },
  schema: moodLogSchema,
  defaultConfig: {},
  Widget: MoodLogWidget,
  produces: ["mood.today", "mood.weekAverage", "mood.trend"],
  consumes: [],
  excel: {
    buildSheet: (entries: ToolEntry[]) => ({
      name: "Mood Log",
      headers: ["Date", "Mood (1-5)", "Note", "Weekly Avg"],
      rows: entries.map((e, i) => {
        const p = e.payload as Partial<MoodLogPayload>;
        const row = entries.length - i;
        return [
          e.entry_date,
          typeof p.mood === "number" ? p.mood : "",
          p.note ?? "",
          `=AVERAGE(B${Math.max(2, row - 6)}:B${row})`,
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Mood today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["mood.today"] === "number"
            ? (aggregates["mood.today"] as number)
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Week average", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["mood.weekAverage"] === "number"
            ? (aggregates["mood.weekAverage"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
