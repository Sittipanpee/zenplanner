/**
 * Share Card Component
 * Social sharing preview for spirit animal results
 */

"use client";

import { useState } from "react";
import {
  Share2,
  Facebook,
  Twitter,
  Copy,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { ZenButton } from "../ui/zen-button";
import { ZenCard } from "../ui/zen-card";
import type { SpiritAnimal } from "@/lib/types";

// Spirit animal emoji and theme mappings
const ANIMAL_THEMES: Record<SpiritAnimal, { emoji: string; gradient: string; theme: string }> = {
  lion: { emoji: "🦁", gradient: "from-zen-gold to-zen-blossom", theme: "Gold & Blossom" },
  whale: { emoji: "🐋", gradient: "from-zen-indigo to-zen-sky", theme: "Deep Ocean" },
  dolphin: { emoji: "🐬", gradient: "from-zen-sky to-zen-sage-light", theme: "Ocean Breeze" },
  owl: { emoji: "🦉", gradient: "from-zen-indigo to-zen-sage", theme: "Mystic Night" },
  fox: { emoji: "🦊", gradient: "from-zen-earth to-zen-gold", theme: "Autumn Forest" },
  turtle: { emoji: "🐢", gradient: "from-zen-sage to-zen-sage-light", theme: "Forest Green" },
  eagle: { emoji: "🦅", gradient: "from-gray-200 to-zen-sky", theme: "Sky High" },
  octopus: { emoji: "🐙", gradient: "from-zen-indigo to-zen-blossom", theme: "Purple Depths" },
  mountain: { emoji: "🏔️", gradient: "from-zen-stone to-zen-text-muted", theme: "Stone Gray" },
  wolf: { emoji: "🐺", gradient: "from-gray-700 to-zen-earth", theme: "Lunar Wolf" },
  sakura: { emoji: "🌸", gradient: "from-pink-200 to-amber-100", theme: "Sakura" },
  cat: { emoji: "🐈", gradient: "from-zen-surface-alt to-zen-border", theme: "Minimal" },
  crocodile: { emoji: "🐊", gradient: "from-green-800 to-zen-sage", theme: "River Depth" },
  dove: { emoji: "🕊️", gradient: "from-white to-zen-sage-light", theme: "Peaceful" },
  butterfly: { emoji: "🦋", gradient: "from-amber-200 via-pink-300 to-sky-300", theme: "Summer Meadow" },
  bamboo: { emoji: "🌿", gradient: "from-green-200 to-green-400", theme: "Bamboo Grove" },
};

export interface ShareCardProps {
  animal: SpiritAnimal;
  animalName: string;
  archetypeCode: string;
  description?: string;
  quizUrl?: string;
  onShareLine?: () => void;
  onShareFacebook?: () => void;
  onShareTwitter?: () => void;
  onCopyLink?: () => void;
}

export function ShareCard({
  animal,
  animalName,
  archetypeCode,
  description = "",
  quizUrl = "https://zenplanner.app/quiz",
  onShareLine,
  onShareFacebook,
  onShareTwitter,
  onCopyLink,
}: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const theme = ANIMAL_THEMES[animal] || ANIMAL_THEMES.lion;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    onCopyLink?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `ฉันคือ ${theme.emoji} ${animalName}! ค้นหาสัตว์ประจำตัวคุณได้ที่`;

  return (
    <ZenCard variant="default" padding="lg" className="w-full max-w-md">
      {/* Preview Header */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-semibold text-zen-text">
          แชร์ผลลัพธ์ของคุณ
        </h2>
        <p className="text-sm text-zen-text-secondary mt-1">
          ให้เพื่อนๆ ได้รู้จักตัวตนที่แท้จริงของคุณ
        </p>
      </div>

      {/* Card Preview */}
      <div
        className={`
          relative overflow-hidden rounded-zen-xl p-6 mb-6
          bg-gradient-to-br ${theme.gradient}
        `}
      >
        {/* Decorative elements */}
        <div className="absolute top-3 right-3">
          <Sparkles className="w-5 h-5 text-white/60" />
        </div>

        {/* Animal Display */}
        <div className="text-center">
          <div className="text-6xl mb-3 animate-zen-float">
            {theme.emoji}
          </div>
          <h3 className="font-display text-2xl font-bold text-zen-text">
            {animalName}
          </h3>
          <p className="text-sm text-zen-text/70 mt-1">
            {archetypeCode}
          </p>
          {description && (
            <p className="text-xs text-zen-text/60 mt-3 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Theme Badge */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-zen-text font-medium">
            {theme.theme} Theme
          </span>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3 mb-6">
        {/* LINE Button */}
        <ZenButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={onShareLine}
          className="!bg-zen-line hover:!bg-[#05b54a]"
        >
          <LineIcon className="w-5 h-5 mr-2" />
          <span>แชร์ไป LINE</span>
        </ZenButton>

        {/* Facebook & Twitter Row */}
        <div className="flex gap-3">
          <ZenButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onShareFacebook}
            className="!text-[#1877f2] !border-[#1877f2]/30 hover:!bg-[#1877f2]/5"
          >
            <Facebook className="w-5 h-5 mr-1.5" />
            <span>Facebook</span>
          </ZenButton>
          <ZenButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onShareTwitter}
            className="!text-black hover:!bg-gray-100"
          >
            <Twitter className="w-5 h-5 mr-1.5" />
            <span>X</span>
          </ZenButton>
        </div>

        {/* Copy Link */}
        <ZenButton
          variant="ghost"
          size="md"
          fullWidth
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-zen-sage" />
              <span>คัดลอกแล้ว!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              <span>คัดลอกลิงก์</span>
            </>
          )}
        </ZenButton>
      </div>

      {/* URL Display */}
      <div className="p-3 bg-zen-surface-alt rounded-lg">
        <p className="text-xs text-zen-text-muted mb-1">ลิงก์สำหรับเพื่อน:</p>
        <p className="text-sm text-zen-text-secondary truncate font-mono">
          {quizUrl}
        </p>
      </div>
    </ZenCard>
  );
}

// Simple LINE icon component (since lucide-react doesn't have LINE)
function LineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 13.53c-.22.5-.77.72-1.22.5l-2.69-1.34-1.29.64c-.44.22-.99.1-1.22-.22-.23-.33-.1-.77.22-1l1.29-1.64-1.29-1.64c-.32-.44-.45-.99-.22-1.44.22-.44.77-.65 1.22-.44l1.29.64 2.69-1.34c.45-.22.99-.1 1.22.33.22.33.1.88-.22 1.1l-2.69 1.34 1.29 1.64c.33.44.45.99.22 1.33z" />
    </svg>
  );
}

export default ShareCard;
