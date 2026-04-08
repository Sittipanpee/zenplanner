/**
 * Barrel of every ToolDefinition stub. Wave-1 agents replace each export
 * here with the real implementation imported from `lib/tools/{tool_id}/index.tsx`.
 *
 * IMPORTANT — Wave-1 convention:
 *   - Each tool lives in `lib/tools/{tool_id}/` (snake_case folder).
 *   - The folder exports a single `ToolDefinition` as default OR named export
 *     matching the camelCase form of the tool id (e.g. `dailyPriorities`).
 *   - Replace the corresponding stub below with `import { dailyPriorities } from "./daily_priorities";
export { dailyPriorities };`
 *
 * All stubs use `PlaceholderWidget`, an empty Zod schema, and excel
 * placeholders so the foundation compiles cleanly before Wave-1 lands.
 */

import { z } from "zod";
import {
  Activity, AlarmClock, AlignJustify, BarChart3, BookOpen, Brain, Briefcase,
  Calendar, CalendarDays, CheckSquare, ClipboardList, Clock, Coffee, Compass,
  CreditCard, Crosshair, Droplets, Feather, FileText, Flag, Flame, Goal,
  Heart, Lightbulb, ListChecks, ListTodo, Moon, NotebookPen, PiggyBank,
  Repeat, Rocket, ScrollText, Smile, Sparkles, Star, Sun, Target, Timer,
  TrendingUp, Wallet, Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import { PlaceholderWidget } from "./PlaceholderWidget";
import type {
  ToolDefinition,
  ToolWidgetProps,
  ToolCategory,
  ToolId,
  LocalizedString,
} from "./types";
import type { SpiritAnimal } from "@/lib/types";

// Empty Zod schema — Wave-1 agents replace with real entry payload schema.
const emptySchema = z.object({}).passthrough();

const PlaceholderWidgetTyped: ComponentType<ToolWidgetProps> = PlaceholderWidget;

interface StubInput {
  id: ToolId;
  category: ToolCategory;
  name: LocalizedString;
  description: LocalizedString;
  icon: LucideIcon;
  color: string;
  recommendedFor: SpiritAnimal[];
  recommendationReason: LocalizedString;
}

function makeStub(input: StubInput): ToolDefinition {
  return {
    id: input.id,
    category: input.category,
    name: input.name,
    description: input.description,
    icon: input.icon,
    color: input.color,
    recommendedFor: input.recommendedFor,
    recommendationReason: input.recommendationReason,
    schema: emptySchema,
    defaultConfig: {},
    Widget: PlaceholderWidgetTyped,
    produces: [],
    consumes: [],
    excel: {
      buildSheet: () => ({
        name: input.name.en,
        headers: ["date", "payload"],
        rows: [],
      }),
      buildDashboardSection: () => [],
    },
  };
}

// ---------- helper trilingual constructor ----------
const L = (en: string, th: string, zh: string): LocalizedString => ({ en, th, zh });

// ============================================================
// PRODUCTIVITY (9)
// ============================================================

import { dailyPriorities } from "./daily_priorities";
export { dailyPriorities };

import { pomodoro } from "./pomodoro";
export { pomodoro };

import { tasks } from "./tasks";
export { tasks };

import { eisenhowerMatrix } from "./eisenhower_matrix";
export { eisenhowerMatrix };

import { kanbanBoard } from "./kanban_board";
export { kanbanBoard };

import { timeBoxing } from "./time_boxing";
export { timeBoxing };

import { focusBlocks } from "./focus_blocks";
export { focusBlocks };

import { breakTimer } from "./break_timer";
export { breakTimer };

import { deepWork } from "./deep_work";
export { deepWork };

// ============================================================
// WELLBEING (10)
// ============================================================

import { habitTracker } from "./habit_tracker";
export { habitTracker };

import { moodLog } from "./mood_log";
export { moodLog };

import { water } from "./water";
export { water };

import { sleep } from "./sleep";
export { sleep };

import { energyLevel } from "./energy_level";
export { energyLevel };

import { moodScore } from "./mood_score";
export { moodScore };

import { sleepQuality } from "./sleep_quality";
export { sleepQuality };

import { energyDial } from "./energy_dial";
export { energyDial };

import { meditationTimer } from "./meditation_timer";
export { meditationTimer };

import { workoutLog } from "./workout_log";
export { workoutLog };

// ============================================================
// REFLECTION (11)
// ============================================================

import { gratitude } from "./gratitude";
export { gratitude };

import { weeklyReview } from "./weekly_review";
export { weeklyReview };

import { dailyReflection } from "./daily_reflection";
export { dailyReflection };

import { monthlyHorizon } from "./monthly_horizon";
export { monthlyHorizon };

import { quarterlyVision } from "./quarterly_vision";
export { quarterlyVision };

import { weeklyIntentions } from "./weekly_intentions";
export { weeklyIntentions };

import { monthlyReview } from "./monthly_review";
export { monthlyReview };

import { quarterlyOkrs } from "./quarterly_okrs";
export { quarterlyOkrs };

import { yearVision } from "./year_vision";
export { yearVision };

import { gratitudeThree } from "./gratitude_three";
export { gratitudeThree };

import { lessonsLearned } from "./lessons_learned";
export { lessonsLearned };

// ============================================================
// TRACKING (7)
// ============================================================

import { booksLog } from "./books_log";
export { booksLog };

import { goalsTracker } from "./goals_tracker";
export { goalsTracker };

import { decisionLog } from "./decision_log";
export { decisionLog };

import { learningLog } from "./learning_log";
export { learningLog };

import { financeQuick } from "./finance_quick";
export { financeQuick };

import { expenseLog } from "./expense_log";
export { expenseLog };

import { savingsGoal } from "./savings_goal";
export { savingsGoal };

// ============================================================
// CREATIVITY (3)
// ============================================================

import { quickNotes } from "./quick_notes";
export { quickNotes };

import { brainDump } from "./brain_dump";
export { brainDump };

import { ideaCapture } from "./idea_capture";
export { ideaCapture };

// ============================================================
// SYNTHETIC (not shown in catalog)
// ============================================================

/**
 * period_reflection: backing tool for the /reports page reflection textarea.
 * NOT included in catalog/recommendations — filtered out by id prefix logic.
 * The reports page POSTs to /api/tools/entries with this id to persist
 * freeform reflections per period (week/month/quarter/year).
 */
export const periodReflection: ToolDefinition = makeStub({
  id: "period_reflection", category: "reflection",
  name: L("Period Reflection", "ทบทวนช่วงเวลา", "周期反思"),
  description: L("Freeform reflection attached to a reporting period.", "การทบทวนแบบอิสระสำหรับช่วงเวลารายงาน", "附加到报告周期的自由反思"),
  icon: Feather, color: "zen-indigo",
  recommendedFor: [],
  recommendationReason: L("Synthetic tool — not shown in catalog.", "เครื่องมือภายใน — ไม่แสดงในแคตตาล็อก", "内部工具 — 不在目录中显示"),
});

// Re-export for convenient registry assembly.
export const ALL_STUBS: ToolDefinition[] = [
  // productivity
  dailyPriorities, pomodoro, eisenhowerMatrix, kanbanBoard, timeBoxing,
  tasks, focusBlocks, breakTimer, deepWork,
  // wellbeing
  habitTracker, moodLog, water, sleep, energyLevel,
  moodScore, sleepQuality, energyDial, meditationTimer, workoutLog,
  // reflection
  gratitude, weeklyReview, dailyReflection, monthlyHorizon, quarterlyVision,
  weeklyIntentions, monthlyReview, quarterlyOkrs, yearVision, gratitudeThree,
  lessonsLearned,
  // tracking
  booksLog, goalsTracker, decisionLog, learningLog, financeQuick,
  expenseLog, savingsGoal,
  // creativity
  quickNotes, brainDump, ideaCapture,
  // synthetic (hidden from catalog by toSerializable filter — see registry.ts)
  periodReflection,
];

/**
 * Tool IDs that are not shown in the catalog but are registered so their
 * entries can be persisted via /api/tools/entries. Catalog/recommendation
 * surfaces filter these out.
 */
export const SYNTHETIC_TOOL_IDS: ReadonlySet<string> = new Set(["period_reflection"]);

// Lucide icon barrel for unused-import linter — every stub uses at least one.
// Keeping all icon imports referenced silences the linter for the big import set.
void ([
  AlarmClock, FileText, TrendingUp, Flame, Sparkles,
] satisfies LucideIcon[]);
