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

export const eisenhowerMatrix: ToolDefinition = makeStub({
  id: "eisenhower_matrix", category: "productivity",
  name: L("Eisenhower Matrix", "เมทริกซ์ไอเซนฮาวร์", "艾森豪威尔矩阵"),
  description: L("Sort tasks by urgency and importance.", "จัดเรียงงานตามความเร่งด่วนและความสำคัญ", "按紧急性与重要性排序任务"),
  icon: AlignJustify, color: "zen-clay",
  recommendedFor: ["lion", "eagle", "crocodile", "owl"],
  recommendationReason: L("Strategic prioritization for decisive planners.", "การจัดลำดับเชิงกลยุทธ์สำหรับผู้วางแผนเด็ดขาด", "为决断型规划者设计的战略优先级"),
});

export const kanbanBoard: ToolDefinition = makeStub({
  id: "kanban_board", category: "productivity",
  name: L("Kanban Board", "กระดานคัมบัง", "看板"),
  description: L("To Do, Doing, Done — flexible workflow.", "ทำต่อ กำลังทำ เสร็จแล้ว — เวิร์กโฟลว์ยืดหยุ่น", "待办、进行中、完成 — 灵活工作流"),
  icon: ClipboardList, color: "zen-sage",
  recommendedFor: ["fox", "octopus", "butterfly"],
  recommendationReason: L("Adaptive flow for parallel thinkers.", "การไหลที่ปรับตัวได้สำหรับนักคิดแบบขนาน", "适合并行思考者的自适应流程"),
});

export const timeBoxing: ToolDefinition = makeStub({
  id: "time_boxing", category: "productivity",
  name: L("Time Boxing", "ไทม์บ็อกซิ่ง", "时间盒"),
  description: L("Block your day hour by hour.", "บล็อกเวลาทีละชั่วโมง", "按小时安排你的一天"),
  icon: Clock, color: "zen-sky",
  recommendedFor: ["owl", "mountain", "lion"],
  recommendationReason: L("Hour-by-hour control for structured days.", "ควบคุมเป็นรายชั่วโมงสำหรับวันที่มีโครงสร้าง", "为结构化日子提供小时级控制"),
});

export const focusBlocks: ToolDefinition = makeStub({
  id: "focus_blocks", category: "productivity",
  name: L("Focus Blocks", "บล็อกโฟกัส", "专注时段"),
  description: L("Reserve deep-focus blocks each day.", "จองเวลาโฟกัสลึกในแต่ละวัน", "每天预留深度专注时段"),
  icon: Crosshair, color: "zen-clay",
  recommendedFor: ["owl", "mountain"],
  recommendationReason: L("Protected windows for deep workers.", "ช่วงเวลาที่ปกป้องสำหรับผู้ทำงานเชิงลึก", "为深度工作者保护的时间窗口"),
});

export const breakTimer: ToolDefinition = makeStub({
  id: "break_timer", category: "productivity",
  name: L("Break Timer", "ตัวจับเวลาพัก", "休息计时"),
  description: L("Reminders to step away and recharge.", "ตัวเตือนให้พักและเติมพลัง", "提醒你休息与充电"),
  icon: Coffee, color: "zen-amber",
  recommendedFor: ["sakura", "dove", "cat", "bamboo"],
  recommendationReason: L("Gentle pacing for sustainable energy.", "จังหวะอ่อนโยนเพื่อพลังที่ยั่งยืน", "为可持续能量提供温和节奏"),
});

export const deepWork: ToolDefinition = makeStub({
  id: "deep_work", category: "productivity",
  name: L("Deep Work", "ทำงานเชิงลึก", "深度工作"),
  description: L("Track long, undistracted focus sessions.", "ติดตามช่วงโฟกัสยาวที่ไม่ถูกรบกวน", "追踪长时间无干扰的专注时段"),
  icon: Brain, color: "zen-indigo",
  recommendedFor: ["owl", "whale", "mountain"],
  recommendationReason: L("Long-form focus for deep thinkers.", "โฟกัสระยะยาวสำหรับนักคิดเชิงลึก", "适合深度思考者的长时间专注"),
});

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

export const moodScore: ToolDefinition = makeStub({
  id: "mood_score", category: "wellbeing",
  name: L("Mood Score", "คะแนนอารมณ์", "心情评分"),
  description: L("Numeric daily mood score.", "คะแนนอารมณ์ประจำวันแบบตัวเลข", "每日心情数字评分"),
  icon: BarChart3, color: "zen-rose",
  recommendedFor: ["whale", "sakura", "dove"],
  recommendationReason: L("Quantify mood for trend tracking.", "วัดอารมณ์เพื่อติดตามแนวโน้ม", "量化心情以追踪趋势"),
});

