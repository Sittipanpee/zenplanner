/**
 * Quiz Step API
 * Process quiz answers and return next question or result
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { determineAnimal, generateInsight } from "@/lib/quiz-engine";
import { buildQuizSystemPrompt } from "@/lib/quiz-prompts";
import { callLLM } from "@/lib/llm";
import { QUIZ_DATA } from "@/lib/quiz-data";
import type { AxisScores } from "@/lib/types";

const MINIGAME_QUESTION_COUNT = 10;

// Simple in-memory rate limiter — replace with Redis in production
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
    if (!checkRateLimit(ip, 30, 60000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, message, mode, questionIndex, answerIndex } = await request.json();

    if (mode === "minigame") {
      // Input validation
      if (typeof questionIndex !== "number" || typeof answerIndex !== "number") {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
      }
      if (answerIndex < 0 || answerIndex > 3) {
        return NextResponse.json({ error: "Invalid answer index" }, { status: 400 });
      }

      // Load existing answers from DB quiz_session JSONB field
      let existingAnswers: number[] = [];
      if (sessionId) {
        const { data: session, error: fetchError } = await supabase
          .from("quiz_sessions")
          .select("answers")
          .eq("id", sessionId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Failed to fetch quiz session:", fetchError);
        }

        if (session?.answers && Array.isArray(session.answers)) {
          existingAnswers = session.answers as number[];
        }
      }

      // Append new answer to the loaded array
      const updatedAnswers = [...existingAnswers, answerIndex];

      // Save updated answers back to DB before returning
      if (sessionId) {
        const { error: saveError } = await supabase
          .from("quiz_sessions")
          .update({ answers: updatedAnswers })
          .eq("id", sessionId);

        if (saveError) {
          console.error("Failed to save quiz answers:", saveError);
        }
      }

      // Calculate cumulative axis scores using QUIZ_DATA (full axis values, not compressed deltas)
      const scores = calculateScoresFromQuizData(updatedAnswers);

      // Check if complete
      const isComplete = updatedAnswers.length >= MINIGAME_QUESTION_COUNT;

      if (isComplete) {
        const spiritAnimal = determineAnimal(scores);
        const insight = await generateInsight(spiritAnimal, scores);

        return NextResponse.json({
          reply: "",
          isComplete: true,
          spiritAnimal,
          insight,
          axisScores: scores,
        });
      }

      // Return next question
      const nextQuestionIndex = updatedAnswers.length;
      const nextQuestion = QUIZ_DATA[nextQuestionIndex % QUIZ_DATA.length];

      return NextResponse.json({
        reply: nextQuestion
          ? `${nextQuestion.scenario}`
          : "ขอบคุณที่ตอบคำถาม!",
        isComplete: false,
        questionIndex: nextQuestionIndex,
        question: nextQuestion
          ? {
              id: nextQuestion.id,
              scenario: nextQuestion.scenario,
              options: nextQuestion.options.map((o) => o.label),
            }
          : null,
      });
    }

    if (mode === "custom") {
      // LLM-driven custom quiz mode
      if (!message || typeof message !== "string") {
        return NextResponse.json({ error: "Missing message for custom mode" }, { status: 400 });
      }

      // Detect locale from Accept-Language header or query param
      const acceptLanguage = request.headers.get("accept-language") ?? "";
      let locale: "en" | "th" | "zh" = "th";
      if (acceptLanguage.startsWith("zh")) locale = "zh";
      else if (acceptLanguage.startsWith("en")) locale = "en";

      // Load conversation history from DB
      let conversation: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
      if (sessionId) {
        const { data: session } = await supabase
          .from("quiz_sessions")
          .select("conversation")
          .eq("id", sessionId)
          .single();

        if (session?.conversation && Array.isArray(session.conversation)) {
          conversation = session.conversation as Array<{
            role: "user" | "assistant" | "system";
            content: string;
          }>;
        }
      }

      // Build messages (skip any system messages from stored conversation)
      const messages = [
        ...conversation.filter((m) => m.role !== "system"),
        { role: "user" as const, content: message },
      ];

      const systemPrompt = buildQuizSystemPrompt(locale);
      const reply = await callLLM(systemPrompt, messages, {
        temperature: 0.8,
        maxTokens: 600,
      });

      // Persist updated conversation
      if (sessionId) {
        const updatedConversation = [
          ...conversation.filter((m) => m.role !== "system"),
          { role: "user" as const, content: message },
          { role: "assistant" as const, content: reply },
        ];
        await supabase
          .from("quiz_sessions")
          .update({ conversation: updatedConversation })
          .eq("id", sessionId);
      }

      return NextResponse.json({
        reply,
        isComplete: false,
      });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error) {
    console.error("Quiz step error:", error);
    return NextResponse.json({ error: "Quiz failed" }, { status: 500 });
  }
}

/**
 * Calculate cumulative axis scores from an ordered list of answer indices.
 * Each answer maps to a row in QUIZ_DATA — full axis values used (not compressed deltas).
 * Base: 50 for all axes. Per-question: weighted average of the selected option's score.
 * Clamped to 0-100.
 */
function calculateScoresFromQuizData(answers: number[]): AxisScores {
  const scores: AxisScores = {
    energy: 50,
    planning: 50,
    social: 50,
    decision: 50,
    focus: 50,
    drive: 50,
  };

  answers.forEach((answerIndex, questionIdx) => {
    const question = QUIZ_DATA[questionIdx % QUIZ_DATA.length];
    if (!question) return;

    const option = question.options[answerIndex];
    if (!option) return;

    const s = option.score;

    // Apply full axis value contribution: move score toward the answer's value
    // Contribution = (answerValue - currentScore) * weight
    // Weight decreases as more questions answered to prevent runaway scores
    const weight = 1 / (questionIdx + 1);

    scores.energy = clamp(scores.energy + (s.energy - scores.energy) * weight);
    scores.planning = clamp(scores.planning + (s.planning - scores.planning) * weight);
    scores.social = clamp(scores.social + (s.social - scores.social) * weight);
    scores.decision = clamp(scores.decision + (s.decision - scores.decision) * weight);
    scores.focus = clamp(scores.focus + (s.focus - scores.focus) * weight);
    scores.drive = clamp(scores.drive + (s.drive - scores.drive) * weight);
  });

  return scores;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
