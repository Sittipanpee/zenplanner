/**
 * Workout Log — log exercises with sets/reps/minutes.
 */

import { Dumbbell } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { WorkoutLogWidget } from "./widget";

export const workoutLogSchema = z.object({
  exercises: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(80),
        sets: z.number().int().min(1).max(20),
        reps: z.number().int().min(0).max(100),
        minutes: z.number().int().min(0).max(240),
      })
    )
    .max(10),
});

export type WorkoutLogPayload = z.infer<typeof workoutLogSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const workoutLog: ToolDefinition = {
  id: "workout_log",
  category: "wellbeing",
  name: {
    en: "Workout Log",
    th: "บันทึกการออกกำลังกาย",
    zh: "训练日志",
  },
  description: {
    en: "Log exercises with sets, reps, and duration. Track your training load.",
    th: "บันทึกการออกกำลังกายพร้อมเซ็ต เรพ และเวลา ติดตามภาระการฝึก",
    zh: "记录动作、组数、次数与时长，追踪训练量。",
  },
  icon: Dumbbell,
  color: "zen-rose",
  recommendedFor: ["lion", "wolf", "mountain", "eagle"],
  recommendationReason: {
    en: "Action-driven archetypes thrive on measurable physical progress.",
    th: "สายลงมือทำเติบโตได้ดีเมื่อความก้าวหน้าทางกายภาพวัดได้",
    zh: "行动型原型在可衡量的身体进步中成长。",
  },
  schema: workoutLogSchema,
  defaultConfig: {},
  Widget: WorkoutLogWidget,
  produces: ["workout.minutesToday", "workout.exerciseCount"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = workoutLogSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        for (const ex of parsed.data.exercises) {
          rows.push([e.entry_date, ex.name, ex.sets, ex.reps, ex.minutes]);
        }
      }
      return {
        name: "Workout Log",
        headers: ["Date", "Exercise", "Sets", "Reps", "Minutes"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Workout minutes today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["workout.minutesToday"] === "number"
            ? aggregates["workout.minutesToday"]
            : 0,
        style: "metric",
      },
    ],
  },
};
