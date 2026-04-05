'use client'

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'th', label: '\u0E44\u0E17\u0E22' },
  { code: 'zh', label: '\u4E2D\u6587' },
] as const

/**
 * Language switcher component.
 * Sets NEXT_LOCALE cookie and triggers a router refresh so next-intl
 * picks up the new locale on the next server render.
 */
export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const changeLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`
    startTransition(() => router.refresh())
  }

  return (
    <div className="flex gap-1" role="group" aria-label="Language selection">
      {LOCALES.map(({ code, label }) => {
        const isActive = locale === code
        return (
          <button
            key={code}
            type="button"
            onClick={() => changeLocale(code)}
            disabled={isPending}
            aria-pressed={isActive}
            className={`
              px-2 py-1 text-xs rounded font-medium
              min-h-[var(--zen-touch-target)]
              transition-colors duration-150
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zen-sage
              ${isActive
                ? 'bg-zen-sage text-white'
                : 'text-zen-text-secondary hover:text-zen-text hover:bg-zen-surface-alt'
              }
              ${isPending ? 'opacity-60 cursor-wait' : ''}
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
