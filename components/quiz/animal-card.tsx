/**
 * Animal Card Component
 * Reveal card with unique themes per spirit animal
 * Uses canonical animal data from lib/animal-data.ts
 */

"use client";

import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getAnimal, type AnimalData } from "@/lib/animal-data";
import type { SpiritAnimal } from "@/lib/types";
import { Sparkles, Share2, ArrowRight } from "lucide-react";

/** Get the locale-aware animal name */
function getAnimalName(data: AnimalData, locale: string): string {
  switch (locale) {
    case "th":
      return data.nameTh;
    case "zh":
      return data.nameZh;
    default:
      return data.nameEn;
  }
}

export interface AnimalCardProps {
  animal: SpiritAnimal;
  archetypeCode?: string;
  showShare?: boolean;
  showCTA?: boolean;
  onShare?: () => void;
  onContinue?: () => void;
  className?: string;
}

/**
 * Animal Card - Full reveal card for spirit animal
 */
export function AnimalCard({
  animal,
  archetypeCode,
  showShare = true,
  showCTA = true,
  onShare,
  onContinue,
  className,
}: AnimalCardProps) {
  const data = getAnimal(animal);
  const locale = useLocale();
  const t = useTranslations("quiz");
  const tCommon = useTranslations("common");
  const animalName = getAnimalName(data, locale);

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        background: data.gradient,
      }}
      role="region"
      aria-label={animalName}
    >
      {/* Frame animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none"
        )}
        style={{
          boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.25)`,
        }}
      />

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-zen-float"
            style={{
              background: "rgba(255,255,255,0.4)",
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <span
              className="text-7xl md:text-8xl animate-zen-pop"
              role="img"
              aria-label={data.nameEn}
            >
              {data.emoji}
            </span>
            <Sparkles
              className="absolute -top-2 -right-4 w-6 h-6 animate-zen-float"
              style={{ color: "rgba(255,255,255,0.7)" }}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--zen-font-display)] mb-2">
            {animalName}
          </h1>

          <p className="text-lg opacity-90 mb-1">{data.nameEn !== animalName ? data.nameEn : data.nameTh}</p>

          {archetypeCode && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-mono"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {archetypeCode}
            </span>
          )}
        </div>

        {/* Description */}
        <div
          className="text-center p-4 rounded-xl mb-6"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <p className="text-sm md:text-base leading-relaxed">{data.description}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full
                bg-white/20 hover:bg-white/30 active:scale-95
                transition-all duration-200 font-medium text-sm"
              aria-label={t("reveal.share")}
            >
              <Share2 className="w-4 h-4" />
              {t("reveal.share")}
            </button>
          )}

          {showCTA && onContinue && (
            <button
              onClick={onContinue}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full
                bg-white text-zen-text font-semibold
                hover:bg-zen-surface hover:shadow-lg active:scale-95
                transition-all duration-200"
              aria-label={t("reveal.viewPlanner")}
            >
              {t("reveal.viewPlanner")}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Animal Avatar - Small avatar for display
 */
export interface AnimalAvatarProps {
  animal: SpiritAnimal;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function AnimalAvatar({
  animal,
  size = "md",
  showName = false,
  className,
}: AnimalAvatarProps) {
  const data = getAnimal(animal);
  const locale = useLocale();
  const animalName = getAnimalName(data, locale);

  const sizeClasses = {
    sm: "w-10 h-10 text-xl",
    md: "w-16 h-16 text-3xl",
    lg: "w-24 h-24 text-5xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "relative rounded-full flex items-center justify-center",
          sizeClasses[size]
        )}
        style={{
          background: data.gradient,
          boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
        }}
      >
        <span role="img" aria-label={data.nameEn}>
          {data.emoji}
        </span>
      </div>
      {showName && (
        <span className="text-xs font-medium text-zen-text-secondary dark:text-zinc-400">
          {animalName}
        </span>
      )}
    </div>
  );
}
