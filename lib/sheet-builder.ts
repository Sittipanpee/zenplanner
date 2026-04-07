/**
 * ZenPlanner Sheet Builder — ExcelJS edition (PTS-00 Phase M4).
 *
 * Replaces the legacy SheetJS implementation with ExcelJS to deliver:
 *   - Real bound formulas (not formula strings rendered as text)
 *   - A Dashboard sheet (first tab) aggregating KPIs across tool sheets
 *   - Styled input cells, borders, freeze panes, conditional formatting
 *   - Data validation dropdowns
 *   - Output that opens correctly in both Excel and Google Sheets
 *
 * The legacy generator is preserved at `lib/planner-generator.sheetjs.ts.bak`.
 *
 * Public API is unchanged: `generatePlannerWorkbook(config)` returns an
 * `ArrayBuffer` containing a valid `.xlsx` file.
 */

import ExcelJS from "exceljs";
import type { ToolId, PlannerBlueprint } from "./types";
import { TOOL_INFO } from "./archetype-map";
import { buildDashboardSheet } from "./excel/build-dashboard-sheet";
import { buildToolSheet } from "./excel/build-tool-sheet";
import { getToolSpec } from "./excel/tool-templates";

const DEBUG = process.env.DEBUG_MODE === "true";
function dbg(...args: unknown[]): void {
  if (DEBUG) console.log("[DBG][sheet-builder]", ...args);
}

export interface SheetConfig {
  blueprint: PlannerBlueprint;
  format: "google_sheets" | "excel_vba";
}

/**
 * Generate planner workbook from blueprint.
 *
 * Returns an ArrayBuffer containing a fully-formed .xlsx file. The signature
 * is preserved from the legacy SheetJS implementation so all existing callers
 * (planner-generator.ts, /api/planner/* routes) keep working unchanged.
 */
export async function generatePlannerWorkbook(
  config: SheetConfig
): Promise<ArrayBuffer> {
  dbg("generatePlannerWorkbook called");
  const { blueprint } = config;

  if (!blueprint) {
    throw new Error("Blueprint is undefined");
  }
  if (!blueprint.tool_selection || !Array.isArray(blueprint.tool_selection)) {
    throw new Error(
      "Invalid tool_selection: " + JSON.stringify(blueprint.tool_selection)
    );
  }

  const toolIds = blueprint.tool_selection as ToolId[];
  dbg("tool_selection:", toolIds);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ZenPlanner";
  workbook.created = new Date();
  workbook.title = blueprint.title ?? "ZenPlanner";

  // Dashboard MUST be the first sheet so it's the tab users see on open.
  buildDashboardSheet(workbook, toolIds, blueprint.title ?? "ZenPlanner");

  // Tool sheets
  for (const toolId of toolIds) {
    const info = TOOL_INFO[toolId];
    if (!info) {
      dbg("[SKIP] Unknown tool id (not in TOOL_INFO):", toolId);
      continue;
    }
    try {
      const spec = getToolSpec(toolId, info.name, info.description);
      buildToolSheet(workbook, spec);
    } catch (err) {
      dbg("[SKIP] Failed to build sheet for", toolId, "reason:", err);
      // Best-effort: never let one bad tool break the whole workbook.
    }
  }

  dbg("Writing workbook to buffer…");
  const buffer = await workbook.xlsx.writeBuffer();
  dbg("Buffer byteLength:", buffer.byteLength);

  if (!buffer || buffer.byteLength === 0) {
    throw new Error("ExcelJS produced an empty buffer");
  }

  // ExcelJS returns an ArrayBuffer in browser-like envs but a Buffer in Node;
  // normalize to ArrayBuffer for the existing API surface.
  if (buffer instanceof ArrayBuffer) return buffer;
  const nodeBuf = buffer as unknown as Buffer;
  return nodeBuf.buffer.slice(
    nodeBuf.byteOffset,
    nodeBuf.byteOffset + nodeBuf.byteLength
  ) as ArrayBuffer;
}
