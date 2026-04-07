/**
 * Dashboard Page (PTS-02 rebuild)
 *
 * Renders a grid of the authenticated user's enabled tool widgets.
 * Mobile-first: 1-col on phone, 2-col on sm+. Each widget is wrapped
 * by ToolWidgetWrapper which owns collapse/menu/error-boundary chrome.
 *
 * NOTE on widgets: many tools currently render PlaceholderWidget while
 * Wave-1 agents land their real implementations. This page works
 * identically with stubs and real widgets.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LayoutGrid, Sparkles, Target, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ALL_TOOLS, getToolByIdString } from "@/lib/tools/registry";
import type { Locale, ToolDefinition, UserTool } from "@/lib/tools/types";
import { ToolWidgetWrapper } from "@/components/dashboard/tool-widget-wrapper";

const DEFAULT_EXPANDED_COUNT = 5;

interface EnabledTool {
  userTool: UserTool;
  definition: ToolDefinition;
}

export default function DashboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const tDash = useTranslations("dashboard");
  const tTools = useTranslations("tools");
  const locale = useLocale() as Locale;

  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userTools, setUserTools] = useState<UserTool[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth + initial fetch
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        setUserId(data?.user?.id ?? null);
        setAuthChecked(true);

        if (!data?.user) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/tools/mine", { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to load tools (${res.status})`);
        const json = (await res.json()) as { tools: UserTool[] };
        if (!cancelled) {
          setUserTools(json.tools ?? []);
        }
      } catch (err: unknown) {
        // eslint-disable-next-line no-console
        console.error("[dashboard] init failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // Resolve enabled tools, sorted by position
  const enabledTools: EnabledTool[] = useMemo(() => {
    const enabled = userTools
      .filter((ut) => ut.enabled)
      .sort((a, b) => a.position - b.position);

    const resolved: EnabledTool[] = [];
    for (const ut of enabled) {
      const def = getToolByIdString(ut.tool_id);
      if (def) resolved.push({ userTool: ut, definition: def });
    }
    return resolved;
  }, [userTools]);

  // Disable handler — optimistic
  const handleDisable = useCallback(async (toolId: string) => {
    setUserTools((prev) =>
      prev.map((ut) =>
        ut.tool_id === toolId ? { ...ut, enabled: false } : ut
      )
    );
    try {
      const res = await fetch("/api/tools/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ toolId }),
      });
      if (!res.ok) throw new Error(`Disable failed (${res.status})`);
    } catch (err) {
      // Roll back
      setUserTools((prev) =>
        prev.map((ut) =>
          ut.tool_id === toolId ? { ...ut, enabled: true } : ut
        )
      );
      // eslint-disable-next-line no-console
      console.error("[dashboard] disable failed:", err);
    }
  }, []);

  // Reorder handler
  const persistOrdering = useCallback(async (rows: UserTool[]) => {
    const ordering = rows.map((ut, idx) => ({
      toolId: ut.tool_id,
      position: idx,
    }));
    try {
      const res = await fetch("/api/tools/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ordering }),
      });
      if (!res.ok) throw new Error(`Reorder failed (${res.status})`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[dashboard] reorder failed:", err);
    }
  }, []);

  const moveTool = useCallback(
    (toolId: string, dir: -1 | 1) => {
      setUserTools((prev) => {
        const enabled = prev
          .filter((ut) => ut.enabled)
          .sort((a, b) => a.position - b.position);
        const idx = enabled.findIndex((ut) => ut.tool_id === toolId);
        if (idx < 0) return prev;
        const swapIdx = idx + dir;
        if (swapIdx < 0 || swapIdx >= enabled.length) return prev;

        const reordered = [...enabled];
        [reordered[idx], reordered[swapIdx]] = [
          reordered[swapIdx],
          reordered[idx],
        ];
        const repositioned = reordered.map((ut, i) => ({
          ...ut,
          position: i,
        }));

        // Persist
        void persistOrdering(repositioned);

        // Merge back with disabled rows
        const disabled = prev.filter((ut) => !ut.enabled);
        return [...repositioned, ...disabled];
      });
    },
    [persistOrdering]
  );

  // Summary strip
  const todayIso = new Date().toISOString().slice(0, 10);
  const enabledCount = enabledTools.length;
  const totalCatalog = ALL_TOOLS.length;

  // Live count of tools with an entry saved today (across enabled tools).
  const [entriesToday, setEntriesToday] = useState(0);
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const url = `/api/tools/entries?from=${todayIso}&to=${todayIso}`;
    fetch(url, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { entries: [] }))
      .then((d) => {
        if (cancelled) return;
        const list = Array.isArray(d?.entries) ? d.entries : [];
        // Count distinct tool_ids that have any entry today.
        const distinctTools = new Set(list.map((e: { tool_id: string }) => e.tool_id));
        setEntriesToday(distinctTools.size);
      })
      .catch(() => {
        // Silent fallback — summary chip is non-critical UI.
        if (!cancelled) setEntriesToday(0);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, todayIso]);

  // ---------- Render ----------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zen-bg">
        <Loader2 className="h-6 w-6 animate-spin text-zen-sage" />
      </main>
    );
  }

  if (authChecked && !userId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zen-bg p-6 text-center">
        <p className="text-zen-text">{tDash("findAnimal")}</p>
        <Link
          href="/login"
          className="rounded-xl bg-zen-sage px-5 py-2 text-sm font-medium text-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Welcome strip */}
      <header className="bg-gradient-to-br from-zen-sage/15 to-zen-gold/10 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <p className="text-xs uppercase tracking-wide text-zen-text-muted">
            {new Date().toLocaleDateString(locale, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-zen-text md:text-3xl">
            {tDash("welcome") || "Your dashboard"}
          </h1>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-zen-surface px-3 py-1 text-zen-text-secondary shadow-sm">
              {enabledCount} / {totalCatalog} tools active
            </span>
            <span className="rounded-full bg-zen-surface px-3 py-1 text-zen-text-secondary shadow-sm">
              {entriesToday} entries today
            </span>
          </div>
        </div>
      </header>

      {/* Widget grid */}
      <section className="mx-auto max-w-md px-4 py-6 md:max-w-4xl md:px-8">
        {enabledTools.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zen-border bg-zen-surface p-8 text-center">
            <LayoutGrid className="mx-auto h-8 w-8 text-zen-text-muted" />
            <p className="mt-3 text-sm text-zen-text">
              {tTools("dashboard.empty")}
            </p>
            <Link
              href="/blueprint"
              className="mt-4 inline-block rounded-xl bg-zen-sage px-5 py-2 text-sm font-medium text-white hover:bg-zen-sage/90"
            >
              {tTools("dashboard.emptyAction")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {enabledTools.map((entry, idx) => (
              <ToolWidgetWrapper
                key={entry.userTool.tool_id}
                tool={entry.definition}
                userTool={entry.userTool}
                userId={userId ?? ""}
                locale={locale}
                defaultExpanded={idx < DEFAULT_EXPANDED_COUNT}
                onDisable={handleDisable}
                onMoveUp={(id) => moveTool(id, -1)}
                onMoveDown={(id) => moveTool(id, 1)}
                canMoveUp={idx > 0}
                canMoveDown={idx < enabledTools.length - 1}
              />
            ))}
          </div>
        )}

        {/* Quick actions (secondary) */}
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-zen-text-secondary">
            {tDash("quickActions.title")}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/quiz"
              className="flex items-center gap-2 rounded-xl bg-zen-gold/10 p-4 text-zen-gold"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">
                {tDash("quickActions.takeQuiz")}
              </span>
            </Link>
            <Link
              href="/blueprint"
              className="flex items-center gap-2 rounded-xl bg-zen-sage/10 p-4 text-zen-sage"
            >
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">
                {tDash("quickActions.createPlanner")}
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
