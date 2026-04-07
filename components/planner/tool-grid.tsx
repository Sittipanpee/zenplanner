/**
 * Tool Grid Component
 * Categorized grid of planner tools with selection + search/filter
 * i18n + dark mode ready
 */

'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import type { ToolId, BlueprintCustomization } from '@/lib/types'
import { ToolCard } from './tool-card'

// Tool metadata with full taxonomy
const TOOL_METADATA: Record<
  ToolId,
  { name: string; description: string; category: string }
> = {
  daily_power_block: { name: 'Daily Power Block', description: 'Top-3 priorities + time blocks', category: 'Productivity' },
  weekly_compass: { name: 'Weekly Compass', description: 'Week overview with top goals, habits, review', category: 'Productivity' },
  monthly_horizon: { name: 'Monthly Horizon', description: 'Month-level goal setting + milestone tracking', category: 'Productivity' },
  quarterly_vision: { name: 'Quarterly Vision Board', description: '90-day OKR-style planning', category: 'Productivity' },
  pomodoro_tracker: { name: 'Pomodoro Tracker', description: 'Focus sessions with break scheduling', category: 'Productivity' },
  eisenhower_matrix: { name: 'Eisenhower Matrix', description: 'Urgent/Important quadrant sorter', category: 'Productivity' },
  kanban_board: { name: 'Kanban Board', description: 'To Do / Doing / Done columns', category: 'Productivity' },
  time_boxing: { name: 'Time Boxing', description: 'Hour-by-hour day planner', category: 'Productivity' },
  morning_clarity: { name: 'Morning Clarity', description: '5-minute morning prompt', category: 'Reflection & Mindfulness' },
  evening_reflection: { name: 'Evening Reflection', description: 'What went well, what to improve', category: 'Reflection & Mindfulness' },
  weekly_review: { name: 'Weekly Review', description: 'Score the week, lessons, adjustments', category: 'Reflection & Mindfulness' },
  mood_tracker: { name: 'Mood Tracker', description: 'Daily mood logging with emoji/color scale', category: 'Reflection & Mindfulness' },
  energy_map: { name: 'Energy Map', description: 'Track energy levels throughout the day', category: 'Reflection & Mindfulness' },
  gratitude_log: { name: 'Gratitude Log', description: '3 things grateful for daily', category: 'Reflection & Mindfulness' },
  journal_prompt: { name: 'Journal Prompt', description: 'LLM-generated daily reflection question', category: 'Reflection & Mindfulness' },
  mindfulness_bell: { name: 'Mindfulness Bell', description: 'Scheduled breathing/pause reminders', category: 'Reflection & Mindfulness' },
  habit_heatmap: { name: 'Habit Heatmap', description: 'GitHub-tile style check-in grid', category: 'Habit & Streak' },
  habit_stack: { name: 'Habit Stack', description: 'Chain habits together (if X then Y)', category: 'Habit & Streak' },
  streak_tracker: { name: 'Streak Tracker', description: 'Consecutive day counter with freeze tokens', category: 'Habit & Streak' },
  '21day_challenge': { name: '21-Day Challenge', description: 'Focused habit formation sprint', category: 'Habit & Streak' },
  quest_system: { name: 'Quest System', description: 'Goals framed as RPG quests with XP', category: 'Goal & Progress' },
  level_up: { name: 'Level-Up Tracker', description: 'Skill tree visualization', category: 'Goal & Progress' },
  milestone_map: { name: 'Milestone Map', description: 'Visual roadmap of key checkpoints', category: 'Goal & Progress' },
  progress_bars: { name: 'Progress Bars', description: 'Percentage completion for each goal area', category: 'Goal & Progress' },
  bujo_spread: { name: 'Bujo Spread', description: 'Bullet journal template with custom keys', category: 'Creative & Visual' },
  moodboard: { name: 'Moodboard', description: 'Visual inspiration collage area', category: 'Creative & Visual' },
  brain_dump: { name: 'Brain Dump', description: 'Unstructured capture space', category: 'Creative & Visual' },
  mind_map: { name: 'Mind Map', description: 'Central idea branching thoughts', category: 'Creative & Visual' },
  doodle_zone: { name: 'Doodle Zone', description: 'Free drawing area within planner', category: 'Creative & Visual' },
  life_wheel: { name: 'Life Wheel', description: 'Score 8 life areas', category: 'Self-Scoring' },
  weekly_scorecard: { name: 'Weekly Scorecard', description: 'Rate yourself 1-10 on key dimensions', category: 'Self-Scoring' },
  hp_clarity_chart: { name: 'HP Clarity Chart', description: 'High Performance Planner clarity score', category: 'Self-Scoring' },
  nps_self: { name: 'Self NPS', description: 'How likely would you recommend your week?', category: 'Self-Scoring' },
  budget_tracker: { name: 'Budget Tracker', description: 'Income/expense/savings tracker', category: 'Finance & Life' },
  meal_planner: { name: 'Meal Planner', description: 'Weekly meal planning grid', category: 'Finance & Life' },
  fitness_log: { name: 'Fitness Log', description: 'Workout tracking + body metrics', category: 'Finance & Life' },
  reading_list: { name: 'Reading List', description: 'Books queue + notes', category: 'Finance & Life' },
  project_tracker: { name: 'Project Tracker', description: 'Multi-project status dashboard', category: 'Finance & Life' },
}

