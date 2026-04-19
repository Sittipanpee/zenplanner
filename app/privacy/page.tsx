/**
 * Privacy Policy Page (PDPA-compliant)
 * Public route, trilingual via next-intl, mobile-first, dark-mode ready.
 */

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

interface Section {
  key:
    | 'collect'
    | 'why'
    | 'sharing'
    | 'subprocessors'
    | 'rights'
    | 'cookies'
    | 'retention'
    | 'contact'
}

const SECTIONS: Section['key'][] = [
  'collect',
  'why',
  'sharing',
  'subprocessors',
  'rights',
  'cookies',
  'retention',
  'contact',
]

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy')

  return (
    <main className="min-h-screen bg-zen-bg text-zen-fg px-4 py-12 sm:py-16">
      <article className="mx-auto max-w-prose leading-relaxed">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-sm opacity-70">{t('lastUpdated')}</p>
          <p className="mt-4">{t('intro')}</p>
        </header>

        {SECTIONS.map((key, idx) => (
          <section key={key} className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3">
              {idx + 1}. {t(`sections.${key}.title`)}
            </h2>
            <p className="whitespace-pre-line">
              {t(`sections.${key}.body`)}
            </p>
          </section>
        ))}

        <footer className="mt-12 pt-6 border-t border-zen-border text-sm opacity-80">
          <Link href="/terms" className="underline hover:opacity-100">
            {t('footerTermsLink')}
          </Link>
        </footer>
      </article>
    </main>
  )
}
