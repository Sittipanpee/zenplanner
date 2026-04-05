/**
 * Root Layout
 * Mounts NextIntlClientProvider, ThemeProvider, Zen design tokens, fonts, and LIFF provider
 */

import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Nunito, Noto_Sans_Thai, JetBrains_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import { LIFFProvider } from '@/components/liff/liff-provider'

const cormorant = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const notoSansThai = Noto_Sans_Thai({
  variable: '--font-thai',
  subsets: ['thai'],
  weight: ['400', '500', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

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
        className={`
          ${cormorant.variable} ${nunito.variable} ${notoSansThai.variable} ${jetbrainsMono.variable}
          font-body bg-[var(--bg-primary)] text-[var(--text-primary)]
          min-h-screen
          pt-safe-top pb-safe-bottom
        `}
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
