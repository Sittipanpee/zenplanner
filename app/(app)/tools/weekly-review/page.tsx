/**
 * Weekly Review — full-page editor route.
 * Mobile-first editor for the heavy-data `weekly_review` tool.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { ToolEntry } from "@/lib/tools/types";
import {
  mondayOfWeek,
  type WeeklyReviewPayload,
} from "@/lib/tools/weekly_review";

const TOOL_ID = "weekly_review";
const MAX_ITEMS = 5;
const MAX_LEN = 400;
const MAX_FOCUS = 400;

type Draft = {
  wins: string[];
  losses: string[];
  nextWeekFocus: string;
  overallRating: number;
};

const emptyDraft: Draft = {
  wins: [""],
  losses: [""],
  nextWeekFocus: "",
  overallRating: 3,
};

function cleanList(items: string[]): string[] {
  return items
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => s.slice(0, MAX_LEN));
}

export default function WeeklyReviewPage() {
  const t = useTranslations("tools.weeklyReview");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [entries, setEntries] = useState<ToolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const weekKey = useMemo(() => mondayOfWeek(), []);

  // Load existing entries
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
        const thisWeek = list.find((e) => e.entry_date === weekKey);
        if (thisWeek) {
          const p = thisWeek.payload as Partial<WeeklyReviewPayload>;
          setDraft({
            wins: p.wins && p.wins.length > 0 ? [...p.wins] : [""],
            losses: p.losses && p.losses.length > 0 ? [...p.losses] : [""],
            nextWeekFocus: p.nextWeekFocus ?? "",
            overallRating: p.overallRating ?? 3,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekKey]);

  const updateListItem = useCallback(
    (key: "wins" | "losses", idx: number, value: string) => {
      setDraft((d) => {
        const next = [...d[key]];
        next[idx] = value.slice(0, MAX_LEN);
        return { ...d, [key]: next };
      });
    },
    []
  );

  const addItem = useCallback((key: "wins" | "losses") => {
    setDraft((d) => {
      if (d[key].length >= MAX_ITEMS) return d;
      return { ...d, [key]: [...d[key], ""] };
    });
  }, []);

  const removeItem = useCallback((key: "wins" | "losses", idx: number) => {
    setDraft((d) => {
      const next = d[key].filter((_, i) => i !== idx);
      return { ...d, [key]: next.length ? next : [""] };
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload: WeeklyReviewPayload = {
        wins: cleanList(draft.wins),
        losses: cleanList(draft.losses),
        nextWeekFocus: draft.nextWeekFocus.trim().slice(0, MAX_FOCUS),
        overallRating: Math.max(1, Math.min(5, draft.overallRating)),
      };
      const res = await fetch("/api/tools/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolId: TOOL_ID,
          entryDate: weekKey,
          payload,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { entry?: ToolEntry };
        if (json.entry) {
          setEntries((prev) => {
            const filtered = prev.filter((e) => e.entry_date !== weekKey);
            return [json.entry as ToolEntry, ...filtered];
          });
        }
      }
    } finally {
      setSaving(false);
    }
  }, [draft, saving, weekKey]);

  const previous = entries.filter((e) => e.entry_date !== weekKey);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 pb-32 pt-6 text-zinc-900 dark:text-zinc-100">
      <header>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
        <p className="mt-1 text-xs text-zinc-400">Week of {weekKey}</p>
      </header>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      ) : (
        <>
          {/* Wins */}
          <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("winsLabel")}
            </h2>
            {draft.wins.map((w, i) => (
              <div key={`win-${i}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={w}
                  maxLength={MAX_LEN}
                  onChange={(e) => updateListItem("wins", i, e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => removeItem("wins", i)}
                  className="rounded-lg p-2 text-zinc-400 hover:text-red-500"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {draft.wins.length < MAX_ITEMS && (
              <button
                type="button"
                onClick={() => addItem("wins")}
                className="inline-flex items-center gap-1 self-start text-sm font-medium text-emerald-600 dark:text-emerald-400"
              >
                <Plus className="h-4 w-4" /> {t("addItem")}
              </button>
            )}
          </section>

          {/* Losses */}
          <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("lossesLabel")}
            </h2>
            {draft.losses.map((l, i) => (
              <div key={`loss-${i}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={l}
                  maxLength={MAX_LEN}
                  onChange={(e) => updateListItem("losses", i, e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => removeItem("losses", i)}
                  className="rounded-lg p-2 text-zinc-400 hover:text-red-500"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {draft.losses.length < MAX_ITEMS && (
              <button
                type="button"
                onClick={() => addItem("losses")}
                className="inline-flex items-center gap-1 self-start text-sm font-medium text-emerald-600 dark:text-emerald-400"
              >
                <Plus className="h-4 w-4" /> {t("addItem")}
              </button>
            )}
          </section>

          {/* Next week focus */}
          <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("nextFocusLabel")}
            </h2>
            <textarea
              value={draft.nextWeekFocus}
              maxLength={MAX_FOCUS}
              onChange={(e) =>
                setDraft((d) => ({ ...d, nextWeekFocus: e.target.value }))
              }
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            />
          </section>

          {/* Rating */}
          <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("ratingLabel")}
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({ ...d, overallRating: n }))
                  }
                  aria-label={`Rating ${n}`}
                  className="rounded-full p-1"
                >
                  <Star
                    className={`h-7 w-7 ${
                      n <= draft.overallRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Previous weeks */}
          {previous.length > 0 && (
            <section className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <button
                type="button"
                onClick={() => setShowPrevious((s) => !s)}
                className="flex w-full items-center justify-between p-4 text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                <span>
                  {t("previousLabel")} ({previous.length})
                </span>
                {showPrevious ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showPrevious && (
                <ul className="flex flex-col gap-2 border-t border-zinc-100 p-4 dark:border-zinc-900">
                  {previous.map((e) => {
                    const p = e.payload as Partial<WeeklyReviewPayload>;
                    return (
                      <li
                        key={e.id}
                        className="rounded-lg border border-zinc-100 p-3 text-xs dark:border-zinc-900"
                      >
                        <div className="font-medium">{e.entry_date}</div>
                        <div className="mt-1 text-zinc-500">
                          {(p.wins?.length ?? 0)} {t("winsLabel")} ·{" "}
                          {p.overallRating ?? "-"}/5
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      {/* Sticky save bar */}
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
