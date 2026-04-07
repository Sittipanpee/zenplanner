/**
 * Stats Grid Component - Quick Stats Cards
 * i18n + dark mode ready
 */

'use client'

import { useTranslations } from 'next-intl'
import { ZenCard, ZenCardContent } from '../ui/zen-card'
import { TrendingUp, FileSpreadsheet, Flame, Award, Target, Calendar } from 'lucide-react'

export interface DashboardStats {
  quizzesCompleted?: number
  plannersCreated?: number
  currentStreak?: number
  totalActivities?: number
  daysActive?: number
  averageScore?: number
}

export interface StatsGridProps {
  stats: DashboardStats
  showAll?: boolean
}

const DEFAULT_STATS: DashboardStats = {
  quizzesCompleted: 0,
  plannersCreated: 0,
  currentStreak: 0,
  totalActivities: 0,
  daysActive: 0,
  averageScore: 0,
}

export function StatsGrid({ stats, showAll = false }: StatsGridProps) {
  const t = useTranslations('dashboard.stats')
  const mergedStats = { ...DEFAULT_STATS, ...stats }

  // TODO: Streak calculation needs backend implementation.
  // Currently using stub values (0) until activity_log streak calculation is wired.
  const quickStats = [
    {
      labelKey: 'plannersCreated' as const,
      value: mergedStats.plannersCreated || 0,
      icon: <FileSpreadsheet className="w-5 h-5" />,
      color: 'text-zen-sage',
    },
    {
      labelKey: 'currentStreak' as const,
      value: mergedStats.currentStreak || 0,
      icon: <Flame className="w-5 h-5" />,
      color: 'text-zen-earth',
    },
    {
      labelKey: 'toolsUsed' as const,
      value: mergedStats.quizzesCompleted || 0,
      icon: <Award className="w-5 h-5" />,
      color: 'text-zen-gold',
    },
  ]

  const extendedStats = [
    {
      labelKey: 'daysActive' as const,
      value: mergedStats.daysActive || 0,
      icon: <Calendar className="w-5 h-5" />,
      color: 'text-zen-indigo',
    },
    {
      labelKey: 'longestStreak' as const,
      value: mergedStats.totalActivities || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-zen-sky',
    },
    {
      labelKey: 'planners' as const,
      value: mergedStats.averageScore || 0,
      icon: <Target className="w-5 h-5" />,
      color: 'text-zen-blossom',
    },
  ]

  const displayStats = showAll ? [...quickStats, ...extendedStats] : quickStats

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayStats.map((stat) => (
        <ZenCard key={stat.labelKey} variant="default" padding="sm" className="text-center">
          <ZenCardContent>
            <div className={`${stat.color} mx-auto w-fit mb-2`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-zen-text font-display">{stat.value}</p>
            <p className="text-xs text-zen-text-muted mt-1 line-clamp-1">{t(stat.labelKey)}</p>
          </ZenCardContent>
        </ZenCard>
      ))}
    </div>
  )
}

export default StatsGrid
