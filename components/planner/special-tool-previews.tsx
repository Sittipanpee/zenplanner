/**
 * Special Tool Previews
 * Visual previews for tools with special rendering requirements
 */

"use client";

import { Flame, Star, Trophy, Zap, Target, CheckCircle2, Battery, BatteryMedium, BatteryLow, LayoutGrid, Clock, Heart, Sparkles, TrendingUp, DollarSign, Utensils, Activity } from "lucide-react";
import type { ToolId, BlueprintCustomization } from "@/lib/types";

// Color scheme CSS variables mapping
const COLOR_SCHEME_MAP: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  "zen-sage": { bg: "#7C9A82", border: "#A8C5AE", text: "#2C2C2C", accent: "#5A7A62" },
  "zen-earth": { bg: "#B38B6D", border: "#C9A96E", text: "#2C2C2C", accent: "#8B6B4D" },
  "zen-sky": { bg: "#89A4C7", border: "#6B7AA1", text: "#2C2C2C", accent: "#5A7AA1" },
  "zen-blossom": { bg: "#D4837F", border: "#E8C99B", text: "#2C2C2C", accent: "#B4635F" },
  "zen-indigo": { bg: "#6B7AA1", border: "#474787", text: "#F5F3EE", accent: "#4A5A81" },
};

/**
 * Habit Heatmap Preview
 * GitHub-style 7x52 tile grid
 */
interface HabitHeatmapPreviewProps {
  customization?: BlueprintCustomization;
}

