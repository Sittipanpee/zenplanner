/**
 * Generic ExcelJS tool-sheet builder.
 *
 * Translates abstract row data (mix of literals + Excel formula strings prefixed
 * with "=") into a styled worksheet with frozen header, data validation,
 * conditional formatting, and brand styling.
 *
 * Each tool template lives in `tool-templates.ts` and returns a `ToolSheetSpec`.
 * This module is the only place that touches ExcelJS Worksheet APIs for tool sheets.
 *
 * Cross-sheet reference mechanism (Wave 5 — EXCEL-E1):
 *   ToolSheetSpec supports two new optional fields:
 *   - `summaryCells`: a named-cell registry that this sheet exposes for others to pull from.
 *   - `consumesCell`: declarative cross-sheet references rendered as Excel cross-sheet formulas.
 *
 *   To resolve tool IDs → sheet specs at render time without creating circular imports,
 *   callers (e.g. sheet-builder.ts) must register specs via `registerSpecForToolId` before
 *   calling `buildToolSheet` for any sheet that uses `consumesCell`.
 */

import type { Workbook, Worksheet, DataValidation } from "exceljs";
import {
  HEADER_FILL,
  HEADER_FONT,
  TITLE_FONT,
  INPUT_FILL,
  ALL_BORDERS,
  CENTER,
  LEFT,
  FORMATS,
  COLORS,
} from "./styles";

export type CellValue = string | number | boolean | null;

export interface ColumnSpec {
  header: string;
  width?: number;
  /** numFmt or one of the FORMATS keys */
  format?: keyof typeof FORMATS | string;
  /** Whether this column is meant for user input (gets yellow fill) */
  input?: boolean;
  /** Optional data validation */
  validation?: DataValidation;
  /** Optional conditional format type */
  conditional?: "progress" | "moodScale" | "energyScale";
}

/**
 * Declarative cross-sheet reference. When a tool sheet wants to display a value
 * computed on another tool's sheet, declare it here rather than writing the formula
 * inline. The build pipeline resolves the target tool's summary cell address at
 * render time via the registered spec (see `registerSpecForToolId`).
 *
 * Example — Weekly Compass pulls "habits kept this week" from Habit Heatmap:
 *   consumesCell: [{
 *     address: "B16",
 *     label: "Habits kept this week",
 *     from: { toolId: "habit_heatmap", summaryKey: "weekTotalDone" },
 *   }]
 */
export interface ConsumesCellEntry {
  /** Cell address ON THIS SHEET where the cross-sheet formula is written (e.g. "B16") */
  address: string;
  /** Human-readable label placed in the adjacent column-A cell of the same row */
  label: string;
  from: {
    /** The ToolId string (kept as plain string to avoid circular imports) */
    toolId: string;
    /** Key in the target spec's `summaryCells` map */
    summaryKey: string;
  };
}

export interface ToolSheetSpec {
  /** Sheet tab name (max 31 chars) */
  name: string;
  /** Optional emoji or title to render in row 1 */
  title?: string;
  /** Optional category caption rendered under title */
  subtitle?: string;
  /** Column definitions; defines the table */
  columns: ColumnSpec[];
  /** Body rows. Strings beginning with "=" become real formulas. */
  rows: CellValue[][];
  /** Optional summary rows rendered after a blank row separator */
  summary?: Array<{ label: string; formula: string; format?: keyof typeof FORMATS }>;
  /**
   * Named cells THIS sheet exposes for cross-sheet consumption.
   * Key = semantic name used in other specs' consumesCell[].from.summaryKey.
   * Value = the cell address on THIS sheet that holds the value (e.g. "I15").
   */
  summaryCells?: Record<string, string>;
  /**
   * Declarative cross-sheet references to be written after all normal rows.
   * See ConsumesCellEntry for details.
   */
  consumesCell?: ConsumesCellEntry[];
}

// ---------------------------------------------------------------------------
// Cross-sheet spec registry — avoids circular imports between build-tool-sheet
// and tool-templates. Callers register specs before calling buildToolSheet.
// ---------------------------------------------------------------------------

/** Module-level registry: toolId (string) → ToolSheetSpec */
const _specRegistry = new Map<string, ToolSheetSpec>();

