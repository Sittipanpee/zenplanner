/**
 * Tool template registry — produces ToolSheetSpec for every ToolId.
 *
 * Templates are pure data: rows containing literals or formula strings (prefixed
 * with "="). The buildToolSheet renderer turns them into styled worksheets with
 * frozen panes, validation, and conditional formatting.
 *
 * The "summary" block on each spec drives both the per-sheet KPI strip AND
 * the cross-sheet Dashboard aggregations (the dashboard references summary
 * cell addresses by computing them from the spec).
 */

import type { ToolId } from "@/lib/types";
import type { DataValidation } from "exceljs";
import type { ToolSheetSpec, CellValue } from "./build-tool-sheet";

// ----- shared validations -----

const STATUS_VALIDATION: DataValidation = {
  type: "list",
  allowBlank: true,
  formulae: ['"Pending,In Progress,Done,Skipped"'],
  showErrorMessage: false,
};

const PRIORITY_VALIDATION: DataValidation = {
  type: "list",
  allowBlank: true,
  formulae: ['"High,Medium,Low"'],
  showErrorMessage: false,
};

const SCORE_1_5: DataValidation = {
  type: "whole",
  operator: "between",
  allowBlank: true,
  formulae: [1, 5],
  showErrorMessage: true,
  errorTitle: "Invalid score",
  error: "Score must be 1-5",
};

const SCORE_1_10: DataValidation = {
  type: "whole",
  operator: "between",
  allowBlank: true,
  formulae: [1, 10],
  showErrorMessage: true,
  errorTitle: "Invalid score",
  error: "Score must be 1-10",
};

// ----- helpers -----

function emptyRows(n: number, cols: number): CellValue[][] {
  return Array.from({ length: n }, () => Array.from({ length: cols }, () => ""));
}

function dateRows(days: number, cols: number): CellValue[][] {
  return Array.from({ length: days }, (_, i) => {
    const offset = days - 1 - i;
    const dateFormula = `=TODAY()-${offset}`;
    return [dateFormula, ...Array.from({ length: cols - 1 }, () => "")];
  });
}

// ----- per-tool specs -----

function dailyPowerBlock(): ToolSheetSpec {
  return {
    name: "Daily Power Block",
    title: "⚡ Daily Power Block",
    subtitle: "Top-3 priorities + time blocks",
    columns: [
      { header: "Priority", width: 10 },
      { header: "Task", width: 36, input: true },
      { header: "Time", width: 12, input: true },
      { header: "Done", width: 8, input: true, validation: { type: "list", allowBlank: true, formulae: ['"✓,✗"'] } },
      { header: "Notes", width: 30, input: true },
    ],
    rows: [
      [1, "", "07:00", "", ""],
      [2, "", "10:00", "", ""],
      [3, "", "14:00", "", ""],
    ],
    summary: [
      { label: "Tasks Filled", formula: '=COUNTA(B4:B6)' },
      { label: "Tasks Done", formula: '=COUNTIF(D4:D6,"✓")' },
      { label: "Completion %", formula: '=IFERROR(COUNTIF(D4:D6,"✓")/COUNTA(B4:B6),0)', format: "percent" },
    ],
  };
}

