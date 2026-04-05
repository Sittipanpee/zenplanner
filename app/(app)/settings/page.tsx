/**
 * Settings Page
 * Language, appearance, and account settings
 * i18n + dark mode ready
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import { ZenCard } from '@/components/ui/zen-card'
import { ZenButton } from '@/components/ui/zen-button'
import { ArrowLeft, Globe, Palette, User, LogOut, Sun, Moon, Monitor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const LOCALES = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'th', label: 'ภาษาไทย', flag: 'TH' },
  { code: 'zh', label: '中文', flag: 'ZH' },
] as const

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, labelKey: 'light' as const },
  { value: 'dark', icon: Moon, labelKey: 'dark' as const },
  { value: 'system', icon: Monitor, labelKey: 'system' as const },
] as const

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('profile.settings')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || null)
        setDisplayName(user.user_metadata?.display_name || user.email?.split('@')[0] || null)
      }
    }
    fetchUser()
  }, [supabase])

  const changeLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    router.refresh()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </Link>
          <h1 className="font-display text-xl font-bold text-zen-text">
            {t('title')}
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Language Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">{t('language')}</h2>
          </div>
          <ZenCard>
            <div className="flex gap-2">
              {LOCALES.map(({ code, label, flag }) => (
                <button
                  key={code}
                  onClick={() => changeLocale(code)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    locale === code
                      ? 'border-zen-sage bg-zen-sage/5 text-zen-text font-semibold'
                      : 'border-zen-border text-zen-text-secondary hover:border-zen-border-hover'
                  }`}
                >
                  <span className="block text-lg font-bold">{flag}</span>
                  <span className="block text-xs mt-1">{label}</span>
                </button>
              ))}
            </div>
          </ZenCard>
        </section>

        {/* Appearance Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">{t('theme')}</h2>
          </div>
          <ZenCard>
            <div className="flex gap-2">
              {mounted && THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-center transition-all duration-200 ${
                    theme === value
                      ? 'border-zen-sage bg-zen-sage/5 text-zen-text font-semibold'
                      : 'border-zen-border text-zen-text-secondary hover:border-zen-border-hover'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" />
                  <span className="block text-xs">{tCommon(`theme.${labelKey}`)}</span>
                </button>
              ))}
            </div>
          </ZenCard>
        </section>

        {/* Account Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-zen-sage" />
            <h2 className="font-semibold text-zen-text">{t('account')}</h2>
          </div>
          <ZenCard>
            <div className="space-y-4">
              {displayName && (
                <div>
                  <p className="text-xs text-zen-text-muted mb-1">Display Name</p>
                  <p className="text-zen-text font-medium">{displayName}</p>
                </div>
              )}
              {userEmail && (
                <div>
                  <p className="text-xs text-zen-text-muted mb-1">Email</p>
                  <p className="text-zen-text font-medium">{userEmail}</p>
                </div>
              )}
              {!displayName && !userEmail && (
                <p className="text-zen-text-muted text-sm">Not signed in</p>
              )}
            </div>
          </ZenCard>
        </section>

        {/* Sign Out */}
        <ZenButton variant="ghost" fullWidth onClick={handleSignOut}>
          <LogOut className="w-5 h-5 mr-2" />
          {t('signOut')}
        </ZenButton>
      </div>
    </main>
  )
}
