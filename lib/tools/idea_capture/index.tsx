/**
 * Idea Capture — save ideas before they vanish. Starrable, with notes.
 */

import { Rocket } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { IdeaCaptureWidget } from "./widget";

export const ideaCaptureSchema = z.object({
  ideas: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1).max(120),
        notes: z.string().max(400),
        starred: z.boolean(),
      })
    )
    .max(10),
});

export type IdeaCapturePayload = z.infer<typeof ideaCaptureSchema>;

export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const ideaCapture: ToolDefinition = {
  id: "idea_capture",
  category: "creativity",
  name: {
    en: "Idea Capture",
    th: "จับไอเดีย",
    zh: "灵感捕捉",
  },
  description: {
    en: "Save ideas before they vanish. Star the best ones.",
    th: "บันทึกไอเดียก่อนที่จะลืม ติดดาวไอเดียดีๆ",
    zh: "在灵感消失前记录下来，给最好的加星标。",
  },
  icon: Rocket,
  color: "zen-amber",
  recommendedFor: ["butterfly", "fox", "octopus", "dolphin"],
  recommendationReason: {
    en: "Fast-burning archetypes generate ideas faster than they can remember.",
    th: "สายความคิดไวผลิตไอเดียเร็วกว่าจะจำได้ทัน",
    zh: "思维飞快的原型产生想法的速度超过记忆能力。",
  },
  schema: ideaCaptureSchema,
  defaultConfig: {},
  Widget: IdeaCaptureWidget,
  produces: ["ideas.count", "ideas.starredCount"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const parsed = ideaCaptureSchema.safeParse(e.payload);
        if (!parsed.success) continue;
        for (const idea of parsed.data.ideas) {
          rows.push([e.entry_date, idea.starred ? "⭐" : "", idea.title, idea.notes]);
        }
      }
      return {
        name: "Idea Capture",
        headers: ["Date", "Star", "Title", "Notes"],
        rows,
      };
    },
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Ideas captured today", style: "label" },
      {
        address: "C2",
        value: typeof aggregates["ideas.count"] === "number" ? aggregates["ideas.count"] : 0,
        style: "metric",
      },
    ],
  },
};
