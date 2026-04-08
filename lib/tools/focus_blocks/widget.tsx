"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Crosshair, Plus, Check } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { focusBlocksSchema, todayIso } from "./index";

export function FocusBlocksWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.focusBlocks");
  const today = todayIso();
  const todayEntry = useMemo(() => entries.find((e) => e.entry_date === today), [entries, today]);
  const initial = useMemo(() => {
    if (!todayEntry) return [] as { id: string; label: string; minutes: number; done: boolean }[];
    const p = focusBlocksSchema.safeParse(todayEntry.payload);
    return p.success ? p.data.blocks : [];
  }, [todayEntry]);

  const [blocks, setBlocks] = useState(initial);
  const [draft, setDraft] = useState({ label: "", minutes: 90 });
  useEffect(() => setBlocks(initial), [initial]);

  const persist = async (next: typeof blocks) => {
    try { await onEntryAdd({ blocks: next }); } catch { /* parent */ }
  };

  const add = () => {
    if (!draft.label.trim() || blocks.length >= 4) return;
    const next = [...blocks, { id: Math.random().toString(36).slice(2, 10), label: draft.label.slice(0, 80), minutes: draft.minutes, done: false }];
    setBlocks(next); setDraft({ label: "", minutes: 90 });
    void persist(next);
  };

  const toggle = (id: string) => {
    const next = blocks.map((b) => b.id === id ? { ...b, done: !b.done } : b);
    setBlocks(next); void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Crosshair className="h-4 w-4 text-zen-clay" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{t("title")}</span>
          <span className="text-xs text-zinc-500">{t("subtitle")}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {blocks.map((b) => (
          <li key={b.id} className={`flex items-center gap-2 rounded-xl border p-3 ${b.done ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"}`}>
            <button type="button" onClick={() => toggle(b.id)} aria-label="Toggle done" className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${b.done ? "bg-emerald-500 text-white" : "border-2 border-zinc-300 dark:border-zinc-700"}`}>
              {b.done && <Check className="h-5 w-5" />}
            </button>
            <div className="flex-1">
              <div className={`text-sm font-medium ${b.done ? "text-zinc-400 line-through" : ""}`}>{b.label}</div>
              <div className="text-xs text-zinc-500">{b.minutes} min</div>
            </div>
          </li>
        ))}
      </ul>
      {blocks.length < 4 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-2 dark:border-zinc-700">
          <input type="text" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder={t("labelPlaceholder")} maxLength={80}
            className="min-h-10 rounded-md bg-white px-2 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-500">{t("minutesLabel")}</label>
            <input type="number" min={15} max={240} value={draft.minutes} onChange={(e) => setDraft({ ...draft, minutes: parseInt(e.target.value) || 90 })}
              className="min-h-10 w-20 rounded-md bg-white px-2 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100" />
            <button type="button" onClick={add} disabled={!draft.label.trim()}
              className="min-h-10 flex-1 rounded-lg bg-zen-clay text-xs font-medium text-white disabled:opacity-40">
              <Plus className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
