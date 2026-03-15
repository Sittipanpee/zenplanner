/**
 * Preview Mini Component
 * Miniature preview of planner sheets
 */

"use client";

import { useMemo } from "react";
import type { ToolId, BlueprintCustomization } from "@/lib/types";

export interface PreviewMiniProps {
  toolId: ToolId;
  customization?: BlueprintCustomization;
}

// Preview templates for each tool type
const PREVIEW_TEMPLATES: Record<ToolId, { cols: number; rows: number; content: string[][] }> = {
  daily_power_block: {
    cols: 4,
    rows: 5,
    content: [
      ["Date", "Priority", "Time Block", "Score"],
      ["2024-01-15", "Write Report", "09:00-11:00", ""],
      ["2024-01-15", "Team Meeting", "14:00-15:00", ""],
      ["2024-01-15", "Plan Review", "16:00-17:00", ""],
    ],
  },
  weekly_compass: {
    cols: 3,
    rows: 8,
    content: [
      ["Day", "Focus", "Status"],
      ["Mon", "Planning", ""],
      ["Tue", "Deep Work", ""],
      ["Wed", "Meetings", ""],
      ["Thu", "Review", ""],
      ["Fri", "Planning", ""],
    ],
  },
  monthly_horizon: {
    cols: 2,
    rows: 6,
    content: [
      ["Goal", "Milestone"],
      ["Launch v2", "Jan 15"],
      ["Hire Dev", "Jan 30"],
      ["100 Users", "Feb 14"],
    ],
  },
  quarterly_vision: {
    cols: 3,
    rows: 5,
    content: [
      ["Area", "Goal", "KPI"],
      ["Revenue", "$50K", "+20%"],
      ["Users", "1000", "+50%"],
    ],
  },
  pomodoro_tracker: {
    cols: 4,
    rows: 6,
    content: [
      ["Task", "Session", "Break", "Status"],
      ["Writing", "25m", "5m", ""],
      ["Coding", "25m", "5m", ""],
    ],
  },
  eisenhower_matrix: {
    cols: 2,
    rows: 5,
    content: [
      ["Urgent", "Not Urgent"],
      ["Do First", "Schedule"],
      ["", ""],
      ["Delegate", "Eliminate"],
    ],
  },
  kanban_board: {
    cols: 3,
    rows: 5,
    content: [
      ["To Do", "Doing", "Done"],
      ["Task 1", "Task 4", "Task 7"],
      ["Task 2", "Task 5", ""],
    ],
  },
  time_boxing: {
    cols: 5,
    rows: 4,
    content: [
      ["Time", "Mon", "Tue", "Wed", "Thu"],
      ["9:00", "", "", "", ""],
      ["10:00", "", "", "", ""],
    ],
  },
  morning_clarity: {
    cols: 1,
    rows: 5,
    content: [
      ["Morning Prompt"],
      ["I am grateful for..."],
      ["Today's intention..."],
      ["Affirmation..."],
    ],
  },
  evening_reflection: {
    cols: 2,
    rows: 5,
    content: [
      ["What went well", "To improve"],
      ["", ""],
      ["Tomorrow's focus", ""],
      ["", ""],
    ],
  },
  weekly_review: {
    cols: 3,
    rows: 5,
    content: [
      ["Score", "Lesson", "Next Week"],
      ["/10", "", ""],
      ["/10", "", ""],
    ],
  },
  mood_tracker: {
    cols: 4,
    rows: 8,
    content: [
      ["Date", "Mood", "Energy", "Note"],
      ["Mon", "", "", ""],
      ["Tue", "", "", ""],
    ],
  },
  energy_map: {
    cols: 5,
    rows: 4,
    content: [
      ["Hour", "Mon", "Tue", "Wed", "Thu"],
      ["09:00", "", "", "", ""],
      ["10:00", "", "", "", ""],
    ],
  },
  gratitude_log: {
    cols: 1,
    rows: 4,
    content: [
      ["Gratitude"],
      ["1. "],
      ["2. "],
      ["3. "],
    ],
  },
  journal_prompt: {
    cols: 1,
    rows: 6,
    content: [
      ["Today's Prompt"],
      [""],
      [""],
      [""],
      [""],
    ],
  },
  mindfulness_bell: {
    cols: 2,
    rows: 4,
    content: [
      ["Time", "Reminder"],
      ["Morning", ""],
      ["Evening", ""],
    ],
  },
  habit_heatmap: {
    cols: 53,
    rows: 7,
    content: [],
  },
  habit_stack: {
    cols: 2,
    rows: 5,
    content: [
      ["Trigger", "Habit"],
      ["After...", "Then..."],
      ["After...", "Then..."],
    ],
  },
  streak_tracker: {
    cols: 3,
    rows: 4,
    content: [
      ["Habit", "Streak", "Best"],
      ["Exercise", "5", "12"],
      ["Read", "3", "7"],
    ],
  },
  "21day_challenge": {
    cols: 7,
    rows: 4,
    content: [
      ["Day", "1", "2", "3", "4", "5", "6"],
      ["", "", "", "", "", "", ""],
    ],
  },
  quest_system: {
    cols: 4,
    rows: 5,
    content: [
      ["Quest", "XP", "Status", "Reward"],
      ["Complete task", "100", "", ""],
    ],
  },
  level_up: {
    cols: 2,
    rows: 6,
    content: [
      ["Skill", "Level"],
      ["Coding", "Lv.5"],
      ["Writing", "Lv.3"],
    ],
  },
  milestone_map: {
    cols: 3,
    rows: 5,
    content: [
      ["Milestone", "Date", "Status"],
      ["Launch", "Q1", ""],
      ["Scale", "Q2", ""],
    ],
  },
  progress_bars: {
    cols: 2,
    rows: 5,
    content: [
      ["Goal", "Progress"],
      ["Health", "███░░"],
      ["Career", "████░"],
    ],
  },
  bujo_spread: {
    cols: 2,
    rows: 8,
    content: [
      ["Key", "Log"],
      ["•", ""],
      ["-", ""],
      ["o", ""],
    ],
  },
  moodboard: {
    cols: 3,
    rows: 3,
    content: [
      ["", "", ""],
      ["", "Image", ""],
      ["", "", ""],
    ],
  },
  brain_dump: {
    cols: 1,
    rows: 10,
    content: [
      ["Capture Space"],
      [""],
      [""],
      [""],
      [""],
    ],
  },
  mind_map: {
    cols: 1,
    rows: 6,
    content: [
      ["Central Topic"],
      ["Branch 1"],
      ["Branch 2"],
      ["Branch 3"],
    ],
  },
  doodle_zone: {
    cols: 1,
    rows: 1,
    content: [["🎨"]],
  },
  life_wheel: {
    cols: 2,
    rows: 9,
    content: [
      ["Area", "Score"],
      ["Career", "7"],
      ["Health", "6"],
      ["Finance", "5"],
      ["Family", "8"],
    ],
  },
  weekly_scorecard: {
    cols: 2,
    rows: 6,
    content: [
      ["Dimension", "Score"],
      ["Productivity", "/10"],
      ["Wellness", "/10"],
    ],
  },
  hp_clarity_chart: {
    cols: 3,
    rows: 4,
    content: [
      ["Area", "Week", "Month"],
      ["Clarity", "", ""],
    ],
  },
  nps_self: {
    cols: 2,
    rows: 5,
    content: [
      ["Week", "Score"],
      ["W1", ""],
      ["W2", ""],
    ],
  },
  budget_tracker: {
    cols: 3,
    rows: 5,
    content: [
      ["Category", "Budget", "Actual"],
      ["Food", "5000", ""],
      ["Transport", "2000", ""],
    ],
  },
  meal_planner: {
    cols: 4,
    rows: 5,
    content: [
      ["Day", "Breakfast", "Lunch", "Dinner"],
      ["Mon", "", "", ""],
      ["Tue", "", "", ""],
    ],
  },
  fitness_log: {
    cols: 4,
    rows: 5,
    content: [
      ["Date", "Exercise", "Duration", "Notes"],
      ["", "", "", ""],
    ],
  },
  reading_list: {
    cols: 3,
    rows: 5,
    content: [
      ["Book", "Status", "Notes"],
      ["Book 1", "Reading", ""],
      ["Book 2", "Queue", ""],
    ],
  },
  project_tracker: {
    cols: 5,
    rows: 4,
    content: [
      ["Project", "Status", "Due", "Progress"],
      ["Project 1", "", "", ""],
    ],
  },
};