/**
 * Register a ToolSheetSpec under a toolId so that cross-sheet formula
 * resolution can look up the target tool's `name` and `summaryCells`.
 * Must be called before `buildToolSheet` is invoked for any spec that
 * references the registered toolId via `consumesCell`.
 */
export function registerSpecForToolId(toolId: string, spec: ToolSheetSpec): void {
  _specRegistry.set(toolId, spec);
}

/**
 * Look up the Excel sheet name (i.e. `safeSheetName(spec.name)`) for a given
 * toolId from the registry. Returns undefined if not registered.
 */
export function getSheetNameForToolId(toolId: string): string | undefined {
  const spec = _specRegistry.get(toolId);
  if (!spec) return undefined;
  return safeSheetName(spec.name);
}

/**
 * Look up the registered ToolSheetSpec for a toolId. Returns undefined if not registered.
 */
export function getRegisteredSpec(toolId: string): ToolSheetSpec | undefined {
  return _specRegistry.get(toolId);
}

/**
 * Shift a cell address column by `delta` columns.
 * e.g. shiftCol("B16", -1) => "A16"
 * Only handles single-letter column addresses (A–Z).
 */
function shiftCol(address: string, delta: number): string {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match) return address;
  const colStr = match[1];
  const rowStr = match[2];
  // Convert column letters to number, shift, convert back
  let colNum = 0;
  for (let i = 0; i < colStr.length; i++) {
    colNum = colNum * 26 + (colStr.charCodeAt(i) - 64);
  }
  colNum += delta;
  if (colNum < 1) colNum = 1;
  // Convert back to letters
  let result = "";
  let n = colNum;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result + rowStr;
}

/**
 * Sanitize a sheet name to Excel's 31-char + invalid-char rules.
 */
export function safeSheetName(name: string): string {
  return name.replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Sheet";
}

/**
 * Build a styled worksheet from a ToolSheetSpec.
 */
