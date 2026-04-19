/**
 * Goals Tracker — persistent goals with 0-100% progress sliders.
 * Stored in config (not per-day entries) since goals persist across days.
 */

import { Goal } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { GoalsTrackerWidget } from "./widget";

export const goalsTrackerSchema = z.object({
  goals: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1).max(140),
        progress: z.number().int().min(0).max(100),
      })
    )
    .max(8),
});

export type GoalsTrackerPayload = z.infer<typeof goalsTrackerSchema>;

export const goalsTracker: ToolDefinition = {
  id: "goals_tracker",
  category: "tracking",
  name: {
    en: "Goals Tracker",
    th: "ตัวติดตามเป้าหมาย",
    zh: "目标追踪",
  },
  description: {
    en: "Track long-term goals with 0-100% progress sliders.",
    th: "ติดตามเป้าหมายระยะยาวด้วยแถบเปอร์เซ็นต์ความก้าวหน้า",
    zh: "用 0-100% 进度条追踪长期目标。",
  },
  icon: Goal,
  color: "zen-amber",
  recommendedFor: ["lion", "eagle", "mountain", "crocodile"],
  recommendationReason: {
    en: "Long-horizon goals give visionary archetypes a persistent north star.",
    th: "เป้าหมายระยะยาวให้ทิศทางคงที่แก่สัตว์สายวิสัยทัศน์",
    zh: "长期目标为远见型原型提供持续的北极星。",
  },
  schema: goalsTrackerSchema,
  defaultConfig: { goals: [] },
  Widget: GoalsTrackerWidget,
  produces: ["goals.count", "goals.averageProgress"],
  consumes: [],
  excel: {
    buildSheet: (_entries, config): WorkbookSheet => {
      const raw = (config as { goals?: unknown })?.goals;
      const parsed = goalsTrackerSchema.safeParse({ goals: raw });
      const goals = parsed.success ? parsed.data.goals : [];
      return {
        name: "Goals Tracker",
        headers: ["Goal", "Progress %"],
        rows: goals.map((g) => [g.text, g.progress]),
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Goals tracked", style: "label" },
      {
        address: "C2",
        value: typeof aggregates["goals.count"] === "number" ? aggregates["goals.count"] : 0,
        style: "metric",
      },
    ],
  },
};
