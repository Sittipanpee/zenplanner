/** Kanban Board — 3-column task flow. Server-safe. */
import { ClipboardList } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { KanbanBoardWidget } from "./widget";

export type KanbanColumn = "todo" | "doing" | "done";

export const kanbanBoardSchema = z.object({
  cards: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(140),
    column: z.enum(["todo", "doing", "done"]),
  })).max(15),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const kanbanBoard: ToolDefinition = {
  id: "kanban_board", category: "productivity",
  name: { en: "Kanban Board", th: "กระดานคัมบัง", zh: "看板" },
  description: {
    en: "To Do → Doing → Done. Flexible 3-column workflow.",
    th: "ทำต่อ → กำลังทำ → เสร็จแล้ว เวิร์กโฟลว์ 3 คอลัมน์",
    zh: "待办 → 进行中 → 完成，3 列灵活工作流",
  },
  icon: ClipboardList, color: "zen-sage",
  recommendedFor: ["fox", "octopus", "butterfly"],
  recommendationReason: {
    en: "Parallel thinkers need a visual board to see all their work at once.",
    th: "นักคิดแบบขนานต้องการกระดานเพื่อเห็นงานทั้งหมดพร้อมกัน",
    zh: "并行思考者需要可视化的板来同时查看所有工作。",
  },
  schema: kanbanBoardSchema, defaultConfig: {}, Widget: KanbanBoardWidget,
  produces: ["kanban.todoCount", "kanban.doneCount"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = kanbanBoardSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const c of p.data.cards) rows.push([e.entry_date, c.column, c.text]);
      }
      return { name: "Kanban Board", headers: ["Date", "Column", "Task"], rows };
    },
    buildDashboardSection: (a) => [
      { address: "B2", value: "Kanban in progress", style: "label" },
      { address: "C2", value: typeof a["kanban.doneCount"] === "number" ? a["kanban.doneCount"] : 0, style: "metric" },
    ],
  },
};