export function buildToolSheet(workbook: Workbook, spec: ToolSheetSpec): Worksheet {
  const ws = workbook.addWorksheet(safeSheetName(spec.name), {
    views: [{ state: "frozen", ySplit: spec.title ? 3 : 1 }],
  });

  // Title row
  let headerRowIdx = 1;
  if (spec.title) {
    ws.mergeCells(1, 1, 1, Math.max(spec.columns.length, 1));
    const titleCell = ws.getCell(1, 1);
    titleCell.value = spec.title;
    titleCell.font = TITLE_FONT;
    titleCell.alignment = LEFT;
    ws.getRow(1).height = 28;

    if (spec.subtitle) {
      ws.mergeCells(2, 1, 2, Math.max(spec.columns.length, 1));
      const sub = ws.getCell(2, 1);
      sub.value = spec.subtitle;
      sub.font = { italic: true, color: { argb: COLORS.zenIndigo }, size: 10 };
      sub.alignment = LEFT;
      headerRowIdx = 3;
    } else {
      headerRowIdx = 2;
    }
  }

  // Header row
  const headerRow = ws.getRow(headerRowIdx);
  spec.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER;
    cell.border = ALL_BORDERS;

    const wsCol = ws.getColumn(i + 1);
    wsCol.width = col.width ?? Math.max(12, col.header.length + 4);
  });
  headerRow.height = 22;

  // Data rows
  const firstDataRow = headerRowIdx + 1;
  spec.rows.forEach((row, rIdx) => {
    const excelRow = ws.getRow(firstDataRow + rIdx);
    spec.columns.forEach((col, cIdx) => {
      const raw = row[cIdx];
      const cell = excelRow.getCell(cIdx + 1);
      assignCellValue(cell, raw);

      cell.border = ALL_BORDERS;
      cell.alignment = LEFT;

      if (col.format) {
        const fmt = (FORMATS as Record<string, string>)[col.format] ?? col.format;
        cell.numFmt = fmt;
      }

      // Style empty input cells with yellow fill
      if (col.input && (raw === "" || raw === null || raw === undefined)) {
        cell.fill = INPUT_FILL;
      }
    });
  });

  // Apply column-level data validation across the data range
  const lastDataRow = firstDataRow + Math.max(spec.rows.length, 1) - 1;
  spec.columns.forEach((col, cIdx) => {
    if (!col.validation) return;
    for (let r = firstDataRow; r <= lastDataRow; r++) {
      ws.getCell(r, cIdx + 1).dataValidation = col.validation;
    }
  });

  // Conditional formatting per column
  spec.columns.forEach((col, cIdx) => {
    if (!col.conditional || spec.rows.length === 0) return;
    const colLetter = ws.getColumn(cIdx + 1).letter;
    const range = `${colLetter}${firstDataRow}:${colLetter}${lastDataRow}`;

    if (col.conditional === "progress") {
      ws.addConditionalFormatting({
        ref: range,
        rules: [
          {
            type: "dataBar",
            priority: 1,
            cfvo: [
              { type: "num", value: 0 },
              { type: "num", value: 1 },
            ],
            gradient: true,
          },
        ],
      });
    } else if (col.conditional === "moodScale" || col.conditional === "energyScale") {
      ws.addConditionalFormatting({
        ref: range,
        rules: [
          {
            type: "colorScale",
            priority: 1,
            cfvo: [
              { type: "num", value: 1 },
              { type: "num", value: 3 },
              { type: "num", value: 5 },
            ],
            color: [
              { argb: COLORS.zenBlossom },
              { argb: COLORS.zenGold },
              { argb: COLORS.zenSage },
            ],
          },
        ],
      });
    }
  });

  // Summary block
  if (spec.summary && spec.summary.length > 0) {
    const summaryStart = lastDataRow + 2;
    spec.summary.forEach((s, i) => {
      const labelCell = ws.getCell(summaryStart + i, 1);
      labelCell.value = s.label;
      labelCell.font = { bold: true };
      labelCell.alignment = LEFT;

      const valueCell = ws.getCell(summaryStart + i, 2);
      assignCellValue(valueCell, s.formula);
      if (s.format) {
        const fmt = (FORMATS as Record<string, string>)[s.format] ?? s.format;
        valueCell.numFmt = fmt;
      }
      valueCell.font = { bold: true, color: { argb: COLORS.zenIndigo } };
    });
  }

  // Cross-sheet consumesCell block
  // Resolves each entry against the registered spec registry and writes
  // an Excel cross-sheet formula of the form ='Target Sheet'!<cell>.
  if (spec.consumesCell && spec.consumesCell.length > 0) {
    for (const entry of spec.consumesCell) {
      const targetSheetName = getSheetNameForToolId(entry.from.toolId);
      const targetSpec = getRegisteredSpec(entry.from.toolId);
      const targetCell = targetSpec?.summaryCells?.[entry.from.summaryKey];

      if (!targetSheetName || !targetCell) {
        // Target not registered or summary key missing — skip silently but leave
        // a label so the sheet is not completely empty at that address.
        const labelAddress = shiftCol(entry.address, -1);
        ws.getCell(labelAddress).value = entry.label;
        ws.getCell(labelAddress).font = { italic: true, color: { argb: "FF999999" } };
        ws.getCell(entry.address).value = "#REF — target not loaded";
        continue;
      }

      // Write label in the column immediately to the left of the value address
      const labelAddress = shiftCol(entry.address, -1);
      const labelCell = ws.getCell(labelAddress);
      labelCell.value = entry.label;
      labelCell.font = { bold: true };
      labelCell.alignment = LEFT;

      // Write the cross-sheet formula
      const valueCell = ws.getCell(entry.address);
      valueCell.value = {
        formula: `'${targetSheetName}'!${targetCell}`,
        result: 0,
      };
      valueCell.font = { bold: true, color: { argb: COLORS.zenIndigo } };
      valueCell.numFmt = "#,##0";
    }
  }

  return ws;
}

function assignCellValue(cell: import("exceljs").Cell, raw: CellValue): void {
  if (raw === null || raw === undefined) {
    cell.value = null;
    return;
  }
  if (typeof raw === "string" && raw.startsWith("=")) {
    cell.value = { formula: raw.substring(1) };
    return;
  }
  cell.value = raw as string | number | boolean;
}
