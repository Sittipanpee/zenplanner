// ZenPlanner — TypeScript Type Definitions (SSOT)
// Agent 3: TYPES

// ============================================================
// ENUMS & LITERAL TYPES
// ============================================================

export type QuizMode = 'minigame' | 'custom';
export type QuizPhase = 'quiz' | 'reveal' | 'profiling' | 'complete';
export type QuizStatus = 'in_progress' | 'complete';

export type BlueprintStatus = 'draft' | 'confirmed' | 'generating' | 'completed';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type PlannerFormat = 'google_sheets' | 'excel_vba' | 'pdf';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// 16 Spirit Animals
export type SpiritAnimal =
  | 'lion'
  | 'whale'
  | 'dolphin'
  | 'owl'
  | 'fox'
  | 'turtle'
  | 'eagle'
  | 'octopus'
  | 'mountain'
  | 'wolf'
  | 'sakura'
  | 'cat'
  | 'crocodile'
  | 'dove'
  | 'butterfly'
  | 'bamboo';

// ============================================================
// AXIS SCORES (6 dimensions, 0-100 scale)
// ============================================================

export interface AxisScores {
  energy: number; // 0-100: dawn igniter vs night weaver
  planning: number; // 0-100: architect vs surfer
  social: number; // 0-100: gatherer vs hermit
  decision: number; // 0-100: blade vs petal
  focus: number; // 0-100: laser vs kaleidoscope
  drive: number; // 0-100: summit vs garden
}

// ============================================================
// LIFESTYLE PROFILE (Mode 2 profiling data)
// ============================================================

export interface LifestyleProfile {
  schedule: string;
  energy_pattern: string;
  goals: string[];
  obstacles: string[];
  preferences: Record<string, unknown>;
}

// ============================================================
// BLUEPRINT CUSTOMIZATION
// ============================================================

export interface BlueprintCustomization {
  color_scheme?: string;
  language?: string;
  wake_time?: string;
  categories?: string[];
}

// ============================================================
// CONVERSATION MESSAGE
// ============================================================

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ============================================================
// DATABASE TABLE INTERFACES (match schema.sql exactly)
// ============================================================

// Profiles table
export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  spirit_animal: SpiritAnimal | null;
  archetype_code: string | null;
  line_user_id: string | null;
  line_display_name: string | null;
  line_picture_url: string | null;
  created_at: string;
}

// Quiz Sessions table
export interface QuizSession {
  id: string;
  user_id: string | null;
  mode: QuizMode;
  phase: QuizPhase;
  conversation: ConversationMessage[];
  axis_scores: AxisScores | null;
  archetype_code: string | null;
  spirit_animal: SpiritAnimal | null;
  lifestyle_profile: LifestyleProfile | null;
  status: QuizStatus;
  created_at: string;
}

// Planner Blueprints table
export interface PlannerBlueprint {
  id: string;
  user_id: string | null;
  quiz_session_id: string | null;
  title: string | null;
  description: string | null;
  spirit_animal: SpiritAnimal | null;
  archetype_code: string | null;
  tool_selection: string[]; // Tool IDs from tools-taxonomy.md
  customization: BlueprintCustomization | null;
  status: BlueprintStatus;
  created_at: string;
}

// Generation Jobs table
export interface GenerationJob {
  id: string;
  blueprint_id: string | null;
  total_sheets: number;
  completed_sheets: number;
  current_sheet: string | null;
  status: JobStatus;
  error: string | null;
  output_url: string | null;
  created_at: string;
}

// Generated Planners table
export interface GeneratedPlanner {
  id: string;
  user_id: string | null;
  blueprint_id: string | null;
  format: PlannerFormat;
  download_url: string | null;
  expires_at: string | null;
  created_at: string;
}

// Payments table
export interface Payment {
  id: string;
  user_id: string | null;
  blueprint_id: string | null;
  amount_cents: number;
  currency: string;
  stripe_session_id: string | null;
  status: PaymentStatus;
  created_at: string;
}

// Activity Log table
export interface ActivityLog {
  id: string;
  user_id: string | null;
  activity_type: string;
  metadata: Record<string, unknown> | null;
  activity_date: string;
  created_at: string;
}

// Animal Assets table
export interface AnimalAsset {
  animal_id: SpiritAnimal;
  image_url: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
}

// ============================================================
// TOOL ID TYPE (from tools-taxonomy.md)
// ============================================================

