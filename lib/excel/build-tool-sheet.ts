/**
 * Generic ExcelJS tool-sheet builder.
 *
 * Translates abstract row data (mix of literals + Excel formula strings prefixed
 * with "=") into a styled worksheet with frozen header, data validation,
 * conditional formatting, and brand styling.
 *
 * Each tool template lives in `tool-templates.ts` and returns a `ToolSheetSpec`.
 * This module is the only place that touches ExcelJS Worksheet APIs for tool sheets.
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
