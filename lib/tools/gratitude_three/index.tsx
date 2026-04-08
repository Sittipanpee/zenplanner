/**
 * 3 Gratitudes — fixed 3-slot daily gratitude practice.
 */

import { Heart } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { GratitudeThreeWidget } from "./widget";

export const gratitudeThreeSchema = z.object({
  items: z.array(z.string().min(1).max(200)).max(3),
});

export type GratitudeThreePayload = z.infer<typeof gratitudeThreeSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const gratitudeThree: ToolDefinition = {
  id: "gratitude_three",
  category: "reflection",
  name: {
    en: "3 Gratitudes",
    th: "3 ความกรัทัญญู",
    zh: "三件感恩",
  },
  description: {
    en: "Three things you're grateful for, every day. Short prompt, big effect.",
    th: "สามสิ่งที่คุณรู้สึกขอบคุณในแต่ละวัน แบบสั้นๆ แต่ทรงพลัง",
    zh: "每天三件值得感恩的事。简短提示，巨大影响。",
  },
  icon: Heart,
  color: "zen-blossom",
  recommendedFor: ["sakura", "dove", "whale", "cat"],
  recommendationReason: {
    en: "Simple, reflective archetypes benefit from structured daily gratitude.",
    th: "สายสะท้อนเรียบง่ายได้ประโยชน์จากกิจวัตรขอบคุณประจำวัน",
    zh: "简单、反思型原型从结构化的每日感恩中受益。",
  },
  schema: gratitudeThreeSchema,
  defaultConfig: {},
  Widget: GratitudeThreeWidget,
  produces: ["gratitude3.streakDays"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = gratitudeThreeSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        const items = parsed.data.items;
        rows.push([e.entry_date, items[0] ?? "", items[1] ?? "", items[2] ?? ""]);
      }
      return {
        name: "3 Gratitudes",
        headers: ["Date", "Gratitude 1", "Gratitude 2", "Gratitude 3"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "3-gratitudes streak", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["gratitude3.streakDays"] === "number"
            ? aggregates["gratitude3.streakDays"]
            : 0,
        style: "metric",
      },
    ],
  },
};
