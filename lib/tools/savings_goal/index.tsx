/** Savings Goal — single goal with current/target progress. */
import { PiggyBank } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { SavingsGoalWidget } from "./widget";

export const savingsGoalSchema = z.object({
  label: z.string().max(80),
  currentAmount: z.number().min(0),
  targetAmount: z.number().min(1),
});

export const savingsGoal: ToolDefinition = {
  id: "savings_goal", category: "tracking",
  name: { en: "Savings Goal", th: "เป้าหมายการออม", zh: "储蓄目标" },
  description: {
    en: "One savings goal. Current vs target with a gradient progress bar.",
    th: "เป้าหมายออมเงินหนึ่งเป้า แสดงปัจจุบันเทียบกับเป้าหมาย",
    zh: "一个储蓄目标。当前 vs 目标，带渐变进度条。",
  },
  icon: PiggyBank, color: "zen-rose",
  recommendedFor: ["turtle", "bamboo", "mountain"],
  recommendationReason: {
    en: "Patient builders benefit from a visible long-term savings target.",
    th: "ผู้สร้างที่อดทนได้ประโยชน์จากเป้าหมายออมเงินระยะยาวที่มองเห็นได้",
    zh: "耐心的建设者受益于清晰可见的长期储蓄目标。",
  },
  schema: savingsGoalSchema,
  defaultConfig: { label: "", currentAmount: 0, targetAmount: 10000 },
  Widget: SavingsGoalWidget,
  produces: ["savings.progressPct"], consumes: [],
  excel: {
    buildSheet: (_e, config): WorkbookSheet => {
      const p = savingsGoalSchema.safeParse(config);
      const d = p.success ? p.data : { label: "", currentAmount: 0, targetAmount: 10000 };
      return {
        name: "Savings Goal",
        headers: ["Label", "Current", "Target", "% Progress"],
        rows: [[d.label, d.currentAmount, d.targetAmount, Math.round((d.currentAmount / d.targetAmount) * 100)]],
      };
    },
    buildDashboardSection: () => [
      { address: "B2", value: "Savings progress", style: "label" },
    ],
  },
};