function habitHeatmap(): ToolSheetSpec {
  const weeks = 12;
  const rows: CellValue[][] = [];
  for (let w = 1; w <= weeks; w++) {
    rows.push([`W${w}`, "", "", "", "", "", "", "", `=COUNTIF(B${w + 3}:H${w + 3},"✓")`]);
  }
  // With title + subtitle, headerRowIdx=3, firstDataRow=4, lastDataRow=15.
  // W12 (the most recent week) occupies data row 15; its Total cell is I15.
  // This cell is exposed as `weekTotalDone` so other tools can cross-reference it.
  return {
    name: "Habit Heatmap",
    title: "🔥 Habit Heatmap",
    subtitle: "Tick a day with ✓ — formulas count weekly totals",
    columns: [
      { header: "Week", width: 8 },
      { header: "Mon", width: 6, input: true, conditional: "moodScale" },
      { header: "Tue", width: 6, input: true, conditional: "moodScale" },
      { header: "Wed", width: 6, input: true, conditional: "moodScale" },
      { header: "Thu", width: 6, input: true, conditional: "moodScale" },
      { header: "Fri", width: 6, input: true, conditional: "moodScale" },
      { header: "Sat", width: 6, input: true, conditional: "moodScale" },
      { header: "Sun", width: 6, input: true, conditional: "moodScale" },
      { header: "Total", width: 10 },
    ],
    rows,
    summary: [
      { label: "Best Week", formula: `=MAX(I4:I${weeks + 3})`, format: "number" },
      { label: "Total Check-ins", formula: `=SUM(I4:I${weeks + 3})`, format: "number" },
      { label: "Avg / Week", formula: `=IFERROR(AVERAGE(I4:I${weeks + 3}),0)`, format: "number" },
    ],
    // Named cell registry — I15 = W12 (most recent week) total check-ins.
    // Exposed so weekly_compass (and future tools) can pull "habits this week"
    // without duplicating the formula or hardcoding the target cell address.
    summaryCells: {
      weekTotalDone: "I15",
    },
  };
}

function moodTracker(): ToolSheetSpec {
  const days = 30;
  const rows = dateRows(days, 4);
  // Summary sits directly after the data block. With title+subtitle header
  // occupying rows 1–3, the first data row is row 4, so the last data row is
  // row (days + 3) = 33. Summary starts 2 rows later at row 35:
  //   row 35 = "Avg Mood"      → B35
  //   row 36 = "Avg Energy"    → B36
  //   row 37 = "Days Logged"   → B37
  // These cell addresses are exposed via summaryCells so other tool sheets
  // (e.g. weekly_review) can pull them via consumesCell.
  return {
    name: "Mood Tracker",
    title: "😊 Mood Tracker",
    subtitle: "Daily mood + energy on a 1-5 scale",
    columns: [
      { header: "Date", width: 14, format: "date" },
      { header: "Mood", width: 10, input: true, validation: SCORE_1_5, conditional: "moodScale" },
      { header: "Energy", width: 10, input: true, validation: SCORE_1_5, conditional: "energyScale" },
      { header: "Notes", width: 40, input: true },
    ],
    rows,
    summary: [
      { label: "Avg Mood", formula: `=IFERROR(AVERAGE(B4:B${days + 3}),0)`, format: "number" },
      { label: "Avg Energy", formula: `=IFERROR(AVERAGE(C4:C${days + 3}),0)`, format: "number" },
      { label: "Days Logged", formula: `=COUNT(B4:B${days + 3})`, format: "number" },
    ],
    summaryCells: {
      avgMood: "B35",
      avgEnergy: "B36",
      daysLogged: "B37",
    },
  };
}

function gratitudeLog(): ToolSheetSpec {
  const days = 30;
  const rows = dateRows(days, 3);
  return {
    name: "Gratitude Log",
    title: "🙏 Gratitude Log",
    subtitle: "Three things daily",
    columns: [
      { header: "Date", width: 14, format: "date" },
      { header: "I'm grateful for…", width: 50, input: true },
      { header: "Why?", width: 40, input: true },
    ],
    rows,
    summary: [
      { label: "Entries Logged", formula: `=COUNTA(B4:B${days + 3})`, format: "number" },
      { label: "Streak (days)", formula: `=COUNTIF(B4:B${days + 3},"<>")`, format: "number" },
    ],
  };
}

