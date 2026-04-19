/**
 * Expense Log — track every expense by category.
 */

import { CreditCard } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { ExpenseLogWidget } from "./widget";

export const expenseLogSchema = z.object({
  expenses: z
    .array(
      z.object({
        id: z.string().min(1),
        amount: z.number().min(0),
        category: z.enum(["food", "transport", "shopping", "bills", "fun", "other"]),
        note: z.string().max(80),
      })
    )
    .max(15),
});

export type ExpenseLogPayload = z.infer<typeof expenseLogSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const expenseLog: ToolDefinition = {
  id: "expense_log",
  category: "tracking",
  name: {
    en: "Expense Log",
    th: "บันทึกค่าใช้จ่าย",
    zh: "支出日志",
  },
  description: {
    en: "Track every expense by category. Daily snapshot, no budgeting.",
    th: "บันทึกค่าใช้จ่ายทุกรายการตามหมวดหมู่ แบบรายวัน ไม่ต้องตั้งงบประมาณ",
    zh: "按类别记录每笔支出。每日快照，不做预算。",
  },
  icon: CreditCard,
  color: "zen-clay",
  recommendedFor: ["crocodile", "owl", "mountain"],
  recommendationReason: {
    en: "Detail-oriented archetypes benefit from honest daily money tracking.",
    th: "สายใส่ใจรายละเอียดได้ประโยชน์จากการบันทึกเงินประจำวันแบบซื่อสัตย์",
    zh: "注重细节的原型受益于诚实的日常金钱追踪。",
  },
  schema: expenseLogSchema,
  defaultConfig: {},
  Widget: ExpenseLogWidget,
  produces: ["expense.todayTotal", "expense.categoryBreakdown"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = expenseLogSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        for (const x of parsed.data.expenses) {
          rows.push([e.entry_date, x.amount, x.category, x.note]);
        }
      }
      return {
        name: "Expense Log",
        headers: ["Date", "Amount", "Category", "Note"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Expenses today", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["expense.todayTotal"] === "number"
            ? aggregates["expense.todayTotal"]
            : 0,
        style: "metric",
      },
    ],
  },
};
