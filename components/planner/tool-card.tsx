/**
 * Tool Card Component
 * Individual planner tool display with optional preview
 */

"use client";

import { Check } from "lucide-react";
import type { ToolId, BlueprintCustomization } from "@/lib/types";
import { ToolPreview } from "./special-tool-previews";

interface ToolCardProps {
  toolId: ToolId;
  name: string;
  description: string;
  category: string;
  isSelected: boolean;
  onToggle: (toolId: ToolId) => void;
  customization?: BlueprintCustomization;
  showPreview?: boolean;
}

// Tools that have special visual previews
const SPECIAL_PREVIEW_TOOLS: ToolId[] = [
  "habit_heatmap",
  "streak_tracker",
  "21day_challenge",
  "quest_system",
  "progress_bars",
  "level_up",
  "daily_power_block",
  "mood_tracker",
  "kanban_board",
  "life_wheel",
  "eisenhower_matrix",
  "weekly_compass",
  "milestone_map",
  "budget_tracker",
  "energy_map",
  "morning_clarity",
];

export function ToolCard({
  toolId,
  name,
  description,
  category,
  isSelected,
  onToggle,
  customization,
  showPreview = false,
}: ToolCardProps) {
  const hasSpecialPreview = SPECIAL_PREVIEW_TOOLS.includes(toolId);

  return (
    <button
      onClick={() => onToggle(toolId)}
      className={`
        w-full text-left rounded-xl border-2 transition-all duration-200
        focus-visible:ring-2 focus-visible:ring-zen-sage focus-visible:outline-none
        overflow-hidden
        ${isSelected
          ? "border-zen-sage bg-zen-sage/5"
          : "border-zen-border hover:border-zen-border-hover bg-zen-surface"
        }
      `}
    >
      {/* Special Preview Area */}
      {showPreview && hasSpecialPreview && (
        <div className="p-2 border-b border-zen-border bg-zen-surface-alt">
          <ToolPreview toolId={toolId} customization={customization} />
        </div>
      )}

      {/* Card Content */}
      <div className="flex items-start gap-3 p-4">
        <div
          className={`
            w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
            ${isSelected ? "bg-zen-sage text-white" : "bg-zen-surface-alt text-zen-text-muted"}
          `}
        >
          {isSelected && <Check className="w-4 h-4" />}
        </div>
        <div>
          <h3 className="font-semibold text-zen-text">{name}</h3>
          <p className="text-sm text-zen-text-secondary mt-1">{description}</p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-zen-surface-alt rounded text-zen-text-muted">
            {category}
          </span>
        </div>
      </div>
    </button>
  );
}
