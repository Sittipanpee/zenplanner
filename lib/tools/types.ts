/**
 * Productivity Tools System — Type Contracts (SSOT)
 *
 * This file is the single source of truth for the new tool system (PTS-00).
 * All Wave-1 agents implementing tool widgets MUST import their types from here.
 *
 * NOTE: This `ToolId` union is intentionally separate from the legacy
 * `ToolId` in `lib/types.ts` (which belongs to the old SheetJS planner).
 * Always import the productivity-tools `ToolId` from `lib/tools/types`.
 */

import type { ComponentType } from "react";
import type { ZodSchema } from "zod";
import type { LucideIcon } from "lucide-react";
import type { SpiritAnimal } from "@/lib/types";

// ============================================================
// Tool identity
// ============================================================

export type ToolId =
  // Productivity
  | "daily_priorities"
  | "pomodoro"
  | "eisenhower_matrix"
  | "kanban_board"
  | "time_boxing"
  | "tasks"
  | "focus_blocks"
  | "break_timer"
  | "deep_work"
  // Wellbeing
  | "habit_tracker"
  | "mood_log"
  | "water"
  | "sleep"
  | "energy_level"
  | "mood_score"
  | "sleep_quality"
  | "energy_dial"
  | "meditation_timer"
  | "workout_log"
  // Reflection
  | "gratitude"
  | "weekly_review"
  | "daily_reflection"
  | "monthly_horizon"
  | "quarterly_vision"
  | "weekly_intentions"
  | "monthly_review"
  | "quarterly_okrs"
  | "year_vision"
  | "gratitude_three"
  | "lessons_learned"
  // Tracking
  | "books_log"
  | "goals_tracker"
  | "decision_log"
  | "learning_log"
  | "finance_quick"
  | "expense_log"
  | "savings_goal"
  // Creativity
  | "quick_notes"
  | "brain_dump"
  | "idea_capture"
  // Synthetic — backing tools for features like cross-tool reports.
  // Not shown in the catalog; registered so entries can be persisted.
  | "period_reflection";

export type ToolCategory =
  | "productivity"
  | "wellbeing"
  | "reflection"
  | "tracking"
  | "creativity";

export type Locale = "en" | "th" | "zh";

export interface LocalizedString {
  en: string;
  th: string;
  zh: string;
}

// ============================================================
// Persisted entry shape (mirrors `tool_entries` table row)
// ============================================================

export interface ToolEntry {
  id: string;
  user_id: string;
  tool_id: string;
  entry_date: string; // ISO date (YYYY-MM-DD)
  payload: Record<string, unknown>;
  created_at: string; // ISO timestamp
}

// ============================================================
// Widget contract
// ============================================================

export interface ToolWidgetProps {
  userId: string;
  toolId: ToolId;
  config: Record<string, unknown>;
  entries: ToolEntry[];
  onEntryAdd: (payload: unknown) => Promise<void>;
  onConfigChange: (config: Record<string, unknown>) => Promise<void>;
  locale: Locale;
}

// ============================================================
// Excel export contract (placeholder shapes — Wave M4 finalises)
// ============================================================

export interface WorkbookSheet {
  /** Sheet name as it appears in the workbook tab */
  name: string;
  /** Header row (column titles) */
  headers: string[];
  /** Data rows — strings, numbers, booleans, formulas, or null */
  rows: Array<Array<string | number | boolean | null>>;
  /** Optional cell-level metadata (formula bindings, validation, styling hints) */
  meta?: Record<string, unknown>;
}

export interface DashboardCell {
  /** Cell address on the dashboard sheet, e.g. "B4" */
  address: string;
  /** Literal value or Excel formula (prefix with `=`) */
  value: string | number | boolean;
  /** Optional rendering hint for the dashboard generator */
  style?: "metric" | "label" | "progress" | "chart-anchor";
}

export interface ToolExcelContract {
  buildSheet: (
    entries: ToolEntry[],
    config: Record<string, unknown>
  ) => WorkbookSheet;
  buildDashboardSection: (
    aggregates: Record<string, unknown>
  ) => DashboardCell[];
}

// ============================================================
// ToolDefinition — the master interface every tool conforms to
// ============================================================

export interface ToolDefinition {
  // Identity
  id: ToolId;
  category: ToolCategory;

  // Presentation
  name: LocalizedString;
  description: LocalizedString;
  icon: LucideIcon;
  /** Tailwind color token, e.g. "zen-sage" */
  color: string;

  // Archetype affinity
  recommendedFor: SpiritAnimal[];
  recommendationReason: LocalizedString;

  // Data shape
  schema: ZodSchema;
  defaultConfig: Record<string, unknown>;

  // Widget — rendered on the dashboard
  Widget: ComponentType<ToolWidgetProps>;

  // Relations (Pillar 3)
  produces: string[];
  consumes: string[];

  // Excel (Pillar 4)
  excel: ToolExcelContract;
}

// ============================================================
// Persisted user_tools row (mirrors `user_tools` table)
// ============================================================

export interface UserTool {
  id: string;
  user_id: string;
  tool_id: string;
  enabled: boolean;
  config: Record<string, unknown>;
  position: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Type guard
// ============================================================

const ALL_TOOL_IDS: readonly ToolId[] = [
  "daily_priorities", "pomodoro", "eisenhower_matrix", "kanban_board",
  "time_boxing", "tasks", "focus_blocks", "break_timer", "deep_work",
  "habit_tracker", "mood_log", "water", "sleep", "energy_level",
  "mood_score", "sleep_quality", "energy_dial", "meditation_timer", "workout_log",
  "gratitude", "weekly_review", "daily_reflection", "monthly_horizon",
  "quarterly_vision", "weekly_intentions", "monthly_review", "quarterly_okrs",
  "year_vision", "gratitude_three", "lessons_learned",
  "books_log", "goals_tracker", "decision_log", "learning_log",
  "finance_quick", "expense_log", "savings_goal",
  "quick_notes", "brain_dump", "idea_capture",
] as const;

export function isProductivityToolId(value: string): value is ToolId {
  return (ALL_TOOL_IDS as readonly string[]).includes(value);
}

export { ALL_TOOL_IDS };
