/**
 * Heatmap Component - GitHub-style Activity Heatmap
 * i18n + dark mode ready
 */

'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ZenCard, ZenCardContent, ZenCardHeader } from '../ui/zen-card'
import { Flame, TrendingUp } from 'lucide-react'
import type { ActivityLog } from '@/lib/types'

export interface HeatmapProps {
  data?: ActivityLog[]
  showStats?: boolean
}

function generateDateRange(): string[] {
  const dates: string[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 90)

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function countActivitiesByDate(data: ActivityLog[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const log of data) {
    const date = log.activity_date
    counts[date] = (counts[date] || 0) + 1
  }
  return counts
}

function getIntensityColor(count: number): string {
  if (count === 0) return 'bg-zen-surface-alt'
  if (count <= 2) return 'bg-zen-sage-light'
  if (count <= 5) return 'bg-zen-sage'
  return 'bg-zen-earth'
}

function getMonthLabels(dates: string[]): { month: string; weekIndex: number }[] {
  const labels: { month: string; weekIndex: number }[] = []
  let currentMonth = ''

  dates.forEach((date, index) => {
    const month = new Date(date).toLocaleDateString('en', { month: 'short' })
    if (month !== currentMonth) {
      labels.push({ month, weekIndex: Math.floor(index / 7) })
      currentMonth = month
    }
  })

  return labels
}

export function Heatmap({ data = [], showStats = true }: HeatmapProps) {
  const t = useTranslations('dashboard.heatmap')
  const dates = useMemo(() => generateDateRange(), [])
  const activityCounts = useMemo(() => countActivitiesByDate(data), [data])
  const monthLabels = useMemo(() => getMonthLabels(dates), [dates])

  const totalActivities = data.length
  const currentStreak = useMemo(() => {
    let streak = 0
    for (let i = 0; i < 90; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      if (activityCounts[dateStr] && activityCounts[dateStr] > 0) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    return streak
  }, [activityCounts])

  // Group dates into weeks (columns) for proper CSS grid alignment
  const weeks = useMemo(() => {
    const result: string[][] = []
    for (let i = 0; i < dates.length; i += 7) {
      result.push(dates.slice(i, i + 7))
    }
    return result
  }, [dates])

  return (
    <ZenCard>
      <ZenCardHeader
        title={t('title')}
        subtitle={data.length === 0 ? t('empty') : undefined}
        icon={<Flame className="w-5 h-5" />}
      />

      <ZenCardContent>
        {showStats && (
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zen-sage" />
              <span className="text-sm text-zen-text-secondary">
                {totalActivities} {t('tooltip')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-zen-earth" />
              <span className="text-sm text-zen-text-secondary">
                {currentStreak}d streak
              </span>
            </div>
          </div>
        )}

        {/* Month labels — aligned to week columns via CSS grid */}
        <div className="overflow-x-auto">
          <div className="inline-block">
            <div className="flex mb-1 ml-8" style={{ gap: '2px' }}>
              {weeks.map((_, weekIdx) => {
                const label = monthLabels.find(l => l.weekIndex === weekIdx)
                return (
                  <div key={weekIdx} className="text-xs text-zen-text-muted" style={{ width: '14px', flexShrink: 0 }}>
                    {label ? label.month : ''}
                  </div>
                )
              })}
            </div>

            <div className="flex" style={{ gap: '2px' }}>
              {/* Day labels column */}
              <div className="flex flex-col mr-1" style={{ gap: '2px' }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div
                    key={day + i}
                    className="h-3 w-6 flex items-center justify-end"
                    style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                  >
                    <span className="text-[10px] text-zen-text-muted">{day}</span>
                  </div>
                ))}
              </div>

              {/* Heatmap grid */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col" style={{ gap: '2px' }}>
                  {week.map((date) => {
                    const count = activityCounts[date] || 0
                    return (
                      <div
                        key={date}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(count)} transition-colors`}
                        title={`${date}: ${count}`}
                      />
                    )
                  })}
                  {/* Pad if week is short */}
                  {Array.from({ length: 7 - week.length }).map((_, i) => (
                    <div key={`pad-${i}`} className="w-3 h-3" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-zen-text-muted">{t('less')}</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-zen-surface-alt" />
            <div className="w-3 h-3 rounded-sm bg-zen-sage-light" />
            <div className="w-3 h-3 rounded-sm bg-zen-sage" />
            <div className="w-3 h-3 rounded-sm bg-zen-earth" />
          </div>
          <span className="text-xs text-zen-text-muted">{t('more')}</span>
        </div>
      </ZenCardContent>
    </ZenCard>
  )
}

export default Heatmap
