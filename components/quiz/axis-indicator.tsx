/**
 * Axis Indicator Component
 * Displays 6-axis visualization for personality profiles
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
    labelShort: "พลังงาน",
    poleA: "Dawn Igniter",
    poleB: "Night Weaver",
    color: "bg-zen-gold",
  },
  planning: {
    label: "Planning Style",
    labelShort: "การวางแผน",
    poleA: "Architect",
    poleB: "Surfer",
    color: "bg-zen-sage",
  },
  social: {
    label: "Social Fuel",
    labelShort: "สังคม",
    poleA: "Gatherer",
    poleB: "Hermit",
    color: "bg-zen-blossom",
  },
  decision: {
    label: "Decision Mode",
    labelShort: "การตัดสินใจ",
    poleA: "Blade",
    poleB: "Petal",
    color: "bg-zen-earth",
  },
  focus: {
    label: "Focus Pattern",
    labelShort: "โฟกัส",
    poleA: "Laser",
    poleB: "Kaleidoscope",
    color: "bg-zen-sky",
  },
  drive: {
    label: "Drive Source",
    labelShort: "แรงขับเคลื่อน",
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
    <div className={cn("space-y-3", className)}>
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
                <span className="text-zen-text-secondary font-medium">
                  {compact ? config.labelShort : config.label}
                </span>
                <span className="text-zen-text-muted text-[10px]">
                  {normalizedValue}%
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="relative h-2 bg-zen-surface-alt rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                  config.color
                )}
                style={{ width: `${normalizedValue}%` }}
              />
              {/* Center marker */}
              <div className="absolute inset-y-0 left-1/2 w-0.5 bg-zen-border -translate-x-1/2" />
            </div>

            {/* Pole labels */}
            {showLabels && !compact && (
              <div className="flex justify-between text-[10px] text-zen-text-muted">
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
        "bg-zen-surface border border-zen-border rounded-xl p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-zen-text mb-3">
        ลักษณะนิสัยของคุณ
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {(Object.keys(scores) as (keyof AxisScores)[]).map((key) => (
          <div
            key={key}
            className="flex items-center gap-2 p-2 bg-zen-surface-alt rounded-lg"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                AXIS_CONFIG[key].color
              )}
            />
            <span className="text-zen-text-secondary truncate">
              {getDominantTrait(key)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
