"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { booksLogSchema, todayIso } from "./index";

export function BooksLogWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.booksLog");
  const today = todayIso();
  const todayEntry = useMemo(() => entries.find((e) => e.entry_date === today), [entries, today]);
  const initial = useMemo(() => {
    if (!todayEntry) return [] as { id: string; text: string }[];
    const p = booksLogSchema.safeParse(todayEntry.payload);
    return p.success ? p.data.items : [];
  }, [todayEntry]);

  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState("");
  useEffect(() => setItems(initial), [initial]);

  const persist = async (next: typeof items) => {
    try { await onEntryAdd({ items: next }); } catch { /* parent */ }
  };

  const add = () => {
    const text = draft.trim();
    if (!text || items.length >= 10) return;
    const next = [...items, { id: Math.random().toString(36).slice(2, 10), text: text.slice(0, 200) }];
    setItems(next); setDraft("");
    void persist(next);
  };

  const remove = (id: string) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next); void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-zen-sage" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{t("title")}</span>
          <span className="text-xs text-zinc-500">{t("subtitle")}</span>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {items.map((i) => (
          <li key={i.id} className="flex min-h-12 items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">{i.text}</span>
            <button type="button" onClick={() => remove(i.id)} aria-label="Remove" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 active:scale-95 hover:bg-zinc-200 dark:hover:bg-zinc-800">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      {items.length < 10 && (
        <div className="flex items-center gap-2">
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder={t("addPlaceholder")} maxLength={200}
            className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
          <button type="button" onClick={add} disabled={!draft.trim()} aria-label="Add"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zen-sage text-white disabled:opacity-40">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}
      {items.length === 0 && <p className="text-xs text-zinc-500">{t("emptyHint")}</p>}
    </div>
  );
}
