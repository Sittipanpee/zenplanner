/**
 * Axis Indicator Component
 * Displays 6-axis visualization for personality profiles
 * With dark mode and ARIA support
 */

"use client";

import { cn } from "@/lib/utils";
import type { AxisScores } from "@/lib/types";

// 6 axes definition with labels
const AXIS_CONFIG: Record<
  keyof AxisScores,
  { label: string; labelShort: string; poleA: string; poleB: string; color: string }
> = {
  energy: {
    label: "Energy Rhythm",
    labelShort: "Energy",
    poleA: "Dawn Igniter",
    poleB: "Night Weaver",
    color: "bg-zen-gold",
  },
  planning: {
    label: "Planning Style",
    labelShort: "Planning",
    poleA: "Architect",
    poleB: "Surfer",
    color: "bg-zen-sage",
  },
  social: {
    label: "Social Fuel",
    labelShort: "Social",
    poleA: "Gatherer",
    poleB: "Hermit",
    color: "bg-zen-blossom",
  },
  decision: {
    label: "Decision Mode",
    labelShort: "Decision",
    poleA: "Blade",
    poleB: "Petal",
    color: "bg-zen-earth",
  },
  focus: {
    label: "Focus Pattern",
    labelShort: "Focus",
    poleA: "Laser",
    poleB: "Kaleidoscope",
    color: "bg-zen-sky",
  },
  drive: {
    label: "Drive Source",
    labelShort: "Drive",
    poleA: "Summit",
    poleB: "Garden",
    color: "bg-zen-indigo",
  },
};

export interface AxisIndicatorProps {
  scores: AxisScores;
  showLabels?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Axis Indicator - Progress bars for each axis
 */
export function AxisIndicator({
  scores,
  showLabels = true,
  compact = false,
  className,
}: AxisIndicatorProps) {
  const axisKeys = Object.keys(scores) as (keyof AxisScores)[];

  return (
    <div className={cn("space-y-3", className)} role="group" aria-label="Personality axis scores">
      {axisKeys.map((key) => {
        const config = AXIS_CONFIG[key];
        const value = scores[key];
        const normalizedValue = Math.max(0, Math.min(100, value));

        return (
          <div
            key={key}
            className={cn("space-y-1", compact ? "space-y-0.5" : "")}
          >
            {showLabels && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-zen-text-secondary dark:text-zinc-400 font-medium">
                  {compact ? config.labelShort : config.label}
                </span>
                <span className="text-zen-text-muted dark:text-zinc-500 text-[10px]">
                  {normalizedValue}%
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div
              className="relative h-2 bg-zen-surface-alt dark:bg-zinc-800 rounded-full overflow-hidden"
              role="meter"
              aria-label={config.label}
              aria-valuenow={normalizedValue}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                  config.color
                )}
                style={{ width: `${normalizedValue}%` }}
              />
              {/* Center marker */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-zen-border dark:bg-zinc-600 -translate-x-1/2" />
            </div>

            {/* Pole labels */}
            {showLabels && !compact && (
              <div className="flex justify-between text-[10px] text-zen-text-muted dark:text-zinc-500">
                <span>{config.poleA}</span>
                <span>{config.poleB}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Axis Summary Card
 * Compact card showing axis summary
 */
export interface AxisSummaryProps {
  scores: AxisScores;
  className?: string;
}

export function AxisSummary({ scores, className }: AxisSummaryProps) {
  // Determine dominant traits
  const getDominantTrait = (key: keyof AxisScores) => {
    const config = AXIS_CONFIG[key];
    const value = scores[key];
    return value >= 50 ? config.poleA : config.poleB;
  };

  return (
    <div
      className={cn(
        "bg-zen-surface dark:bg-zinc-900 border border-zen-border dark:border-zinc-700 rounded-xl p-4",
        className
      )}
      role="region"
      aria-label="Personality traits summary"
    >
      <h3 className="text-sm font-semibold text-zen-text dark:text-zinc-100 mb-3">
        Your Traits
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {(Object.keys(scores) as (keyof AxisScores)[]).map((key) => (
          <div
            key={key}
            className="flex items-center gap-2 p-2 bg-zen-surface-alt dark:bg-zinc-800 rounded-lg"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                AXIS_CONFIG[key].color
              )}
              aria-hidden="true"
            />
            <span className="text-zen-text-secondary dark:text-zinc-400 truncate">
              {getDominantTrait(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
