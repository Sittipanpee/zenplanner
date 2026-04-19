/** Focus Blocks — reserve deep-focus windows each day. Server-safe. */
import { Crosshair } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, WorkbookSheet } from "../types";
import { FocusBlocksWidget } from "./widget";

export const focusBlocksSchema = z.object({
  blocks: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1).max(80),
    minutes: z.number().int().min(15).max(240),
    done: z.boolean(),
  })).max(4),
});

export function todayIso(d = new Date()): string {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10);
}

export const focusBlocks: ToolDefinition = {
  id: "focus_blocks", category: "productivity",
  name: { en: "Focus Blocks", th: "บล็อกโฟกัส", zh: "专注时段" },
  description: {
    en: "Reserve deep-focus windows each day. Max 4 blocks.",
    th: "จองเวลาโฟกัสลึกในแต่ละวัน สูงสุด 4 บล็อก",
    zh: "每天预留深度专注时段，最多 4 个。",
  },
  icon: Crosshair, color: "zen-clay",
  recommendedFor: ["owl", "mountain"],
  recommendationReason: {
    en: "Deep workers need protected windows to avoid context switching.",
    th: "ผู้ทำงานเชิงลึกต้องการช่วงเวลาปกป้องเพื่อหลีกเลี่ยงการสลับบริบท",
    zh: "深度工作者需要受保护的时段以避免上下文切换。",
  },
  schema: focusBlocksSchema, defaultConfig: {}, Widget: FocusBlocksWidget,
  produces: ["focusBlocks.completedToday"], consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => {
      const rows: (string | number | boolean)[][] = [];
      for (const e of entries) {
        const p = focusBlocksSchema.safeParse(e.payload);
        if (!p.success) continue;
        for (const b of p.data.blocks) rows.push([e.entry_date, b.label, b.minutes, b.done]);
      }
      return { name: "Focus Blocks", headers: ["Date", "Block", "Minutes", "Done"], rows };
    },
    buildDashboardSection: (a) => [
      { address: "B2", value: "Focus blocks done today", style: "label" },
      { address: "C2", value: typeof a["focusBlocks.completedToday"] === "number" ? a["focusBlocks.completedToday"] : 0, style: "metric" },
    ],
  },
};
