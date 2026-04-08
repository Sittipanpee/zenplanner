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
import { safeSheetName, getRegisteredSpec, getSheetNameForToolId } from "./build-tool-sheet";

/**
 * KPI descriptor built from a tool's summaryCells registry. Maps a tool's
 * exposed cell (e.g. "mood_tracker.avgMood") to a dashboard KPI card.
 * Dashboard renders the first ~5 of these as the top KPI strip.
 */
interface DashboardKpi {
  label: string;
  toolId: ToolId;
  summaryKey: string;
  format?: string;
}

/**
 * Canonical KPI priority list. Tools that expose their summary via
 * summaryCells and appear here get a reserved slot in the top-strip.
 * Order matters — the first 5 matches win the KPI cards. Tools not on
 * this list still appear in the per-tool summary table below.
 *
 * This replaces the hardcoded if-chain that used to live in this file
 * (habit_heatmap, mood_tracker, daily_power_block). Now the dashboard
 * auto-discovers any tool that declares summaryCells — no code change
 * needed when a new tool ships.
 */
const KPI_PRIORITY: DashboardKpi[] = [
  { label: "Habit Check-ins", toolId: "habit_heatmap", summaryKey: "weekTotalDone", format: "#,##0" },
  { label: "Avg Mood", toolId: "mood_tracker", summaryKey: "avgMood", format: "0.0" },
  { label: "Avg Energy", toolId: "mood_tracker", summaryKey: "avgEnergy", format: "0.0" },
  { label: "Weekly Completion", toolId: "weekly_compass", summaryKey: "completionPct", format: "0%" },
  { label: "Priorities Done", toolId: "weekly_compass", summaryKey: "doneCount", format: "#,##0" },
  // Future: the moment any tool adds summaryCells, extend this list
  // and the dashboard picks it up automatically.
];

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

  // KPI: total entries — generic COUNTA across all enabled tool sheets.
  // Safe in both Excel and Google Sheets.
  if (enabledNames.length > 0) {
    const totalEntriesFormula =
      "=" +
      enabledNames
        .map((t) => `COUNTA(${quoteSheetRef(t.name)}!B:B)`)
        .join("+");
    kpis.push({ label: "Total Entries", formula: totalEntriesFormula, format: "#,##0" });
  }

  // Dynamic KPI discovery from the summaryCells registry (Wave 5 E3).
  //
  // Before this refactor, the dashboard had a hardcoded if-chain for each
  // known KPI (habit_heatmap, mood_tracker, daily_power_block). Every new
  // KPI required editing this file. Now the dashboard reads KPI_PRIORITY
  // and, for each tool that's actually enabled AND exposes the requested
  // summary cell, generates a cross-sheet formula automatically.
  //
  // The registry is populated during Phase 1 of the two-phase build
  // (see sheet-builder.ts) before any dashboard rendering happens, so
  // every lookup succeeds regardless of render order.
  const enabledIds = new Set(toolIds);
  for (const kpi of KPI_PRIORITY) {
    if (!enabledIds.has(kpi.toolId)) continue;

    const spec = getRegisteredSpec(kpi.toolId);
    const sheetName = getSheetNameForToolId(kpi.toolId);
    const cellAddress = spec?.summaryCells?.[kpi.summaryKey];

    if (!spec || !sheetName || !cellAddress) {
      // Tool enabled but it hasn't exposed this summary cell — skip gracefully.
      // Same blast radius as any other conditional KPI: just omits the slot.
      continue;
    }

    kpis.push({
      label: kpi.label,
      formula: `='${sheetName}'!${cellAddress}`,
      format: kpi.format,
    });

    // Max 5 KPI slots — stop early if the strip is full.
    if (kpis.length >= 5) break;
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
