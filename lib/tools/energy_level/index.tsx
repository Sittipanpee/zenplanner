import { Zap } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { EnergyLevelWidget } from "./widget";

// ---------- Schema ----------

export const energyLevelSchema = z.object({
  level: z.number().int().min(1).max(10),
  timeOfDay: z.string().optional(),
});

export type EnergyLevelPayload = z.infer<typeof energyLevelSchema>;

// ---------- ToolDefinition ----------

export const energyLevel: ToolDefinition = {
  id: "energy_level",
  category: "wellbeing",
  name: {
    en: "Energy Level",
    th: "ระดับพลังงาน",
    zh: "能量水平",
  },
  description: {
    en: "Log your energy from 1 to 10 throughout the day.",
    th: "บันทึกระดับพลังงาน 1 ถึง 10 ตลอดทั้งวัน",
    zh: "记录一天中 1 到 10 的能量水平。",
  },
  icon: Zap,
  color: "zen-gold",
  recommendedFor: ["dolphin", "fox", "butterfly", "octopus", "dove", "cat", "bamboo"],
  recommendationReason: {
    en: "Flow-state archetypes benefit from tracking their natural energy rhythms.",
    th: "สัตว์สายโฟลว์เรียนรู้จังหวะพลังงานตามธรรมชาติของตนได้ดีขึ้น",
    zh: "心流型原型通过追踪自然能量节律而受益。",
  },
  schema: energyLevelSchema,
  defaultConfig: {},
  Widget: EnergyLevelWidget,
  produces: ["energy.currentLevel", "energy.dailyAverage", "energy.weekPattern"],
  consumes: [],
  excel: {
    buildSheet: (entries) => {
      const rows: Array<Array<string | number | boolean | null>> = entries.map((e) => {
        const p = e.payload as Partial<EnergyLevelPayload>;
        return [e.entry_date, p.timeOfDay ?? e.created_at, p.level ?? 0];
      });
      const lastRow = rows.length + 1;
      rows.push(["Daily Average", "", `=AVERAGE(C2:C${lastRow})`]);
      return {
        name: "Energy Level",
        headers: ["Date", "Time", "Level"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Current energy", style: "label" },
      {
        address: "C2",
        value: typeof aggregates["energy.currentLevel"] === "number"
          ? aggregates["energy.currentLevel"]
          : 0,
        style: "metric",
      },
      { address: "B3", value: "Daily average", style: "label" },
      {
        address: "C3",
        value: typeof aggregates["energy.dailyAverage"] === "number"
          ? aggregates["energy.dailyAverage"]
          : 0,
        style: "metric",
      },
    ],
  },
};