export const sleepQuality: ToolDefinition = makeStub({
  id: "sleep_quality", category: "wellbeing",
  name: L("Sleep Quality", "คุณภาพการนอน", "睡眠质量"),
  description: L("Rate how rested you feel.", "ให้คะแนนความสดชื่นที่ได้รับ", "为你的休息感打分"),
  icon: Star, color: "zen-indigo",
  recommendedFor: ["whale", "bamboo", "turtle"],
  recommendationReason: L("Lightweight rest tracking.", "การติดตามการพักแบบเบา", "轻量化的休息追踪"),
});

export const energyDial: ToolDefinition = makeStub({
  id: "energy_dial", category: "wellbeing",
  name: L("Energy Dial", "ตัวหมุนพลังงาน", "能量仪表"),
  description: L("Quick dial for current energy level.", "ตัวหมุนเร็วสำหรับระดับพลังงานตอนนี้", "快速调节当前能量"),
  icon: Activity, color: "zen-amber",
  recommendedFor: ["fox", "dolphin", "butterfly"],
  recommendationReason: L("One-tap energy check-in.", "เช็กอินพลังงานด้วยการแตะครั้งเดียว", "一键能量打卡"),
});

import { meditationTimer } from "./meditation_timer";
export { meditationTimer };

export const workoutLog: ToolDefinition = makeStub({
  id: "workout_log", category: "wellbeing",
  name: L("Workout Log", "บันทึกการออกกำลังกาย", "健身日志"),
  description: L("Log workouts and physical activity.", "บันทึกการออกกำลังกายและกิจกรรมทางกาย", "记录健身与运动"),
  icon: Heart, color: "zen-rose",
  recommendedFor: ["lion", "wolf", "mountain", "eagle"],
  recommendationReason: L("Physical discipline for action-driven types.", "วินัยทางกายสำหรับผู้ขับเคลื่อนด้วยการกระทำ", "为行动派提供身体纪律"),
});

// ============================================================
// REFLECTION (11)
// ============================================================

import { gratitude } from "./gratitude";
export { gratitude };

import { weeklyReview } from "./weekly_review";
export { weeklyReview };

import { dailyReflection } from "./daily_reflection";
export { dailyReflection };

export const monthlyHorizon: ToolDefinition = makeStub({
  id: "monthly_horizon", category: "reflection",
  name: L("Monthly Horizon", "เส้นขอบฟ้ารายเดือน", "月度展望"),
  description: L("Plan and review the month ahead.", "วางแผนและทบทวนเดือนที่จะถึง", "规划与回顾未来的一个月"),
  icon: CalendarDays, color: "zen-sky",
  recommendedFor: ["turtle", "mountain", "bamboo", "eagle"],
  recommendationReason: L("Monthly arc for steady builders.", "ส่วนโค้งรายเดือนสำหรับผู้สร้างที่มั่นคง", "为稳健建设者提供的月度轨迹"),
});

export const quarterlyVision: ToolDefinition = makeStub({
  id: "quarterly_vision", category: "reflection",
  name: L("Quarterly Vision", "วิสัยทัศน์รายไตรมาส", "季度愿景"),
  description: L("90-day OKR-style planning.", "การวางแผนแบบ OKR 90 วัน", "90 天 OKR 式规划"),
  icon: Compass, color: "zen-clay",
  recommendedFor: ["eagle", "lion", "crocodile"],
  recommendationReason: L("Strategic horizon for visionaries.", "ขอบฟ้าเชิงกลยุทธ์สำหรับผู้มีวิสัยทัศน์", "为远见者设计的战略视野"),
});

export const weeklyIntentions: ToolDefinition = makeStub({
  id: "weekly_intentions", category: "reflection",
  name: L("Weekly Intentions", "เจตนารายสัปดาห์", "每周意图"),
  description: L("Set 3 intentions for the week.", "ตั้งเจตนา 3 ข้อสำหรับสัปดาห์", "为本周设定 3 个意图"),
  icon: Flag, color: "zen-sage",
  recommendedFor: ["dove", "sakura", "whale"],
  recommendationReason: L("Soft commitments for gentle progress.", "พันธสัญญานุ่มนวลสำหรับความก้าวหน้าที่อ่อนโยน", "为温和的进步设定轻柔承诺"),
});

