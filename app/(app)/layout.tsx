/**
 * App Group Layout
 * Protected routes with bottom tab navigation (mobile) / sidebar (desktop)
 */

"use client";

import { useState } from "react";
import { ZenBottomNav } from "@/components/ui/zen-nav";
import Link from "next/link";
import { Home, Compass, LayoutGrid, User, Menu, X, ArrowLeft } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "หน้าหลัก", icon: <Home className="w-5 h-5" /> },
  { href: "/blueprint", label: "Planner", icon: <Compass className="w-5 h-5" /> },
  { href: "/tools", label: "เครื่องมือ", icon: <LayoutGrid className="w-5 h-5" /> },
  { href: "/profile", label: "โปรไฟล์", icon: <User className="w-5 h-5" /> },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zen-bg pb-16 md:pb-0">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex md:fixed md:left-0 md:top-0 md:h-screen md:w-64 bg-zen-surface border-r border-zen-border flex-col z-20">
        <div className="p-6 border-b border-zen-border">
          <h1 className="font-display text-2xl font-bold text-zen-sage">ZenPlanner</h1>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zen-text-secondary hover:bg-zen-surface-alt hover:text-zen-text transition-colors mb-1"
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zen-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zen-text-muted hover:bg-zen-surface-alt hover:text-zen-text transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">กลับหน้าหลัก</span>
          </Link>
        </div>
      </aside>

      {/* Mobile hamburger menu */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-zen-surface border border-zen-border rounded-lg shadow-zen-md"
      >
        <Menu className="w-6 h-6 text-zen-text" />
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside
            className="fixed left-0 top-0 h-full w-64 bg-zen-surface border-r border-zen-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-zen-border flex justify-between items-center">
              <h1 className="font-display text-2xl font-bold text-zen-sage">ZenPlanner</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-zen-text" />
              </button>
            </div>
            <nav className="p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zen-text-secondary hover:bg-zen-surface-alt hover:text-zen-text transition-colors mb-1"
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content - offset on desktop */}
      <div className="md:ml-64">
        {children}
      </div>

      {/* Mobile Bottom Nav - Hidden on desktop */}
      <div className="md:hidden">
        <ZenBottomNav items={navItems} />
      </div>
    </div>
  );
}