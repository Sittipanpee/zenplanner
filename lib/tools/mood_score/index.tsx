import { BarChart3 } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolEntry } from "../types";
import { MoodScoreWidget } from "./widget";

// ---------- Schema ----------

export const moodScoreSchema = z.object({
  score: z.number().int().min(1).max(10),
});

export type MoodScorePayload = z.infer<typeof moodScoreSchema>;

// ---------- ToolDefinition ----------

export const moodScore: ToolDefinition = {
  id: "mood_score",
  category: "wellbeing",
  name: {
    en: "Mood Score",
    th: "คะแนนอารมณ์",
    zh: "心情评分",
  },
  description: {
    en: "Numeric daily mood score.",
    th: "คะแนนอารมณ์ประจำวันแบบตัวเลข",
    zh: "每日心情数字评分",
  },
  icon: BarChart3,
  color: "zen-rose",
  recommendedFor: ["whale", "sakura", "dove"],
  recommendationReason: {
    en: "Quantify mood for trend tracking.",
    th: "วัดอารมณ์เพื่อติดตามแนวโน้ม",
    zh: "量化心情以追踪趋势",
  },
  schema: moodScoreSchema,
  defaultConfig: {},
  Widget: MoodScoreWidget,
  produces: ["moodScore.today", "moodScore.weekAverage"],
  consumes: [],
  excel: {
    buildSheet: (entries: ToolEntry[]) => ({
      name: "Mood Score",
      headers: ["Date", "Score (1-10)", "Weekly Avg"],
      rows: entries.map((e, i) => {
        const p = e.payload as Partial<MoodScorePayload>;
        const row = entries.length - i;
        return [
          e.entry_date,
          typeof p.score === "number" ? p.score : "",
          `=AVERAGE(B${Math.max(2, row - 6)}:B${row})`,
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Mood score today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["moodScore.today"] === "number"
            ? (aggregates["moodScore.today"] as number)
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Week average", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["moodScore.weekAverage"] === "number"
            ? (aggregates["moodScore.weekAverage"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
