/**
 * Profile Page
 * Uses canonical animal data from lib/animal-data.ts
 * i18n + dark mode ready
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { ZenCard } from '@/components/ui/zen-card'
import { ZenButton } from '@/components/ui/zen-button'
import { Settings, LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAnimal, getAnimalName } from '@/lib/animal-data'
import type { SpiritAnimal } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('profile')
  const locale = useLocale() as 'en' | 'th' | 'zh'

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<{
    spiritAnimal: string | null
    createdAt: string | null
  }>({
    spiritAnimal: null,
    createdAt: null,
  })
  const [stats, setStats] = useState({
    quizzesCompleted: 0,
    plannersCreated: 0,
    currentStreak: 0,
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('spirit_animal, created_at')
          .eq('id', user.id)
          .single()

        const { count: quizCount } = await supabase
          .from('quiz_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'complete')

        const { count: plannerCount } = await supabase
          .from('planner_blueprints')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        setProfile({
          spiritAnimal: profileData?.spirit_animal || null,
          createdAt: profileData?.created_at || null,
        })
        setStats({
          quizzesCompleted: quizCount || 0,
          plannersCreated: plannerCount || 0,
          currentStreak: 0,
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Use canonical animal data
  const displayName = profile.spiritAnimal
    ? getAnimalName(profile.spiritAnimal as SpiritAnimal, locale)
    : t('title')
  const displayEmoji = profile.spiritAnimal
    ? getAnimal(profile.spiritAnimal as SpiritAnimal).emoji
    : '🧘'
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(
        locale === 'th' ? 'th-TH' : locale === 'zh' ? 'zh-CN' : 'en-US',
        { year: 'numeric', month: 'long' }
      )
    : '-'

  if (isLoading) {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zen-sage" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      <div className="max-w-md md:max-w-lg mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 bg-zen-sage/10 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl md:text-6xl">
            {displayEmoji}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-zen-text">
            {displayName}
          </h1>
          <p className="text-zen-text-secondary">{memberSince}</p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <ZenCard>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">{t('spiritAnimal')}</span>
                <span className="font-semibold">{profile.spiritAnimal ? `${displayEmoji} ${displayName}` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">{t('planningStyle')}</span>
                <span className="font-semibold">{stats.plannersCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zen-text-secondary">{t('keyTraits')}</span>
                <span className="font-semibold text-zen-gold">{stats.currentStreak}</span>
              </div>
            </div>
          </ZenCard>

          {/* Link to Settings — no more alert("coming soon") */}
          <Link href="/settings">
            <ZenButton variant="secondary" fullWidth>
              <Settings className="w-5 h-5 mr-2" />
              {t('settings.title')}
            </ZenButton>
          </Link>

          <ZenButton variant="ghost" fullWidth onClick={handleLogout}>
            <LogOut className="w-5 h-5 mr-2" />
            {t('settings.signOut')}
          </ZenButton>
        </div>
      </div>
    </main>
  )
}
