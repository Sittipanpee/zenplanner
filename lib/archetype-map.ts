/**
 * ZenPlanner — Spirit Animal to Planner Tool Mapping
 * Maps archetypes to recommended tools based on axis scores
 */

import type { SpiritAnimal, ToolId, AxisScores } from "./types";

/**
 * Recommended tools per animal
 * Based on personality traits and planning style
 */
export const ANIMAL_TOOLS: Record<SpiritAnimal, ToolId[]> = {
  lion: [
    "daily_power_block",    // Structured, action-oriented
    "quarterly_vision",     // Big picture goals
    "eisenhower_matrix",    // Prioritization
    "weekly_scorecard",     // Performance tracking
  ],
  whale: [
    "weekly_compass",       // Reflective planning
    "journal_prompt",       // Deep thinking
    "mind_map",             // Big picture visualization
    "life_wheel",           // Holistic assessment
  ],
  dolphin: [
    "habit_heatmap",        // Social accountability
    "bujo_spread",          // Flexible tracking
    "moodboard",            // Creative expression
    "weekly_review",        // Social reflection
  ],
  owl: [
    "daily_power_block",    // Detailed planning
    "pomodoro_tracker",     // Focus work
    "project_tracker",     // Complex project management
    "progress_bars",       // Progress visualization
  ],
  fox: [
    "kanban_board",        // Flexible workflow
    "brain_dump",          // Quick capture
    "time_boxing",         // Adaptive scheduling
    "21day_challenge",     // Quick wins
  ],
  turtle: [
    "habit_heatmap",       // Long-term tracking
    "streak_tracker",      // Consistency building
    "milestone_map",       // Steady progress
    "monthly_horizon",     // Patient goal setting
  ],
  eagle: [
    "quarterly_vision",    // Long-term vision
    "eisenhower_matrix",   // Strategic prioritization
    "level_up",            // Achievement system
    "quest_system",        // Goal gamification
  ],
  octopus: [
    "mind_map",            // Multi-dimensional thinking
    "brain_dump",          // Idea capture
    "moodboard",           // Creative visualization
    "project_tracker",     // Parallel projects
  ],
  mountain: [
    "daily_power_block",   // Structured routine
    "weekly_compass",      // Consistent planning
    "project_tracker",     // Long-term projects
    "fitness_log",         // Physical discipline
  ],
  wolf: [
    "habit_heatmap",       // Team accountability
    "weekly_review",       // Social reflection
    "streak_tracker",      // Pack motivation
    "level_up",           // Group achievement
  ],
  sakura: [
    "morning_clarity",     // Gentle start
    "gratitude_log",      // Appreciation practice
    "journal_prompt",     // Emotional reflection
    "life_wheel",         // Balance check
  ],
  cat: [
    "bujo_spread",        // Flexible organization
    "mood_tracker",       // Self-awareness
    "reading_list",      // Independent learning
    "weekly_compass",     // Light planning
  ],
  crocodile: [
    "project_tracker",    // Strategic planning
    "eisenhower_matrix",  // Patient prioritization
    "milestone_map",      // Long-term milestones
    "progress_bars",     // Steady measurement
  ],
  dove: [
    "morning_clarity",    // Peaceful start
    "evening_reflection", // Harmony check
    "gratitude_log",      // Appreciation
    "weekly_scorecard",   // Balance tracking
  ],
  butterfly: [
    "brain_dump",         // Quick capture
    "moodboard",         // Visual inspiration
    "21day_challenge",   // Focused sprints
    "habit_stack",       // Flexible routines
  ],
  bamboo: [
    "habit_heatmap",      // Long-term tracking
    "daily_power_block",  // Consistent structure
    "monthly_horizon",    // Gradual progress
    "streak_tracker",     // Steady momentum
  ],
};

/**
 * Calculate tool recommendations based on axis scores
 * Returns prioritized list of tools
 */
