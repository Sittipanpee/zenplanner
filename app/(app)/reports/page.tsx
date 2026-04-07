"use client";

/**
 * /reports — cross-tool aggregation report (PTS-03-04)
 *
 * Mobile-first. Shows headline KPIs across enabled tools, a per-tool
 * breakdown for the selected period, and a freeform reflection note
 * persisted via the existing /api/tools/entries pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { KpiCard } from "@/components/reports/kpi-card";
import { PeriodTabs, type ReportPeriod } from "@/components/reports/period-tabs";

interface AggregateResponse {
  range: { from: string; to: string };
  metrics: Record<string, number | string>;
  toolBreakdown: Record<string, { entries: number; lastEntryDate: string | null }>;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeFor(period: ReportPeriod): { from: string; to: string } {
  const to = new Date();
  to.setUTCHours(0, 0, 0, 0);
  const from = new Date(to);
  switch (period) {
    case "week":
      from.setUTCDate(from.getUTCDate() - 6);
      break;
    case "month":
      from.setUTCDate(from.getUTCDate() - 29);
      break;
    case "quarter":
      from.setUTCDate(from.getUTCDate() - 89);
      break;
    case "year":
      from.setUTCDate(from.getUTCDate() - 364);
      break;
  }
  return { from: isoDate(from), to: isoDate(to) };
}

export default function ReportsPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [data, setData] = useState<AggregateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState("");
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const range = useMemo(() => rangeFor(period), [period]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/tools/aggregate?from=${range.from}&to=${range.to}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: AggregateResponse) => {
        if (!cancelled) setData(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const saveReflection = useCallback(async () => {
    if (!reflection.trim()) return;
    setReflectionSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/tools/entries", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: "period_reflection",
          entryDate: range.to,
          payload: { period, range, note: reflection.trim() },
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setReflection("");
      setReflectionSaved(true);
      setTimeout(() => setReflectionSaved(false), 2000);
    } catch (e) {
      // Surface failure in UI — never silent (Master Plan §9).
      setError(e instanceof Error ? e.message : "reflection_save_failed");
    } finally {
      setReflectionSaving(false);
    }
  }, [reflection, period, range]);

  const metrics = data?.metrics ?? {};
  const breakdown = data?.toolBreakdown ?? {};
  const hasAnyData = Object.values(breakdown).some((b) => b.entries > 0);

  const streak = metrics["streak.currentDays"];
  const moodAvg = metrics["mood.weekAverage"];
  const prioritiesDone = metrics["priorities.doneCount"];
  const habitPct = metrics["habit.completionRate"];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
      </header>

      <div className="mb-6">
        <PeriodTabs
          value={period}
          onChange={setPeriod}
          labels={{
            week: t("tabs.week"),
            month: t("tabs.month"),
            quarter: t("tabs.quarter"),
            year: t("tabs.year"),
          }}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zen-sage"
            />
            {tCommon("actions.loading")}
          </span>
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
        >
          {tCommon("errors.serverError")} <span className="opacity-60">({error})</span>
        </div>
      )}

      {!loading && !hasAnyData && !error && (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          {t("empty")}
        </div>
      )}

      {!loading && hasAnyData && (
        <>
          <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label={t("kpi.streak")}
              value={typeof streak === "number" ? streak : "—"}
            />
            <KpiCard
              label={t("kpi.moodAverage")}
              value={typeof moodAvg === "number" ? moodAvg.toFixed(1) : "—"}
            />
            <KpiCard
              label={t("kpi.prioritiesDone")}
              value={typeof prioritiesDone === "number" ? prioritiesDone : "—"}
            />
            <KpiCard
              label={t("kpi.habitsPercent")}
              value={
                typeof habitPct === "number"
                  ? `${Math.round(habitPct * 100)}%`
                  : "—"
              }
            />
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
              {t("breakdownLabel")}
            </h2>
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white/70 dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/60">
              {Object.entries(breakdown).map(([toolId, stats]) => (
                <li
                  key={toolId}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {toolId}
                  </span>
                  <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                    {stats.entries} · {stats.lastEntryDate ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <section className="mt-8">
        <label
          htmlFor="reflection"
          className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {t("reflectionLabel")}
        </label>
        <textarea
          id="reflection"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder={t("reflectionPlaceholder")}
          rows={4}
          className="w-full rounded-xl border border-zinc-200 bg-white/70 p-3 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-50"
        />
        <div className="mt-2 flex items-center justify-end gap-3">
          {reflectionSaved && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              {tCommon("actions.copied").replace("Copied!", "Saved")}
            </span>
          )}
          <button
            type="button"
            onClick={saveReflection}
            disabled={!reflection.trim() || reflectionSaving}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {reflectionSaving && (
              <span
                aria-hidden="true"
                className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
            {tCommon("actions.save")}
          </button>
        </div>
      </section>
    </main>
  );
}
