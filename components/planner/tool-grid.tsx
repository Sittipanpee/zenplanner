/**
 * Tool Grid Component
 * Categorized grid of planner tools with selection
 */

"use client";

import type { ToolId, BlueprintCustomization } from "@/lib/types";
import { ToolCard } from "./tool-card";

// Tool metadata with full taxonomy
const TOOL_METADATA: Record<
  ToolId,
  { name: string; description: string; category: string }
> = {
  // Productivity
  daily_power_block: {
    name: "Daily Power Block",
    description: "Top-3 priorities + time blocks (ref: High Performance Planner)",
    category: "Productivity",
  },
  weekly_compass: {
    name: "Weekly Compass",
    description: "Week overview with top goals, habits, review",
    category: "Productivity",
  },
  monthly_horizon: {
    name: "Monthly Horizon",
    description: "Month-level goal setting + milestone tracking",
    category: "Productivity",
  },
  quarterly_vision: {
    name: "Quarterly Vision Board",
    description: "90-day OKR-style planning",
    category: "Productivity",
  },
  pomodoro_tracker: {
    name: "Pomodoro Tracker",
    description: "Focus sessions with break scheduling",
    category: "Productivity",
  },
  eisenhower_matrix: {
    name: "Eisenhower Matrix",
    description: "Urgent/Important quadrant sorter",
    category: "Productivity",
  },
  kanban_board: {
    name: "Kanban Board",
    description: "To Do / Doing / Done columns",
    category: "Productivity",
  },
  time_boxing: {
    name: "Time Boxing",
    description: "Hour-by-hour day planner",
    category: "Productivity",
  },
  // Reflection & Mindfulness
  morning_clarity: {
    name: "Morning Clarity",
    description: "5-minute morning prompt (gratitude, intention, affirmation)",
    category: "Reflection & Mindfulness",
  },
  evening_reflection: {
    name: "Evening Reflection",
    description: "What went well, what to improve, tomorrow's focus",
    category: "Reflection & Mindfulness",
  },
  weekly_review: {
    name: "Weekly Review",
    description: "Score the week, lessons, adjustments",
    category: "Reflection & Mindfulness",
  },
  mood_tracker: {
    name: "Mood Tracker",
    description: "Daily mood logging with emoji/color scale",
    category: "Reflection & Mindfulness",
  },
  energy_map: {
    name: "Energy Map",
    description: "Track energy levels throughout the day",
    category: "Reflection & Mindfulness",
  },
  gratitude_log: {
    name: "Gratitude Log",
    description: "3 things grateful for daily",
    category: "Reflection & Mindfulness",
  },
  journal_prompt: {
    name: "Journal Prompt",
    description: "LLM-generated daily reflection question",
    category: "Reflection & Mindfulness",
  },
  mindfulness_bell: {
    name: "Mindfulness Bell",
    description: "Scheduled breathing/pause reminders",
    category: "Reflection & Mindfulness",
  },
  // Habit & Streak
  habit_heatmap: {
    name: "Habit Heatmap",
    description: "GitHub-tile style check-in grid",
    category: "Habit & Streak",
  },
  habit_stack: {
    name: "Habit Stack",
    description: "Chain habits together (if X then Y)",
    category: "Habit & Streak",
  },
  streak_tracker: {
    name: "Streak Tracker",
    description: "Consecutive day counter with freeze tokens",
    category: "Habit & Streak",
  },
  "21day_challenge": {
    name: "21-Day Challenge",
    description: "Focused habit formation sprint",
    category: "Habit & Streak",
  },
  // Goal & Progress
  quest_system: {
    name: "Quest System",
    description: "Goals framed as RPG quests with XP",
    category: "Goal & Progress",
  },
  level_up: {
    name: "Level-Up Tracker",
    description: "Skill tree visualization",
    category: "Goal & Progress",
  },
  milestone_map: {
    name: "Milestone Map",
    description: "Visual roadmap of key checkpoints",
    category: "Goal & Progress",
  },
  progress_bars: {
    name: "Progress Bars",
    description: "Percentage completion for each goal area",
    category: "Goal & Progress",
  },
  // Creative & Visual
  bujo_spread: {
    name: "Bujo Spread",
    description: "Bullet journal template with custom keys",
    category: "Creative & Visual",
  },
  moodboard: {
    name: "Moodboard",
    description: "Visual inspiration collage area",
    category: "Creative & Visual",
  },
  brain_dump: {
    name: "Brain Dump",
    description: "Unstructured capture space",
    category: "Creative & Visual",
  },
  mind_map: {
    name: "Mind Map",
    description: "Central idea → branching thoughts",
    category: "Creative & Visual",
  },
  doodle_zone: {
    name: "Doodle Zone",
    description: "Free drawing area within planner",
    category: "Creative & Visual",
  },
  // Self-Scoring
  life_wheel: {
    name: "Life Wheel",
    description: "Score 8 life areas (health, career, etc.)",
    category: "Self-Scoring",
  },
  weekly_scorecard: {
    name: "Weekly Scorecard",
    description: "Rate yourself 1-10 on key dimensions",
    category: "Self-Scoring",
  },
  hp_clarity_chart: {
    name: "HP Clarity Chart",
    description: "Ref: High Performance Planner clarity score",
    category: "Self-Scoring",
  },
  nps_self: {
    name: "Self NPS",
    description: "How likely would you recommend your week to a friend?",
    category: "Self-Scoring",
  },
  // Finance & Life
  budget_tracker: {
    name: "Budget Tracker",
    description: "Income/expense/savings tracker",
    category: "Finance & Life",
  },
  meal_planner: {
    name: "Meal Planner",
    description: "Weekly meal planning grid",
    category: "Finance & Life",
  },
  fitness_log: {
    name: "Fitness Log",
    description: "Workout tracking + body metrics",
    category: "Finance & Life",
  },
  reading_list: {
    name: "Reading List",
    description: "Books queue + notes",
    category: "Finance & Life",
  },
  project_tracker: {
    name: "Project Tracker",
    description: "Multi-project status dashboard",
    category: "Finance & Life",
  },
};