export const monthlyReview: ToolDefinition = makeStub({
  id: "monthly_review", category: "reflection",
  name: L("Monthly Review", "ทบทวนรายเดือน", "月度回顾"),
  description: L("Review what worked and what didn't.", "ทบทวนสิ่งที่ได้ผลและไม่ได้ผล", "回顾哪些有效、哪些无效"),
  icon: BookOpen, color: "zen-sage",
  recommendedFor: ["whale", "owl", "mountain"],
  recommendationReason: L("Pause and learn at month-end.", "หยุดและเรียนรู้เมื่อจบเดือน", "月末停下脚步去学习"),
});

export const quarterlyOkrs: ToolDefinition = makeStub({
  id: "quarterly_okrs", category: "reflection",
  name: L("Quarterly OKRs", "OKR รายไตรมาส", "季度 OKR"),
  description: L("Objectives + Key Results, every 90 days.", "วัตถุประสงค์ + ผลลัพธ์หลัก ทุก 90 วัน", "目标与关键结果，每 90 天"),
  icon: Target, color: "zen-clay",
  recommendedFor: ["eagle", "lion", "crocodile"],
  recommendationReason: L("Outcome-driven planning for ambition.", "การวางแผนเน้นผลลัพธ์สำหรับความทะเยอทะยาน", "为雄心驱动的成果规划"),
});

export const yearVision: ToolDefinition = makeStub({
  id: "year_vision", category: "reflection",
  name: L("Year Vision", "วิสัยทัศน์รายปี", "年度愿景"),
  description: L("Sketch your year in one page.", "วาดภาพปีของคุณในหน้าเดียว", "在一页上勾勒你的一年"),
  icon: Sun, color: "zen-amber",
  recommendedFor: ["eagle", "whale", "mountain"],
  recommendationReason: L("Long view for big-picture minds.", "มุมมองระยะยาวสำหรับผู้คิดภาพใหญ่", "为大局观者提供长远视角"),
});

export const gratitudeThree: ToolDefinition = makeStub({
  id: "gratitude_three", category: "reflection",
  name: L("3 Gratitudes", "3 ความขอบคุณ", "三个感恩"),
  description: L("Three things you appreciated today.", "สามสิ่งที่คุณซาบซึ้งวันนี้", "今天你欣赏的三件事"),
  icon: Heart, color: "zen-rose",
  recommendedFor: ["sakura", "dove", "cat", "bamboo"],
  recommendationReason: L("A simple ritual that compounds.", "พิธีกรรมง่ายๆ ที่ทบทวีตามเวลา", "随时间累积的简单仪式"),
});

export const lessonsLearned: ToolDefinition = makeStub({
  id: "lessons_learned", category: "reflection",
  name: L("Lessons Learned", "บทเรียนที่ได้", "经验教训"),
  description: L("Capture what you learned today.", "บันทึกสิ่งที่คุณเรียนรู้วันนี้", "记录你今天学到了什么"),
  icon: Lightbulb, color: "zen-amber",
  recommendedFor: ["owl", "whale", "octopus"],
  recommendationReason: L("Convert experience into wisdom.", "เปลี่ยนประสบการณ์เป็นปัญญา", "将经验转化为智慧"),
});

// ============================================================
// TRACKING (7)
// ============================================================

export const booksLog: ToolDefinition = makeStub({
  id: "books_log", category: "tracking",
  name: L("Books Log", "บันทึกหนังสือ", "读书记录"),
  description: L("Track what you're reading.", "ติดตามสิ่งที่คุณกำลังอ่าน", "追踪你正在读的书"),
  icon: BookOpen, color: "zen-sage",
  recommendedFor: ["owl", "whale", "cat"],
  recommendationReason: L("A reading habit for curious minds.", "นิสัยการอ่านสำหรับผู้อยากรู้", "为好奇心提供阅读习惯"),
});

export const goalsTracker: ToolDefinition = makeStub({
  id: "goals_tracker", category: "tracking",
  name: L("Goals Tracker", "ตัวติดตามเป้าหมาย", "目标追踪"),
  description: L("Track progress toward each goal.", "ติดตามความก้าวหน้าสู่แต่ละเป้าหมาย", "追踪每个目标的进度"),
  icon: Goal, color: "zen-clay",
  recommendedFor: ["eagle", "lion", "crocodile", "wolf"],
  recommendationReason: L("Progress visibility for goal seekers.", "ความชัดเจนของความก้าวหน้าสำหรับผู้แสวงหาเป้าหมาย", "为追求目标者提供进度可视化"),
});

export const decisionLog: ToolDefinition = makeStub({
  id: "decision_log", category: "tracking",
  name: L("Decision Log", "บันทึกการตัดสินใจ", "决策日志"),
  description: L("Record decisions and their context.", "บันทึกการตัดสินใจและบริบท", "记录决策及其背景"),
  icon: ScrollText, color: "zen-indigo",
  recommendedFor: ["owl", "crocodile", "octopus"],
  recommendationReason: L("Track your reasoning over time.", "ติดตามการให้เหตุผลของคุณตามเวลา", "随时间追踪你的推理"),
});

