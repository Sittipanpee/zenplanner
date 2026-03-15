/**
 * Quiz Intro Page
 * Entry point for spirit animal quiz
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Sparkles, Zap, Heart, Target, ArrowLeft } from "lucide-react";

export default function QuizIntroPage() {
  const router = useRouter();

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: "คำถามสนุก 22 ข้อ" },
    { icon: <Heart className="w-5 h-5" />, text: "เข้าใจตัวเองลึกขึ้น" },
    { icon: <Target className="w-5 h-5" />, text: "ได้ Planner เฉพาะตัว" },
  ];

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Simple Header */}
      <div className="fixed top-0 left-0 right-0 px-4 md:px-8 py-4 z-10">
        <Link href="/" className="inline-flex items-center text-zen-text-secondary hover:text-zen-text">
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-1">กลับ</span>
        </Link>
      </div>

      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl space-y-8 md:space-y-10 pt-8 md:pt-0">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-6 md:mb-8">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-zen-gold mx-auto animate-zen-float" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-zen-text mb-3 md:mb-4">
            ค้นหาสัตว์ประจำตัวคุณ
          </h1>
          <p className="text-zen-text-secondary text-lg md:text-xl">
            ตอบคำถาม 22 ข้อ เพื่อค้นพบสัตว์ที่สะท้อนตัวตนที่แท้จริงของคุณ
          </p>
        </div>

        {/* Features */}
        <ZenCard>
          <div className="space-y-4 md:space-y-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-zen-sage">{feature.icon}</div>
                <span className="text-zen-text text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </ZenCard>

        {/* Preview Animals */}
        <div className="flex justify-center gap-3 md:gap-4">
          {["🦁", "🐋", "🦉", "🐺", "🦋"].map((emoji, i) => (
            <span
              key={i}
              className="text-3xl md:text-4xl lg:text-5xl"
            >
              {emoji}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 max-w-md mx-auto">
          <ZenButton
            size="lg"
            fullWidth
            onClick={() => router.push("/quiz/minigame")}
          >
            เริ่มทำ Quiz
          </ZenButton>
          <p className="text-center text-sm text-zen-text-muted">
            ใช้เวลาประมาณ 2-3 นาที
          </p>
        </div>

        {/* Alternative */}
        <div className="text-center">
          <button
            onClick={() => router.push("/quiz/custom")}
            className="text-zen-sage text-sm md:text-base hover:underline"
          >
            หรือสร้าง Planner แบบ Custom →
          </button>
        </div>
      </div>
    </main>
  );
}