function weeklyCompass(): ToolSheetSpec {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  // Row layout (title + subtitle → headerRowIdx=3, firstDataRow=4):
  //   Rows 4–10 : Mon–Sun data rows
  //   Row 12    : summary "Filled Days"   (lastDataRow=10, summaryStart=12)
  //   Row 13    : summary "Done"
  //   Row 14    : summary "Completion %"
  //   Row 16    : [cross-tool] "Habits kept this week" ← Habit Heatmap!I15
  //
  // B16 is the designated address for the cross-sheet habit total, placed
  // two rows after the last summary entry to form a visually distinct section.
  return {
    name: "Weekly Compass",
    title: "🧭 Weekly Compass",
    subtitle: "Week of " + "=TEXT(TODAY()-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\")",
    columns: [
      { header: "Day", width: 14 },
      { header: "Main Focus", width: 36, input: true },
      { header: "Priority", width: 12, input: true, validation: PRIORITY_VALIDATION },
      { header: "Status", width: 14, input: true, validation: STATUS_VALIDATION },
    ],
    rows: days.map((d) => [d, "", "", ""]),
    summary: [
      { label: "Filled Days", formula: '=COUNTA(B2:B8)' },
      { label: "Done", formula: '=COUNTIF(D2:D8,"Done")' },
      { label: "Completion %", formula: '=IFERROR(COUNTIF(D2:D8,"Done")/COUNTA(B2:B8),0)', format: "percent" },
    ],
    // Exposed for downstream aggregators (weekly_review, monthly dashboards).
    // Summary block starts at row 12 per the layout comment above.
    summaryCells: {
      filledDays: "B12",
      doneCount: "B13",
      completionPct: "B14",
    },
    // Cross-sheet reference: pull the most-recent-week habit total from Habit Heatmap.
    // Placed at B16 — two rows below the last summary row (row 14), giving visual
    // breathing room. The label "Habits kept this week" is written to A16 by the renderer.
    consumesCell: [
      {
        address: "B16",
        label: "Habits kept this week",
        from: { toolId: "habit_heatmap", summaryKey: "weekTotalDone" },
      },
    ],
  };
}

function eisenhower(): ToolSheetSpec {
  return {
    name: "Eisenhower Matrix",
    title: "⚡ Eisenhower Matrix",
    subtitle: "Sort tasks by urgency × importance",
    columns: [
      { header: "Quadrant", width: 26 },
      { header: "Task", width: 40, input: true },
      { header: "Notes", width: 30, input: true },
    ],
    rows: [
      ["Q1: Urgent & Important (Do)", "", ""],
      ["Q1: Urgent & Important (Do)", "", ""],
      ["Q2: Important / Not Urgent (Schedule)", "", ""],
      ["Q2: Important / Not Urgent (Schedule)", "", ""],
      ["Q3: Urgent / Not Important (Delegate)", "", ""],
      ["Q3: Urgent / Not Important (Delegate)", "", ""],
      ["Q4: Neither (Delete)", "", ""],
      ["Q4: Neither (Delete)", "", ""],
    ],
    summary: [
      { label: "Q1 Tasks", formula: '=COUNTIFS(A2:A9,"Q1*",B2:B9,"<>")' },
      { label: "Q2 Tasks", formula: '=COUNTIFS(A2:A9,"Q2*",B2:B9,"<>")' },
      { label: "Q3 Tasks", formula: '=COUNTIFS(A2:A9,"Q3*",B2:B9,"<>")' },
      { label: "Q4 Tasks", formula: '=COUNTIFS(A2:A9,"Q4*",B2:B9,"<>")' },
    ],
  };
}

