/**
 * ZenPlanner Sheet Builder
 * Generates Excel/Google Sheets using SheetJS (xlsx)
 */

import * as XLSX from "xlsx";
import type { ToolId, PlannerBlueprint } from "./types";
import { TOOL_INFO } from "./archetype-map";

export interface SheetConfig {
  blueprint: PlannerBlueprint;
  format: "google_sheets" | "excel_vba";
}

/**
 * Generate planner workbook from blueprint
 */
export async function generatePlannerWorkbook(config: SheetConfig): Promise<ArrayBuffer> {
  console.log("generatePlannerWorkbook called");
  try {
  const { blueprint, format } = config;

  if (!blueprint) {
    throw new Error("Blueprint is undefined");
  }
  console.log("Blueprint:", blueprint);
  if (!blueprint.tool_selection || !Array.isArray(blueprint.tool_selection)) {
    throw new Error("Invalid tool_selection: " + JSON.stringify(blueprint.tool_selection));
  }
  console.log("tool_selection:", blueprint.tool_selection);

  const workbook = XLSX.utils.book_new();
  console.log("Workbook created");

  // Add cover sheet
  createCoverSheet(workbook, blueprint);

  // Add selected tool sheets
  const toolIds = blueprint.tool_selection as ToolId[];
  for (const toolId of toolIds) {
    createToolSheet(workbook, toolId, blueprint.customization);
  }

  // Add index/overview sheet (first)
  createIndexSheet(workbook, toolIds);

  // Add VBA macro if Excel format
  if (format === "excel_vba") {
    addVBAMacros(workbook);
  }

  console.log("Writing workbook to buffer...");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  console.log("Buffer result:", buffer);

  if (!buffer) {
    throw new Error("XLSX.write returned undefined - workbook may be empty or invalid");
  }

  console.log("Buffer length:", buffer.length);

  // Convert Uint8Array to ArrayBuffer properly
  const uint8Array = new Uint8Array(buffer);
  const result = uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
  console.log("Result created, byteLength:", result.byteLength);
  return result;
  } catch (error) {
    console.error("Error in generatePlannerWorkbook:", error);
    throw error;
  }
}

/**
 * Create cover sheet
 */
function createCoverSheet(workbook: XLSX.WorkBook, blueprint: PlannerBlueprint) {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["", "", ""],
    ["", "", ""],
    ["🌟 " + (blueprint.title || "Your ZenPlanner"), "", ""],
    ["", "", ""],
    [blueprint.spirit_animal ? getAnimalEmoji(blueprint.spirit_animal) + " " + blueprint.spirit_animal : "Personalized Planner", "", ""],
    ["", "", ""],
    [blueprint.description || "Your personalized planning system", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["Created: " + new Date().toLocaleDateString("th-TH"), "", ""],
  ]);

  // Style the cover
  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
  for (let R = range.s.r; R <= range.e.r; R++) {
    const addr = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (!sheet[addr]) continue;
    sheet[addr].s = {
      font: { size: R === 2 ? 24 : 14, bold: R === 2 },
      alignment: { horizontal: "center" },
    };
  }

  sheet["!cols"] = [{ wch: 40 }, { wch: 40 }, { wch: 40 }];

  XLSX.utils.book_append_sheet(workbook, sheet, "Cover");
}

/**
 * Create index/overview sheet
 */
