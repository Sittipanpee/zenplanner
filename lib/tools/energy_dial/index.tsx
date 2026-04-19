import { Activity } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition } from "../types";
import { EnergyDialWidget } from "./widget";

// ---------- Schema ----------

export const energyDialSchema = z.object({
  level: z.number().int().min(1).max(5),
  checkedAt: z.string(),
});

export type EnergyDialPayload = z.infer<typeof energyDialSchema>;

// ---------- ToolDefinition ----------

export const energyDial: ToolDefinition = {
  id: "energy_dial",
  category: "wellbeing",
  name: {
    en: "Energy Dial",
    th: "ตัวหมุนพลังงาน",
    zh: "能量仪表",
  },
  description: {
    en: "One-tap 5-point energy check-in.",
    th: "เช็กอินพลังงาน 5 ระดับด้วยการแตะครั้งเดียว",
    zh: "一键 5 档能量打卡",
  },
  icon: Activity,
  color: "zen-amber",
  recommendedFor: ["fox", "dolphin", "butterfly"],
  recommendationReason: {
    en: "One-tap energy check-in.",
    th: "เช็กอินพลังงานด้วยการแตะครั้งเดียว",
    zh: "一键能量打卡",
  },
  schema: energyDialSchema,
  defaultConfig: {},
  Widget: EnergyDialWidget,
  produces: ["energyDial.currentLevel", "energyDial.checkInsToday"],
  consumes: [],
  excel: {
    buildSheet: (entries) => {
      const rows: Array<Array<string | number | boolean | null>> = entries.map(
        (e) => {
          const p = e.payload as Partial<EnergyDialPayload>;
          return [
            e.entry_date,
            p.checkedAt ?? e.created_at,
            p.level ?? null,
          ];
        }
      );
      return {
        name: "Energy Dial",
        headers: ["Date", "Checked At", "Level (1-5)"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Current energy (1-5)", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["energyDial.currentLevel"] === "number"
            ? aggregates["energyDial.currentLevel"]
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Check-ins today", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["energyDial.checkInsToday"] === "number"
            ? aggregates["energyDial.checkInsToday"]
            : 0,
        style: "metric",
      },
    ],
  },
};
