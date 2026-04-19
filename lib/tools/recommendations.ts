/**
 * Spirit-animal → recommended tools mapping.
 *
 * Deterministic. No LLM. Each animal gets 5–8 hand-picked tool ids
 * that align with the archetype's profile in `lib/archetype-map.ts`.
 *
 * Used by the post-quiz "Your recommended toolkit" card and by the
 * blueprint catalog "Recommended for your {animal}" highlight.
 */

import type { SpiritAnimal } from "@/lib/types";
import type { ToolId } from "./types";

const RECOMMENDATIONS: Record<SpiritAnimal, ToolId[]> = {
  // High-drive structured action
  lion: [
    "daily_priorities",
    "eisenhower_matrix",
    "quarterly_okrs",
    "goals_tracker",
    "weekly_review",
    "workout_log",
    "deep_work",
  ],
  // Reflective deep wells
  whale: [
    "daily_reflection",
    "weekly_review",
    "gratitude",
    "monthly_review",
    "year_vision",
    "meditation_timer",
    "lessons_learned",
  ],
  // Social/emotional, light structure
  dolphin: [
    "habit_tracker",
    "mood_log",
    "energy_level",
    "weekly_intentions",
    "quick_notes",
    "water",
  ],
  // Detail-driven planners, deep focus
  owl: [
    "time_boxing",
    "pomodoro",
    "deep_work",
    "decision_log",
    "lessons_learned",
    "weekly_review",
    "books_log",
  ],
  // Adaptive, fast-moving
  fox: [
    "tasks",
    "kanban_board",
    "quick_notes",
    "energy_level",
    "idea_capture",
    "habit_tracker",
  ],
  // Patient consistency
  turtle: [
    "habit_tracker",
    "monthly_horizon",
    "savings_goal",
    "sleep",
    "water",
    "weekly_review",
  ],
  // Strategic visionaries
  eagle: [
    "year_vision",
    "quarterly_okrs",
    "quarterly_vision",
    "goals_tracker",
    "weekly_review",
    "monthly_horizon",
  ],
  // Creative parallel thinkers
  octopus: [
    "kanban_board",
    "brain_dump",
    "idea_capture",
    "quick_notes",
    "decision_log",
    "learning_log",
  ],
  // Disciplined builders
  mountain: [
    "daily_priorities",
    "habit_tracker",
    "deep_work",
    "monthly_horizon",
    "workout_log",
    "weekly_review",
  ],
  // Loyal team players
  wolf: [
    "habit_tracker",
    "weekly_review",
    "goals_tracker",
    "workout_log",
    "tasks",
    "weekly_intentions",
  ],
  // Gentle morning bloomers
  sakura: [
    "gratitude_three",
    "mood_log",
    "weekly_intentions",
    "meditation_timer",
    "daily_reflection",
    "break_timer",
  ],
  // Independent low-key
  cat: [
    "quick_notes",
    "books_log",
    "mood_log",
    "gratitude_three",
    "habit_tracker",
    "weekly_review",
  ],
  // Patient strategists
  crocodile: [
    "decision_log",
    "quarterly_okrs",
    "expense_log",
    "goals_tracker",
    "weekly_review",
    "deep_work",
  ],
  // Peace-seeking harmonizers
  dove: [
    "gratitude_three",
    "meditation_timer",
    "weekly_intentions",
    "daily_reflection",
    "mood_log",
    "break_timer",
  ],
  // Bursty inspiration chasers
  butterfly: [
    "idea_capture",
    "brain_dump",
    "quick_notes",
    "energy_dial",
    "mood_log",
    "habit_tracker",
  ],
  // Steady gradual growers
  bamboo: [
    "habit_tracker",
    "sleep",
    "monthly_horizon",
    "savings_goal",
    "gratitude_three",
    "meditation_timer",
  ],
};

export function getRecommendedToolIds(animal: SpiritAnimal): ToolId[] {
  return RECOMMENDATIONS[animal];
}