// Color scheme CSS variables mapping
const COLOR_SCHEME_MAP: Record<string, { bg: string; border: string; text: string }> = {
  "zen-sage": { bg: "#7C9A82", border: "#A8C5AE", text: "#2C2C2C" },
  "zen-earth": { bg: "#B38B6D", border: "#C9A96E", text: "#2C2C2C" },
  "zen-sky": { bg: "#89A4C7", border: "#6B7AA1", text: "#2C2C2C" },
  "zen-blossom": { bg: "#D4837F", border: "#E8C99B", text: "#2C2C2C" },
  "zen-indigo": { bg: "#6B7AA1", border: "#474787", text: "#F5F3EE" },
};

/**
 * Preview Mini Component
 * Shows a miniature preview of what the sheet will look like
 */
export function PreviewMini({ toolId, customization }: PreviewMiniProps) {
  const template = PREVIEW_TEMPLATES[toolId];
  const colors = COLOR_SCHEME_MAP[customization?.color_scheme || "zen-sage"];

  // Generate grid style for habit heatmap special case
  const isHeatmap = toolId === "habit_heatmap";

  const gridStyle = useMemo(() => {
    if (isHeatmap) {
      return {
        display: "grid",
        gridTemplateColumns: "repeat(53, 4px)",
        gridTemplateRows: "repeat(7, 4px)",
        gap: "2px",
      };
    }
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
      gridTemplateRows: `repeat(${template.rows}, 1fr)`,
      gap: "1px",
    };
  }, [isHeatmap, template.cols, template.rows]);

  return (
    <div className="bg-zen-surface border border-zen-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-3 py-2 text-white text-xs font-medium"
        style={{ backgroundColor: colors.bg }}
      >
        {toolId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </div>

      {/* Preview Content */}
      <div className="p-2 overflow-auto">
        {isHeatmap ? (
          // Special rendering for heatmap - using deterministic pattern
          <div style={gridStyle as React.CSSProperties}>
            {Array.from({ length: 53 * 7 }).map((_, i) => {
              // Deterministic "random" based on index
              const seed = (i * 7 + 3) % 10;
              const bgColor = seed > 6 ? colors.bg : seed > 3 ? colors.border : "#E8E4DB";
              return (
                <div
                  key={i}
                  className="rounded-sm"
                  style={{
                    backgroundColor: bgColor,
                    width: "4px",
                    height: "4px",
                  }}
                />
              );
            })}
          </div>
        ) : template.content.length > 0 ? (
          <div style={gridStyle as React.CSSProperties}>
            {template.content.flat().map((cell, i) => {
              const colIndex = i % template.cols;
              const isHeader = Math.floor(i / template.cols) === 0;
              return (
                <div
                  key={i}
                  className={`
                    px-1 py-0.5 text-[6px] leading-tight overflow-hidden
                    ${isHeader ? "font-semibold" : ""}
                  `}
                  style={{
                    backgroundColor: isHeader ? colors.bg : "transparent",
                    color: isHeader ? "#FFFFFF" : colors.text,
                    borderRadius: "1px",
                  }}
                >
                  {cell}
                </div>
              );
            })}
          </div>
        ) : (
          // Empty placeholder for visual tools
          <div
            className="flex items-center justify-center text-zen-text-muted text-xs"
            style={{ height: `${template.rows * 12}px` }}
          >
            Visual Area
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1 bg-zen-surface-alt border-t border-zen-border">
        <div className="flex gap-1">
          {Object.values(COLOR_SCHEME_MAP).slice(0, 3).map((c, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: c.bg }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Get preview dimensions for a tool
 */
export function getPreviewDimensions(toolId: ToolId) {
  const template = PREVIEW_TEMPLATES[toolId];
  return {
    width: template.cols * 24,
    height: template.rows * 16,
  };
}