// Category order for display
const CATEGORY_ORDER = [
  "Productivity",
  "Reflection & Mindfulness",
  "Habit & Streak",
  "Goal & Progress",
  "Creative & Visual",
  "Self-Scoring",
  "Finance & Life",
];

export interface ToolGridProps {
  selectedTools: ToolId[];
  onToggleTool: (toolId: ToolId) => void;
  customization?: BlueprintCustomization;
}

/**
 * Categorized tool grid component
 * Groups tools by category and displays toggleable cards
 */
export function ToolGrid({
  selectedTools,
  onToggleTool,
  customization,
}: ToolGridProps) {
  // Group tools by category
  const groupedTools = CATEGORY_ORDER.map((category) => ({
    category,
    tools: Object.entries(TOOL_METADATA)
      .filter(([, meta]) => meta.category === category)
      .map(([id, meta]) => ({
        id: id as ToolId,
        ...meta,
      })),
  })).filter((group) => group.tools.length > 0);

  return (
    <div className="space-y-8">
      {groupedTools.map(({ category, tools }) => (
        <div key={category}>
          <h3 className="font-semibold text-zen-text mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-zen-sage" />
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                toolId={tool.id}
                name={tool.name}
                description={tool.description}
                category={category}
                isSelected={selectedTools.includes(tool.id)}
                onToggle={onToggleTool}
                customization={customization}
                showPreview={true}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Get tool metadata by ID
 */
export function getToolMetadata(toolId: ToolId) {
  return TOOL_METADATA[toolId];
}

/**
 * Get all tools grouped by category
 */
export function getToolsByCategory() {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: Object.entries(TOOL_METADATA)
      .filter(([, meta]) => meta.category === category)
      .map(([id, meta]) => ({
        id: id as ToolId,
        ...meta,
      })),
  })).filter((group) => group.tools.length > 0);
}
