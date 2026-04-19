/**
 * Eisenhower Matrix — 2x2 task quadrant sorter. Server-safe. Widget in ./widget.
 */

import { AlignJustify } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { EisenhowerMatrixWidget } from "./widget";

const taskSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1).max(140),
  done: z.boolean(),
});

export const eisenhowerMatrixSchema = z.object({
  quadrants: z.object({
    do: z.array(taskSchema).max(4),
    schedule: z.array(taskSchema).max(4),
    delegate: z.array(taskSchema).max(4),
    delete: z.array(taskSchema).max(4),
  }),
});

export type EisenhowerMatrixPayload = z.infer<typeof eisenhowerMatrixSchema>;
export type EisenhowerQuadrant = "do" | "schedule" | "delegate" | "delete";

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const eisenhowerMatrix: ToolDefinition = {
  id: "eisenhower_matrix",
  category: "productivity",
  name: {
    en: "Eisenhower Matrix",
    th: "เมทริกซ์ไอเซนฮาวร์",
    zh: "艾森豪威尔矩阵",
  },
  description: {
    en: "Sort tasks by urgency and importance. Do / Schedule / Delegate / Delete.",
    th: "จัดเรียงงานตามความเร่งด่วนและความสำคัญ — ทำ/วางแผน/มอบหมาย/ลบ",
    zh: "按紧急性与重要性排序任务 — 做/排期/委派/删除",
  },
  icon: AlignJustify,
  color: "zen-clay",
  recommendedFor: ["lion", "eagle", "crocodile", "owl"],
  recommendationReason: {
    en: "Decisive planners need a visual sorter to attack the right work first.",
    th: "นักวางแผนเด็ดขาดต้องการเครื่องมือจัดลำดับภาพเพื่อลงมือทำงานสำคัญก่อน",
    zh: "果断的规划者需要可视化的分类器来优先处理正确的工作。",
  },
  schema: eisenhowerMatrixSchema,
  defaultConfig: {},
  Widget: EisenhowerMatrixWidget,
  produces: ["eisenhower.doCount", "eisenhower.scheduleCount"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = eisenhowerMatrixSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        const q = parsed.data.quadrants;
        rows.push([
          e.entry_date,
          q.do.length,
          q.schedule.length,
          q.delegate.length,
          q.delete.length,
          q.do.filter((t) => t.done).length,
        ]);
      }
      return {
        name: "Eisenhower Matrix",
        headers: ["Date", "Do", "Schedule", "Delegate", "Delete", "Do Done"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Urgent + Important today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["eisenhower.doCount"] === "number"
            ? aggregates["eisenhower.doCount"]
            : 0,
        style: "metric",
      },
    ],
  },
};
