/**
 * Customization Panel Component
 * Settings sidebar for planner customization
 * Color scheme IDs synced with blueprint/customize/page.tsx
 * i18n + dark mode ready
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ZenCard } from '@/components/ui/zen-card'
import { ZenInput } from '@/components/ui/zen-input'
import { Clock, Palette, Globe, FolderKanban } from 'lucide-react'
import type { BlueprintCustomization } from '@/lib/types'

interface PlannerCustomization extends BlueprintCustomization {
  sleep_time?: string
}

export interface CustomizationPanelProps {
  customization: PlannerCustomization
  onChange: (customization: PlannerCustomization) => void
}

// SYNCED: These 5 schemes must match blueprint/customize/page.tsx COLOR_PALETTES
const COLOR_SCHEMES = [
  { id: 'zen-sage', name: 'Zen Garden', colors: ['#7C9A82', '#A8C5AE', '#F5F3EE'] },
  { id: 'zen-earth', name: 'Warm Earth', colors: ['#B38B6D', '#D4A574', '#F5F3EE'] },
  { id: 'zen-sky', name: 'Calm Sky', colors: ['#89A4C7', '#B8C9E0', '#F5F3EE'] },
  { id: 'zen-gold', name: 'Golden Hour', colors: ['#C9A96E', '#E8C99B', '#FAFAF7'] },
  { id: 'zen-indigo', name: 'Deep Indigo', colors: ['#6B7AA1', '#8E95B8', '#F5F3EE'] },
]

const LANGUAGES = [
  { id: 'th', name: 'Thai' },
  { id: 'en', name: 'English' },
  { id: 'zh', name: 'Chinese' },
]

const DEFAULT_CATEGORIES = [
  'Work',
  'Health',
  'Learning',
  'Relationships',
  'Finance',
  'Personal Growth',
]

export function CustomizationPanel({ customization, onChange }: CustomizationPanelProps) {
  const t = useTranslations('planner.customize')
  const [localCustomization, setLocalCustomization] = useState<PlannerCustomization>(customization)

  const updateField = <K extends keyof PlannerCustomization>(field: K, value: PlannerCustomization[K]) => {
    const updated = { ...localCustomization, [field]: value }
    setLocalCustomization(updated)
    onChange(updated)
  }

  const handleCategoryToggle = (category: string) => {
    const current = localCustomization.categories || []
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category]
    updateField('categories', updated)
  }

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <ZenCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-zen-sage" />
          <h3 className="font-semibold text-zen-text">{t('colorScheme')}</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => updateField('color_scheme', scheme.id)}
              className={`
                group relative aspect-square rounded-lg overflow-hidden transition-all duration-200
                ${localCustomization.color_scheme === scheme.id ? 'ring-2 ring-zen-sage ring-offset-2' : 'hover:scale-105'}
              `}
              title={scheme.name}
            >
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${scheme.colors[0]}, ${scheme.colors[1]})` }} />
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-zen-text-muted">
          {COLOR_SCHEMES.find((s) => s.id === localCustomization.color_scheme)?.name || 'Zen Garden'}
        </p>
      </ZenCard>

      {/* Language */}
      <ZenCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-zen-sage" />
          <h3 className="font-semibold text-zen-text">Language</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => updateField('language', lang.id)}
              className={`
                px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${localCustomization.language === lang.id
                  ? 'border-zen-sage bg-zen-sage/5 text-zen-text'
                  : 'border-zen-border hover:border-zen-border-hover text-zen-text-secondary'}
              `}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </ZenCard>

      {/* Schedule */}
      <ZenCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-zen-sage" />
          <h3 className="font-semibold text-zen-text">Schedule</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ZenInput type="time" label="Wake" value={localCustomization.wake_time || '07:00'} onChange={(e) => updateField('wake_time', e.target.value)} />
          <ZenInput type="time" label="Sleep" value={localCustomization.sleep_time || '23:00'} onChange={(e) => updateField('sleep_time', e.target.value)} />
        </div>
      </ZenCard>

      {/* Categories */}
      <ZenCard variant="default" padding="md">
        <div className="flex items-center gap-2 mb-4">
          <FolderKanban className="w-5 h-5 text-zen-sage" />
          <h3 className="font-semibold text-zen-text">Categories</h3>
        </div>
        <div className="space-y-2">
          {DEFAULT_CATEGORIES.map((category) => {
            const isSelected = localCustomization.categories?.includes(category) ?? false
            return (
              <label key={category} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-zen-sage border-zen-sage' : 'border-zen-border group-hover:border-zen-border-hover'}`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" className="sr-only" checked={isSelected} onChange={() => handleCategoryToggle(category)} />
                <span className={isSelected ? 'text-zen-text' : 'text-zen-text-secondary'}>{category}</span>
              </label>
            )
          })}
        </div>
      </ZenCard>
    </div>
  )
}
