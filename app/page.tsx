/**
 * Landing Page
 * Award-quality hero + feature highlights + mode selection cards
 * i18n + dark mode ready
 */

export const dynamic = 'force-dynamic'

import { Sparkles, Target } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import ThemeToggle from '@/components/ui/theme-toggle'
import LanguageSwitcher from '@/components/ui/language-switcher'

export default async function HomePage() {
  const t = await getTranslations()

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center">
      {/* Top bar with controls */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-2 p-4">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 w-full"
        style={{ background: 'linear-gradient(180deg, var(--zen-surface-alt) 0%, var(--zen-bg) 100%)' }}
      >
        <div className="text-6xl mb-6 animate-zen-float">&#127807;</div>
        <h1
          className="text-5xl md:text-7xl font-light mb-4 text-zen-text"
          style={{ fontFamily: 'var(--zen-font-display)' }}
        >
          {t('common.app.name')}
        </h1>
        <p className="text-xl text-zen-text-muted mb-8 max-w-md">
          {t('common.app.tagline')}
        </p>
        <div className="text-3xl space-x-2 mb-8" aria-hidden="true">
          &#129409; &#128024; &#129413; &#128058; &#129419;
        </div>
        <Link
          href="/quiz"
          className="px-8 py-4 bg-zen-sage text-white rounded-full text-lg font-medium hover:opacity-90 transition-opacity"
        >
          {t('landing.startJourney')}
        </Link>
      </section>

      {/* Feature Highlights */}
      <section className="w-full max-w-4xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Feature 1: Spirit Animal Quiz */}
          <div className="text-center space-y-3 p-6 bg-zen-surface border border-zen-border rounded-2xl hover:shadow-zen-md transition-shadow">
            <div className="text-4xl">&#129517;</div>
            <h2
              className="text-xl font-semibold text-zen-text"
              style={{ fontFamily: 'var(--zen-font-display)' }}
            >
              {t('landing.feature1.title')}
            </h2>
            <p className="text-zen-text-secondary text-sm leading-relaxed">
              {t('landing.feature1.desc')}
            </p>
          </div>

          {/* Feature 2: Smart Planner */}
          <div className="text-center space-y-3 p-6 bg-zen-surface border border-zen-border rounded-2xl hover:shadow-zen-md transition-shadow">
            <div className="text-4xl">&#128203;</div>
            <h2
              className="text-xl font-semibold text-zen-text"
              style={{ fontFamily: 'var(--zen-font-display)' }}
            >
              {t('landing.feature2.title')}
            </h2>
            <p className="text-zen-text-secondary text-sm leading-relaxed">
              {t('landing.feature2.desc')}
            </p>
          </div>

          {/* Feature 3: 3 Languages */}
          <div className="text-center space-y-3 p-6 bg-zen-surface border border-zen-border rounded-2xl hover:shadow-zen-md transition-shadow">
            <div className="text-4xl">&#127759;</div>
            <h2
              className="text-xl font-semibold text-zen-text"
              style={{ fontFamily: 'var(--zen-font-display)' }}
            >
              {t('landing.feature3.title')}
            </h2>
            <p className="text-zen-text-secondary text-sm leading-relaxed">
              {t('landing.feature3.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Mode Selection Cards */}
      <section className="w-full max-w-md md:max-w-2xl lg:max-w-4xl px-4 pb-12 space-y-8 md:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Mode 1: Spirit Animal Quiz */}
          <Link href="/quiz" className="w-full text-left group block">
            <div className="bg-zen-surface border-2 border-zen-border rounded-zen-xl p-6 md:p-8 transition-all duration-200 hover:border-zen-sage hover:shadow-zen-lg hover:-translate-y-1">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-zen-gold/10 rounded-full flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-zen-gold" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-zen-text">
                    {t('common.nav.quiz')}
                  </h2>
                  <p className="text-sm md:text-base text-zen-text-secondary mt-1">
                    {t('landing.card1.desc')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Mode 2: Custom Planner Builder */}
          <Link href="/blueprint" className="w-full text-left group block">
            <div className="bg-zen-surface border-2 border-zen-border rounded-zen-xl p-6 md:p-8 transition-all duration-200 hover:border-zen-sage hover:shadow-zen-lg hover:-translate-y-1">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-zen-sage/10 rounded-full flex items-center justify-center shrink-0">
                  <Target className="w-7 h-7 md:w-8 md:h-8 text-zen-sage" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-semibold text-zen-text">
                    {t('common.nav.planner')}
                  </h2>
                  <p className="text-sm md:text-base text-zen-text-secondary mt-1">
                    {t('landing.card2.desc')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Bottom Links */}
        <div className="text-center pt-4 md:pt-6">
          <Link href="/login" className="text-zen-text-muted text-sm md:text-base hover:underline">
            {t('common.nav.login')}
          </Link>
        </div>
      </section>
    </main>
  )
}
