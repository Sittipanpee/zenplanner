/**
 * Landing Page
 * Two-mode selection: Quiz (Spirit Animal) vs Custom Planner Builder
 * i18n + dark mode ready
 */

import { Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import ThemeToggle from '@/components/ui/theme-toggle'
import LanguageSwitcher from '@/components/ui/language-switcher'

export default async function HomePage() {
  const t = await getTranslations('common')

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Top bar with controls */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl space-y-8 md:space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--accent-primary)] mb-3 md:mb-4">
            {t('app.name')}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg md:text-xl">
            {t('app.tagline')}
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Mode 1: Spirit Animal Quiz */}
          <Link href="/quiz" className="w-full text-left group block">
            <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-2xl p-6 md:p-8 transition-all duration-200 hover:border-[var(--accent-gold)] hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--accent-gold)]/10 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-[var(--accent-gold)]" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
                    {t('nav.quiz')}
                  </h2>
                  <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">
                    {t('app.tagline')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Mode 2: Custom Planner Builder */}
          <Link href="/blueprint" className="w-full text-left group block">
            <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] rounded-2xl p-6 md:p-8 transition-all duration-200 hover:border-[var(--accent-primary)] hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[var(--accent-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                  <Target className="w-7 h-7 md:w-8 md:h-8 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
                    {t('nav.planner')}
                  </h2>
                  <p className="text-sm md:text-base text-[var(--text-secondary)] mt-1">
                    {t('app.tagline')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Links */}
        <div className="text-center pt-4 md:pt-6">
          <Link href="/login" className="text-[var(--text-muted)] text-sm md:text-base hover:underline">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </main>
  )
}
