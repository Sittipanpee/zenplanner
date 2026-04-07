/**
 * Progress Dots Component
 * Step progress indicator for quiz phases
 * With dark mode, ARIA, and ProgressBar width fix
 */

"use client";

import { useTranslations } from "next-intl";
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
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Step ${current} of ${total}`}
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
                  : "bg-zen-border dark:bg-zinc-700",
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
 * FIX: width is now always applied regardless of color+variant combination
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
        <div className="flex justify-between text-xs text-zen-text-secondary dark:text-zinc-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div
        className="h-2 bg-zen-surface-alt dark:bg-zinc-800 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(clampedProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            !color && variant === "gradient"
              ? "bg-gradient-to-r from-zen-sage to-zen-sage-light"
              : !color && variant === "animated"
                ? "bg-zen-sage animate-zen-glow-pulse"
                : !color
                  ? "bg-zen-sage"
                  : ""
          )}
          style={{
            width: `${clampedProgress}%`,
            ...(color ? { background: color } : {}),
          }}
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
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1" role="listitem">
          {/* Step dot */}
          <div
            className={cn(
              "relative flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
              step.status === "completed"
                ? "bg-zen-sage text-white"
                : step.status === "current"
                  ? "bg-zen-sage-light text-zen-text dark:text-zinc-100 animate-zen-pulse-grow"
                  : "bg-zen-border dark:bg-zinc-700 text-zen-text-muted dark:text-zinc-500"
            )}
            aria-current={step.status === "current" ? "step" : undefined}
          >
            {step.status === "completed" ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
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
                ? "text-zen-text dark:text-zinc-200"
                : step.status === "current"
                  ? "text-zen-text dark:text-zinc-100 font-medium"
                  : "text-zen-text-muted dark:text-zinc-500"
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
                  : "bg-zen-border dark:bg-zinc-700"
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
    { key: "quiz", label: "Quiz", status: phase === "quiz" ? "current" : (phase === "reveal" || phase === "profile" || phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "reveal", label: "Reveal", status: phase === "reveal" ? "current" : (phase === "profile" || phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "profile", label: "Profile", status: phase === "profile" ? "current" : (phase === "complete" ? "completed" : "pending") as "completed" | "current" | "pending" },
    { key: "complete", label: "Done", status: phase === "complete" ? "current" : "pending" as "completed" | "current" | "pending" },
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
        "relative h-2 bg-zen-surface-alt dark:bg-zinc-800 rounded-full overflow-hidden",
        className
      )}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {/* Background path markers */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-zen-border dark:border-zinc-700 last:border-0"
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
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-200 rounded-full shadow-md transition-all duration-300"
        style={{ left: `calc(${(current / total) * 100}% - 6px)` }}
      />
    </div>
  );
}
