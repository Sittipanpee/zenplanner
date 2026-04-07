/**
 * Quiz Game Page
 * Handles the actual quiz gameplay
 * With sessionStorage persistence, i18n, dark mode, and previous-question button
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { QuizCard } from "@/components/quiz/quiz-card";
import { ZenButton } from "@/components/ui/zen-button";
import { getAnimal } from "@/lib/animal-data";
import { createClient } from "@/lib/supabase/client";
import { QUIZ_DATA, type QuizQuestion } from "@/lib/quiz-data";
import { getDominantAnimal } from "@/lib/archetype-map";
import type { AxisScores } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

const STORAGE_KEY = "zenplanner-quiz-state";

// Use quiz data from lib (22 questions)
const QUIZ_QUESTIONS: QuizQuestion[] = QUIZ_DATA;

export default function QuizGamePage({ params }: { params: Promise<{ mode: string }> }) {
  const [mode, setMode] = useState<string>("minigame");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ animal: string; scores: AxisScores } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // Resolve params
  useEffect(() => {
    params.then((p) => setMode(p.mode));
  }, [params]);

  // On mount: restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentQuestion !== undefined && Array.isArray(parsed.answers)) {
          setCurrentQuestion(parsed.currentQuestion);
          setAnswers(parsed.answers);
          if (parsed.mode) {
            setMode(parsed.mode);
          }
        }
      }
    } catch {
      // [SKIP] sessionStorage not available or corrupted — start fresh
    }
  }, []);

  const handleAnswer = useCallback(async (optionIndex: number) => {
    setIsLoading(true);

    // Store answer
    const newAnswers = [...answers, optionIndex];
    const newQuestion = currentQuestion + 1;

    // Persist to sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentQuestion: newQuestion,
        answers: newAnswers,
        mode,
      }));
    } catch {
      // [SKIP] sessionStorage write failed — continue without persistence
    }

    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(newQuestion);
    } else {
      // Calculate result
      const scores = calculateScores(newAnswers);
      const animal = determineAnimal(scores);
      setResult({ animal, scores });

      // Clear sessionStorage on complete
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // [SKIP] sessionStorage removal failed
      }

      // Try to save to database (if user is logged in)
      await saveQuizResult(animal, scores);
    }

    setIsLoading(false);
  }, [answers, currentQuestion, mode]);

  /** Go back to previous question */
  const handlePrevious = useCallback(() => {
    if (currentQuestion <= 0 || answers.length === 0) return;

    const newAnswers = answers.slice(0, -1);
    const newQuestion = currentQuestion - 1;

    setAnswers(newAnswers);
    setCurrentQuestion(newQuestion);

    // Update sessionStorage
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentQuestion: newQuestion,
        answers: newAnswers,
        mode,
      }));
    } catch {
      // [SKIP] sessionStorage write failed
    }
  }, [currentQuestion, answers, mode]);

  const saveQuizResult = async (animal: string, scores: AxisScores) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("[SKIP] User not logged in, skipping quiz save");
        setIsSaving(false);
        return;
      }

      // Call the quiz complete API
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          axisScores: scores,
          spiritAnimal: animal,
        }),
      });

      if (response.ok) {
        const data = await response.json();

      } else {
        console.error("Failed to save quiz:", await response.text());
      }
    } catch (error) {
      console.error("Error saving quiz result:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateScores = (ans: number[]): AxisScores => {
    const scores: AxisScores = { energy: 50, planning: 50, social: 50, decision: 50, focus: 50, drive: 50 };

    ans.forEach((a, idx) => {
      const option = QUIZ_QUESTIONS[idx]?.options[a];
      if (option?.score) {
        Object.entries(option.score).forEach(([k, v]) => {
          if (k in scores && v !== undefined) {
            const key = k as keyof AxisScores;
            scores[key] = Math.min(100, Math.max(0, scores[key] + v / 3));
          }
        });
      }
    });

    return scores;
  };

  const determineAnimal = (scores: AxisScores) => {
    // Use the proper 6-axis algorithm from archetype-map
    return getDominantAnimal(scores);
  };

  // Show result page
  if (result) {
    const animalData = getAnimal(result.animal as Parameters<typeof getAnimal>[0]);
    const animalName = locale === "th" ? animalData.nameTh : locale === "zh" ? animalData.nameZh : animalData.nameEn;

    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 animate-zen-reveal">
          <div className="text-6xl mb-4">
            {animalData.emoji}
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            {t("reveal.title")}
          </h1>
          <h2 className="font-display text-4xl font-bold text-zen-sage capitalize">
            {animalName}
          </h2>
          <p className="text-zen-text-secondary">
            {animalData.description}
          </p>
          {/* Saving status indicator */}
          {isSaving && (
            <p className="text-sm text-zen-text-muted flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-zen-sage rounded-full animate-pulse" aria-hidden="true" />
              {tCommon("actions.loading")}
            </p>
          )}
          {!isSaving && (
            <p className="text-sm text-zen-sage flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-zen-sage rounded-full" aria-hidden="true" />
              {tCommon("actions.done")}
            </p>
          )}
          <ZenButton fullWidth onClick={() => router.push(`/quiz/reveal?animal=${result.animal}`)}>
            {tCommon("actions.continue")}
          </ZenButton>
        </div>
      </main>
    );
  }

  const currentQ = QUIZ_QUESTIONS[currentQuestion];

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <QuizCard
        key={currentQuestion}
        question={{
          id: currentQ.id,
          scenario: currentQ.scenario,
          options: currentQ.options.map((opt, i) => ({
            text: opt.label,
            emoji: ["🔥", "🌊", "☕", "🤝"][i] || "✨",
            score: opt.score,
          })),
        }}
        questionNumber={currentQuestion + 1}
        totalQuestions={QUIZ_QUESTIONS.length}
        onAnswer={handleAnswer}
        isLoading={isLoading}
      />

      <div className="mt-6 flex items-center gap-4">
        {/* Previous question button */}
        {currentQuestion > 0 && (
          <button
            onClick={handlePrevious}
            disabled={isLoading}
            className="flex items-center gap-1 text-zen-text-secondary text-sm hover:text-zen-text disabled:opacity-50 transition-colors"
            aria-label={t("question.back")}
          >
            <ArrowLeft className="w-4 h-4" />
            {t("question.back")}
          </button>
        )}
        <button
          onClick={() => router.push("/quiz")}
          className="text-zen-text-muted text-sm hover:underline"
        >
          {tCommon("actions.cancel")}
        </button>
      </div>
    </main>
  );
}
