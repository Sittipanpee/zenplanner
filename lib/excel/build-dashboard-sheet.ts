/**
 * Dashboard sheet builder — aggregates KPIs across all tool sheets via real
 * cross-sheet formulas. The dashboard is added as the FIRST sheet.
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ToolId } from "@/lib/types";
import { TOOL_INFO } from "@/lib/archetype-map";
import {
  HEADER_FILL,
  HEADER_FONT,
  TITLE_FONT,
  KPI_FILL,
  KPI_LABEL_FONT,
  KPI_VALUE_FONT,
  ALL_BORDERS,
  CENTER,
  LEFT,
  COLORS,
} from "./styles";
import { safeSheetName } from "./build-tool-sheet";

/**
 * Quote a sheet name for use inside a cross-sheet formula reference.
 * Excel requires single quotes when the name contains spaces or special chars.
 */
function quoteSheetRef(name: string): string {
  const safe = safeSheetName(name);
  if (/[^A-Za-z0-9_]/.test(safe)) return `'${safe.replace(/'/g, "''")}'`;
  return safe;
}

export function buildDashboardSheet(
  workbook: Workbook,
  toolIds: ToolId[],
  plannerTitle: string
): Worksheet {
  const ws = workbook.addWorksheet("Dashboard", {
    views: [{ state: "frozen", ySplit: 4 }],
    properties: { tabColor: { argb: COLORS.zenIndigo } },
  });

  // Column widths
  [22, 18, 18, 18, 22].forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });

  // Title
  ws.mergeCells("A1:E1");
  const title = ws.getCell("A1");
  title.value = `🌟 ${plannerTitle || "ZenPlanner"} — Dashboard`;
  title.font = TITLE_FONT;
  title.alignment = LEFT;
  ws.getRow(1).height = 30;

  ws.mergeCells("A2:E2");
  const subtitle = ws.getCell("A2");
  subtitle.value =
    "Live KPIs aggregated from every tool sheet. Edit any tool — these update instantly.";
  subtitle.font = { italic: true, color: { argb: COLORS.zenIndigo }, size: 10 };
  subtitle.alignment = LEFT;

  // KPI strip — row 4 labels, row 5 values
  const kpiRowLabel = 4;
  const kpiRowValue = 5;
  const kpis: Array<{ label: string; formula: string; format?: string }> = [];

  // Sheet name lookup
  const enabledNames = toolIds
    .map((id) => ({ id, name: TOOL_INFO[id]?.name ?? id }))
    .filter((t) => !!t.name);

  // KPI: total entries (sum of "Tasks Filled" or COUNTA across known tools)
  // We sum a generic "any non-empty cell in column B of every tool sheet"
  // which is a safe approximation that works in both Excel and Sheets.
  if (enabledNames.length > 0) {
    const totalEntriesFormula =
      "=" +
      enabledNames
        .map((t) => `COUNTA(${quoteSheetRef(t.name)}!B:B)`)
        .join("+");
    kpis.push({ label: "Total Entries", formula: totalEntriesFormula, format: "#,##0" });
  }

  // Habit completion % (if habit_heatmap enabled)
  if (toolIds.includes("habit_heatmap")) {
    const ref = quoteSheetRef(TOOL_INFO.habit_heatmap.name);
    kpis.push({
      label: "Habit Check-ins",
      formula: `=SUM(${ref}!I4:I15)`,
      format: "#,##0",
    });
  }

  // Average mood (if mood_tracker enabled)
  if (toolIds.includes("mood_tracker")) {
    const ref = quoteSheetRef(TOOL_INFO.mood_tracker.name);
    kpis.push({
      label: "Avg Mood",
      formula: `=IFERROR(AVERAGE(${ref}!B4:B33),0)`,
      format: "0.0",
    });
  }

  // Daily priorities done
  if (toolIds.includes("daily_power_block")) {
    const ref = quoteSheetRef(TOOL_INFO.daily_power_block.name);
    kpis.push({
      label: "Priorities Done",
      formula: `=COUNTIF(${ref}!D4:D6,"✓")`,
      format: "#,##0",
    });
  }

  // Render KPI cells (max 5)
  kpis.slice(0, 5).forEach((kpi, i) => {
    const col = i + 1;
    const labelCell = ws.getCell(kpiRowLabel, col);
    labelCell.value = kpi.label;
    labelCell.font = KPI_LABEL_FONT;
    labelCell.alignment = CENTER;
    labelCell.fill = KPI_FILL;
    labelCell.border = ALL_BORDERS;

    const valueCell = ws.getCell(kpiRowValue, col);
    valueCell.value = { formula: kpi.formula.substring(1) };
    valueCell.font = KPI_VALUE_FONT;
    valueCell.alignment = CENTER;
    valueCell.fill = KPI_FILL;
    valueCell.border = ALL_BORDERS;
    if (kpi.format) valueCell.numFmt = kpi.format;
  });
  ws.getRow(kpiRowValue).height = 28;

  // Per-tool summary table — header row 7
  const tableHeaderRow = 7;
  const headers = ["Tool", "Category", "Sheet", "Entries", "Status"];
  headers.forEach((h, i) => {
    const cell = ws.getCell(tableHeaderRow, i + 1);
    cell.value = h;
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = CENTER;
    cell.border = ALL_BORDERS;
  });
  ws.getRow(tableHeaderRow).height = 22;

  enabledNames.forEach((tool, i) => {
    const r = tableHeaderRow + 1 + i;
    const info = TOOL_INFO[tool.id];
    const sheetRef = quoteSheetRef(tool.name);

    ws.getCell(r, 1).value = info?.name ?? tool.id;
    ws.getCell(r, 2).value = info?.category ?? "—";
    ws.getCell(r, 3).value = {
      text: tool.name,
      hyperlink: `#${safeSheetName(tool.name)}!A1`,
    };
    ws.getCell(r, 3).font = { color: { argb: COLORS.zenIndigo }, underline: true };
    ws.getCell(r, 4).value = { formula: `COUNTA(${sheetRef}!B:B)` };
    ws.getCell(r, 4).numFmt = "#,##0";
    ws.getCell(r, 5).value = {
      formula: `IF(COUNTA(${sheetRef}!B:B)>1,"Active","Empty")`,
    };

    for (let c = 1; c <= 5; c++) {
      ws.getCell(r, c).border = ALL_BORDERS;
      ws.getCell(r, c).alignment = LEFT;
    }
  });

  return ws;
}
