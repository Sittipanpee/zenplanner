/**
 * Share Card Component
 * Social sharing preview for spirit animal results
 * FIX: Correct LINE logo SVG, default handlers for Facebook/Twitter
 * i18n + dark mode ready
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Facebook, Twitter, Copy, CheckCircle2, Sparkles } from 'lucide-react'
import { ZenButton } from '../ui/zen-button'
import { ZenCard } from '../ui/zen-card'
import type { SpiritAnimal } from '@/lib/types'

const ANIMAL_THEMES: Record<SpiritAnimal, { emoji: string; gradient: string; theme: string }> = {
  lion: { emoji: '🦁', gradient: 'from-zen-gold to-zen-blossom', theme: 'Gold & Blossom' },
  whale: { emoji: '🐋', gradient: 'from-zen-indigo to-zen-sky', theme: 'Deep Ocean' },
  dolphin: { emoji: '🐬', gradient: 'from-zen-sky to-zen-sage-light', theme: 'Ocean Breeze' },
  owl: { emoji: '🦉', gradient: 'from-zen-indigo to-zen-sage', theme: 'Mystic Night' },
  fox: { emoji: '🦊', gradient: 'from-zen-earth to-zen-gold', theme: 'Autumn Forest' },
  turtle: { emoji: '🐢', gradient: 'from-zen-sage to-zen-sage-light', theme: 'Forest Green' },
  eagle: { emoji: '🦅', gradient: 'from-gray-200 to-zen-sky', theme: 'Sky High' },
  octopus: { emoji: '🐙', gradient: 'from-zen-indigo to-zen-blossom', theme: 'Purple Depths' },
  mountain: { emoji: '🏔️', gradient: 'from-zen-stone to-zen-text-muted', theme: 'Stone Gray' },
  wolf: { emoji: '🐺', gradient: 'from-gray-700 to-zen-earth', theme: 'Lunar Wolf' },
  sakura: { emoji: '🌸', gradient: 'from-pink-200 to-amber-100', theme: 'Sakura' },
  cat: { emoji: '🐈', gradient: 'from-zen-surface-alt to-zen-border', theme: 'Minimal' },
  crocodile: { emoji: '🐊', gradient: 'from-green-800 to-zen-sage', theme: 'River Depth' },
  dove: { emoji: '🕊️', gradient: 'from-white to-zen-sage-light', theme: 'Peaceful' },
  butterfly: { emoji: '🦋', gradient: 'from-amber-200 via-pink-300 to-sky-300', theme: 'Summer Meadow' },
  bamboo: { emoji: '🌿', gradient: 'from-green-200 to-green-400', theme: 'Bamboo Grove' },
}

export interface ShareCardProps {
  animal: SpiritAnimal
  animalName: string
  archetypeCode: string
  description?: string
  quizUrl?: string
  onShareLine?: () => void
  onShareFacebook?: () => void
  onShareTwitter?: () => void
  onCopyLink?: () => void
}

export function ShareCard({
  animal, animalName, archetypeCode, description = '',
  quizUrl = 'https://zenplanner.app/quiz',
  onShareLine, onShareFacebook, onShareTwitter, onCopyLink,
}: ShareCardProps) {
  const t = useTranslations('planner.done')
  const [copied, setCopied] = useState(false)
  const theme = ANIMAL_THEMES[animal] || ANIMAL_THEMES.lion

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + '/quiz' : quizUrl
  const shareText = `${theme.emoji} ${animalName}! ${t('shareTitle')}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true)
      onCopyLink?.()
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Clipboard API not available — do not fail silently
      console.warn('[ShareCard] Clipboard write failed')
    })
  }

  // Default share handlers open native share URLs if no custom handler provided
  const handleFacebookShare = onShareFacebook ?? (() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  })

  const handleTwitterShare = onShareTwitter ?? (() => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
  })

  return (
    <ZenCard variant="default" padding="lg" className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="font-display text-xl font-semibold text-zen-text">{t('shareTitle')}</h2>
      </div>

      {/* Card Preview */}
      <div className={`relative overflow-hidden rounded-zen-xl p-6 mb-6 bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute top-3 right-3">
          <Sparkles className="w-5 h-5 text-white/60" />
        </div>
        <div className="text-center">
          <div className="text-6xl mb-3">{theme.emoji}</div>
          <h3 className="font-display text-2xl font-bold text-zen-text">{animalName}</h3>
          <p className="text-sm text-zen-text/70 mt-1">{archetypeCode}</p>
          {description && <p className="text-xs text-zen-text/60 mt-3 line-clamp-2">{description}</p>}
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-zen-text font-medium">
            {theme.theme}
          </span>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3 mb-6">
        {/* LINE Button — correct logo SVG */}
        <ZenButton variant="primary" size="lg" fullWidth onClick={onShareLine} className="!bg-zen-line hover:!bg-[#05b54a]">
          <LineLogoIcon className="w-5 h-5 mr-2" />
          <span>{t('shareLine')}</span>
        </ZenButton>

        <div className="flex gap-3">
          <ZenButton variant="secondary" size="lg" fullWidth onClick={handleFacebookShare} className="!text-[#1877f2] !border-[#1877f2]/30 hover:!bg-[#1877f2]/5">
            <Facebook className="w-5 h-5 mr-1.5" />
            <span>{t('shareFacebook')}</span>
          </ZenButton>
          <ZenButton variant="secondary" size="lg" fullWidth onClick={handleTwitterShare} className="!text-zen-text hover:!bg-zen-surface-alt">
            <Twitter className="w-5 h-5 mr-1.5" />
            <span>{t('shareTwitter')}</span>
          </ZenButton>
        </div>

        <ZenButton variant="ghost" size="md" fullWidth onClick={handleCopyLink}>
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2 text-zen-sage" />
              <span>{t('copyLink')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              <span>{t('copyLink')}</span>
            </>
          )}
        </ZenButton>
      </div>

      <div className="p-3 bg-zen-surface-alt rounded-lg">
        <p className="text-sm text-zen-text-secondary truncate font-mono">{shareUrl}</p>
      </div>
    </ZenCard>
  )
}

/** Correct LINE logo SVG — the official "LINE" wordmark path */
function LineLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.108 9.436-7.025C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  )
}

export default ShareCard