export function HabitHeatmapPreview({ customization }: HabitHeatmapPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Generate sample heatmap data (52 weeks x 7 days)
  const weeks = 52;
  const days = 7;

  // Sample data with varying completion levels
  const getIntensity = (week: number, day: number) => {
    // Simulate some patterns
    const rand = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
    const val = rand - Math.floor(rand);
    if (val > 0.7) return 3; // High
    if (val > 0.4) return 2;  // Medium
    if (val > 0.1) return 1;   // Low
    return 0; // Empty
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return "var(--zen-surface-alt, #E8E4DB)"; // Empty - uses CSS var for dark mode
    if (intensity === 1) return colors.border; // Light
    if (intensity === 2) return colors.accent; // Medium
    return colors.bg; // Full
  };

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium" style={{ backgroundColor: colors.bg }}>
        Habit Heatmap
      </div>
      <div className="p-3">
        {/* Month labels */}
        <div className="flex ml-6 mb-1">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => (
            <span key={month} className="text-[6px] text-zen-text-muted" style={{ flex: i < 6 ? 4.3 : 4.4 }}>
              {month}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-1">
            {dayLabels.map((day, i) => (
              <span key={i} className="text-[6px] text-zen-text-muted h-[8px] leading-[8px]">
                {i % 2 === 0 ? day : ""}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {Array.from({ length: weeks }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {Array.from({ length: days }).map((_, dayIndex) => {
                  const intensity = getIntensity(weekIndex, dayIndex);
                  return (
                    <div
                      key={dayIndex}
                      className="w-[6px] h-[6px] rounded-sm"
                      style={{ backgroundColor: getColor(intensity) }}
                      title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: ${intensity * 33}%`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-2 text-[6px] text-zen-text-muted">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[6px] h-[6px] rounded-sm" style={{ backgroundColor: getColor(i) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Streak Tracker Preview
 * Shows current streak, best streak, and freeze tokens
 */
interface StreakTrackerPreviewProps {
  customization?: BlueprintCustomization;
}

export function StreakTrackerPreview({ customization }: StreakTrackerPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Sample streak data
  const streaks = [
    { name: "Morning Run", current: 12, best: 21, freezes: 2 },
    { name: "Read 30 min", current: 5, best: 14, freezes: 1 },
    { name: "Meditation", current: 28, best: 45, freezes: 3 },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium" style={{ backgroundColor: colors.bg }}>
        Streak Tracker
      </div>
      <div className="p-2 space-y-2">
        {streaks.map((streak, i) => (
          <div key={i} className="flex items-center justify-between bg-zen-surface-alt rounded-lg p-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
                <Flame className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zen-text">{streak.name}</div>
                <div className="text-[10px] text-zen-text-muted">Best: {streak.best} days</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold" style={{ color: colors.bg }}>{streak.current}</div>
              <div className="text-[8px] text-zen-text-muted">days</div>
            </div>
            {/* Freeze tokens */}
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className={`w-3 h-3 rounded-full text-[6px] flex items-center justify-center ${
                    j < streak.freezes ? "bg-zen-sky text-white" : "bg-zen-border"
                  }`}
                >
                  ❄
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 21-Day Challenge Preview
 * 21 boxes in a row with stars on 7, 14, 21
 */
interface TwentyOneDayChallengePreviewProps {
  customization?: BlueprintCustomization;
}

export function TwentyOneDayChallengePreview({ customization }: TwentyOneDayChallengePreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Sample: days 1-14 completed, 15-21 empty
  const completedDays = 14;

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium" style={{ backgroundColor: colors.bg }}>
        21-Day Challenge
      </div>
      <div className="p-2">
        <div className="mb-2">
          <div className="text-xs font-semibold text-zen-text">Morning Meditation</div>
          <div className="text-[10px] text-zen-text-muted">{completedDays}/21 days completed</div>
        </div>

        {/* 21 boxes row */}
        <div className="flex justify-between gap-[2px]">
          {Array.from({ length: 21 }).map((_, i) => {
            const dayNum = i + 1;
            const isCompleted = dayNum <= completedDays;
            const isStar = dayNum === 7 || dayNum === 14 || dayNum === 21;

            return (
              <div key={i} className="flex flex-col items-center">
                {isStar && (
                  <Star className="w-2.5 h-2.5 mb-0.5" fill={colors.border} stroke={colors.border} />
                )}
                <div
                  className={`
                    w-5 h-5 rounded flex items-center justify-center text-[8px] font-medium
                    ${isCompleted ? "text-white" : "bg-zen-surface-alt text-zen-text-muted"}
                  `}
                  style={{ backgroundColor: isCompleted ? colors.bg : undefined }}
                >
                  {isCompleted ? "✓" : dayNum}
                </div>
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex justify-between mt-1 text-[6px] text-zen-text-muted">
          <span>Day 1</span>
          <span>Day 21</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Quest System Preview
 * Card-based display with XP prominently shown
 */
interface QuestSystemPreviewProps {
  customization?: BlueprintCustomization;
}

export function QuestSystemPreview({ customization }: QuestSystemPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Sample quests
  const quests = [
    { name: "Complete Project", xp: 500, difficulty: "Hard", status: "In Progress", reward: "1000 XP" },
    { name: "Daily Review", xp: 50, difficulty: "Easy", status: "Done", reward: "100 XP" },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Trophy className="w-3 h-3" />
        Quest System
        <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Total: 1,250 XP</span>
      </div>
      <div className="p-2 space-y-2">
        {quests.map((quest, i) => (
          <div key={i} className="bg-zen-surface-alt rounded-lg p-2 flex items-center gap-2">
            {/* XP Badge */}
            <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center" style={{ backgroundColor: colors.bg }}>
              <span className="text-[10px] text-white font-bold">{quest.xp}</span>
              <span className="text-[6px] text-white/80">XP</span>
            </div>

            {/* Quest Info */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zen-text truncate">{quest.name}</div>
              <div className="flex items-center gap-2 text-[8px] text-zen-text-muted">
                <span className={`px-1 py-0.5 rounded ${
                  quest.difficulty === "Hard" ? "bg-zen-blossom/20 text-zen-blossom" :
                  quest.difficulty === "Medium" ? "bg-zen-gold/20 text-zen-gold" :
                  "bg-zen-sage/20 text-zen-sage"
                }`}>
                  {quest.difficulty}
                </span>
                <span>{quest.reward}</span>
              </div>
            </div>

            {/* Status */}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              quest.status === "Done" ? "bg-zen-sage text-white" : "bg-zen-gold/20 text-zen-gold"
            }`}>
              {quest.status === "Done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Progress Bars Preview
 * Visual progress bars with percentage
 */
interface ProgressBarsPreviewProps {
  customization?: BlueprintCustomization;
}

export function ProgressBarsPreview({ customization }: ProgressBarsPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Sample progress data
  const goals = [
    { name: "Health & Fitness", progress: 75 },
    { name: "Career Growth", progress: 45 },
    { name: "Learning", progress: 90 },
    { name: "Relationships", progress: 60 },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium" style={{ backgroundColor: colors.bg }}>
        Progress Bars
      </div>
      <div className="p-3 space-y-3">
        {goals.map((goal, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zen-text">{goal.name}</span>
              <span className="text-xs font-semibold" style={{ color: colors.bg }}>{goal.progress}%</span>
            </div>
            <div className="h-2 bg-zen-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${goal.progress}%`,
                  backgroundColor: colors.bg,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Level Up Tracker Preview
 * Skill tree visualization
 */
interface LevelUpPreviewProps {
  customization?: BlueprintCustomization;
}

export function LevelUpPreview({ customization }: LevelUpPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Sample skills
  const skills = [
    { name: "Leadership", level: 5, maxLevel: 10 },
    { name: "Coding", level: 8, maxLevel: 10 },
    { name: "Communication", level: 3, maxLevel: 10 },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Target className="w-3 h-3" />
        Level Up Tracker
      </div>
      <div className="p-2 space-y-2">
        {skills.map((skill, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="text-xs font-semibold text-zen-text w-20 truncate">{skill.name}</div>
            <div className="flex-1 flex gap-0.5">
              {Array.from({ length: skill.maxLevel }).map((_, j) => (
                <div
                  key={j}
                  className={`h-2 flex-1 rounded-sm ${
                    j < skill.level ? "" : "bg-zen-surface-alt"
                  }`}
                  style={{ backgroundColor: j < skill.level ? colors.bg : undefined }}
                />
              ))}
            </div>
            <div className="text-[10px] font-bold" style={{ color: colors.bg }}>
              LV.{skill.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Daily Power Block Preview
 * Priority grid with 3 priorities + time blocks
 */
interface DailyPowerBlockPreviewProps {
  customization?: BlueprintCustomization;
}

export function DailyPowerBlockPreview({ customization }: DailyPowerBlockPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const priorities = [
    { rank: 1, task: "Complete project report", time: "9:00 AM" },
    { rank: 2, task: "Client call", time: "2:00 PM" },
    { rank: 3, task: "Review team work", time: "4:00 PM" },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Zap className="w-3 h-3" />
        Daily Power Block
      </div>
      <div className="p-2 space-y-1.5">
        {priorities.map((p, i) => (
          <div key={i} className="flex items-center gap-2 bg-zen-surface-alt rounded-lg p-2">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: colors.bg }}>
              {p.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-zen-text truncate">{p.task}</div>
            </div>
            <div className="text-[10px] text-zen-text-muted">{p.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mood Tracker Preview
 * Emoji selector with color gradient
 */
interface MoodTrackerPreviewProps {
  customization?: BlueprintCustomization;
}

export function MoodTrackerPreview({ customization }: MoodTrackerPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const moods = [
    { emoji: "😫", label: "Awful", color: "#EF4444" },
    { emoji: "😕", label: "Bad", color: "#F97316" },
    { emoji: "😐", label: "Okay", color: "#EAB308" },
    { emoji: "🙂", label: "Good", color: "#22C55E" },
    { emoji: "😊", label: "Great", color: "#10B981" },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Heart className="w-3 h-3" />
        Mood Tracker
      </div>
      <div className="p-2">
        {/* Emoji row */}
        <div className="flex justify-between mb-2">
          {moods.map((mood, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="text-lg">{mood.emoji}</div>
              {i === 3 && (
                <div className="w-4 h-4 rounded-full bg-zen-sage text-white flex items-center justify-center text-[8px]">✓</div>
              )}
            </div>
          ))}
        </div>
        {/* Weekly mini chart */}
        <div className="flex items-end justify-between h-8 gap-1">
          {[3, 4, 2, 4, 3, 4, 3].map((level, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${level * 20}%`,
                backgroundColor: moods[level]?.color || colors.bg,
                minHeight: "4px",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[6px] text-zen-text-muted mt-1">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Kanban Board Preview
 * 3-column To Do / In Progress / Done
 */
interface KanbanBoardPreviewProps {
  customization?: BlueprintCustomization;
}

export function KanbanBoardPreview({ customization }: KanbanBoardPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const columns = [
    { title: "To Do", items: 2, color: "#EF4444" },
    { title: "In Progress", items: 1, color: "#F59E0B" },
    { title: "Done", items: 3, color: "#22C55E" },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <LayoutGrid className="w-3 h-3" />
        Kanban Board
      </div>
      <div className="p-2 flex gap-1">
        {columns.map((col, i) => (
          <div key={i} className="flex-1 bg-zen-surface-alt rounded p-1.5">
            <div className="flex items-center gap-1 mb-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[8px] font-medium text-zen-text">{col.title}</span>
              <span className="text-[8px] text-zen-text-muted ml-auto">{col.items}</span>
            </div>
            {col.items > 0 && (
              <div className="space-y-1">
                {Array.from({ length: Math.min(col.items, 2) }).map((_, j) => (
                  <div key={j} className="bg-zen-surface rounded p-1">
                    <div className="h-1.5 w-3/4 bg-zen-border rounded mb-1" />
                    <div className="h-1 w-1/2 bg-zen-border/50 rounded" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Life Wheel Preview
 * 8-spoke radar/wheel chart
 */
interface LifeWheelPreviewProps {
  customization?: BlueprintCustomization;
}

export function LifeWheelPreview({ customization }: LifeWheelPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const areas = [
    { name: "Health", score: 8 },
    { name: "Career", score: 6 },
    { name: "Finance", score: 5 },
    { name: "Growth", score: 7 },
    { name: "Family", score: 9 },
    { name: "Friends", score: 7 },
    { name: "Fun", score: 4 },
    { name: "Spirit", score: 6 },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <TrendingUp className="w-3 h-3" />
        Life Wheel
      </div>
      <div className="p-2">
        {/* Wheel visualization */}
        <div className="flex justify-center mb-2">
          <div className="relative w-20 h-20">
            {/* Grid circles */}
            <div className="absolute inset-0 border border-zen-border rounded-full" />
            <div className="absolute inset-2 border border-zen-border rounded-full" />
            <div className="absolute inset-4 border border-zen-border rounded-full" />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-zen-sage" />
            </div>
            {/* Spoke scores - simplified as dots at positions */}
            {areas.map((area, i) => {
              const angle = (i * 45 - 90) * (Math.PI / 180);
              const radius = (area.score / 10) * 0.8 + 0.1;
              const x = 50 + radius * 40 * Math.cos(angle);
              const y = 50 + radius * 40 * Math.sin(angle);
              return (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                    backgroundColor: colors.bg,
                  }}
                />
              );
            })}
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-4 gap-x-1 gap-y-0.5 text-[6px] text-zen-text-muted">
          {areas.slice(0, 4).map((a, i) => (
            <span key={i}>{a.name}</span>
          ))}
          {areas.slice(4).map((a, i) => (
            <span key={i + 4} className="text-right">{a.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Eisenhower Matrix Preview
 * 2x2 quadrant grid (Urgent/Important)
 */
interface EisenhowerMatrixPreviewProps {
  customization?: BlueprintCustomization;
}

export function EisenhowerMatrixPreview({ customization }: EisenhowerMatrixPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const quadrants = [
    { title: "Do First", sub: "Urgent & Important", items: 2, color: "#EF4444", bg: "#FEE2E2" },
    { title: "Schedule", sub: "Not Urgent & Important", items: 3, color: "#3B82F6", bg: "#DBEAFE" },
    { title: "Delegate", sub: "Urgent & Not Important", items: 1, color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Eliminate", sub: "Not Urgent & Not Important", items: 0, color: "#6B7280", bg: "#F3F4F6" },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <LayoutGrid className="w-3 h-3" />
        Eisenhower Matrix
      </div>
      <div className="p-1.5 grid grid-cols-2 gap-1">
        {quadrants.map((q, i) => (
          <div key={i} className="rounded p-1.5" style={{ backgroundColor: q.bg }}>
            <div className="text-[8px] font-bold" style={{ color: q.color }}>{q.title}</div>
            <div className="text-[5px] text-zen-text-muted">{q.sub}</div>
            <div className="text-[10px] font-semibold mt-0.5" style={{ color: q.color }}>{q.items} items</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Weekly Compass Preview
 * Week overview with goals
 */
interface WeeklyCompassPreviewProps {
  customization?: BlueprintCustomization;
}

export function WeeklyCompassPreview({ customization }: WeeklyCompassPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = 2; // Wednesday

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Clock className="w-3 h-3" />
        Weekly Compass
      </div>
      <div className="p-2">
        {/* Week header */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-zen-text">Week 12</span>
          <span className="text-[10px] text-zen-text-muted">Mar 16-22</span>
        </div>
        {/* Day indicators */}
        <div className="flex justify-between gap-1 mb-2">
          {days.map((day, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-1 rounded text-[8px] font-medium ${
                i === today ? "text-white" : "text-zen-text-muted"
              }`}
              style={{ backgroundColor: i === today ? colors.bg : "transparent" }}
            >
              {day}
            </div>
          ))}
        </div>
        {/* Goals preview */}
        <div className="space-y-1">
          <div className="text-[8px] text-zen-text-muted mb-1">Top Goals</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.bg }} />
            <div className="flex-1 h-1.5 bg-zen-surface-alt rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
            <div className="flex-1 h-1.5 bg-zen-surface-alt rounded w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Milestone Map Preview
 * Horizontal timeline with checkpoints
 */
interface MilestoneMapPreviewProps {
  customization?: BlueprintCustomization;
}

export function MilestoneMapPreview({ customization }: MilestoneMapPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const milestones = [
    { name: "Research", done: true },
    { name: "Design", done: true },
    { name: "Dev", done: false },
    { name: "Test", done: false },
    { name: "Launch", done: false },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Target className="w-3 h-3" />
        Milestone Map
      </div>
      <div className="p-2">
        {/* Timeline */}
        <div className="relative">
          {/* Line */}
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-zen-border" />
          {/* Progress */}
          <div className="absolute top-2 left-0 h-0.5" style={{ width: "40%", backgroundColor: colors.bg }} />
          {/* Milestones */}
          <div className="flex justify-between relative">
            {milestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] z-10 ${
                    m.done ? "text-white" : "bg-zen-surface-alt text-zen-text-muted"
                  }`}
                  style={{ backgroundColor: m.done ? colors.bg : undefined }}
                >
                  {m.done ? "✓" : i + 1}
                </div>
                <span className="text-[6px] text-zen-text-muted mt-1">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Budget Tracker Preview
 * Income/Expense table with totals
 */
interface BudgetTrackerPreviewProps {
  customization?: BlueprintCustomization;
}

export function BudgetTrackerPreview({ customization }: BudgetTrackerPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const transactions = [
    { type: "income", name: "Salary", amount: 50000 },
    { type: "expense", name: "Rent", amount: 15000 },
    { type: "expense", name: "Food", amount: 8000 },
  ];

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <DollarSign className="w-3 h-3" />
        Budget Tracker
      </div>
      <div className="p-2">
        {/* Balance */}
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-zen-border">
          <span className="text-[8px] text-zen-text-muted">Balance</span>
          <span className="text-xs font-bold" style={{ color: balance >= 0 ? colors.bg : "#EF4444" }}>
            ฿{balance.toLocaleString()}
          </span>
        </div>
        {/* Transactions */}
        <div className="space-y-1">
          {transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${t.type === "income" ? "bg-zen-sage" : "bg-zen-blossom"}`} />
                <span className="text-[8px] text-zen-text truncate max-w-[60px]">{t.name}</span>
              </div>
              <span className={`text-[8px] font-medium ${t.type === "income" ? "text-zen-sage" : "text-zen-blossom"}`}>
                {t.type === "income" ? "+" : "-"}฿{t.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Energy Map Preview
 * Line/curve showing energy throughout day
 */
interface EnergyMapPreviewProps {
  customization?: BlueprintCustomization;
}

export function EnergyMapPreview({ customization }: EnergyMapPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const hours = ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"];
  const energyLevels = [60, 85, 50, 70, 65, 40];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Battery className="w-3 h-3" />
        Energy Map
      </div>
      <div className="p-2">
        {/* Chart */}
        <div className="relative h-12 mb-1">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2].map(i => (
              <div key={i} className="border-b border-zen-border h-0" />
            ))}
          </div>
          {/* Line chart - simplified */}
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {energyLevels.map((level, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${level}%`,
                    backgroundColor: level > 70 ? colors.bg : level > 40 ? colors.accent : "#E5E7EB",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Labels */}
        <div className="flex justify-between text-[6px] text-zen-text-muted">
          {hours.map((h, i) => (
            <span key={i}>{h}</span>
          ))}
        </div>
        {/* Peak time indicator */}
        <div className="mt-1 text-[7px] text-zen-text text-center">
          Peak: <span style={{ color: colors.bg }}>9:00 AM</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Morning Clarity Preview
 * 3-prompt card (gratitude/intention/affirmation)
 */
interface MorningClarityPreviewProps {
  customization?: BlueprintCustomization;
}

export function MorningClarityPreview({ customization }: MorningClarityPreviewProps) {
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  const prompts = [
    { label: "I'm grateful for...", icon: "🙏", filled: true },
    { label: "Today I will...", icon: "🎯", filled: true },
    { label: "I am...", icon: "✨", filled: false },
  ];

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-white text-xs font-medium flex items-center gap-2" style={{ backgroundColor: colors.bg }}>
        <Sparkles className="w-3 h-3" />
        Morning Clarity
      </div>
      <div className="p-2 space-y-1.5">
        {prompts.map((p, i) => (
          <div
            key={i}
            className={`rounded-lg p-2 ${p.filled ? "bg-zen-surface-alt" : "border border-dashed border-zen-border"}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span>{p.icon}</span>
              <span className="text-[8px] text-zen-text-muted">{p.label}</span>
            </div>
            {p.filled && (
              <div className="text-[9px] text-zen-text italic">
                {i === 0 ? "My health, family, friends" : i === 1 ? "Complete the project on time" : "Capable and worthy"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Main preview renderer - routes to appropriate preview component
 */
interface ToolPreviewProps {
  toolId: ToolId;
  customization?: BlueprintCustomization;
}

export function ToolPreview({ toolId, customization }: ToolPreviewProps) {
  switch (toolId) {
    case "habit_heatmap":
      return <HabitHeatmapPreview customization={customization} />;
    case "streak_tracker":
      return <StreakTrackerPreview customization={customization} />;
    case "21day_challenge":
      return <TwentyOneDayChallengePreview customization={customization} />;
    case "quest_system":
      return <QuestSystemPreview customization={customization} />;
    case "progress_bars":
      return <ProgressBarsPreview customization={customization} />;
    case "level_up":
      return <LevelUpPreview customization={customization} />;
    case "daily_power_block":
      return <DailyPowerBlockPreview customization={customization} />;
    case "mood_tracker":
      return <MoodTrackerPreview customization={customization} />;
    case "kanban_board":
      return <KanbanBoardPreview customization={customization} />;
    case "life_wheel":
      return <LifeWheelPreview customization={customization} />;
    case "eisenhower_matrix":
      return <EisenhowerMatrixPreview customization={customization} />;
    case "weekly_compass":
      return <WeeklyCompassPreview customization={customization} />;
    case "milestone_map":
      return <MilestoneMapPreview customization={customization} />;
    case "budget_tracker":
      return <BudgetTrackerPreview customization={customization} />;
    case "energy_map":
      return <EnergyMapPreview customization={customization} />;
    case "morning_clarity":
      return <MorningClarityPreview customization={customization} />;
    default:
      return null;
  }
}