export function calculateToolRecommendations(scores: AxisScores): ToolId[] {
  const recommendations = new Map<ToolId, number>();

  // Add base recommendations from animal
  const dominantAnimal = getDominantAnimal(scores);
  const baseTools = ANIMAL_TOOLS[dominantAnimal];
  baseTools.forEach((tool) => recommendations.set(tool, 10));

  // Add conditional tools based on scores
  if (scores.energy > 80) {
    ["daily_power_block", "pomodoro_tracker", "eisenhower_matrix"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 5);
    });
  }

  if (scores.planning > 80) {
    ["weekly_compass", "monthly_horizon", "project_tracker"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 5);
    });
  }

  if (scores.social > 80) {
    ["habit_heatmap", "streak_tracker", "weekly_review"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 5);
    });
  }

  if (scores.focus > 80) {
    ["pomodoro_tracker", "time_boxing", "project_tracker"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 3);
    });
  }

  if (scores.energy < 40) {
    ["morning_clarity", "mood_tracker", "gratitude_log"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 3);
    });
  }

  if (scores.social < 40) {
    ["journal_prompt", "brain_dump", "doodle_zone"].forEach((t) => {
      const current = recommendations.get(t as ToolId) || 0;
      recommendations.set(t as ToolId, current + 3);
    });
  }

  // Sort by score and return top tools
  const sorted = [...recommendations.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([tool]) => tool);

  return sorted as ToolId[];
}

/**
 * Animal archetype profiles — declared at module scope so per-axis stdDev
 * can be precomputed once and re-used by every match.
 *
 * Profile order: [energy, planning, social, decision, focus, drive]
 * Values are author-declared "target levels" in the [0,100] range.
 */
const ARCHETYPE_PROFILES: Array<{ animal: SpiritAnimal; profile: number[] }> = [
  { animal: "lion",      profile: [85, 85, 70, 75, 80, 85] },
  { animal: "whale",     profile: [25, 20, 20, 25, 30, 25] },
  { animal: "dolphin",   profile: [75, 25, 70, 30, 25, 30] },
  { animal: "owl",       profile: [20, 80, 20, 75, 85, 25] },
  { animal: "fox",       profile: [55, 35, 50, 70, 40, 70] },
  { animal: "turtle",    profile: [30, 75, 25, 30, 65, 30] },
  { animal: "eagle",     profile: [80, 85, 20, 80, 85, 90] },
  { animal: "octopus",   profile: [50, 30, 65, 35, 35, 35] },
  { animal: "mountain",  profile: [35, 90, 20, 70, 70, 75] },
  { animal: "wolf",      profile: [75, 70, 85, 70, 65, 80] },
  { animal: "sakura",    profile: [50, 25, 60, 30, 25, 25] },
  { animal: "cat",       profile: [50, 30, 15, 25, 30, 25] },
  { animal: "crocodile", profile: [45, 65, 20, 80, 75, 70] },
  { animal: "dove",      profile: [35, 30, 75, 25, 50, 25] },
  { animal: "butterfly", profile: [65, 20, 55, 25, 20, 30] },
  { animal: "bamboo",    profile: [30, 25, 50, 30, 35, 35] },
];

/**
 * Per-axis standard deviation across all 16 archetype profiles.
 * Used to normalize Manhattan distance so axes with naturally wider spread
 * (e.g., social: 15→85) don't dominate axes with narrower spread.
 * Computed once at module load.
 */
const AXIS_SD: number[] = (() => {
  const n = ARCHETYPE_PROFILES.length;
  return [0, 1, 2, 3, 4, 5].map((axisIdx) => {
    const values = ARCHETYPE_PROFILES.map((a) => a.profile[axisIdx]);
    const mean = values.reduce((s, v) => s + v, 0) / n;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    return Math.max(1, Math.sqrt(variance)); // floor at 1 to avoid div-by-zero
  });
})();

export interface AnimalMatch {
  animal: SpiritAnimal;
  /** Raw Manhattan distance in score units (smaller = closer) */
  distance: number;
  /** Z-score normalized distance — fairer cross-axis comparison */
  zDistance: number;
}

/**
 * Rank all archetypes by similarity to the user's score profile.
 * Returns sorted ascending by zDistance (closest match first).
 *
 * Distance is computed as the sum of per-axis absolute differences divided
 * by that axis's stdDev across the registry — so an axis with narrow spread
 * carries the same per-unit weight as an axis with wide spread.
 */
export function getRankedAnimals(scores: AxisScores): AnimalMatch[] {
  const userVec = [
    scores.energy,
    scores.planning,
    scores.social,
    scores.decision,
    scores.focus,
    scores.drive,
  ];

  const ranked = ARCHETYPE_PROFILES.map(({ animal, profile }) => {
    let raw = 0;
    let z = 0;
    for (let i = 0; i < 6; i++) {
      const diff = Math.abs(userVec[i] - profile[i]);
      raw += diff;
      z += diff / AXIS_SD[i];
    }
    return { animal, distance: raw, zDistance: z };
  });

  ranked.sort((a, b) => a.zDistance - b.zDistance);
  return ranked;
}

/**
 * Get the single best-matching animal — convenience wrapper around
 * getRankedAnimals that returns just the top result.
 */
