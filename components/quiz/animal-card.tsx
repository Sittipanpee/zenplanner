/**
 * Animal Card Component
 * Reveal card with unique themes per spirit animal
 */

"use client";

import { cn } from "@/lib/utils";
import type { SpiritAnimal } from "@/lib/types";
import { Sparkles, Share2, ArrowRight } from "lucide-react";

// Animal data from CLAUDE.md
const ANIMAL_DATA: Record<
  SpiritAnimal,
  { emoji: string; name: string; nameTH: string; gradient: string; textColor: string; accent: string; frameAnimation: string; particleEffect: string; description: string }
> = {
  lion: {
    emoji: "🦁",
    name: "Lion",
    nameTH: "สิงโต",
    gradient: "linear-gradient(135deg, #C9A96E 0%, #D4837F 50%, #E8C170 100%)",
    textColor: "#3D2B1F",
    accent: "#C9A96E",
    frameAnimation: "animate-zen-pulse-gold",
    particleEffect: "floating-sparks",
    description: "ราชาแห่งแรงบันดาลใจ — ผู้นำที่มุ่งมั่นและทรงพลัง",
  },
  whale: {
    emoji: "🐋",
    name: "Whale",
    nameTH: "วาฬ",
    gradient: "linear-gradient(135deg, #1B3A4B 0%, #3D6B7E 50%, #89A4C7 100%)",
    textColor: "#E8F0F5",
    accent: "#89A4C7",
    frameAnimation: "animate-zen-wave-slow",
    particleEffect: "floating-bubbles",
    description: "นักปราชญ์ใต้ทะเลลึก — ความคิดที่ลึกซึ้งและมีสติ",
  },
  dolphin: {
    emoji: "🐬",
    name: "Dolphin",
    nameTH: "โลมา",
    gradient: "linear-gradient(135deg, #89C4E1 0%, #A8E6CF 50%, #FFE0B2 100%)",
    textColor: "#2C3E50",
    accent: "#4FC3F7",
    frameAnimation: "animate-zen-bounce-playful",
    particleEffect: "confetti-pop",
    description: "นักเล่นผู้ชนะ — พลังงานบวกและความคิดสร้างสรรค์",
  },
  owl: {
    emoji: "🦉",
    name: "Owl",
    nameTH: "นกฮูก",
    gradient: "linear-gradient(135deg, #2C2C54 0%, #474787 50%, #8E7CC3 100%)",
    textColor: "#E8E0F0",
    accent: "#8E7CC3",
    frameAnimation: "animate-zen-glow-mystic",
    particleEffect: "floating-stars",
    description: "ผู้พิทักษ์แห่งสติ — ปัญญาและความสงบ",
  },
  fox: {
    emoji: "🦊",
    name: "Fox",
    nameTH: "จิ้งจอก",
    gradient: "linear-gradient(135deg, #B38B6D 0%, #D4A574 50%, #E8C99B 100%)",
    textColor: "#3C2415",
    accent: "#C77B3E",
    frameAnimation: "animate-zen-shift-clever",
    particleEffect: "falling-leaves",
    description: "นักกลยุทธ์ผู้ปรับตัว — ฉลาดและยืดหยุ่น",
  },
  turtle: {
    emoji: "🐢",
    name: "Turtle",
    nameTH: "เต่า",
    gradient: "linear-gradient(135deg, #5D7B6F 0%, #7C9A82 50%, #A8C5AE 100%)",
    textColor: "#1A2E22",
    accent: "#7C9A82",
    frameAnimation: "animate-zen-grow-steady",
    particleEffect: "growing-vines",
    description: "ผู้สร้างที่ไม่หยุดเดิน — ความมุ่งมั่นและความอดทน",
  },
  eagle: {
    emoji: "🦅",
    name: "Eagle",
    nameTH: "อินทรี",
    gradient: "linear-gradient(135deg, #F5F5F0 0%, #D4CFC3 30%, #89A4C7 100%)",
    textColor: "#2C3E50",
    accent: "#5B7FA5",
    frameAnimation: "animate-zen-soar",
    particleEffect: "wind-streaks",
    description: "วิสัยทัศน์เหนือก้อนเมฆ — ผู้มองการณ์ไกล",
  },
  octopus: {
    emoji: "🐙",
    name: "Octopus",
    nameTH: "ปลาหมึกยักษ์",
    gradient: "linear-gradient(135deg, #6B5B95 0%, #B8A9C9 50%, #D4BEE4 100%)",
    textColor: "#2D1B4E",
    accent: "#7B6BA1",
    frameAnimation: "animate-zen-tentacle-wave",
    particleEffect: "ink-splatter",
    description: "จอมมัลติทาสก์ — ความคิดหลากหลายและสร้างสรรค์",
  },
  mountain: {
    emoji: "🏔️",
    name: "Mountain",
    nameTH: "ภูเขา",
    gradient: "linear-gradient(135deg, #6B6560 0%, #8B8680 50%, #A8A098 100%)",
    textColor: "#F5F3EE",
    accent: "#8B8680",
    frameAnimation: "animate-zen-stone-solid",
    particleEffect: "dust-motes",
    description: "สถาปนิกแห่งกาลเวลา — ความอดทนและวิสัยทัศน์",
  },
  wolf: {
    emoji: "🐺",
    name: "Wolf",
    nameTH: "หมาป่า",
    gradient: "linear-gradient(135deg, #4A4A4A 0%, #6B6B6B 40%, #A0522D 100%)",
    textColor: "#F0EDE8",
    accent: "#A0522D",
    frameAnimation: "animate-zen-howl-pulse",
    particleEffect: "ember-glow",
    description: "ผู้นำฝูง — ความภักดีและพลังทีม",
  },
  sakura: {
    emoji: "🌸",
    name: "Sakura",
    nameTH: "ซากุระ",
    gradient: "linear-gradient(135deg, #FFD1DC 0%, #FFC0CB 30%, #F5E6CC 100%)",
    textColor: "#5C3A42",
    accent: "#E8A0B1",
    frameAnimation: "animate-zen-petal-fall",
    particleEffect: "cherry-blossoms",
    description: "ศิลปินแห่งกระแส — ความงามและความคิดสร้างสรรค์",
  },
  cat: {
    emoji: "🐈",
    name: "Cat",
    nameTH: "แมว",
    gradient: "linear-gradient(135deg, #F5F3EE 0%, #E8E4DB 50%, #D4CFC3 100%)",
    textColor: "#3C3C3C",
    accent: "#A8A098",
    frameAnimation: "animate-zen-minimal-line",
    particleEffect: "none",
    description: "นักจัดการตัวเอง — ความเรียบง่ายและเป็นอิสระ",
  },
  crocodile: {
    emoji: "🐊",
    name: "Crocodile",
    nameTH: "จระเข้",
    gradient: "linear-gradient(135deg, #2D4739 0%, #476B5C 50%, #6B8F71 100%)",
    textColor: "#E8F0E8",
    accent: "#4A7C59",
    frameAnimation: "animate-zen-stillness",
    particleEffect: "water-ripple",
    description: "นักล่าผู้อดทน — ความอดทนและกลยุทธ์",
  },
  dove: {
    emoji: "🕊️",
    name: "Dove",
    nameTH: "นกพิราบ",
    gradient: "linear-gradient(135deg, #FEFEFE 0%, #E8E4DB 30%, #D4CFC3 60%, #C9E4CA 100%)",
    textColor: "#4A4A4A",
    accent: "#9BC4A0",
    frameAnimation: "animate-zen-feather-drift",
    particleEffect: "soft-light",
    description: "ผู้รักษาสมดุล — ความสงบและความกลมกลืน",
  },
  butterfly: {
    emoji: "🦋",
    name: "Butterfly",
    nameTH: "ผีเสื้อ",
    gradient: "linear-gradient(135deg, #FFE0B2 0%, #FFAB91 30%, #CE93D8 60%, #90CAF9 100%)",
    textColor: "#3E2723",
    accent: "#FF8A65",
    frameAnimation: "animate-zen-morph-wings",
    particleEffect: "sparkle-trail",
    description: "นักสำรวจผู้ไม่หยุดค้นหา — ความอยากรู้และการเปลี่ยนแปลง",
  },
  bamboo: {
    emoji: "🌿",
    name: "Bamboo",
    nameTH: "ไผ่",
    gradient: "linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 30%, #81C784 60%, #66BB6A 100%)",
    textColor: "#1B5E20",
    accent: "#4CAF50",
    frameAnimation: "animate-zen-sway",
    particleEffect: "bamboo-rustle",
    description: "ผู้ยืดหยุ่นไม่มีวันหัก — ความยืดหยุ่นและการเติบโต",
  },
};

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
  const data = ANIMAL_DATA[animal];

  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl", className)}
      style={{
        background: data.gradient,
        color: data.textColor,
      }}
    >
      {/* Frame animation */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl pointer-events-none",
          data.frameAnimation
        )}
        style={{
          boxShadow: `inset 0 0 0 2px ${data.accent}40`,
        }}
      />

      {/* Particle effects */}
      {data.particleEffect !== "none" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {data.particleEffect === "floating-sparks" &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-zen-float"
                style={{
                  background: data.accent,
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.3}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          {data.particleEffect === "floating-bubbles" &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-zen-float"
                style={{
                  background: `${data.accent}40`,
                  width: 8 + i * 4,
                  height: 8 + i * 4,
                  right: `${15 + i * 10}%`,
                  bottom: `${10 + (i % 2) * 20}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              />
            ))}
          {data.particleEffect === "floating-stars" &&
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-zen-float"
                style={{
                  color: data.accent,
                  fontSize: 8 + (i % 3) * 4,
                  left: `${5 + i * 10}%`,
                  top: `${15 + (i % 4) * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.5,
                }}
              >
                ★
              </div>
            ))}
          {data.particleEffect === "confetti-pop" &&
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-sm animate-zen-confetti"
                style={{
                  background: [data.accent, "#FFE082", "#81D4FA", "#F48FB1"][i % 4],
                  left: `${5 + i * 8}%`,
                  top: "0%",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
        </div>
      )}

      {/* Content */}
      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-4">
            <span
              className="text-7xl md:text-8xl animate-zen-pop"
              role="img"
              aria-label={data.name}
            >
              {data.emoji}
            </span>
            <Sparkles
              className="absolute -top-2 -right-4 w-6 h-6 animate-zen-float"
              style={{ color: data.accent }}
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--zen-font-display)] mb-2">
            {data.nameTH}
          </h1>

          <p className="text-lg opacity-90 mb-1">{data.name}</p>

          {archetypeCode && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-mono"
              style={{ background: `${data.accent}30`, color: data.textColor }}
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
            >
              <Share2 className="w-4 h-4" />
              แชร์ผลลัพธ์
            </button>
          )}

          {showCTA && onContinue && (
            <button
              onClick={onContinue}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full
                bg-white text-zen-text font-semibold
                hover:bg-zen-surface hover:shadow-lg active:scale-95
                transition-all duration-200"
            >
              สร้าง Planner ของฉัน
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
  const data = ANIMAL_DATA[animal];

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
          boxShadow: `0 2px 8px ${data.accent}40`,
        }}
      >
        <span role="img" aria-label={data.name}>
          {data.emoji}
        </span>
      </div>
      {showName && (
        <span className="text-xs font-medium text-zen-text-secondary">
          {data.nameTH}
        </span>
      )}
    </div>
  );
}

/**
 * Get animal data helper
 */
export function getAnimalData(animal: SpiritAnimal) {
  return ANIMAL_DATA[animal];
}
