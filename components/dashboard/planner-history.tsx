/**
 * Planner History Component - Download History List
 * Uses canonical animal data. i18n + dark mode ready.
 */

'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { ZenCard, ZenCardContent, ZenCardHeader } from '../ui/zen-card'
import { ZenButton } from '../ui/zen-button'
import { FileSpreadsheet, Download, Calendar } from 'lucide-react'
import { getAnimal } from '@/lib/animal-data'
import type { GeneratedPlanner, SpiritAnimal } from '@/lib/types'

const FORMAT_LABELS: Record<string, string> = {
  google_sheets: 'Google Sheets',
  excel_vba: 'Excel (VBA)',
  pdf: 'PDF',
}

export interface PlannerHistoryProps {
  planners: GeneratedPlanner[]
  title?: string
  showEmpty?: boolean
}

export function PlannerHistory({
  planners,
  title,
  showEmpty = true,
}: PlannerHistoryProps) {
  const t = useTranslations('dashboard.recentPlanners')
  const locale = useLocale()

  const sortedPlanners = [...planners].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale === 'th' ? 'th-TH' : locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <ZenCard>
      <ZenCardHeader
        title={title || t('title')}
        subtitle={`${planners.length}`}
        icon={<FileSpreadsheet className="w-5 h-5" />}
      />

      <ZenCardContent>
        {sortedPlanners.length === 0 ? (
          showEmpty ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="w-12 h-12 text-zen-text-muted mx-auto mb-3" />
              <p className="text-zen-text-secondary">{t('empty')}</p>
              <Link href="/blueprint" className="mt-4 inline-block">
                <ZenButton variant="secondary" size="sm">
                  {t('createFirst')}
                </ZenButton>
              </Link>
            </div>
          ) : null
        ) : (
          <div className="space-y-3">
            {sortedPlanners.map((planner) => {
              // Try to get animal emoji from the blueprint spirit_animal field
              const animalEmoji = planner.blueprint_id ? '🦁' : '📋'
              const isUrlExpired = isExpired(planner.expires_at)

              return (
                <div
                  key={planner.id}
                  className="flex items-center justify-between p-3 bg-zen-surface-alt rounded-lg border border-zen-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zen-surface flex items-center justify-center text-xl shrink-0">
                      {animalEmoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-zen-text truncate">
                        Planner #{planner.id.slice(0, 8)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zen-text-muted">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(planner.created_at)}</span>
                        <span className="mx-1">|</span>
                        <span>{FORMAT_LABELS[planner.format] || planner.format}</span>
                      </div>
                    </div>
                  </div>

                  {planner.download_url && !isUrlExpired ? (
                    <a href={planner.download_url} download target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <ZenButton variant="primary" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        {t('viewAll')}
                      </ZenButton>
                    </a>
                  ) : (
                    <ZenButton variant="ghost" size="sm" disabled>
                      Expired
                    </ZenButton>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </ZenCardContent>
    </ZenCard>
  )
}

export default PlannerHistory
