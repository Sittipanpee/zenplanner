/**
 * Habit Tracker — server-safe ToolDefinition. Widget lives in ./widget.
 */

import { Repeat } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { HabitTrackerWidget } from "./widget";

// ---------- Schema ----------

export const habitTrackerSchema = z.object({
  habits: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(80),
        done: z.boolean(),
      })
    )
    .min(0)
    .max(10),
});

export type HabitTrackerPayload = z.infer<typeof habitTrackerSchema>;

interface HabitConfig {
  habitList: string[];
}

export const DEFAULT_HABITS = ["Drink water", "Exercise", "Read 10 min"];

// ---------- ToolDefinition ----------

export const habitTracker: ToolDefinition = {
  id: "habit_tracker",
  category: "wellbeing",
  name: {
    en: "Habit Tracker",
    th: "ตัวติดตามนิสัย",
    zh: "习惯追踪",
  },
  description: {
    en: "Check off your daily habits.",
    th: "ติ๊กนิสัยประจำวันของคุณ",
    zh: "勾选你的每日习惯",
  },
  icon: Repeat,
  color: "zen-blossom",
  recommendedFor: [
    "lion",
    "turtle",
    "mountain",
    "owl",
    "eagle",
    "wolf",
    "crocodile",
    "bamboo",
  ],
  recommendationReason: {
    en: "Daily check-offs build the steady consistency that disciplined and structured planners thrive on.",
    th: "การติ๊กรายวันสร้างความสม่ำเสมอที่ผู้มีวินัยและรักโครงสร้างเติบโตได้",
    zh: "每日打卡积累稳定的坚持，让自律与结构型规划者茁壮成长。",
  },
  schema: habitTrackerSchema,
  defaultConfig: {
    habitList: DEFAULT_HABITS,
  },
  Widget: HabitTrackerWidget,
  produces: ["habit.completionRate", "habit.streakDays", "habit.doneToday"],
  consumes: [],
  excel: {
    buildSheet: (entries, config): WorkbookSheet => {
      const cfg = config as Partial<HabitConfig>;
      const habits =
        Array.isArray(cfg.habitList) && cfg.habitList.length > 0
          ? cfg.habitList
          : DEFAULT_HABITS;
      return {
        name: "Habit Tracker",
        headers: ["Date", ...habits],
        rows: entries.map((e) => {
          const parsed = habitTrackerSchema.safeParse(e.payload);
          const doneByName = new Map<string, boolean>();
          if (parsed.success) {
            parsed.data.habits.forEach((h) => doneByName.set(h.name, h.done));
          }
          return [
            e.entry_date,
            ...habits.map((name) => doneByName.get(name) === true),
          ];
        }),
      };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Habit Completion Rate", style: "label" },
      { address: "C2", value: "=AVERAGE(...)", style: "metric" },
      { address: "B3", value: "Current Streak", style: "label" },
      { address: "C3", value: "=MAX(...)", style: "metric" },
    ],
  },
};
