/**
 * Zen Navigation Components
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  active?: boolean;
}

/**
 * Bottom Tab Navigation (for mobile)
 */
export interface ZenBottomNavProps {
  items: NavItem[];
  className?: string;
}

export function ZenBottomNav({ items, className = "" }: ZenBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`
        zen-bottom-bar fixed bottom-0 left-0 right-0 z-50
        bg-zen-surface border-t border-zen-border
        flex items-center justify-around px-2 pb-safe
        lg:hidden
        ${className}
      `}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || item.active;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`
              flex flex-col items-center justify-center min-w-[64px] h-14
              transition-colors duration-200
              ${isActive ? "text-zen-sage" : "text-zen-text-muted hover:text-zen-text-secondary"}
            `}
          >
            <div className="mb-1" aria-hidden="true">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Top Header Navigation
 */
export interface ZenHeaderProps {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function ZenHeader({ title, left, right, className = "" }: ZenHeaderProps) {
  return (
    <header
      className={`
        sticky top-0 z-40 bg-zen-surface/95 backdrop-blur-sm
        border-b border-zen-border h-14 flex items-center justify-between px-4
        pt-safe
        ${className}
      `}
    >
      <div className="flex items-center gap-3">
        {left}
        {title && (
          <h1 className="font-display text-lg font-semibold text-zen-text">
            {title}
          </h1>
        )}
      </div>
      <div>{right}</div>
    </header>
  );
}

/**
 * Sidebar Navigation (for desktop)
 */
export interface ZenSidebarProps {
  items: NavItem[];
  className?: string;
}

export function ZenSidebar({ items, className = "" }: ZenSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        w-64 bg-zen-surface border-r border-zen-border min-h-screen p-4
        hidden lg:block
        ${className}
      `}
    >
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold text-zen-sage">ZenPlanner</h2>
      </div>
      <nav role="navigation" aria-label="Sidebar navigation" className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || item.active;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isActive
                  ? "bg-zen-sage/10 text-zen-sage"
                  : "text-zen-text-secondary hover:bg-zen-surface-alt hover:text-zen-text"
                }
              `}
            >
              <div aria-hidden="true">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}