/** Quick Finance — minimal log-style tool. Server-safe. */
import { Wallet } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { FinanceQuickWidget } from "./widget";

export const financeQuickSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    text: z.string().min(1).max(200),
  })).max(10),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const financeQuick: ToolDefinition = {
  id: "finance_quick", category: "tracking",
  name: { en: "Quick Finance", th: "การเงินด่วน", zh: "快速财务" },
  description: { en: "One-line money tracking. No categories, no fuss.", th: "ติดตามเงินบรรทัดเดียว ไม่ต้องแยกหมวด", zh: "单行财务追踪，无需分类" },
  icon: Wallet, color: "zen-amber",
  recommendedFor: ["crocodile", "mountain", "turtle"],
  recommendationReason: {
    en: "Simple daily capture keeps intentional behavior in view.",
    th: "การบันทึกประจำวันแบบง่ายทำให้พฤติกรรมที่ตั้งใจไว้อยู่ในสายตา",
    zh: "简单的每日记录让有意识的行为始终可见。",
  },
  schema: financeQuickSchema, defaultConfig: {}, Widget: FinanceQuickWidget,
  produces: ["finance.entriesToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = financeQuickSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const i of p.data.items) rows.push([e.entry_date, i.text]);
      }
      return { name: "Quick Finance", headers: ["Date", "Entry"], rows };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Entries today", style: "label" },
    ],
  },
};
