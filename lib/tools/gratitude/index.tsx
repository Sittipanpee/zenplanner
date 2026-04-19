import { Heart } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolEntry } from "../types";
import { GratitudeWidget } from "./widget";

// ---------- Schema ----------

export const gratitudeSchema = z.object({
  items: z.array(z.string().min(1).max(200)).min(1).max(5),
});

export type GratitudePayload = z.infer<typeof gratitudeSchema>;

// ---------- ToolDefinition ----------

export const gratitude: ToolDefinition = {
  id: "gratitude",
  category: "reflection",
  name: {
    en: "Gratitude",
    th: "ความขอบคุณ",
    zh: "感恩日记",
  },
  description: {
    en: "Three things you're grateful for today.",
    th: "สามสิ่งที่คุณขอบคุณในวันนี้",
    zh: "今天你感激的三件事",
  },
  icon: Heart,
  color: "zen-blossom",
  recommendedFor: ["dove", "sakura", "butterfly", "whale", "bamboo", "cat", "turtle"],
  recommendationReason: {
    en: "A reflective practice that nurtures gentle, appreciative hearts.",
    th: "การฝึกใคร่ครวญที่หล่อเลี้ยงหัวใจที่อ่อนโยนและรู้คุณค่า",
    zh: "一种滋养温柔感恩之心的反思练习",
  },
  schema: gratitudeSchema,
  defaultConfig: {},
  Widget: GratitudeWidget,
  produces: ["gratitude.count", "gratitude.streakDays"],
  consumes: [],
  excel: {
    buildSheet: (entries: ToolEntry[]) => ({
      name: "Gratitude",
      headers: ["Date", "Item 1", "Item 2", "Item 3"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<GratitudePayload>;
        const items = p.items ?? [];
        return [e.entry_date, items[0] ?? "", items[1] ?? "", items[2] ?? ""];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Gratitude entries", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["gratitude.count"] === "number"
            ? (aggregates["gratitude.count"] as number)
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Streak (days)", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["gratitude.streakDays"] === "number"
            ? (aggregates["gratitude.streakDays"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
