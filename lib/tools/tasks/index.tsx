/**
 * Tasks — simple checkable task list.
 *
 * Server-safe module: ToolDefinition + Zod schema only. Widget lives in ./widget.
 */

import { CheckSquare } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { TasksWidget } from "./widget";

// ---------- Schema ----------

export const tasksSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().min(1).max(140),
        done: z.boolean(),
      })
    )
    .max(8),
});

export type TasksPayload = z.infer<typeof tasksSchema>;

// ---------- ToolDefinition ----------

export const tasks: ToolDefinition = {
  id: "tasks",
  category: "productivity",
  name: {
    en: "Tasks",
    th: "งานที่ต้องทำ",
    zh: "任务",
  },
  description: {
    en: "Simple checkable task list.",
    th: "รายการงานที่ติ๊กได้แบบเรียบง่าย",
    zh: "简单的可勾选任务列表",
  },
  icon: CheckSquare,
  color: "zen-sage",
  recommendedFor: ["fox", "lion", "wolf", "owl", "eagle"],
  recommendationReason: {
    en: "Universal capture for any planner.",
    th: "การจดบันทึกสากลสำหรับนักวางแผนทุกประเภท",
    zh: "适合任何规划者的通用记录",
  },
  schema: tasksSchema,
  defaultConfig: {},
  Widget: TasksWidget,
  produces: ["tasks.totalCount", "tasks.doneCount"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: Array<Array<string | number | boolean>> = [];
      for (const e of entries) {
        const parsed = tasksSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        for (const item of parsed.data.items) {
          rows.push([e.entry_date, item.text, item.done]);
        }
      }
      return {
        name: "Tasks",
        headers: ["Date", "Task", "Done?"],
        rows,
      };
    },
    buildDashboardSection: () => [
      {
        address: "B2",
        value: "Tasks completed this week",
        style: "label",
      },
      {
        address: "C2",
        value: "=SUM(...)",
        style: "metric",
      },
    ],
  },
};