export function getDominantAnimal(scores: AxisScores): SpiritAnimal {
  return getRankedAnimals(scores)[0].animal;
}

/**
 * Get tool details for display
 */
export interface ToolInfo {
  id: ToolId;
  name: string;
  description: string;
  category: string;
}

export const TOOL_INFO: Record<ToolId, Omit<ToolInfo, "id">> = {
  // Productivity
  daily_power_block: { name: "Daily Power Block", description: "Top-3 priorities + time blocks", category: "Productivity" },
  weekly_compass: { name: "Weekly Compass", description: "Week overview with goals + review", category: "Productivity" },
  monthly_horizon: { name: "Monthly Horizon", description: "Month-level goal + milestone tracking", category: "Productivity" },
  quarterly_vision: { name: "Quarterly Vision", description: "90-day OKR-style planning", category: "Productivity" },
  pomodoro_tracker: { name: "Pomodoro Tracker", description: "Focus sessions with break scheduling", category: "Productivity" },
  eisenhower_matrix: { name: "Eisenhower Matrix", description: "Urgent/Important quadrant sorter", category: "Productivity" },
  kanban_board: { name: "Kanban Board", description: "To Do / Doing / Done workflow", category: "Productivity" },
  time_boxing: { name: "Time Boxing", description: "Hour-by-hour day planning", category: "Productivity" },

  // Reflection
  morning_clarity: { name: "Morning Clarity", description: "5-minute morning prompt", category: "Reflection" },
  evening_reflection: { name: "Evening Reflection", description: "Daily review + tomorrow focus", category: "Reflection" },
  weekly_review: { name: "Weekly Review", description: "Score week, lessons, adjustments", category: "Reflection" },
  mood_tracker: { name: "Mood Tracker", description: "Daily mood logging with analysis", category: "Reflection" },
  energy_map: { name: "Energy Map", description: "Hour-by-hour energy tracking", category: "Reflection" },
  gratitude_log: { name: "Gratitude Log", description: "3 things grateful for daily", category: "Reflection" },
  journal_prompt: { name: "Journal Prompt", description: "LLM-generated daily prompt", category: "Reflection" },
  mindfulness_bell: { name: "Mindfulness Bell", description: "Scheduled breathing reminders", category: "Reflection" },

  // Habits
  habit_heatmap: { name: "Habit Heatmap", description: "GitHub-style check-in grid", category: "Habits" },
  habit_stack: { name: "Habit Stack", description: "Chain habits together", category: "Habits" },
  streak_tracker: { name: "Streak Tracker", description: "Consecutive day counter", category: "Habits" },
  "21day_challenge": { name: "21-Day Challenge", description: "Focused habit sprint", category: "Habits" },

  // Goals
  quest_system: { name: "Quest System", description: "RPG-style goal tracking", category: "Goals" },
  level_up: { name: "Level-Up Tracker", description: "Skill tree visualization", category: "Goals" },
  milestone_map: { name: "Milestone Map", description: "Visual roadmap checkpoints", category: "Goals" },
  progress_bars: { name: "Progress Bars", description: "Percentage completion tracking", category: "Goals" },

  // Creative
  bujo_spread: { name: "Bujo Spread", description: "Bullet journal template", category: "Creative" },
  moodboard: { name: "Moodboard", description: "Visual inspiration area", category: "Creative" },
  brain_dump: { name: "Brain Dump", description: "Unstructured capture space", category: "Creative" },
  mind_map: { name: "Mind Map", description: "Central idea branching", category: "Creative" },
  doodle_zone: { name: "Doodle Zone", description: "Free drawing area", category: "Creative" },

  // Self-Scoring
  life_wheel: { name: "Life Wheel", description: "8 life area scoring", category: "Scoring" },
  weekly_scorecard: { name: "Weekly Scorecard", description: "Rate key dimensions", category: "Scoring" },
  hp_clarity_chart: { name: "HP Clarity Chart", description: "High Performance clarity score", category: "Scoring" },
  nps_self: { name: "Self NPS", description: "Week recommendation rating", category: "Scoring" },

  // Finance/Life
  budget_tracker: { name: "Budget Tracker", description: "Income/expense tracking", category: "Finance" },
  meal_planner: { name: "Meal Planner", description: "Weekly meal grid", category: "Life" },
  fitness_log: { name: "Fitness Log", description: "Workout + body metrics", category: "Life" },
  reading_list: { name: "Reading List", description: "Books queue + notes", category: "Life" },
  project_tracker: { name: "Project Tracker", description: "Multi-project dashboard", category: "Productivity" },
};