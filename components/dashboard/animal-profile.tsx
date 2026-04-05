/**
 * Animal Profile Component - Spirit Animal Mini Card
 * Uses canonical animal data from lib/animal-data.ts
 * i18n + dark mode ready
 */

'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ZenCard, ZenCardContent } from '../ui/zen-card'
import { ZenButton } from '../ui/zen-button'
import { getAnimal, getAnimalName } from '@/lib/animal-data'
import type { SpiritAnimal } from '@/lib/types'

export interface AnimalProfileProps {
  animal: SpiritAnimal
  archetypeCode?: string
  description?: string
  showActions?: boolean
}

export function AnimalProfile({
  animal,
  archetypeCode,
  description,
  showActions = true,
}: AnimalProfileProps) {
  const locale = useLocale() as 'en' | 'th' | 'zh'
  const t = useTranslations('dashboard')
  const data = getAnimal(animal)
  const name = getAnimalName(animal, locale)

  return (
    <ZenCard variant="highlight" className="relative overflow-hidden">
      {/* Background gradient based on animal */}
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: data.gradient }}
      />

      <ZenCardContent className="relative">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-zen-surface-alt flex items-center justify-center text-4xl shadow-zen-md">
            {data.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-zen-text font-display">
              {data.emoji} {name}
            </h3>
            {data.archetypeTitle && (
              <p className="text-sm text-zen-sage font-medium mt-0.5">
                {data.archetypeTitle}
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
        {(description || data.description) && (
          <p className="mt-4 text-sm text-zen-text-secondary line-clamp-2">
            {description || data.description}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Link href="/quiz/reveal" className="flex-1">
              <ZenButton variant="secondary" size="sm" fullWidth>
                {t('quickActions.retakeQuiz')}
              </ZenButton>
            </Link>
            <Link href="/blueprint" className="flex-1">
              <ZenButton variant="primary" size="sm" fullWidth>
                {t('quickActions.newPlanner')}
              </ZenButton>
            </Link>
          </div>
        )}
      </ZenCardContent>
    </ZenCard>
  )
}

export default AnimalProfile
