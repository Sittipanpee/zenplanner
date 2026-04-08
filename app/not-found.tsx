/**
 * Custom 404 Not Found Page
 * Branded zen design, mobile-first, i18n + dark mode.
 */

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFound() {
  const t = await getTranslations('common.errors.pages.notFound')

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="text-6xl mb-2 animate-zen-float" aria-hidden="true">
          &#127807;
        </div>

        <div className="space-y-3">
          <p
            className="font-display text-6xl font-light text-zen-text-muted"
            aria-hidden="true"
          >
            404
          </p>
          <h1
            className="font-display text-2xl md:text-3xl font-semibold text-zen-text"
          >
            {t('title')}
          </h1>
          <p className="text-zen-text-secondary text-sm md:text-base leading-relaxed">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full px-6 py-3 bg-zen-sage text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            {t('home')}
          </Link>
          <Link
            href="/quiz"
            className="w-full px-6 py-3 bg-zen-surface border border-zen-border text-zen-text rounded-full font-medium hover:border-zen-sage transition-colors"
          >
            {t('quiz')}
          </Link>
          <Link
            href="/dashboard"
            className="w-full px-6 py-3 bg-zen-surface border border-zen-border text-zen-text rounded-full font-medium hover:border-zen-sage transition-colors"
          >
            {t('dashboard')}
          </Link>
        </div>
      </div>
    </main>
  )
}
