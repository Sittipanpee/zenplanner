/**
 * Root Layout
 * Mounts NextIntlClientProvider, ThemeProvider, Zen design tokens, fonts, and LIFF provider
 */

import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { LIFFProvider } from '@/components/liff/liff-provider'

/**
 * Font CSS variable classes.
 * Google Fonts (Cormorant Garamond, Nunito, Noto Sans Thai, JetBrains Mono) are
 * loaded via globals.css @import or fallback to system fonts defined in CSS variables.
 * Production deployment should add Google Fonts link in <head> or use next/font/google
 * when network access is available at build time.
 */

export const metadata: Metadata = {
  title: 'ZenPlanner — Plan with your spirit',
  description: 'Discover your spirit animal and build a personalized planner',
  openGraph: {
    title: 'ZenPlanner',
    description: 'Discover your spirit animal and build a personalized planner',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className="font-body bg-zen-bg text-zen-text min-h-screen pt-safe-top pb-safe-bottom"
      >
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <LIFFProvider>
              {children}
            </LIFFProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