function pomodoro(): ToolSheetSpec {
  return {
    name: "Pomodoro Tracker",
    title: "🍅 Pomodoro Tracker",
    subtitle: "Estimate vs actual focus sessions",
    columns: [
      { header: "Task", width: 36, input: true },
      { header: "Est.", width: 8, input: true, format: "number" },
      { header: "Actual", width: 10, input: true, format: "number" },
      { header: "Status", width: 14, input: true, validation: STATUS_VALIDATION },
      { header: "Minutes", width: 12, format: "number" },
    ],
    rows: Array.from({ length: 10 }, (_, i) => ["", "", "", "Pending", `=C${i + 2}*25`]),
    summary: [
      { label: "Total Estimated", formula: '=SUM(B2:B11)', format: "number" },
      { label: "Total Completed", formula: '=SUM(C2:C11)', format: "number" },
      { label: "Progress", formula: '=IFERROR(SUM(C2:C11)/SUM(B2:B11),0)', format: "percent" },
    ],
  };
}

function lifeWheel(): ToolSheetSpec {
  const areas = ["Health", "Career", "Finance", "Relationships", "Personal Growth", "Fun & Recreation", "Environment", "Community"];
  return {
    name: "Life Wheel",
    title: "🎡 Life Wheel",
    subtitle: "Rate each area 1-10",
    columns: [
      { header: "Area", width: 22 },
      { header: "Score (1-10)", width: 14, input: true, validation: SCORE_1_10, conditional: "moodScale" },
      { header: "Notes", width: 40, input: true },
    ],
    rows: areas.map((a) => [a, "", ""]),
    summary: [
      { label: "Average", formula: `=IFERROR(AVERAGE(B2:B${areas.length + 1}),0)`, format: "number" },
      { label: "Lowest", formula: `=IFERROR(MIN(B2:B${areas.length + 1}),0)`, format: "number" },
      { label: "Highest", formula: `=IFERROR(MAX(B2:B${areas.length + 1}),0)`, format: "number" },
    ],
  };
}

function budgetTracker(): ToolSheetSpec {
  return {
    name: "Budget Tracker",
    title: "💰 Budget Tracker",
    subtitle: "Daily income vs expense",
    columns: [
      { header: "Date", width: 14, format: "date", input: true },
      { header: "Item", width: 30, input: true },
      { header: "Category", width: 16, input: true },
      { header: "Income", width: 14, input: true, format: "currency" },
      { header: "Expense", width: 14, input: true, format: "currency" },
      { header: "Balance", width: 14, format: "currency" },
    ],
    rows: Array.from({ length: 20 }, (_, i) => ["", "", "", "", "", `=D${i + 2}-E${i + 2}`]),
    summary: [
      { label: "Total Income", formula: '=SUM(D2:D21)', format: "currency" },
      { label: "Total Expense", formula: '=SUM(E2:E21)', format: "currency" },
      { label: "Net Balance", formula: '=SUM(D2:D21)-SUM(E2:E21)', format: "currency" },
    ],
  };
}

function projectTracker(): ToolSheetSpec {
  return {
    name: "Project Tracker",
    title: "🚀 Project Tracker",
    subtitle: "Tasks across projects with due dates",
    columns: [
      { header: "Project", width: 18, input: true },
      { header: "Task", width: 30, input: true },
      { header: "Due Date", width: 14, input: true, format: "date" },
      { header: "Status", width: 14, input: true, validation: STATUS_VALIDATION },
      { header: "Priority", width: 12, input: true, validation: PRIORITY_VALIDATION },
      { header: "Days Left", width: 12 },
    ],
    rows: Array.from({ length: 12 }, (_, i) => ["", "", "", "Pending", "Medium", `=IFERROR(C${i + 2}-TODAY(),"")`]),
    summary: [
      { label: "Total Tasks", formula: '=COUNTA(B2:B13)' },
      { label: "Done", formula: '=COUNTIF(D2:D13,"Done")' },
      { label: "Overdue", formula: '=COUNTIF(F2:F13,"<0")' },
    ],
  };
}

function genericLog(name: string, title: string, subtitle: string): ToolSheetSpec {
  const days = 14;
  return {
    name,
    title,
    subtitle,
    columns: [
      { header: "Date", width: 14, format: "date" },
      { header: "Entry", width: 50, input: true },
      { header: "Notes", width: 30, input: true },
    ],
    rows: dateRows(days, 3),
    summary: [
      { label: "Entries", formula: `=COUNTA(B4:B${days + 3})`, format: "number" },
    ],
  };
}

