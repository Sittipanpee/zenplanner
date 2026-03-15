/**
 * Quiz Card Component
 * Animated card for quiz questions
 */

"use client";

import { useState } from "react";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export interface QuizQuestion {
  id: number;
  scenario: string;
  options: {
    text: string;
    emoji: string;
    score: {
      energy?: number;
      planning?: number;
      social?: number;
      decision?: number;
      focus?: number;
      drive?: number;
    };
  }[];
}

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (optionIndex: number) => void;
  isLoading?: boolean;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  isLoading,
}: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const progressPercent = (questionNumber / totalQuestions) * 100;

  const handleAnswer = (index: number) => {
    if (isLoading) return;

    setSelectedIndex(index);
    setIsAnimatingOut(true);

    // Brief animation before proceeding
    setTimeout(() => {
      setSelectedIndex(null);
      setIsAnimatingOut(false);
      onAnswer(index);
    }, 300);
  };

  return (
    <div className={`w-full max-w-md mx-auto ${isAnimatingOut ? 'animate-zen-slide-out-left' : 'animate-zen-slide-up'}`}>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-zen-text-secondary mb-2">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-zen-gold" />
            คำถามที่ {questionNumber}/{totalQuestions}
          </span>
          <span className="font-semibold text-zen-sage">{Math.round(progressPercent)}%</span>
        </div>
        {/* Animated progress bar */}
        <div className="h-3 bg-zen-surface-alt rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-zen-sage to-zen-sage-light rounded-full transition-all duration-500 ease-out animate-zen-glow-pulse"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
        </div>
      </div>

      {/* Question Card */}
      <ZenCard variant="interactive" padding="lg" className="text-center hover:animate-zen-card-hover">
        <div className="mb-4 relative">
          <Sparkles className="w-10 h-10 text-zen-gold mx-auto animate-zen-float" />
          {/* Sparkle particles */}
          <div className="absolute -top-2 -right-2 w-2 h-2 bg-zen-gold rounded-full animate-zen-bounce-playful" />
          <div className="absolute top-0 -left-1 w-1.5 h-1.5 bg-zen-gold rounded-full animate-zen-bounce-playful" style={{ animationDelay: '0.2s' }} />
        </div>

        <h2 className="text-xl font-semibold text-zen-text mb-6 animate-zen-pop">
          {question.scenario}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isLoading}
              className={`
                w-full p-4 text-left rounded-xl border-2 border-zen-border
                hover:border-zen-sage hover:bg-zen-sage/5 hover:-translate-y-1
                focus-visible:ring-2 focus-visible:ring-zen-sage focus-visible:outline-none
                transition-all duration-200 flex items-center gap-3
                disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedIndex === index ? 'animate-zen-button-press border-zen-sage bg-zen-sage/10' : ''}
                group
              `}
            >
              <span className={`text-2xl transition-transform duration-200 ${selectedIndex === index ? 'scale-125' : 'group-hover:scale-110'}`}>
                {option.emoji}
              </span>
              <span className={`text-zen-text flex-1 transition-colors duration-200 ${selectedIndex === index ? 'text-zen-sage font-medium' : ''}`}>
                {option.text}
              </span>
              <ArrowRight className={`w-5 h-5 text-zen-text-muted transition-all duration-200 ${selectedIndex === index ? 'text-zen-sage animate-zen-shake' : 'group-hover:translate-x-1'}`} />
            </button>
          ))}
        </div>
      </ZenCard>

      {/* Hint text */}
      <p className="text-center text-xs text-zen-text-muted mt-4 animate-zen-fade-in">
        แต่ละคำตอบจะบอกเล่าสไตล์การวางแผนของคุณ
      </p>
    </div>
  );
}

/**
 * Quiz Progress Indicator
 */
export function QuizProgress({
  current,
  total,
  spiritAnimal,
}: {
  current: number;
  total: number;
  spiritAnimal?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`
            w-3 h-3 rounded-full transition-all duration-300 ease-out
            ${i < current
              ? spiritAnimal
                ? "bg-zen-gold animate-zen-pop"
                : "bg-zen-sage"
              : i === current
                ? "bg-zen-sage-light scale-125 animate-zen-pulse-grow"
                : "bg-zen-border"
            }
          `}
        />
      ))}
    </div>
  );
}