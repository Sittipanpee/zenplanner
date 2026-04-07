/**
 * Daily Reflection — full-page editor route.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ToolEntry } from "@/lib/tools/types";
import {
  todayIso,
  type DailyReflectionPayload,
} from "@/lib/tools/daily_reflection";

const TOOL_ID = "daily_reflection";
const MAX_LEN = 400;

type Draft = {
  highlight: string;
  challenge: string;
  tomorrowIntent: string;
};

const emptyDraft: Draft = {
  highlight: "",
  challenge: "",
  tomorrowIntent: "",
};

function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function DailyReflectionPage() {
  const t = useTranslations("tools.dailyReflection");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [entries, setEntries] = useState<ToolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const today = useMemo(() => todayIso(), []);
  const yesterday = useMemo(() => yesterdayIso(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/tools/entries?toolId=${TOOL_ID}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = (await res.json()) as { entries?: ToolEntry[] };
        if (cancelled) return;
        const list = json.entries ?? [];
        setEntries(list);
        const todays = list.find((e) => e.entry_date === today);
        if (todays) {
          const p = todays.payload as Partial<DailyReflectionPayload>;
          setDraft({
            highlight: p.highlight ?? "",
            challenge: p.challenge ?? "",
            tomorrowIntent: p.tomorrowIntent ?? "",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [today]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: DailyReflectionPayload = {
        highlight: draft.highlight.trim().slice(0, MAX_LEN),
        challenge: draft.challenge.trim().slice(0, MAX_LEN),
        tomorrowIntent: draft.tomorrowIntent.trim().slice(0, MAX_LEN),
      };
      const res = await fetch("/api/tools/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolId: TOOL_ID,
          entryDate: today,
          payload,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { entry?: ToolEntry };
        if (json.entry) {
          setEntries((prev) => {
            const filtered = prev.filter((e) => e.entry_date !== today);
            return [json.entry as ToolEntry, ...filtered];
          });
        }
      }
    } finally {
      setSaving(false);
    }
  }, [draft, saving, today]);

  const yesterdayEntry = entries.find((e) => e.entry_date === yesterday);
  const yesterdayPayload = yesterdayEntry?.payload as
    | Partial<DailyReflectionPayload>
    | undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 pb-32 pt-6 text-zinc-900 dark:text-zinc-100">
      <header className="animate-in fade-in duration-500">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
      </header>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      ) : (
        <>
          <section className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 animate-in fade-in duration-500 dark:border-zinc-800 dark:bg-zinc-950">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("highlightPrompt")}
            </label>
            <textarea
              value={draft.highlight}
              maxLength={MAX_LEN}
              rows={3}
              onChange={(e) =>
                setDraft((d) => ({ ...d, highlight: e.target.value }))
              }
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </section>

          <section
            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 animate-in fade-in duration-700 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("challengePrompt")}
            </label>
            <textarea
              value={draft.challenge}
              maxLength={MAX_LEN}
              rows={3}
              onChange={(e) =>
                setDraft((d) => ({ ...d, challenge: e.target.value }))
              }
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </section>

          <section
            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 animate-in fade-in duration-1000 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("intentPrompt")}
            </label>
            <textarea
              value={draft.tomorrowIntent}
              maxLength={MAX_LEN}
              rows={3}
              onChange={(e) =>
                setDraft((d) => ({ ...d, tomorrowIntent: e.target.value }))
              }
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </section>

          {yesterdayPayload && (
            <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("yesterdayLabel")}
              </div>
              {yesterdayPayload.highlight && (
                <p className="text-zinc-700 dark:text-zinc-300">
                  {yesterdayPayload.highlight}
                </p>
              )}
            </section>
          )}
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/90 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 md:sticky md:bottom-4 md:rounded-2xl md:border">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="mx-auto block w-full max-w-2xl rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t("saveBtn")}
        </button>
      </div>
    </main>
  );
}
