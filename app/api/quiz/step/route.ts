/**
 * Quiz Step API
 * Process quiz answers and return next question or result
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callLLM, QUIZ_SYSTEM_PROMPT } from "@/lib/llm";
import { determineAnimal, generateInsight } from "@/lib/quiz-engine";
import type { AxisScores } from "@/lib/types";

// Score weights for each answer option (0-3)
const ANSWER_SCORES = [
  // Question 1: Morning routine
  { energy: 30, planning: 30, social: 10, decision: 20, focus: 20, drive: 25 },
  { energy: -10, planning: -10, social: 10, decision: 10, focus: -10, drive: -5 },
  { energy: 5, planning: 0, social: -5, decision: 5, focus: 5, drive: 5 },
  { energy: 20, planning: -15, social: 30, decision: -10, focus: -5, drive: 15 },
  // Question 2: Work time preference
  { energy: 30, planning: 20, social: -10, decision: 20, focus: 25, drive: 20 },
  { energy: -10, planning: 15, social: -10, decision: 25, focus: 25, drive: 15 },
  { energy: 5, planning: -15, social: 10, decision: 5, focus: 0, drive: 5 },
  { energy: 10, planning: 5, social: 5, decision: 10, focus: 10, drive: 10 },
  // Question 3: Decision making
  { energy: 25, planning: 30, social: 5, decision: 30, focus: 25, drive: 30 },
  { energy: -5, planning: -5, social: 25, decision: -15, focus: 0, drive: 0 },
  { energy: 10, planning: 15, social: -5, decision: -10, focus: 10, drive: 10 },
  { energy: 5, planning: 5, social: 15, decision: 20, focus: 5, drive: 5 },
  // Question 4: Social preference
  { energy: 10, planning: 5, social: 30, decision: 5, focus: 5, drive: 15 },
  { energy: -5, planning: 10, social: -30, decision: 15, focus: 15, drive: 5 },
  { energy: 5, planning: 5, social: 10, decision: 5, focus: 5, drive: 10 },
  { energy: 15, planning: -5, social: 20, decision: 0, focus: 0, drive: 10 },
  // Question 5: Focus style
  { energy: 20, planning: 25, social: -5, decision: 20, focus: 30, drive: 25 },
  { energy: -5, planning: -10, social: 15, decision: -10, focus: -20, drive: 0 },
  { energy: 5, planning: 0, social: 5, decision: 5, focus: 10, drive: 10 },
  { energy: 10, planning: 5, social: 10, decision: 0, focus: 5, drive: 5 },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, message, mode, questionIndex, answerIndex } = await request.json();

    // Input validation
    if (typeof questionIndex !== 'number' || typeof answerIndex !== 'number') {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    if (answerIndex < 0 || answerIndex > 3) {
      return NextResponse.json({ error: "Invalid answer index" }, { status: 400 });
    }

    // For minigame mode, use deterministic logic
    if (mode === "minigame") {
      // Store answer in session
      const answers: number[] = []; // Would come from DB in production

      // Calculate current scores based on answers
      const scores = calculateScores(answers, answerIndex, questionIndex);

      // Check if complete (5 questions)
      const isComplete = questionIndex >= 4;

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

      // Return next question (in production, store in DB)
      return NextResponse.json({
        reply: getNextQuestion(questionIndex),
        isComplete: false,
      });
    }

    // For custom mode, use LLM
    // ... LLM-based quiz implementation

    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("Quiz step error:", error);
    return NextResponse.json({ error: "Quiz failed" }, { status: 500 });
  }
}

function calculateScores(answers: number[], newAnswer: number, questionIndex: number): AxisScores {
  // Start with baseline scores
  const scores: AxisScores = {
    energy: 50,
    planning: 50,
    social: 50,
    decision: 50,
    focus: 50,
    drive: 50,
  };

  // Add previous answers' scores
  answers.forEach((answer, idx) => {
    const scoreIndex = idx * 4 + answer;
    if (scoreIndex < ANSWER_SCORES.length) {
      const score = ANSWER_SCORES[scoreIndex];
      scores.energy = Math.max(0, Math.min(100, scores.energy + score.energy));
      scores.planning = Math.max(0, Math.min(100, scores.planning + score.planning));
      scores.social = Math.max(0, Math.min(100, scores.social + score.social));
      scores.decision = Math.max(0, Math.min(100, scores.decision + score.decision));
      scores.focus = Math.max(0, Math.min(100, scores.focus + score.focus));
      scores.drive = Math.max(0, Math.min(100, scores.drive + score.drive));
    }
  });

  // Add new answer score
  const newScoreIndex = questionIndex * 4 + newAnswer;
  if (newScoreIndex < ANSWER_SCORES.length) {
    const score = ANSWER_SCORES[newScoreIndex];
    scores.energy = Math.max(0, Math.min(100, scores.energy + score.energy));
    scores.planning = Math.max(0, Math.min(100, scores.planning + score.planning));
    scores.social = Math.max(0, Math.min(100, scores.social + score.social));
    scores.decision = Math.max(0, Math.min(100, scores.decision + score.decision));
    scores.focus = Math.max(0, Math.min(100, scores.focus + score.focus));
    scores.drive = Math.max(0, Math.min(100, scores.drive + score.drive));
  }

  return scores;
}

function getNextQuestion(index: number): string {
  const questions = [
    "ถ้าคุณมีวันหยุดสุดสัปดาห์ คุณจะทำอะไร?",
    "เมื่อต้องตัดสินใจสำคัญ คุณทำอย่างไร?",
    "คนรอบข้างมักจะอธิบายคุณว่าอย่างไร?",
    "เมื่อต้องทำงานหลายอย่างพร้อมกัน คุณ...?",
    "ถ้ามีเวลาว่าง คุณชอบทำอะไร?",
  ];
  return questions[index] || "ขอบคุณที่ตอบคำถาม!";
}