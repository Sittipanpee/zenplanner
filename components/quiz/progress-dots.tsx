/**
 * Progress Dots Component
 * Step progress indicator for quiz phases
 */

"use client";

import { cn } from "@/lib/utils";

export interface ProgressDotsProps {
  current: number;
  total: number;
  variant?: "default" | "spirit" | "numbered";
  spiritColor?: string;
  className?: string;
}

/**
 * Progress Dots - Shows progress as a row of dots
 */
export function ProgressDots({
  current,
  total,
  variant = "default",
  spiritColor,
  className,
}: ProgressDotsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = i < current;
        const isCurrent = i === current;

        return (
          <div
            key={i}
            className={cn(
              "relative rounded-full transition-all duration-300 ease-out",
              // Size based on state
              isCurrent ? "w-6 h-3" : "w-3 h-3",
              // Color based on state and variant
              isCompleted
                ? variant === "spirit" && spiritColor
                  ? ""
                  : "bg-zen-sage"
                : isCurrent
                  ? "bg-zen-sage-light scale-110"
                  : "bg-zen-border",
              // Animation for current
              isCurrent && "animate-zen-pulse-grow"
            )}
            style={
              isCompleted && variant === "spirit" && spiritColor
                ? { background: spiritColor }
                : undefined
            }
          >
            {/* Inner dot for completed state */}
            {isCompleted && !isCurrent && variant !== "numbered" && (
              <div className="absolute inset-1 rounded-full bg-white/30" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  variant?: "default" | "gradient" | "animated";
  color?: string;
  className?: string;
}

/**
 * Progress Bar - Linear progress indicator
 */
export function ProgressBar({
  progress,
  showLabel = false,
  variant = "default",
  color,
  className,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-zen-text-secondary mb-1">
          <span>ความคืบหน้า</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div className="h-2 bg-zen-surface-alt rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variant === "gradient"
              ? "bg-gradient-to-r from-zen-sage to-zen-sage-light"
              : variant === "animated"
                ? "animate-zen-glow-pulse"
                : "bg-zen-sage",
            color && variant === "default"
          )}
          style={
            color && variant === "default"
              ? { background: color }
              : { width: `${clampedProgress}%` }
          }
        />
      </div>
    </div>
  );
}

export interface StepIndicatorProps {
  steps: { label: string; status: "completed" | "current" | "pending" }[];
  className?: string;
}

/**
 * Step Indicator - Shows multiple steps with labels
 */
export function StepIndicator({ steps, className }: StepIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between w-full",
        className
      )}
    >
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          {/* Step dot */}
          <div
            className={cn(
              "relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
              step.status === "completed"
                ? "bg-zen-sage text-white"
                : step.status === "current"
                  ? "bg-zen-sage-light text-zen-text animate-zen-pulse-grow"
                  : "bg-zen-border text-zen-text-muted"
            )}
          >
            {step.status === "completed" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>

          {/* Step label */}
          <span
            className={cn(
              "hidden sm:block text-xs ml-2 whitespace-nowrap",
              step.status === "completed"
                ? "text-zen-text"
                : step.status === "current"
                  ? "text-zen-text font-medium"
                  : "text-zen-text-muted"
            )}
          >
            {step.label}
          </span>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2",
                step.status === "completed"
                  ? "bg-zen-sage"
                  : "bg-zen-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Quiz Phase Progress - Shows quiz/reveal/profile/complete phases
 */
export interface QuizPhaseProgressProps {
  phase: "quiz" | "reveal" | "profile" | "complete";
  quizProgress?: number;
  quizTotal?: number;
  className?: string;
}

export function QuizPhaseProgress({
  phase,
  quizProgress = 0,
  quizTotal = 15,
  className,
}: QuizPhaseProgressProps) {
  const phases = [
    { key: "quiz", label: "ค้นหาสัตว์", status: phase === "quiz" ? "current" : (phase === "reveal" || phase === "profile" || phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "reveal", label: "เผยตัว", status: phase === "reveal" ? "current" : (phase === "profile" || phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "profile", label: "โปรไฟล์", status: phase === "profile" ? "current" : (phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "complete", label: "เสร็จสิ้น", status: phase === "complete" ? "current" : "pending" as "completed" | "current" | "pending" },
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Phase steps */}
      <StepIndicator steps={phases} className="mb-4" />

      {/* Quiz progress bar (only during quiz phase) */}
      {phase === "quiz" && (
        <ProgressBar
          progress={(quizProgress / quizTotal) * 100}
          showLabel
          variant="gradient"
        />
      )}
    </div>
  );
}

/**
 * Zen Path Progress - Garden path themed progress
 */
export interface ZenPathProgressProps {
  current: number;
  total: number;
  className?: string;
}

export function ZenPathProgress({
  current,
  total,
  className,
}: ZenPathProgressProps) {
  return (
    <div
      className={cn(
        "relative h-2 bg-zen-surface-alt rounded-full overflow-hidden",
        className
      )}
    >
      {/* Background path markers */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-zen-border last:border-0"
          />
        ))}
      </div>

      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-zen-sage to-zen-sage-light rounded-full transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />

      {/* Current position marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300"
        style={{ left: `calc(${(current / total) * 100}% - 6px)` }}
      />
    </div>
  );
}