const CATEGORY_ORDER = [
  'Productivity',
  'Reflection & Mindfulness',
  'Habit & Streak',
  'Goal & Progress',
  'Creative & Visual',
  'Self-Scoring',
  'Finance & Life',
]

export interface ToolGridProps {
  selectedTools: ToolId[]
  onToggleTool: (toolId: ToolId) => void
  customization?: BlueprintCustomization
}

export function ToolGrid({ selectedTools, onToggleTool, customization }: ToolGridProps) {
  const t = useTranslations('planner.toolGrid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return Object.entries(TOOL_METADATA)
      .filter(([, meta]) => {
        const matchesSearch = !query || meta.name.toLowerCase().includes(query) || meta.description.toLowerCase().includes(query) || meta.category.toLowerCase().includes(query)
        const matchesCategory = !activeCategory || meta.category === activeCategory
        return matchesSearch && matchesCategory
      })
      .map(([id, meta]) => ({ id: id as ToolId, ...meta }))
  }, [searchQuery, activeCategory])

  const groupedTools = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      tools: filteredTools.filter((tool) => tool.category === category),
    })).filter((group) => group.tools.length > 0)
  }, [filteredTools])

  return (
    <div className="space-y-6">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zen-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-zen-border bg-zen-surface text-zen-text placeholder:text-zen-text-muted focus:outline-none focus:ring-2 focus:ring-zen-sage transition-colors"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCategory ? 'bg-zen-sage text-white' : 'bg-zen-surface-alt text-zen-text-secondary hover:bg-zen-border'
          }`}
        >
          {t('allCategories')}
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat ? 'bg-zen-sage text-white' : 'bg-zen-surface-alt text-zen-text-secondary hover:bg-zen-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected count */}
      <p className="text-sm text-zen-text-secondary">
        {t('selected')}: {selectedTools.length}
      </p>

      {/* No results */}
      {groupedTools.length === 0 && (
        <p className="text-center text-zen-text-muted py-8">{t('noResults')}</p>
      )}

      {/* Tool groups */}
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
  )
}

export function getToolMetadata(toolId: ToolId) {
  return TOOL_METADATA[toolId]
}

export function getToolsByCategory() {
  return CATEGORY_ORDER.map((category) => ({
    category,
    tools: Object.entries(TOOL_METADATA)
      .filter(([, meta]) => meta.category === category)
      .map(([id, meta]) => ({ id: id as ToolId, ...meta })),
  })).filter((group) => group.tools.length > 0)
}
