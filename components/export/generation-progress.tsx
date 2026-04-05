/**
 * Generation Progress Component
 * Shows real-time progress of planner generation
 * i18n + dark mode ready
 */

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, FileSpreadsheet, Loader2 } from 'lucide-react'
import { ZenCard } from '../ui/zen-card'

export interface GenerationProgressProps {
  progress: number
  currentSheet: string | null
  completedSheets: string[]
  isComplete?: boolean
}

export function GenerationProgress({
  progress, currentSheet, completedSheets, isComplete = false,
}: GenerationProgressProps) {
  const t = useTranslations('planner.generate')
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <ZenCard variant="default" padding="lg" className="w-full max-w-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zen-sage/10 mb-4">
          {isComplete ? (
            <CheckCircle2 className="w-8 h-8 text-zen-sage" />
          ) : (
            <Loader2 className="w-8 h-8 text-zen-sage animate-spin" />
          )}
        </div>
        <h2 className="font-display text-xl font-semibold text-zen-text">
          {isComplete ? t('step5') : t('title')}
        </h2>
        <p className="text-sm text-zen-text-secondary mt-1">
          {isComplete ? t('step5') : t('step1')}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zen-text-secondary">{t('step2')}</span>
          <span className="font-medium text-zen-text">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-zen-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-zen-sage to-zen-sage-light rounded-full transition-all duration-500 ease-out"
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
      </div>

      {currentSheet && !isComplete && (
        <div className="flex items-center gap-3 p-3 bg-zen-surface-alt rounded-lg mb-4">
          <Loader2 className="w-5 h-5 text-zen-sage animate-spin flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zen-text truncate">{currentSheet}</p>
            <p className="text-xs text-zen-text-muted">{t('step3')}</p>
          </div>
        </div>
      )}

      {completedSheets.length > 0 && (
        <div>
          <p className="text-sm font-medium text-zen-text-secondary mb-2">
            {t('step4')} ({completedSheets.length})
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {completedSheets.map((sheet, index) => (
              <div key={index} className="flex items-center gap-2 text-sm" style={{ animationDelay: `${index * 50}ms` }}>
                <CheckCircle2 className="w-4 h-4 text-zen-sage flex-shrink-0" />
                <FileSpreadsheet className="w-3.5 h-3.5 text-zen-text-muted flex-shrink-0" />
                <span className="text-zen-text truncate">{sheet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="mt-4 pt-4 border-t border-zen-border">
          <div className="flex items-center justify-center gap-2 text-zen-sage">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">{t('step5')}</span>
          </div>
        </div>
      )}
    </ZenCard>
  )
}

export default GenerationProgress
