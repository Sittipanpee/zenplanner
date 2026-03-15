/**
 * ZenPlanner — Share Animal Button Component
 * Agent 8: LIFF_INTEGRATION
 *
 * Button to share spirit animal result to LINE.
 * Uses Flex Message for rich sharing.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Share2, Check, Copy, Loader2 } from 'lucide-react';
import { SpiritAnimal } from '@/lib/types';
import { shareToLINE, FlexMessageObject, isInLIFF } from '@/lib/liff';

interface ShareAnimalButtonProps {
  animal: SpiritAnimal;
  insight: string;
  className?: string;
}

/**
 * Thai animal names for display
 */
const ANIMAL_NAMES: Record<SpiritAnimal, string> = {
  lion: 'สิงโต',
  whale: 'วาฬ',
  dolphin: 'โลมา',
  owl: 'นกฮูก',
  fox: 'จิ้งจอก',
  turtle: 'เต่า',
  eagle: 'นกอินทรี',
  octopus: 'ปลาหมึก',
  mountain: 'ภูเขา',
  wolf: 'หมาป่า',
  sakura: 'ซากุระ',
  cat: 'แมว',
  crocodile: 'จระเข้',
  dove: 'นกเขา',
  butterfly: 'ผีเสื้อ',
  bamboo: 'ไม้ไผ่',
};

/**
 * Animal emoji mapping
 */
const ANIMAL_EMOJI: Record<SpiritAnimal, string> = {
  lion: '🦁',
  whale: '🐋',
  dolphin: '🐬',
  owl: '🦉',
  fox: '🦊',
  turtle: '🐢',
  eagle: '🦅',
  octopus: '🐙',
  mountain: '🏔️',
  wolf: '🐺',
  sakura: '🌸',
  cat: '🐱',
  crocodile: '🐊',
  dove: '🐦',
  butterfly: '🦋',
  bamboo: '🎋',
};

/**
 * Build a Flex Message for sharing the spirit animal result.
 */
function buildAnimalFlexMessage(animal: SpiritAnimal, insight: string): FlexMessageObject {
  const animalName = ANIMAL_NAMES[animal];
  const emoji = ANIMAL_EMOJI[animal];

  return {
    type: 'flex',
    altText: `${emoji} สัตว์ประจำตัวของคุณคือ ${animalName}!`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: `/animals/${animal}.png`,
        size: 'full',
        aspectRatio: '20:13',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${emoji} ${animalName}`,
            weight: 'bold',
            size: 'xl',
          },
          {
            type: 'text',
            text: insight,
            wrap: true,
            size: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดู Planner ของฉัน',
              uri: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
            },
            style: 'primary',
          },
        ],
      },
    },
  };
}

/**
 * Share Animal Button Component
 *
 * Allows users to share their spirit animal result to LINE.
 * Shows different behavior based on whether running in LINE or standalone.
 *
 * @example
 * ```tsx
 * <ShareAnimalButton
 *   animal="lion"
 *   insight="คุณเป็นผู้นำที่มีความมุ่งมั่นสูง..."
 * />
 * ```
 */
export function ShareAnimalButton({ animal, insight, className = '' }: ShareAnimalButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInLine, setIsInLine] = useState(false);

  // Check if running in LINE on mount
  React.useEffect(() => {
    isInLIFF().then(setIsInLine);
  }, []);

  const handleShare = useCallback(async () => {
    setIsSharing(true);
    setShareSuccess(false);

    try {
      const message = buildAnimalFlexMessage(animal, insight);
      const success = await shareToLINE(message);

      if (success) {
        setShareSuccess(true);
        console.log('[ShareAnimal] Shared successfully');
      } else {
        console.log('[ShareAnimal] Share cancelled or failed');
      }
    } catch (error) {
      console.error('[ShareAnimal] Share error:', error);
    } finally {
      setIsSharing(false);
    }
  }, [animal, insight]);

  const handleCopyLink = useCallback(async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '';
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('[ShareAnimal] Copy failed:', error);
    }
  }, []);

  // Show LINE-style button when in LINE
  if (isInLine) {
    return (
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`
          zen-button zen-button-primary
          flex items-center justify-center gap-2
          min-h-[var(--zen-touch-target)]
          px-6 py-3
          font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${shareSuccess ? 'bg-green-600' : ''}
          ${className}
        `}
        style={{
          background: shareSuccess ? 'var(--zen-sage)' : undefined,
        }}
      >
        {isSharing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : shareSuccess ? (
          <Check className="w-5 h-5" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
        <span>
          {shareSuccess ? 'แชร์แล้ว!' : 'แชร์ไป LINE'}
        </span>
      </button>
    );
  }

  // Show fallback buttons when in standalone browser
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="
          zen-button zen-button-primary
          flex items-center justify-center gap-2
          flex-1
          min-h-[var(--zen-touch-target)]
          px-6 py-3
          font-semibold
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isSharing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
        <span>{isSharing ? 'กำลังแชร์...' : 'แชร์ไป LINE'}</span>
      </button>

      <button
        onClick={handleCopyLink}
        className="
          zen-button zen-button-ghost
          flex items-center justify-center gap-2
          min-h-[var(--zen-touch-target)]
          px-4 py-3
          transition-all duration-200
        "
      >
        {copiedLink ? (
          <>
            <Check className="w-5 h-5" />
            <span className="text-sm">คัดลอกแล้ว</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span className="text-sm">คัดลอกลิงก์</span>
          </>
        )}
      </button>
    </div>
  );
}

export default ShareAnimalButton;
