/** Books Log — minimal log-style tool. Server-safe. */
import { BookOpen } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { BooksLogWidget } from "./widget";

export const booksLogSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const booksLog: ToolDefinition = {
  id: "books_log", category: "tracking",
  name: { en: "Books Log", th: "บันทึกหนังสือ", zh: "读书记录" },
  description: { en: "Track what you're reading.", th: "ติดตามสิ่งที่คุณกำลังอ่าน", zh: "追踪你正在读的书" },
  icon: BookOpen, color: "zen-sage",
  recommendedFor: ["owl", "whale", "cat"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: booksLogSchema, defaultConfig: {}, Widget: BooksLogWidget,
  produces: ["books.activeCount"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = booksLogSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Books Log", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