function createIndexSheet(workbook: XLSX.WorkBook, toolIds: ToolId[]) {
  const rows: any[] = [
    ["📋 Planner Index", "", ""],
    ["", "", ""],
    ["Tool Name", "Category", "Description"],
  ];

  for (const toolId of toolIds) {
    const info = TOOL_INFO[toolId];
    if (info) {
      rows.push([info.name, info.category, info.description]);
    }
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(workbook, sheet, "Index");
}

/**
 * Create individual tool sheet
 */
function createToolSheet(
  workbook: XLSX.WorkBook,
  toolId: ToolId,
  customization: Record<string, any> | null
) {
  const sheetName = TOOL_INFO[toolId]?.name || toolId;
  let rows: any[][] = [];

  // Generate rows based on tool type
  switch (toolId) {
    case "daily_power_block":
      rows = createDailyPowerBlockRows(customization);
      break;
    case "weekly_compass":
      rows = createWeeklyCompassRows();
      break;
    case "monthly_horizon":
      rows = createMonthlyHorizonRows();
      break;
    case "habit_heatmap":
      rows = createHabitHeatmapRows();
      break;
    case "mood_tracker":
      rows = createMoodTrackerRows();
      break;
    case "life_wheel":
      rows = createLifeWheelRows();
      break;
    case "gratitude_log":
      rows = createGratitudeLogRows();
      break;
    case "morning_clarity":
      rows = createMorningClarityRows();
      break;
    case "evening_reflection":
      rows = createEveningReflectionRows();
      break;
    case "kanban_board":
      rows = createKanbanBoardRows();
      break;
    case "eisenhower_matrix":
      rows = createEisenhowerMatrixRows();
      break;
    case "pomodoro_tracker":
      rows = createPomodoroTrackerRows();
      break;
    case "time_boxing":
      rows = createTimeBoxingRows();
      break;
    case "project_tracker":
      rows = createProjectTrackerRows();
      break;
    case "weekly_review":
      rows = createWeeklyReviewRows();
      break;
    case "energy_map":
      rows = createEnergyMapRows();
      break;
    case "journal_prompt":
      rows = createJournalPromptRows();
      break;
    case "habit_stack":
      rows = createHabitStackRows();
      break;
    case "streak_tracker":
      rows = createStreakTrackerRows();
      break;
    case "quest_system":
      rows = createQuestSystemRows();
      break;
    case "level_up":
      rows = createLevelUpRows();
      break;
    case "milestone_map":
      rows = createMilestoneMapRows();
      break;
    case "progress_bars":
      rows = createProgressBarsRows();
      break;
    case "bujo_spread":
      rows = createBujoSpreadRows();
      break;
    case "moodboard":
      rows = createMoodboardRows();
      break;
    case "brain_dump":
      rows = createBrainDumpRows();
      break;
    case "mind_map":
      rows = createMindMapRows();
      break;
    case "doodle_zone":
      rows = createDoodleZoneRows();
      break;
    case "quarterly_vision":
      rows = createQuarterlyVisionRows();
      break;
    case "21day_challenge":
      rows = create21DayChallengeRows();
      break;
    case "weekly_scorecard":
      rows = createWeeklyScorecardRows();
      break;
    case "hp_clarity_chart":
      rows = createHpClarityChartRows();
      break;
    case "nps_self":
      rows = createNpsSelfRows();
      break;
    case "budget_tracker":
      rows = createBudgetTrackerRows();
      break;
    case "meal_planner":
      rows = createMealPlannerRows();
      break;
    case "fitness_log":
      rows = createFitnessLogRows();
      break;
    case "reading_list":
      rows = createReadingListRows();
      break;
    case "mindfulness_bell":
      // Mindfulness Bell - scheduled breathing reminders
      rows = [
        ["🛎️ Mindfulness Bell - การตั้งเตือนสติ", "", "", ""],
        ["", "", "", ""],
        ["วัน/เวลา", "กิจกรรม", "ระดับพลัง (1-5)", "สถานะ"],
        ["จันทร์ 09:00", "หายใจเข้าลึก", "4", "✓"],
        ["จันทร์ 14:00", "พักสมอง 5 นาที", "3", "✓"],
        ["อังคาร 09:00", "หายใจเข้าลึก", "4", ""],
        ["อังคาร 14:00", "พักสมอง 5 นาที", "3", ""],
        ["", "", "", ""],
        ["📝 บันทึกการทำ mindfulness:", "", "", ""],
        ["", "", "", ""],
        ["วันที่", "ความรู้สึก", "หมายเหตุ", ""],
      ];
      break;
  }

  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [{ wch: 25 }, { wch: 40 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
}

// ... (existing template functions from createDailyPowerBlockRows to createStreakTrackerRows)

function createDailyPowerBlockRows(customization: Record<string, any> | null): any[][] {
  const wakeTime = customization?.wake_time || "07:00";
  return [
    ["⚡ Daily Power Block"],
    [],
    ["Date", "=TODAY()"], // Formula: Auto-fill today's date
    [],
    ["Priority", "Task", "Time", "Score", "Notes"],
    ["1", "", wakeTime, "=IF(B6<>\"\",1,0)", ""], // Formula: Score = 1 if task exists
    ["2", "", "", "=IF(B7<>\"\",1,0)", ""],
    ["3", "", "", "=IF(B8<>\"\",1,0)", ""],
    [],
    ["Total Score", "=SUM(D6:D8)"], // Formula: Sum of all scores
    ["Notes"]
  ];
}

function createWeeklyCompassRows(): any[][] {
  return [
    ["🧭 Weekly Compass"],
    [],
    ["Week of:", "=TEXT(TODAY()-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\") & \" - \" & TEXT(TODAY()+7-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\")"], // Formula: Current week range
    [],
    ["Day", "Main Focus", "Priority", "Status"],
    ["Monday", "", "", "=IF(B6<>\"\",\"⏳\",\"\")"],
    ["Tuesday", "", "", "=IF(B7<>\"\",\"⏳\",\"\")"],
    ["Wednesday", "", "", "=IF(B8<>\"\",\"⏳\",\"\")"],
    ["Thursday", "", "", "=IF(B9<>\"\",\"⏳\",\"\")"],
    ["Friday", "", "", "=IF(B10<>\"\",\"⏳\",\"\")"],
    ["Saturday", "", "", "=IF(B11<>\"\",\"⏳\",\"\")"],
    ["Sunday", "", "", "=IF(B12<>\"\",\"⏳\",\"\")"],
    [],
    ["Weekly Review"],
    ["Wins", "=COUNTA(B6:B12)-COUNTBLANK(B6:B12) & \" tasks completed\""],
    ["Lessons", ""]
  ];
}

function createMonthlyHorizonRows(): any[][] {
  // Create header row with formulas
  const headerRow = ["Day", "Focus", "Done?"];
  for (let i = 1; i <= 31; i++) {
    headerRow.push(i.toString());
  }

  return [
    ["🌅 Monthly Horizon"],
    [],
    ["Month:", "=TEXT(TODAY(),\"MMMM YYYY\")"], // Formula: Current month
    [],
    ["Goal 1", ""],
    ["Goal 2", ""],
    ["Goal 3", ""],
    [],
    headerRow,
    // Weekly summary formulas
    ["W1 Summary", "=COUNTIF(C10:AG10,\"✓\") & \" / 7\""],
    ["W2 Summary", "=COUNTIF(C11:AG11,\"✓\") & \" / 7\""],
    ["W3 Summary", "=COUNTIF(C12:AG12,\"✓\") & \" / 7\""],
    ["W4 Summary", "=COUNTIF(C13:AG13,\"✓\") & \" / 7\""],
    ["W5 Summary", "=COUNTIF(C14:AG14,\"✓\") & \" / 7\""]
  ];
}

function createHabitHeatmapRows(): any[][] {
  return [
    ["🔥 Habit Heatmap"],
    [],
    ["Habit:", ""],
    [],
    ["Week", "M", "T", "W", "T", "F", "S", "S", "Weekly Total"], // Added Weekly Total column
    ["W1", "", "", "", "", "", "", "", "=COUNTIF(B8:H8,\"✓\")"], // Formula: Count checkmarks
    ["W2", "", "", "", "", "", "", "", "=COUNTIF(B9:H9,\"✓\")"],
    ["W3", "", "", "", "", "", "", "", "=COUNTIF(B10:H10,\"✓\")"],
    ["W4", "", "", "", "", "", "", "", "=COUNTIF(B11:H11,\"✓\")"],
    ["W5", "", "", "", "", "", "", "", "=COUNTIF(B12:H12,\"✓\")"],
    ["W6", "", "", "", "", "", "", "", "=COUNTIF(B13:H13,\"✓\")"],
    ["W7", "", "", "", "", "", "", "", "=COUNTIF(B14:H14,\"✓\")"],
    ["W8", "", "", "", "", "", "", "", "=COUNTIF(B15:H15,\"✓\")"],
    ["W9", "", "", "", "", "", "", "", "=COUNTIF(B16:H16,\"✓\")"],
    ["W10", "", "", "", "", "", "", "", "=COUNTIF(B17:H17,\"✓\")"],
    ["W11", "", "", "", "", "", "", "", "=COUNTIF(B18:H18,\"✓\")"],
    ["W12", "", "", "", "", "", "", "", "=COUNTIF(B19:H19,\"✓\")"],
    ["W13", "", "", "", "", "", "", "", "=COUNTIF(B20:H20,\"✓\")"],
    ["W14", "", "", "", "", "", "", "", "=COUNTIF(B21:H21,\"✓\")"],
    ["W15", "", "", "", "", "", "", "", "=COUNTIF(B22:H22,\"✓\")"],
    ["W16", "", "", "", "", "", "", "", "=COUNTIF(B23:H23,\"✓\")"],
    ["W17", "", "", "", "", "", "", "", "=COUNTIF(B24:H24,\"✓\")"],
    ["W18", "", "", "", "", "", "", "", "=COUNTIF(B25:H25,\"✓\")"],
    ["W19", "", "", "", "", "", "", "", "=COUNTIF(B26:H26,\"✓\")"],
    ["W20", "", "", "", "", "", "", "", "=COUNTIF(B27:H27,\"✓\")"],
    ["W21", "", "", "", "", "", "", "", "=COUNTIF(B28:H28,\"✓\")"],
    ["W22", "", "", "", "", "", "", "", "=COUNTIF(B29:H29,\"✓\")"],
    ["W23", "", "", "", "", "", "", "", "=COUNTIF(B30:H30,\"✓\")"],
    ["W24", "", "", "", "", "", "", "", "=COUNTIF(B31:H31,\"✓\")"],
    ["W25", "", "", "", "", "", "", "", "=COUNTIF(B32:H32,\"✓\")"],
    ["W26", "", "", "", "", "", "", "", "=COUNTIF(B33:H33,\"✓\")"],
    ["W27", "", "", "", "", "", "", "", "=COUNTIF(B34:H34,\"✓\")"],
    ["W28", "", "", "", "", "", "", "", "=COUNTIF(B35:H35,\"✓\")"],
    ["W29", "", "", "", "", "", "", "", "=COUNTIF(B36:H36,\"✓\")"],
    ["W30", "", "", "", "", "", "", "", "=COUNTIF(B37:H37,\"✓\")"],
    ["W31", "", "", "", "", "", "", "", "=COUNTIF(B38:H38,\"✓\")"],
    ["W32", "", "", "", "", "", "", "", "=COUNTIF(B39:H39,\"✓\")"],
    ["W33", "", "", "", "", "", "", "", "=COUNTIF(B40:H40,\"✓\")"],
    ["W34", "", "", "", "", "", "", "", "=COUNTIF(B41:H41,\"✓\")"],
    ["W35", "", "", "", "", "", "", "", "=COUNTIF(B42:H42,\"✓\")"],
    ["W36", "", "", "", "", "", "", "", "=COUNTIF(B43:H43,\"✓\")"],
    ["W37", "", "", "", "", "", "", "", "=COUNTIF(B44:H44,\"✓\")"],
    ["W38", "", "", "", "", "", "", "", "=COUNTIF(B45:H45,\"✓\")"],
    ["W39", "", "", "", "", "", "", "", "=COUNTIF(B46:H46,\"✓\")"],
    ["W40", "", "", "", "", "", "", "", "=COUNTIF(B47:H47,\"✓\")"],
    ["W41", "", "", "", "", "", "", "", "=COUNTIF(B48:H48,\"✓\")"],
    ["W42", "", "", "", "", "", "", "", "=COUNTIF(B49:H49,\"✓\")"],
    ["W43", "", "", "", "", "", "", "", "=COUNTIF(B50:H50,\"✓\")"],
    ["W44", "", "", "", "", "", "", "", "=COUNTIF(B51:H51,\"✓\")"],
    ["W45", "", "", "", "", "", "", "", "=COUNTIF(B52:H52,\"✓\")"],
    ["W46", "", "", "", "", "", "", "", "=COUNTIF(B53:H53,\"✓\")"],
    ["W47", "", "", "", "", "", "", "", "=COUNTIF(B54:H54,\"✓\")"],
    ["W48", "", "", "", "", "", "", "", "=COUNTIF(B55:H55,\"✓\")"],
    ["W49", "", "", "", "", "", "", "", "=COUNTIF(B56:H56,\"✓\")"],
    ["W50", "", "", "", "", "", "", "", "=COUNTIF(B57:H57,\"✓\")"],
    ["W51", "", "", "", "", "", "", "", "=COUNTIF(B58:H58,\"✓\")"],
    ["W52", "", "", "", "", "", "", "", "=COUNTIF(B59:H59,\"✓\")"],
    [],
    ["Year Total", "=SUM(I8:I59)"] // Formula: Total checkmarks for year
  ];
}

function createMoodTrackerRows(): any[][] {
  return [
    ["😊 Mood Tracker"],
    [],
    ["Date", "Mood (1-5)", "Energy (1-5)", "Notes"],
    // Pre-fill 30 rows with date formulas
    ["=TEXT(TODAY()-30,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-29,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-28,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-27,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-26,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-25,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-24,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-23,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-22,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-21,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-20,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-19,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-18,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-17,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-16,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-15,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-14,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-13,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-12,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-11,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-10,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-9,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-8,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-7,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-6,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-5,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-4,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-3,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-2,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY()-1,\"yyyy-mm-dd\")", "", "", ""],
    ["=TEXT(TODAY(),\"yyyy-mm-dd\")", "", "", ""],
    [],
    // Summary formulas
    ["Average Mood", "=IF(COUNTBLANK(B5:B35)>0,\"\",AVERAGE(B5:B35))"], // Formula: Average mood
    ["Average Energy", "=IF(COUNTBLANK(C5:C35)>0,\"\",AVERAGE(C5:C35))"], // Formula: Average energy
    ["Mood Trend", "=IF(COUNTBLANK(B5:B35)>0,\"\",IF(B35>B5,\"📈 Improving\",\"📉 Declining\"))"] // Formula: Mood trend
  ];
}
function createLifeWheelRows(): any[][] {
  return [["🎡 Life Wheel"], [], ["Area", "Score (1-10)", "Notes"], ["Health", "", ""], ["Career", "", ""], ["Finance", "", ""], ["Relationships", "", ""], ["Personal Growth", "", ""], ["Fun & Recreation", "", ""], ["Environment", "", ""], ["Community", "", ""]];
}
function createGratitudeLogRows(): any[][] {
  return [
    ["🙏 Gratitude Log"],
    [],
    ["Date", "I'm grateful for...", "Why?"],
    // Pre-fill 30 days
    ["=TEXT(TODAY()-29,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-28,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-27,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-26,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-25,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-24,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-23,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-22,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-21,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-20,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-19,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-18,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-17,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-16,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-15,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-14,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-13,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-12,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-11,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-10,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-9,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-8,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-7,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-6,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-5,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-4,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-3,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-2,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY()-1,\"yyyy-mm-dd\")", "", ""],
    ["=TEXT(TODAY(),\"yyyy-mm-dd\")", "", ""],
    [],
    // Summary
    ["Total Entries", "=COUNTA(B5:B34)", ""],
    ["Streak Days", "=COUNTIF(B5:B34,\"<>\")", ""]
  ];
}
function createMorningClarityRows(): any[][] {
  return [
    ["🌅 Morning Clarity"],
    [],
    ["Date", "=TEXT(TODAY(),\"yyyy-mm-dd (EEEE)\")"], // Formula: Today's date with day name
    [],
    ["1. I am grateful for..."],
    [""],
    ["2. My intention for today is..."],
    [""],
    ["3. Today's affirmation:"],
    [""],
    [],
    ["4. Top 3 Priorities Today"],
    ["1.", ""],
    ["2.", ""],
    ["3.", ""],
    [],
    ["Energy Level (1-10)", "=IF(COUNTA(B7:B10)>=3,8,\"\")"] // Auto-suggest energy level
  ];
}
function createEveningReflectionRows(): any[][] {
  return [
    ["🌙 Evening Reflection"],
    [],
    ["Date", "=TEXT(TODAY(),\"yyyy-mm-dd (EEEE)\")"], // Formula: Today's date with day name
    [],
    ["A win from today:"],
    [""],
    ["A lesson learned:"],
    [""],
    ["Tomorrow's #1 focus:"],
    [""],
    [],
    ["Energy at end of day (1-10)", ""],
    ["Mood at end of day (1-10)", ""],
    ["Tomorrow's intention", ""],
    [],
    // Reflection score
    ["Today's Completion Score", "=IF(COUNTA(B7:B10)>=3,10,\"\") & \"/10\""]
  ];
}
function createKanbanBoardRows(): any[][] {
  return [
    ["📋 Kanban Board"],
    [],
    ["To Do", "In Progress", "Done"],
    // Empty rows ready for tasks - user can drag between columns
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
    [],
    // Summary
    ["Total Tasks", "=COUNTA(A4:A17)", "=COUNTA(B4:B17)", "=COUNTA(C4:C17)"],
    ["Completed", "", "", "=COUNTA(C4:C17)"],
    ["Completion %", "", "", "=IF(A22+B22+C22>0,C22/(A22+B22+C22)*100,0)&\"%\""] // Formula: Completion percentage
  ];
}
function createEisenhowerMatrixRows(): any[][] {
  return [
    ["⚡ Eisenhower Matrix", "", "", ""],
    [],
    ["", "Urgent", "Not Urgent"],
    ["Important", "DO - Do First", "DECIDE - Schedule"],
    ["", "------------------", "------------------"],
    ["", "1. Crisis", "2. Planning"],
    ["", "Deadline today", "No deadline"],
    ["", "", ""],
    ["Not Important", "DELEGATE", "DELETE - Eliminate"],
    ["", "------------------", "------------------"],
    ["", "3. Delegation", "4. Delete"],
    ["", "If someone else can do it", "Time wasters"],
    ["", "let them do it", "Remove completely"],
    [],
    // Task count formulas
    ["Tasks in Q1 (DO)", "=COUNTA(B5:B9)", "", ""],
    ["Tasks in Q2 (DECIDE)", "=COUNTA(C5:C9)", "", ""],
    ["Tasks in Q3 (DELEGATE)", "=COUNTA(B12:B16)", "", ""],
    ["Tasks in Q4 (DELETE)", "=COUNTA(C12:C16)", "", ""]
  ];
}
function createPomodoroTrackerRows(): any[][] {
  return [
    ["🍅 Pomodoro Tracker"],
    [],
    ["Task", "Pomodoros (est.)", "Pomodoros (actual)", "Status", "Time Spent"],
    ["", 4, 0, "Pending", "=C5*25&\" min\""],
    ["", 2, 0, "Pending", "=C6*25&\" min\""],
    ["", 3, 0, "Pending", "=C7*25&\" min\""],
    ["", 1, 0, "Pending", "=C8*25&\" min\""],
    ["", 2, 0, "Pending", "=C9*25&\" min\""],
    ["", 4, 0, "Pending", "=C10*25&\" min\""],
    ["", 1, 0, "Pending", "=C11*25&\" min\""],
    ["", 3, 0, "Pending", "=C12*25&\" min\""],
    ["", 2, 0, "Pending", "=C13*25&\" min\""],
    [],
    // Summary formulas
    ["Total Estimated", "=SUM(B5:B14)", "", "", ""],
    ["Total Completed", "=SUM(C5:C14)", "", "", ""],
    ["Progress", "=IF(B15>0,C15/B15*100,0)&\"%\"", "", "", ""]
  ];
}
function createTimeBoxingRows(): any[][] {
  const rows: any[][] = [
    ["⏰ Time Boxing"],
    [],
    ["Date", "=TEXT(TODAY(),\"yyyy-mm-dd\")"],
    [],
    ["Time", "Task", "Status", "Actual Duration"]
  ];

  // Add hourly time blocks (6am to 11pm = 18 hours)
  for (let i = 0; i < 18; i++) {
    const hour = (i + 6) % 24;
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    rows.push([timeStr, "", "⏳", ""]);
  }

  // Add summary formulas
  rows.push([]);
  rows.push(["Total Hours Blocked", "=COUNTA(B6:B23)", "", ""]);
  rows.push(["Tasks Completed", "=COUNTIF(C6:C23,\"✅\")", "", ""]);
  rows.push(["Completion Rate", "=IF(B25>0,C25/B25*100,0)&\"%\"", "", ""]); // Formula: Completion percentage

  return rows;
}
function createProjectTrackerRows(): any[][] {
  return [
    ["🚀 Project Tracker"],
    [],
    ["Project", "Task", "Due Date", "Status", "Priority", "Days Left"],
    ["Project 1", "Task 1", "=TEXT(TODAY()+7,\"yyyy-mm-dd\")", "In Progress", "High", "=DATEDIF(TODAY(),C5,\"D\")"], // Formula: Days until due
    ["Project 1", "Task 2", "=TEXT(TODAY()+14,\"yyyy-mm-dd\")", "Pending", "Medium", "=DATEDIF(TODAY(),C6,\"D\")"],
    ["Project 1", "Task 3", "", "Not Started", "Low", ""],
    ["Project 2", "Task 1", "=TEXT(TODAY()+3,\"yyyy-mm-dd\")", "In Progress", "High", "=DATEDIF(TODAY(),C8,\"D\")"],
    ["Project 2", "Task 2", "=TEXT(TODAY()+10,\"yyyy-mm-dd\")", "Pending", "Medium", "=DATEDIF(TODAY(),C9,\"D\")"],
    ["Project 2", "Task 3", "", "Not Started", "Low", ""],
    ["Project 3", "Task 1", "", "Pending", "Medium", ""],
    [],
    // Summary formulas
    ["Total Projects", "=COUNTA(A5:A12)", "", "", "", ""],
    ["Completed", "=COUNTIF(D5:D12,\"Done\")", "", "", "", ""],
    ["In Progress", "=COUNTIF(D5:D12,\"In Progress\")", "", "", "", ""],
    ["Overdue", "=COUNTIF(F5:F12,\"<0\")", "", "", "", ""]
  ];
}
function createWeeklyReviewRows(): any[][] {
  return [
    ["🗓️ Weekly Review"],
    [],
    ["Week of:", "=TEXT(TODAY()-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\") & \" to \" & TEXT(TODAY()+7-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\")"],
    [],
    ["Top 3 Wins"],
    ["1.", ""],
    ["2.", ""],
    ["3.", ""],
    [],
    ["Key Learnings"],
    [""],
    [],
    ["Challenges Faced"],
    [""],
    [],
    ["Next Week Focus"],
    [""],
    [],
    // Self-assessment scores
    ["Energy Level (1-10)", ""],
    ["Productivity (1-10)", ""],
    ["Mood (1-10)", ""],
    ["Overall Week Score", "=AVERAGE(B15:B17)"] // Formula: Average of all scores
  ];
}
function createEnergyMapRows(): any[][] {
  return [
    ["🔋 Energy Map"],
    [],
    ["Date", "Time", "Energy Level (1-5)", "Notes"],
    // 7 days of hourly tracking
    ["=TEXT(TODAY()-6,\"yyyy-mm-dd\")", "06:00", "", ""],
    ["", "07:00", "", ""],
    ["", "08:00", "", ""],
    ["", "09:00", "", ""],
    ["", "10:00", "", ""],
    ["", "11:00", "", ""],
    ["", "12:00", "", ""],
    ["", "13:00", "", ""],
    ["", "14:00", "", ""],
    ["", "15:00", "", ""],
    ["", "16:00", "", ""],
    ["", "17:00", "", ""],
    ["", "18:00", "", ""],
    ["", "19:00", "", ""],
    ["", "20:00", "", ""],
    ["", "21:00", "", ""],
    ["", "22:00", "", ""],
    ["", "23:00", "", ""],
    [],
    // Average energy calculation
    ["Average (6am-12pm)", "=AVERAGE(C5:C11)", "", ""],
    ["Average (12pm-6pm)", "=AVERAGE(C12:C18)", "", ""],
    ["Average (6pm-12am)", "=AVERAGE(C19:C25)", "", ""],
    ["Peak Energy Time", "=INDEX(B5:B25,MATCH(MAX(C5:C25),C5:C25,0))", "", ""] // Formula: Find peak energy time
  ];
}
function createJournalPromptRows(): any[][] {
  return [["✍️ Journal Prompt"], [], ["Date:"], [], ["Prompt:", "What is one small step I can take today toward a goal that matters?"], [], ["Response:"]];
}
function createHabitStackRows(): any[][] {
  return [["🔗 Habit Stack"], [], ["Current Habit", "New Habit to Stack"], ["After I [Current Habit]...", "I will [New Habit]."]];
}
function createStreakTrackerRows(): any[][] {
  return [
    ["🔥 Streak Tracker"],
    [],
    ["Habit", "Current Streak", "Longest Streak", "Status", "Last Check-in"],
    ["Habit 1", "0", "0", "=IF(C5>0,\"🔥 Active\",\"💤 Inactive\")", "=TEXT(TODAY()-1,\"yyyy-mm-dd\")"],
    ["Habit 2", "0", "0", "=IF(C6>0,\"🔥 Active\",\"💤 Inactive\")", ""],
    ["Habit 3", "0", "0", "=IF(C7>0,\"🔥 Active\",\"💤 Inactive\")", ""],
    ["Habit 4", "0", "0", "=IF(C8>0,\"🔥 Active\",\"💤 Inactive\")", ""],
    ["Habit 5", "0", "0", "=IF(C9>0,\"🔥 Active\",\"💤 Inactive\")", ""],
    [],
    // Summary row
    ["Total Active", "=COUNTIF(D5:D9,\"🔥 Active\")", "", "", ""],
    ["Best Streak Ever", "=MAX(C5:C9)", "", "", ""]
  ];
}

// NEWLY ADDED BATCH 3
function createQuarterlyVisionRows(): any[][] {
  return [["🔭 Quarterly Vision"], [], ["Quarter (e.g., Q1 2026)"], [], ["Objective 1", "Key Result 1", "Key Result 2"], ["", "", ""], ["Objective 2", "Key Result 1", "Key Result 2"], ["", "", ""]];
}
function create21DayChallengeRows(): any[][] {
  return [["💪 21-Day Challenge"], [], ["Challenge:", ""], [], ["Day", "Status (✅/❌)"], ...Array.from({ length: 21 }, (_, i) => [i + 1, ""])];
}
function createQuestSystemRows(): any[][] {
  return [
    ["⚔️ Quest System"],
    [],
    ["Main Quest:", ""],
    ["Main Quest XP Target:", "1000"],
    [],
    ["Side Quest", "XP", "Status", "Reward", "Completed?"],
    ["", "100", "Pending", "", "=IF(C8=\"Done\",1,0)"],
    ["", "50", "Pending", "", "=IF(C9=\"Done\",1,0)"],
    ["", "75", "Pending", "", "=IF(C10=\"Done\",1,0)"],
    ["", "25", "Pending", "", "=IF(C11=\"Done\",1,0)"],
    ["", "150", "Pending", "", "=IF(C12=\"Done\",1,0)"],
    ["", "30", "Pending", "", "=IF(C13=\"Done\",1,0)"],
    ["", "200", "Pending", "", "=IF(C14=\"Done\",1,0)"],
    ["", "80", "Pending", "", "=IF(C15=\"Done\",1,0)"],
    [],
    // XP Summary formulas
    ["Total XP Earned", "=SUM(B8:B15)", "", "", ""],
    ["XP Progress", "=B18/1000*100 & \"%\"", "", "", ""],
    ["Quests Completed", "=COUNTIF(C8:C15,\"Done\")", "", "", ""],
    ["Pending Quests", "=COUNTIF(C8:C15,\"Pending\")", "", "", ""]
  ];
}
function createLevelUpRows(): any[][] {
  return [
    ["🌟 Level-Up Tracker"],
    [],
    ["Skill", "Current Level", "XP to Next", "Total XP", "Progress %"],
    ["Skill 1", 1, "=100*level^2", "0", "=D5/100*1^2*100&\"%\""], // Formula: XP calculation
    ["Skill 2", 1, "=100*level^2", "0", "=D6/100*2^2*100&\"%\""],
    ["Skill 3", 1, "=100*level^2", "0", "=D7/100*3^2*100&\"%\""],
    ["Skill 4", 1, "=100*level^2", "0", "=D8/100*4^2*100&\"%\""],
    ["Skill 5", 1, "=100*level^2", "0", "=D9/100*5^2*100&\"%\""],
    [],
    // Summary
    ["Total Skills", "=COUNTA(A5:A9)", "", "", ""],
    ["Highest Level", "=MAX(B5:B9)", "", "", ""],
    ["Total XP Earned", "=SUM(D5:D9)", "", "", ""]
  ];
}
function createMilestoneMapRows(): any[][] {
  return [
    ["🗺️ Milestone Map"],
    [],
    ["Goal:", ""],
    [],
    ["Milestone", "Target Date", "Status", "Days Left", "Notes"],
    ["Milestone 1", "=TEXT(TODAY()+30,\"yyyy-mm-dd\")", "Not Started", "=C6<>\"\"", ""], // Formula: Days until milestone
    ["Milestone 2", "=TEXT(TODAY()+60,\"yyyy-mm-dd\")", "Not Started", "=C7<>\"\"", ""],
    ["Milestone 3", "=TEXT(TODAY()+90,\"yyyy-mm-dd\")", "Not Started", "=C8<>\"\"", ""],
    ["Milestone 4", "", "Not Started", "", ""],
    ["Milestone 5", "", "Not Started", "", ""],
    [],
    // Summary
    ["Completed", "=COUNTIF(C6:C10,\"Completed\")", "", "", ""],
    ["In Progress", "=COUNTIF(C6:C10,\"In Progress\")", "", "", ""],
    ["Completion %", "=IF(COUNTA(C6:C10)>0,A13/COUNTA(C6:C10)*100,0)&\"%\"", "", "", ""]
  ];
}
function createProgressBarsRows(): any[][] {
  return [["📊 Progress Bars"], [], ["Area", "Progress (e.g., 50%)", "Goal"]];
}
function createBujoSpreadRows(): any[][] {
  return [["📓 Bujo Spread"], [], ["Key:", "• Task, x Done, > Migrated"], []];
}
function createMoodboardRows(): any[][] {
  return [["🎨 Moodboard"], [], ["Insert images, quotes, and inspiration below."]];
}
function createBrainDumpRows(): any[][] {
  return [["🧠 Brain Dump"], [], ["Date", "Thought / Idea / Task"]];
}
function createMindMapRows(): any[][] {
  return [["🕸️ Mind Map"], [], ["Central Idea:", ""]];
}
function createDoodleZoneRows(): any[][] {
  return [["✏️ Doodle Zone"], [], ["A blank space for your creative thoughts."]];
}
function createWeeklyScorecardRows(): any[][] {
  return [
    ["📝 Weekly Scorecard"],
    [],
    ["Week of:", "=TEXT(TODAY()-WEEKDAY(TODAY(),2),\"yyyy-mm-dd\")"],
    [],
    ["Area", "Score (1-10)", "Notes"],
    ["Health", "", ""],
    ["Work", "", ""],
    ["Relationships", "", ""],
    ["Personal Growth", "", ""],
    ["Fun & Recreation", "", ""],
    ["Finances", "", ""],
    [],
    // Summary with formulas
    ["Total Score", "=SUM(B6:B11)", ""],
    ["Average Score", "=AVERAGE(B6:B11)", ""],
    ["Highest Area", "=INDEX(A6:A11,MATCH(MAX(B6:B11),B6:B11,0))", ""],
    ["Lowest Area", "=INDEX(A6:A11,MATCH(MIN(B6:B11),B6:B11,0))", ""]
  ];
}

function createHpClarityChartRows(): any[][] {
  return [
    ["📈 HP Clarity Chart"],
    [],
    ["Clarity Area", "Score (1-10)", "Target", "Gap"],
    ["Self", "", 8, "=B5-C5"],
    ["Skills", "", 8, "=B6-C6"],
    ["Social", "", 8, "=B7-C7"],
    ["Service", "", 8, "=B8-C8"],
    [],
    // Summary formulas
    ["Current Total", "=SUM(B5:B8)", "Target Total", "=SUM(C5:C8)"],
    ["Average Score", "=AVERAGE(B5:B8)", "", ""],
    ["Biggest Gap", "=MAX(D5:D8)", "", ""]
  ];
}

function createNpsSelfRows(): any[][] {
  return [
    ["🤔 Self NPS"],
    [],
    ["On a scale of 0-10, how likely are you to recommend this week to a friend?"],
    ["Score:", "", ""],
    [],
    ["Reason for score:", ""],
    [],
    ["NPS Category:", "=IF(B5>=9,\"Promoter (9-10)\",IF(B5>=7,\"Passive (7-8)\",\"Detractor (0-6)\"))", ""], // Formula: NPS category
    [],
    ["Weekly Trend:"],
    ["Last Week", ""],
    ["This Week", "=B5"],
    ["Change", "=IF(B9<>\"\",B10-B9,\"\")"]
  ];
}
function createBudgetTrackerRows(): any[][] {
  return [
    ["💰 Budget Tracker"],
    [],
    ["Date", "Item", "Category", "Income", "Expense", "Balance"],
    // Sample rows with formulas
    ["=TEXT(TODAY()-30,\"yyyy-mm-dd\")", "Monthly Salary", "Income", "30000", "0", "=D5-E5"],
    ["=TEXT(TODAY()-29,\"yyyy-mm-dd\")", "Rent", "Housing", "0", "8000", "=D6-E6"],
    ["=TEXT(TODAY()-28,\"yyyy-mm-dd\")", "Groceries", "Food", "0", "500", "=D7-E7"],
    ["=TEXT(TODAY()-27,\"yyyy-mm-dd\")", "Utilities", "Bills", "0", "1200", "=D8-E8"],
    ["=TEXT(TODAY()-26,\"yyyy-mm-dd\")", "Transport", "Travel", "0", "300", "=D9-E9"],
    ["=TEXT(TODAY()-25,\"yyyy-mm-dd\")", "Entertainment", "Fun", "0", "500", "=D10-E10"],
    ["=TEXT(TODAY()-24,\"yyyy-mm-dd\")", "Freelance Project", "Income", "5000", "0", "=D11-E11"],
    ["=TEXT(TODAY()-23,\"yyyy-mm-dd\")", "Dining Out", "Food", "0", "400", "=D12-E12"],
    ["=TEXT(TODAY()-22,\"yyyy-mm-dd\")", "Internet", "Bills", "0", "350", "=D13-E13"],
    ["=TEXT(TODAY()-21,\"yyyy-mm-dd\")", "Phone", "Bills", "0", "200", "=D14-E14"],
    // Empty rows for user input
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    ["", "", "", "", "", ""],
    [],
    // Summary formulas
    ["TOTAL", "", "", "=SUM(D5:D14)", "=SUM(E5:E14)", "=D18-E18"],
    ["", "", "", "Total Income", "Total Expense", "Net Balance"],
    ["", "", "", "=D18", "=E18", "=F18"]
  ];
}
function createMealPlannerRows(): any[][] {
  return [["🥗 Meal Planner"], [], ["Day", "Breakfast", "Lunch", "Dinner", "Snacks"], ["Monday"], ["Tuesday"], ["Wednesday"], ["Thursday"], ["Friday"], ["Saturday"], ["Sunday"]];
}
function createFitnessLogRows(): any[][] {
  return [["🏋️ Fitness Log"], [], ["Date", "Activity", "Duration", "Intensity (1-10)", "Notes"]];
}
function createReadingListRows(): any[][] {
  return [["📚 Reading List"], [], ["Title", "Author", "Status", "Rating (1-5)"]];
}

function addVBAMacros(workbook: XLSX.WorkBook) {
  // Create a Reference sheet with dropdown options
  const referenceSheet = XLSX.utils.aoa_to_sheet([
    ["📖 ZenPlanner Reference Guide"],
    [],
    ["Dropdown Options (for manual entry or VBA)"],
    [],
    ["Column", "Valid Options", "Description"],
    ["Status", "Pending, In Progress, Done, Skipped", "Task status"],
    ["Priority", "High, Medium, Low", "Task priority"],
    ["Mood", "😫, 😕, 😐, 🙂, 😄", "Mood scale (1-5)"],
    ["Energy", "1, 2, 3, 4, 5", "Energy level"],
    ["Progress", "0-100%", "Percentage complete"],
    [],
    ["Color Coding (Zen Design System)"],
    [],
    ["Color", "RGB", "Usage"],
    ["zen-sage (Green)", "RGB(124, 154, 130)", "Done/Complete"],
    ["zen-gold (Yellow)", "RGB(201, 169, 110)", "In Progress"],
    ["zen-blossom (Red)", "RGB(212, 131, 127)", "Overdue/Urgent"],
    ["zen-indigo (Purple)", "RGB(107, 122, 161)", "Notes/Info"],
    [],
    ["Keyboard Shortcuts"],
    [],
    ["Action", "Shortcut", "Description"],
    ["Save", "Ctrl+S", "Save workbook"],
    ["Find", "Ctrl+F", "Find text"],
    ["Today's Date", "Ctrl+;", "Insert today's date"],
    ["Current Time", "Ctrl+Shift+;", "Insert current time"],
    [],
    ["Formula Quick Reference"],
    [],
    ["Formula", "Description", "Example"],
    ["=TODAY()", "Current date", "=TODAY()"],
    ["=NOW()", "Current date & time", "=NOW()"],
    ["=SUM(A1:A10)", "Sum range", "=SUM(B2:B100)"],
    ["=AVERAGE(A1:A10)", "Average range", "=AVERAGE(C2:C30)"],
    ["=COUNTIF(A1:A10,\"Done\")", "Count if", "=COUNTIF(D:D,\"Done\")"],
    ["=IF(A1>0,\"Yes\",\"No\")", "If statement", "=IF(B2<>\"\"\"\"\"\\,1,0)"],
    ["=VLOOKUP(...)", "Search table", "=VLOOKUP(A1,Sheet2!A:B,2,0)"],
    ["=INDEX(...)", "Get value by position", "=INDEX(A1:A10,5)"],
    ["=MATCH(...)", "Find position", "=MATCH(A1,B1:B10,0)"],
    [],
    ["Quick Fill Formulas (copy to your sheets)"],
    [],
    ["Use this...", "For...", "Result"],
    ["=IF(B2<>\"\"\"\"\"\\,1,0)", "Score if task exists", "1 or 0"],
    ["=TEXT(TODAY(),\"yyyy-mm-dd\")", "Today's date (text)", "2026-03-15"],
    ["=WEEKDAY(TODAY(),2)", "Day of week (1-7)", "6 (Saturday)"],
    ["=MONTH(TODAY())", "Current month (1-12)", "3"],
    ["=YEAR(TODAY())", "Current year", "2026"],
  ]);
  referenceSheet["!cols"] = [{ wch: 30 }, { wch: 50 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, referenceSheet, "📖 Reference");

  // VBA Instructions sheet
  const instructions = [
    ["วิธีเพิ่มฟังก์ชันอัตโนมัติ (Macros) ให้กับ Planner ของคุณ"],
    [],
    ["คำแนะนำ: โค้ดเหล่านี้จะช่วยเพิ่มความสามารถให้ Planner ของคุณ เช่น การใส่สีตามสถานะ, การสร้างปุ่ม Dropdown, และการสร้างหน้าสรุปผล"],
    ["ทำตามขั้นตอนง่ายๆ นี้เพื่อติดตั้ง:"],
    ["1. เปิดไฟล์ Excel นี้ และไปที่แถบ 'Developer' (หากไม่มี ให้ไปที่ File > Options > Customize Ribbon แล้วติ๊กถูกที่ 'Developer')"],
    ["2. กดที่ 'Visual Basic' หรือกด 'Alt + F11' เพื่อเปิดหน้าต่าง VBA Editor"],
    ["3. ที่หน้าต่างด้านซ้าย (Project Explorer), คลิกขวาที่ 'VBAProject (Your-File-Name.xlsx)' -> Insert -> Module"],
    ["4. จะมีหน้าต่าง Module1 ว่างๆ เปิดขึ้นมา"],
    ["5. คัดลอกโค้ดทั้งหมดจากช่องด้านล่าง (เช่น 'โค้ดสำหรับ Conditional Formatting') ไปวางในหน้าต่าง Module1"],
    ["6. ทำซ้ำขั้นตอนที่ 3-5 สำหรับโค้ดแต่ละชุด (สร้าง Module2, Module3)"],
    ["7. เมื่อวางโค้ดครบแล้ว, กลับไปที่หน้า Excel แล้วกดที่แถบ 'Developer' -> 'Macros'"],
    ["8. เลือก Macro ที่ต้องการจะรัน (เช่น 'ApplyConditionalFormatting') แล้วกด 'Run'"],
    ["9. บันทึกไฟล์เป็น 'Excel Macro-Enabled Workbook (*.xlsm)' เพื่อเก็บ Macro ไว้ใช้งานครั้งต่อไป"],
    [],
    ["---"],
    [],
    ["โค้ดสำหรับ Conditional Formatting (ใส่สีตามสถานะ)"],
    [`' Sub: ApplyConditionalFormatting
Sub ApplyConditionalFormatting()
    Dim ws As Worksheet
    Dim rng As Range
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        Set rng = ws.Range("D:D") ' Assuming Status is in column D
        rng.FormatConditions.Delete
        ' Green for "Done"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""Done"""
        rng.FormatConditions(1).Interior.Color = RGB(124, 154, 130) ' zen-sage
        ' Yellow for "In Progress"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""In Progress"""
        rng.FormatConditions(2).Interior.Color = RGB(201, 169, 110) ' zen-gold
        ' Red for "Overdue"
        rng.FormatConditions.Add Type:=xlCellValue, Operator:=xlEqual, Formula1:="=""Overdue"""
        rng.FormatConditions(3).Interior.Color = RGB(212, 131, 127) ' zen-blossom
        On Error GoTo 0
    Next ws
    MsgBox "Conditional formatting applied!", vbInformation
End Sub`],
    [],
    ["---"],
    [],
    ["โค้ดสำหรับ Dropdown Shortcuts (ปุ่มเลือกสถานะ)"],
    [`' Sub: AddDropdownShortcuts
Sub AddDropdownShortcuts()
    Dim ws As Worksheet
    Dim rng As Range
    Dim statusValues As String
    statusValues = "Pending,In Progress,Done,Skipped"
    Dim priorityValues As String
    priorityValues = "High,Medium,Low"
    Dim moodValues As String
    moodValues = "😫,😕,😐,🙂,😄"
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        ' Add Status dropdown in column D
        Set rng = ws.Range("D2:D1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=statusValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        ' Add Priority dropdown in column E
        Set rng = ws.Range("E2:E1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=priorityValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        ' Add Mood dropdown in column F (if exists)
        Set rng = ws.Range("F2:F1000")
        With rng.Validation
            .Delete
            .Add Type:=xlValidateList, Formula1:=moodValues
            .IgnoreBlank = True
            .InCellDropdown = True
        End With
        On Error GoTo 0
    Next ws
    MsgBox "Dropdown shortcuts added!", vbInformation
End Sub`],
    [],
    ["---"],
    [],
    ["โค้ดสำหรับ Summary Dashboard (สร้างหน้าสรุปผล)"],
    [`' Sub: GenerateSummaryDashboard
Sub GenerateSummaryDashboard()
    Dim ws As Worksheet
    Dim summaryWs As Worksheet
    Dim lastRow As Long
    Dim i As Long
    On Error Resume Next
    Set summaryWs = ThisWorkbook.Worksheets("Summary")
    If summaryWs Is Nothing Then
        Set summaryWs = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(1))
        summaryWs.Name = "Summary"
    End If
    On Error GoTo 0
    With summaryWs
        .Cells.Clear
        .Range("A1").Value = "ZenPlanner Summary"
        .Range("A3").Value = "Sheet Name"
        .Range("B3").Value = "Tasks Done"
        .Range("C3").Value = "Tasks Pending"
        i = 4
        For Each ws In ThisWorkbook.Worksheets
            If ws.Name <> "Summary" And ws.Name <> "Reference" And ws.Name <> "VBA Instructions" Then
                .Cells(i, 1).Value = ws.Name
                On Error Resume Next
                lastRow = ws.Cells(ws.Rows.Count, "D").End(xlUp).Row
                If lastRow > 1 Then
                    .Cells(i, 2).Value = Application.WorksheetFunction.CountIf(ws.Range("D2:D" & lastRow), "Done")
                    .Cells(i, 3).Value = Application.WorksheetFunction.CountIf(ws.Range("D2:D" & lastRow), "Pending")
                End If
                On Error GoTo 0
                i = i + 1
            End If
        Next ws
        .Columns("A:C").AutoFit
    End With
    MsgBox "Summary dashboard generated!", vbInformation
End Sub`],
    [],
    ["---"],
    [],
    ["โค้ดสำหรับ Auto-Date (ใส่วันที่อัตโนมัติ)"],
    [`' Sub: AutoFillDates
Sub AutoFillDates()
    Dim ws As Worksheet
    Dim cell As Range
    For Each ws In ThisWorkbook.Worksheets
        On Error Resume Next
        ' Fill date column if empty
        For Each cell In ws.Range("A5:A100")
            If cell.Offset(0, 1).Value <> "" And cell.Value = "" Then
                cell.Value = "=TEXT(TODAY()-ROW()+5,\"yyyy-mm-dd\")"
            End If
        Next cell
        On Error GoTo 0
    Next ws
    MsgBox "Dates auto-filled!", vbInformation
End Sub`],
  ];
  const vbaSheet = XLSX.utils.aoa_to_sheet(instructions);
  vbaSheet["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, vbaSheet, "VBA Instructions");
}

function getAnimalEmoji(animal: string): string {
  const emojis: Record<string, string> = {
    lion: "🦁", whale: "🐋", dolphin: "🐬", owl: "🦉", fox: "🦊", turtle: "🐢",
    eagle: "🦅", octopus: "🐙", mountain: "⛰️", wolf: "🐺", sakura: "🌸", cat: "🐱",
    crocodile: "🐊", dove: "🕊️", butterfly: "🦋", bamboo: "🎋",
  };
  return emojis[animal] || "🌟";
}