/**
 * Weekly Review — the cross-tool harmony sheet.
 *
 * This is the centerpiece of Excel tool-to-tool integration: a single sheet
 * that pulls live formulas from THREE different tool sheets so the user gets
 * a weekly snapshot of their whole system without leaving the review page.
 *
 * Cross-sheet references (via the `consumesCell` directive):
 *   - B4  ← Habit Heatmap!{weekTotalDone}  = habits completed this week
 *   - B5  ← Mood Tracker!{avgMood}         = average mood this week
 *   - B6  ← Mood Tracker!{avgEnergy}       = average energy this week
 *   - B7  ← Weekly Compass!{doneCount}     = priorities completed this week
 *   - B8  ← Weekly Compass!{completionPct} = overall completion rate
 *
 * The renderer in buildToolSheet resolves each of these to a real
 * cross-sheet Excel formula (e.g. ='Habit Heatmap'!I15) at generation time.
 */
function weeklyReview(): ToolSheetSpec {
  return {
    name: "Weekly Review",
    title: "📊 Weekly Review",
    subtitle: "Cross-tool snapshot of this week",
    columns: [
      { header: "Metric", width: 38 },
      { header: "Value", width: 16, format: "number" },
    ],
    // Pre-seed rows so the cross-sheet addresses (B4–B8) land in the right
    // spots. The renderer writes consumesCell values AFTER these rows exist.
    rows: [
      ["Pulled from other tool sheets:", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["", ""],
      ["What went well this week?", ""],
      ["What got in the way?", ""],
      ["One focus for next week:", ""],
    ],
    summary: [
      { label: "Data points pulled", formula: '=COUNTA(B4:B8)', format: "number" },
    ],
    // Expose the "cross-tool score" so future monthly_horizon can pull from us
    summaryCells: {
      dataPointsPulled: "B14",
    },
    // THE HARMONY: 5 cross-sheet references pulling from 3 different tools
    consumesCell: [
      {
        address: "B4",
        label: "Habits completed this week",
        from: { toolId: "habit_heatmap", summaryKey: "weekTotalDone" },
      },
      {
        address: "B5",
        label: "Average mood (1-5)",
        from: { toolId: "mood_tracker", summaryKey: "avgMood" },
      },
      {
        address: "B6",
        label: "Average energy (1-5)",
        from: { toolId: "mood_tracker", summaryKey: "avgEnergy" },
      },
      {
        address: "B7",
        label: "Priorities completed",
        from: { toolId: "weekly_compass", summaryKey: "doneCount" },
      },
      {
        address: "B8",
        label: "Week completion %",
        from: { toolId: "weekly_compass", summaryKey: "completionPct" },
      },
    ],
  };
}

// ----- registry -----

export type TemplateBuilder = () => ToolSheetSpec;

export const TOOL_TEMPLATES: Partial<Record<ToolId, TemplateBuilder>> = {
  daily_power_block: dailyPowerBlock,
  weekly_compass: weeklyCompass,
  weekly_review: weeklyReview,
  habit_heatmap: habitHeatmap,
  mood_tracker: moodTracker,
  gratitude_log: gratitudeLog,
  eisenhower_matrix: eisenhower,
  pomodoro_tracker: pomodoro,
  life_wheel: lifeWheel,
  budget_tracker: budgetTracker,
  project_tracker: projectTracker,
};

/**
 * Resolve a ToolSheetSpec for any ToolId, falling back to a generic log
 * for tools without a hand-crafted template.
 */
export function getToolSpec(toolId: ToolId, name: string, description: string): ToolSheetSpec {
  const builder = TOOL_TEMPLATES[toolId];
  if (builder) return builder();
  return genericLog(name, `📋 ${name}`, description);
}