export type ToolId =
  | 'daily_power_block'
  | 'weekly_compass'
  | 'monthly_horizon'
  | 'quarterly_vision'
  | 'pomodoro_tracker'
  | 'eisenhower_matrix'
  | 'kanban_board'
  | 'time_boxing'
  | 'morning_clarity'
  | 'evening_reflection'
  | 'weekly_review'
  | 'mood_tracker'
  | 'energy_map'
  | 'gratitude_log'
  | 'journal_prompt'
  | 'mindfulness_bell'
  | 'habit_heatmap'
  | 'habit_stack'
  | 'streak_tracker'
  | '21day_challenge'
  | 'quest_system'
  | 'level_up'
  | 'milestone_map'
  | 'progress_bars'
  | 'bujo_spread'
  | 'moodboard'
  | 'brain_dump'
  | 'mind_map'
  | 'doodle_zone'
  | 'life_wheel'
  | 'weekly_scorecard'
  | 'hp_clarity_chart'
  | 'nps_self'
  | 'budget_tracker'
  | 'meal_planner'
  | 'fitness_log'
  | 'reading_list'
  | 'project_tracker';

// All tool IDs as a constant array (for LLM prompts, validation)
export const ALL_TOOL_IDS: ToolId[] = [
  'daily_power_block', 'weekly_compass', 'monthly_horizon', 'quarterly_vision',
  'pomodoro_tracker', 'eisenhower_matrix', 'kanban_board', 'time_boxing',
  'morning_clarity', 'evening_reflection', 'weekly_review', 'mood_tracker',
  'energy_map', 'gratitude_log', 'journal_prompt', 'mindfulness_bell',
  'habit_heatmap', 'habit_stack', 'streak_tracker', '21day_challenge',
  'quest_system', 'level_up', 'milestone_map', 'progress_bars',
  'bujo_spread', 'moodboard', 'brain_dump', 'mind_map', 'doodle_zone',
  'life_wheel', 'weekly_scorecard', 'hp_clarity_chart', 'nps_self',
  'budget_tracker', 'meal_planner', 'fitness_log', 'reading_list', 'project_tracker',
];

// ============================================================
// TYPE GUARDS & UTILITIES
// ============================================================

export function isSpiritAnimal(value: string): value is SpiritAnimal {
  const animals: string[] = [
    'lion',
    'whale',
    'dolphin',
    'owl',
    'fox',
    'turtle',
    'eagle',
    'octopus',
    'mountain',
    'wolf',
    'sakura',
    'cat',
    'crocodile',
    'dove',
    'butterfly',
    'bamboo',
  ];
  return animals.includes(value);
}

export function isToolId(value: string): value is ToolId {
  const toolIds: string[] = [
    'daily_power_block',
    'weekly_compass',
    'monthly_horizon',
    'quarterly_vision',
    'pomodoro_tracker',
    'eisenhower_matrix',
    'kanban_board',
    'time_boxing',
    'morning_clarity',
    'evening_reflection',
    'weekly_review',
    'mood_tracker',
    'energy_map',
    'gratitude_log',
    'journal_prompt',
    'mindfulness_bell',
    'habit_heatmap',
    'habit_stack',
    'streak_tracker',
    '21day_challenge',
    'quest_system',
    'level_up',
    'milestone_map',
    'progress_bars',
    'bujo_spread',
    'moodboard',
    'brain_dump',
    'mind_map',
    'doodle_zone',
    'life_wheel',
    'weekly_scorecard',
    'hp_clarity_chart',
    'nps_self',
    'budget_tracker',
    'meal_planner',
    'fitness_log',
    'reading_list',
    'project_tracker',
  ];
  return toolIds.includes(value);
}

// ============================================================
// DEFAULT VALUES
// ============================================================

export const DEFAULT_AXIS_SCORES: AxisScores = {
  energy: 50,
  planning: 50,
  social: 50,
  decision: 50,
  focus: 50,
  drive: 50,
};

export const EMPTY_LIFESTYLE_PROFILE: LifestyleProfile = {
  schedule: '',
  energy_pattern: '',
  goals: [],
  obstacles: [],
  preferences: {},
};

export const DEFAULT_BLUEPRINT_CUSTOMIZATION: BlueprintCustomization = {
  color_scheme: 'default',
  language: 'th',
  wake_time: '07:00',
  categories: [],
};