export const learningLog: ToolDefinition = makeStub({
  id: "learning_log", category: "tracking",
  name: L("Learning Log", "บันทึกการเรียนรู้", "学习日志"),
  description: L("Log courses, lessons, breakthroughs.", "บันทึกคอร์ส บทเรียน ความก้าวหน้า", "记录课程、课堂与突破"),
  icon: Briefcase, color: "zen-sage",
  recommendedFor: ["owl", "octopus", "fox"],
  recommendationReason: L("A growth ledger for learners.", "บันทึกการเติบโตสำหรับผู้เรียน", "为学习者的成长账本"),
});

export const financeQuick: ToolDefinition = makeStub({
  id: "finance_quick", category: "tracking",
  name: L("Quick Finance", "การเงินด่วน", "快速财务"),
  description: L("One-line money tracking.", "ติดตามเงินบรรทัดเดียว", "单行财务追踪"),
  icon: Wallet, color: "zen-amber",
  recommendedFor: ["crocodile", "mountain", "turtle"],
  recommendationReason: L("Lightweight money awareness.", "การตระหนักเรื่องเงินแบบเบา", "轻量化的金钱意识"),
});

export const expenseLog: ToolDefinition = makeStub({
  id: "expense_log", category: "tracking",
  name: L("Expense Log", "บันทึกค่าใช้จ่าย", "支出日志"),
  description: L("Track every expense by category.", "ติดตามค่าใช้จ่ายทุกรายการตามหมวด", "按类别追踪每笔支出"),
  icon: CreditCard, color: "zen-clay",
  recommendedFor: ["crocodile", "owl", "mountain"],
  recommendationReason: L("Detail-oriented money tracking.", "การติดตามเงินที่ใส่ใจในรายละเอียด", "注重细节的财务追踪"),
});

export const savingsGoal: ToolDefinition = makeStub({
  id: "savings_goal", category: "tracking",
  name: L("Savings Goal", "เป้าหมายการออม", "储蓄目标"),
  description: L("Track progress toward a savings goal.", "ติดตามความก้าวหน้าสู่เป้าหมายการออม", "追踪储蓄目标的进度"),
  icon: PiggyBank, color: "zen-rose",
  recommendedFor: ["turtle", "bamboo", "mountain"],
  recommendationReason: L("Patient saving for long-term builders.", "การออมที่อดทนสำหรับผู้สร้างระยะยาว", "为长期建设者提供耐心储蓄"),
});

// ============================================================
// CREATIVITY (3)
// ============================================================

export const quickNotes: ToolDefinition = makeStub({
  id: "quick_notes", category: "creativity",
  name: L("Quick Notes", "โน้ตด่วน", "速记"),
  description: L("Capture short notes throughout the day.", "บันทึกโน้ตสั้นๆ ตลอดวัน", "整天捕捉简短笔记"),
  icon: NotebookPen, color: "zen-sky",
  recommendedFor: ["fox", "butterfly", "octopus", "cat"],
  recommendationReason: L("Frictionless capture for fast minds.", "การบันทึกที่ไม่มีการเสียดทานสำหรับผู้คิดเร็ว", "为快速思考者提供零摩擦记录"),
});

export const brainDump: ToolDefinition = makeStub({
  id: "brain_dump", category: "creativity",
  name: L("Brain Dump", "ระบายสมอง", "脑暴"),
  description: L("Empty your head onto the page.", "เทสมองของคุณลงบนหน้ากระดาษ", "把脑子里的一切写下来"),
  icon: Brain, color: "zen-indigo",
  recommendedFor: ["octopus", "butterfly", "fox", "cat"],
  recommendationReason: L("Pressure release for busy minds.", "การปลดปล่อยแรงดันสำหรับผู้คิดมาก", "为忙碌头脑提供减压"),
});

export const ideaCapture: ToolDefinition = makeStub({
  id: "idea_capture", category: "creativity",
  name: L("Idea Capture", "บันทึกไอเดีย", "灵感捕捉"),
  description: L("Save ideas before they vanish.", "บันทึกไอเดียก่อนที่มันจะหายไป", "在灵感消失之前记录下来"),
  icon: Rocket, color: "zen-amber",
  recommendedFor: ["butterfly", "fox", "octopus", "dolphin"],
  recommendationReason: L("Never lose a good thought.", "อย่าให้ความคิดดีๆ หายไป", "永不丢失好想法"),
});

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
