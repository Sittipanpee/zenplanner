/**
 * Quiz Intro Page
 * Entry point for spirit animal quiz
 * With i18n, dark mode, ThemeToggle, LanguageSwitcher
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import ThemeToggle from "@/components/ui/theme-toggle";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { Sparkles, Zap, Heart, Target, ArrowLeft } from "lucide-react";

export default function QuizIntroPage() {
  const router = useRouter();
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");

  const features = [
    { icon: <Zap className="w-5 h-5" />, text: t("home.modeClassic") },
    { icon: <Heart className="w-5 h-5" />, text: t("home.modeChat") },
    { icon: <Target className="w-5 h-5" />, text: t("home.modeGame") },
  ];

  return (
    <main className="min-h-screen bg-zen-bg dark:bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Header with nav controls */}
      <div className="fixed top-0 left-0 right-0 px-4 md:px-8 py-4 z-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center text-zen-text-secondary dark:text-zinc-400 hover:text-zen-text dark:hover:text-zinc-200">
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-1">{tCommon("actions.back")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl space-y-8 md:space-y-10 pt-8 md:pt-0">
        {/* Hero */}
        <div className="text-center">
          <div className="mb-6 md:mb-8">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 text-zen-gold mx-auto animate-zen-float" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-zen-text dark:text-zinc-100 mb-3 md:mb-4">
            {t("home.title")}
          </h1>
          <p className="text-zen-text-secondary dark:text-zinc-400 text-lg md:text-xl">
            {t("home.subtitle")}
          </p>
        </div>

        {/* Features */}
        <ZenCard className="dark:bg-zinc-900 dark:border-zinc-700">
          <div className="space-y-4 md:space-y-5">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-zen-sage">{feature.icon}</div>
                <span className="text-zen-text dark:text-zinc-200 text-lg">{feature.text}</span>
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
              role="img"
              aria-hidden="true"
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
            {t("home.startButton")}
          </ZenButton>
          <p className="text-center text-sm text-zen-text-muted dark:text-zinc-500">
            {t("home.estimatedTime")}
          </p>
        </div>

        {/* Alternative */}
        <div className="text-center">
          <button
            onClick={() => router.push("/quiz/custom")}
            className="text-zen-sage text-sm md:text-base hover:underline"
          >
            {t("home.modeChat")}
          </button>
        </div>
      </div>
    </main>
  );
}
