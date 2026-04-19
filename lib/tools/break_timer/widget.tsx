"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Coffee, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { breakTimerSchema, todayIso } from "./index";

export function BreakTimerWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.breakTimer");
  const today = todayIso();
  const todayEntry = useMemo(() => entries.find((e) => e.entry_date === today), [entries, today]);
  const initial = useMemo(() => {
    if (!todayEntry) return [] as { id: string; minutes: number; at: string }[];
    const p = breakTimerSchema.safeParse(todayEntry.payload);
    return p.success ? p.data.breaks : [];
  }, [todayEntry]);

  const [breaks, setBreaks] = useState(initial);
  useEffect(() => setBreaks(initial), [initial]);

  const addBreak = (minutes: number) => {
    if (breaks.length >= 10) return;
    const next = [...breaks, { id: Math.random().toString(36).slice(2, 10), minutes, at: new Date().toISOString() }];
    setBreaks(next); void onEntryAdd({ breaks: next }).catch(() => {});
  };
  const remove = (id: string) => {
    const next = breaks.filter((b) => b.id !== id);
    setBreaks(next); void onEntryAdd({ breaks: next }).catch(() => {});
  };
  const total = breaks.reduce((s, b) => s + b.minutes, 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="h-4 w-4 text-amber-600" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{t("title")}</span>
            <span className="text-xs text-zinc-500">{t("subtitle")}</span>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{t("totalMinutes", { count: total })}</span>
      </div>
      <div className="flex gap-2">
        {[5, 10, 15, 20].map((m) => (
          <button key={m} type="button" onClick={() => addBreak(m)} disabled={breaks.length >= 10}
            className="min-h-12 flex-1 rounded-xl bg-amber-50 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-40 dark:bg-amber-900/20 dark:text-amber-300">
            <Plus className="mx-auto mb-0.5 h-3 w-3" />
            {m}m
          </button>
        ))}
      </div>
      {breaks.length > 0 && (
        <ul className="flex flex-col gap-1">
          {breaks.map((b) => (
            <li key={b.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-sm font-medium">{b.minutes} min</span>
              <span className="flex-1 text-xs text-zinc-500">{new Date(b.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
              <button type="button" onClick={() => remove(b.id)} aria-label="Remove" className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {breaks.length === 0 && <p className="text-xs text-zinc-500">{t("emptyHint")}</p>}
    </div>
  );
}
