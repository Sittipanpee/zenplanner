'use client'

/**
 * Global Error Boundary
 * Per Next.js App Router conventions, error.tsx must be a client component.
 * Receives `error` and `reset` props; i18n + dark mode.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface RootErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: RootErrorProps) {
  const t = useTranslations('common.errors.pages.error')

  useEffect(() => {
    // Surface error for developer observability. Silent failure is a critical
    // protocol violation per charter §3.8.
    // eslint-disable-next-line no-console
    console.error('[RootError] caught:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-zen-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="text-6xl mb-2" aria-hidden="true">
          &#127783;&#65039;
        </div>

        <div className="space-y-3">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-zen-text">
            {t('title')}
          </h1>
          <p className="text-zen-text-secondary text-sm md:text-base leading-relaxed">
            {t('subtitle')}
          </p>
          {error?.digest ? (
            <p className="text-xs text-zen-text-muted font-mono">
              ref: {error.digest}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full px-6 py-3 bg-zen-sage text-white rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            {t('tryAgain')}
          </button>
          <Link
            href="/"
            className="w-full px-6 py-3 bg-zen-surface border border-zen-border text-zen-text rounded-full font-medium hover:border-zen-sage transition-colors"
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </main>
  )
}
