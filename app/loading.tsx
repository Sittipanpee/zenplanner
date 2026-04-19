/**
 * Root Loading State — branded skeleton shown during route transitions.
 * Server component (no "use client"). Inline, no fetch.
 */
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-zen-bg dark:bg-zinc-950">
      <Loader2
        aria-hidden="true"
        className="h-8 w-8 animate-spin text-zen-sage"
      />
      <p className="font-display text-xl text-zen-text dark:text-zinc-100">
        ZenPlanner
      </p>
      <p className="text-sm text-zen-text/60 dark:text-zinc-400">Loading…</p>
    </div>
  );
}
