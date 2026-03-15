/**
 * Animal Profile Component - Spirit Animal Mini Card
 * Displays user's spirit animal with avatar, name, archetype, and description
 */

import Link from "next/link";
import { ZenCard, ZenCardContent } from "../ui/zen-card";
import { ZenButton } from "../ui/zen-button";
import type { SpiritAnimal } from "@/lib/types";

// Animal emoji map (placeholder - can be replaced with custom images)
const ANIMAL_EMOJIS: Record<SpiritAnimal, string> = {
  lion: "🦁",
  whale: "🐋",
  dolphin: "🐬",
  owl: "🦉",
  fox: "🦊",
  turtle: "🐢",
  eagle: "🦅",
  octopus: "🐙",
  mountain: "🏔️",
  wolf: "🐺",
  sakura: "🌸",
  cat: "🐈",
  crocodile: "🐊",
  dove: "🕊️",
  butterfly: "🦋",
  bamboo: "🌿",
};

// Animal name map (Thai)
const ANIMAL_NAMES: Record<SpiritAnimal, string> = {
  lion: "สิงโต",
  whale: "วาฬ",
  dolphin: "โลมา",
  owl: "นกฮูก",
  fox: "จิ้งจอก",
  turtle: "เต่า",
  eagle: "อินทรี",
  octopus: "ปลาหมึกยักษ์",
  mountain: "ภูเขา",
  wolf: "หมาป่า",
  sakura: "ซากุระ",
  cat: "แมว",
  crocodile: "จระเข้",
  dove: "นกพิราบ",
  butterfly: "ผีเสื้อ",
  bamboo: "ไผ่",
};

// Archetype code meanings
const ARCHETYPE_TITLES: Record<string, string> = {
  DASESL: "ราชาแห่งแรงบันดาลใจ",
  NASHLG: "นักปราชญ์ใต้ทะเลลึก",
  NSSGKS: "นักเล่นผู้ชนะ",
  NAHPLG: "ผู้พิทักษ์แห่งสติ",
  DASPLS: "นักกลยุทธ์ผู้ปรับตัว",
  NAHHKG: "ผู้สร้างที่ไม่หยุดเดิน",
  DASBLG: "วิสัยทัศน์เหนือก้อนเมฆ",
  NSSGKS_ALT: "จอมมัลติทาสก์",
  NAHHLS: "สถาปนิกแห่งกาลเวลา",
  DASGLS: "ผู้นำฝูง",
  NAHPKG: "ศิลปินแห่งกระแส",
 NAHPLS: "นักจัดการตัวเอง",
  NASBLS: "นักล่าผู้อดทน",
  NAHPKG_ALT: "ผู้รักษาสมดุล",
  NSSGKG: "นักสำรวจผู้ไม่หยุดค้นหา",
  NAHHLG: "ผู้ยืดหยุ่นไม่มีวันหัก",
};

export interface AnimalProfileProps {
  animal: SpiritAnimal;
  archetypeCode?: string;
  description?: string;
  showActions?: boolean;
}

export function AnimalProfile({
  animal,
  archetypeCode,
  description,
  showActions = true,
}: AnimalProfileProps) {
  const emoji = ANIMAL_EMOJIS[animal] || "🧘";
  const name = ANIMAL_NAMES[animal] || animal;
  const title = archetypeCode ? ARCHETYPE_TITLES[archetypeCode] || archetypeCode : "";

  return (
    <ZenCard variant="highlight" className="relative overflow-hidden">
      {/* Background gradient based on animal */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "linear-gradient(135deg, var(--zen-sage) 0%, var(--zen-earth) 100%)",
        }}
      />

      <ZenCardContent className="relative">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-zen-surface-alt flex items-center justify-center text-4xl shadow-zen-md">
            {emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-zen-text font-display">
              {emoji} {name}
            </h3>
            {title && (
              <p className="text-sm text-zen-sage font-medium mt-0.5">
                {title}
              </p>
            )}
            {archetypeCode && (
              <p className="text-xs text-zen-text-muted mt-1 font-mono">
                {archetypeCode}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-4 text-sm text-zen-text-secondary line-clamp-2">
            {description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Link href="/quiz/reveal" className="flex-1">
              <ZenButton variant="secondary" size="sm" fullWidth>
                ดูโปรไฟล์
              </ZenButton>
            </Link>
            <Link href="/blueprint" className="flex-1">
              <ZenButton variant="primary" size="sm" fullWidth>
                สร้าง Planner
              </ZenButton>
            </Link>
          </div>
        )}
      </ZenCardContent>
    </ZenCard>
  );
}

export default AnimalProfile;
