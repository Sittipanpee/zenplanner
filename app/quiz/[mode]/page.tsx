/**
 * Quiz Game Page
 * Handles the actual quiz gameplay
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QuizCard, QuizProgress } from "@/components/quiz/quiz-card";
import { ZenButton } from "@/components/ui/zen-button";
import { createClient } from "@/lib/supabase/client";
import { QUIZ_DATA, type QuizQuestion } from "@/lib/quiz-data";
import { getDominantAnimal } from "@/lib/archetype-map";
import type { AxisScores } from "@/lib/types";

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

  useEffect(() => {
    params.then((p) => setMode(p.mode));
  }, [params]);

  const handleAnswer = async (optionIndex: number) => {
    setIsLoading(true);

    // Store answer
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    // Simulate delay for effect
    await new Promise((r) => setTimeout(r, 500));

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const scores = calculateScores(newAnswers);
      const animal = determineAnimal(scores);
      setResult({ animal, scores });

      // Try to save to database (if user is logged in)
      await saveQuizResult(animal, scores);
    }

    setIsLoading(false);
  };

  const saveQuizResult = async (animal: string, scores: AxisScores) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("User not logged in, skipping save");
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
        console.log("Quiz saved successfully:", data);
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
    const animalEmojis: Record<string, string> = {
      lion: "🦁", whale: "🐋", dolphin: "🐬", owl: "🦉", fox: "🦊",
      turtle: "🐢", eagle: "🦅", octopus: "🐙", mountain: "🏔️", wolf: "🐺",
      sakura: "🌸", cat: "🐱", crocodile: "🐊", dove: "🕊️", butterfly: "🦋", bamboo: "🌿"
    };
    const animalNames: Record<string, string> = {
      lion: "สิงโต", whale: "วาฬ", dolphin: "โลมา", owl: "นกฮูก", fox: "จิ้งจอก",
      turtle: "เต่า", eagle: "นกอินทรี", octopus: "ปลาหมึก", mountain: "ภูเขา", wolf: "หมาป่า",
      sakura: "ซากุระ", cat: "แมว", crocodile: "จระเข้", dove: "นกพิราบ", butterfly: "ผีเสื้อ", bamboo: "ไผ่"
    };
    const animalDescriptions: Record<string, string> = {
      lion: "ผู้นำที่เกิดมาพร้อมวิสัยทัศน์!",
      whale: "นักคิดที่มองเห็นภาพใหญ่",
      dolphin: "ผู้เชื่อมต่อแห่งความสุข",
      owl: "ผู้สังเกตการณ์อันชาญฉลาด",
      fox: "ผู้ปรับตัวอันฉลาดหลักแหลม",
      turtle: "ผู้สร้างที่ไม่หยุดเดิน",
      eagle: "วิสัยทัศน์เหนือก้อนเมฆ",
      octopus: "จอมมัลติทาสก์ผู้เก่งกาจ",
      mountain: "สถาปนิกแห่งกาลเวลา",
      wolf: "ผู้นำฝูงผู้ภักดี",
      sakura: "ศิลปินแห่งกระแส",
      cat: "ผู้จัดการตัวเอง",
      crocodile: "นักล่าผู้อดทน",
      dove: "ผู้รักษาสมดุล",
      butterfly: "นักสำรวจผู้ไม่หยุดค้นหา",
      bamboo: "ผู้ยืดหยุ่นไม่มีวันหัก"
    };

    return (
      <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 animate-zen-reveal">
          <div className="text-6xl mb-4">
            {animalEmojis[result.animal] || "🦋"}
          </div>
          <h1 className="font-display text-2xl font-bold text-zen-text">
            สัตว์ประจำตัวคุณคือ...
          </h1>
          <h2 className="font-display text-4xl font-bold text-zen-sage capitalize">
            {animalNames[result.animal] || result.animal}
          </h2>
          <p className="text-zen-text-secondary">
            {animalDescriptions[result.animal] || "การเปลี่ยนแปลงที่สวยงาม"}
          </p>
          {/* Saving status indicator */}
          {isSaving && (
            <p className="text-sm text-zen-text-muted flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-zen-sage rounded-full animate-pulse" />
              กำลังบันทึกผลลัพธ์...
            </p>
          )}
          {!isSaving && (
            <p className="text-sm text-zen-sage flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-zen-sage rounded-full" />
              บันทึกแล้ว
            </p>
          )}
          <ZenButton fullWidth onClick={() => router.push(`/quiz/reveal?animal=${result.animal}`)}>
            ดูผลลัพธ์เต็ม →
          </ZenButton>
        </div>
      </main>
    );
  }

  const currentQ = QUIZ_QUESTIONS[currentQuestion];

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <QuizProgress current={currentQuestion + 1} total={QUIZ_QUESTIONS.length} />

      <QuizCard
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

      <div className="mt-6">
        <button
          onClick={() => router.push("/quiz")}
          className="text-zen-text-muted text-sm hover:underline"
        >
          ← กลับ
        </button>
      </div>
    </main>
  );
}
