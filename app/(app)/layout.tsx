/**
 * App Group Layout
 * Protected routes with top nav (desktop) / bottom tab navigation (mobile)
 * Mounts ThemeToggle + LanguageSwitcher in header
 */

'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, LayoutGrid, User, Settings } from 'lucide-react'
import ThemeToggle from '@/components/ui/theme-toggle'
import LanguageSwitcher from '@/components/ui/language-switcher'

interface NavItem {
  href: string
  labelKey: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: <Home className="w-5 h-5" /> },
  { href: '/blueprint', labelKey: 'planner', icon: <Compass className="w-5 h-5" /> },
  { href: '/tools', labelKey: 'tools', icon: <LayoutGrid className="w-5 h-5" /> },
  { href: '/profile', labelKey: 'profile', icon: <User className="w-5 h-5" /> },
]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = useTranslations('common.nav')
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex-col z-20">
        <div className="p-6 border-b border-[var(--border-primary)]">
          <h1 className="font-display text-2xl font-bold text-[var(--accent-primary)]">ZenPlanner</h1>
        </div>
        <nav className="flex-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-1 ${
                  isActive
                    ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.icon}
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border-primary)] space-y-3">
          <div className="flex items-center justify-between px-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">{t('settings')}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="font-display text-lg font-bold text-[var(--accent-primary)]">ZenPlanner</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content — offset on desktop for sidebar */}
      <div className="md:ml-64">
        <main>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border-primary)] bg-[var(--bg-primary)]/95 backdrop-blur-sm z-50 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[64px] h-14 transition-colors ${
                  isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium mt-1">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
