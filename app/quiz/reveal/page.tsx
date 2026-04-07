/**
 * Quiz Reveal Page
 * Dramatic reveal of spirit animal with animations
 * Uses canonical animal data, inline copy feedback (no alert), i18n, dark mode
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { getAnimal } from "@/lib/animal-data";
import type { SpiritAnimal } from "@/lib/types";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Sparkles, Download, Share2, ArrowLeft, Loader2, Check } from "lucide-react";

function QuizRevealContent() {
  const searchParams = useSearchParams();
  const animalKey = (searchParams.get("animal") || "butterfly") as SpiritAnimal;
  const data = getAnimal(animalKey);
  const locale = useLocale();
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");

  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(true);

  // Get locale-aware name and description
  const animalName = locale === "th" ? data.nameTh : locale === "zh" ? data.nameZh : data.nameEn;
  const animalDescription =
    locale === "th" ? (data.descriptionTh ?? data.description) :
    locale === "zh" ? (data.descriptionZh ?? data.description) :
    data.description;

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch AI-generated planning insight
  useEffect(() => {
    const params = new URLSearchParams({ animal: animalKey, locale });
    const scoreKeys = ["energy", "planning", "social", "decision", "focus", "drive"] as const;
    scoreKeys.forEach((k) => {
      const v = searchParams.get(k);
      if (v) params.set(k, v);
    });

    fetch(`/api/quiz/reveal-summary?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (d.summary) setAiSummary(d.summary); })
      .catch(() => { /* silent — summary is enhancement, not critical */ })
      .finally(() => setIsLoadingAI(false));
  }, [animalKey, locale, searchParams]);

  const handleShare = async () => {
    const text = `${t("reveal.title")} ${animalName} ${data.emoji}! ${animalDescription}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // [SKIP] Clipboard API unavailable in non-secure context — show error inline
      // We still set copied briefly to give feedback attempt
      console.error("[SKIP] Clipboard write failed — browser does not support clipboard API in this context");
    }
  };

  return (
    <main className="min-h-screen bg-zen-bg dark:bg-zinc-950">
      {/* Simple Header */}
      <div className="fixed top-0 left-0 right-0 px-4 py-4 z-50 bg-zen-bg/80 dark:bg-zinc-950/80 backdrop-blur-sm">
        <Link href="/quiz" className="inline-flex items-center text-zen-text-secondary dark:text-zinc-400 hover:text-zen-text dark:hover:text-zinc-200">
          <ArrowLeft className="w-5 h-5" />
          <span className="ml-1">{t("reveal.takeAgain")}</span>
        </Link>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-zen-gold/20 to-zen-blossom/20 dark:from-zen-gold/10 dark:to-zen-blossom/10 py-16 px-4 pt-16">
        <div className="absolute inset-0 opacity-30" aria-hidden="true">
          <Sparkles className="w-full h-full text-zen-gold animate-zen-float" />
        </div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6 rounded-full bg-white dark:bg-zinc-800 shadow-zen-lg text-6xl animate-zen-reveal">
            {data.emoji}
          </div>
          <h1 className="font-display text-3xl font-bold text-zen-text dark:text-zinc-100 mb-2 animate-zen-fade-in" style={{ animationDelay: "0.2s" }}>
            {t("reveal.title")}
          </h1>
          <h2 className="font-display text-5xl font-bold text-zen-sage mb-4 animate-zen-fade-in" style={{ animationDelay: "0.4s" }}>
            {animalName}
          </h2>
          <p className="text-zen-text-secondary dark:text-zinc-400 max-w-sm mx-auto animate-zen-fade-in" style={{ animationDelay: "0.6s" }}>
            {animalDescription}
          </p>
        </div>
      </div>
      {/* AI Planning Insight */}
      <div className="max-w-md mx-auto px-4 pt-6">
        <ZenCard className="p-5">
          <p className="text-xs font-semibold text-zen-sage uppercase tracking-widest mb-3 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            {t("reveal.aiInsight.title")}
          </p>
          {isLoadingAI ? (
            <div className="space-y-2 animate-pulse">
              <div className="h-3.5 bg-zen-border dark:bg-zinc-700 rounded w-full" />
              <div className="h-3.5 bg-zen-border dark:bg-zinc-700 rounded w-5/6" />
              <div className="h-3.5 bg-zen-border dark:bg-zinc-700 rounded w-4/6" />
              <p className="text-xs text-zen-text-muted dark:text-zinc-500 mt-2">{t("reveal.aiInsight.loading")}</p>
            </div>
          ) : aiSummary ? (
            <p className="text-zen-text dark:text-zinc-200 text-sm leading-relaxed">{aiSummary}</p>
          ) : null}
        </ZenCard>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="flex-1 h-11 bg-zen-surface dark:bg-zinc-800 border border-zen-border dark:border-zinc-700 text-zen-text dark:text-zinc-200 font-semibold rounded-full flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-zen-sage transition-colors"
            aria-label={copied ? t("reveal.copied") : t("reveal.share")}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-zen-sage" />
                {t("reveal.copied")}
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                {t("reveal.share")}
              </>
            )}
          </button>
        </div>
        <Link href="/blueprint">
          <ZenButton fullWidth>
            <Download className="w-5 h-5 mr-2" />
            {t("reveal.viewPlanner")}
          </ZenButton>
        </Link>
        <p className="text-center text-sm text-zen-text-muted dark:text-zinc-500">
          {t("reveal.subtitle")}{" "}
          <Link href="/dashboard" className="text-zen-sage hover:underline">
            {tCommon("nav.dashboard")}
          </Link>
        </p>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-zen-bg dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-zen-sage animate-spin mx-auto mb-4" />
        <p className="text-zen-text-secondary dark:text-zinc-400">{/* Loading */}</p>
      </div>
    </main>
  );
}

export default function QuizRevealPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <QuizRevealContent />
    </Suspense>
  );
}
