"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardList, Plus, X, ArrowRight, ArrowLeft } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { kanbanBoardSchema, todayIso, type KanbanColumn } from "./index";

interface Card {
  id: string;
  text: string;
  column: KanbanColumn;
}

const COLUMNS: KanbanColumn[] = ["todo", "doing", "done"];
const randomId = () => Math.random().toString(36).slice(2, 10);

export function KanbanBoardWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.kanbanBoard");
  const today = todayIso();
  const todayEntry = useMemo(() => entries.find((e) => e.entry_date === today), [entries, today]);

  const initial = useMemo<Card[]>(() => {
    if (!todayEntry) return [];
    const parsed = kanbanBoardSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.cards : [];
  }, [todayEntry]);

  const [cards, setCards] = useState<Card[]>(initial);
  const [draft, setDraft] = useState("");

  useEffect(() => setCards(initial), [initial]);

  const persist = async (next: Card[]) => {
    try { await onEntryAdd({ cards: next }); } catch { /* parent */ }
  };

  const addCard = () => {
    const text = draft.trim();
    if (!text || cards.length >= 15) return;
    const next = [...cards, { id: randomId(), text: text.slice(0, 140), column: "todo" as KanbanColumn }];
    setCards(next); setDraft("");
    void persist(next);
  };

  const moveCard = (id: string, dir: 1 | -1) => {
    const next = cards.map((c) => {
      if (c.id !== id) return c;
      const idx = COLUMNS.indexOf(c.column);
      const newIdx = Math.max(0, Math.min(2, idx + dir));
      return { ...c, column: COLUMNS[newIdx] };
    });
    setCards(next); void persist(next);
  };

  const removeCard = (id: string) => {
    const next = cards.filter((c) => c.id !== id);
    setCards(next); void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-zen-sage" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{t("title")}</span>
          <span className="text-xs text-zinc-500">{t("subtitle")}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {COLUMNS.map((col) => (
          <div key={col} className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{t(`columns.${col}`)}</span>
            {cards.filter((c) => c.column === col).map((c) => (
              <div key={c.id} className="flex items-start gap-1 rounded-md bg-white p-1.5 text-xs dark:bg-zinc-950">
                <span className="flex-1 text-zinc-900 dark:text-zinc-100">{c.text}</span>
              </div>
            ))}
            {cards.filter((c) => c.column === col).map((c) => (
              <div key={c.id + "-ctl"} className="flex items-center gap-0.5">
                {col !== "todo" && (
                  <button type="button" onClick={() => moveCard(c.id, -1)} aria-label="Move left" className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700">
                    <ArrowLeft className="h-3 w-3" />
                  </button>
                )}
                {col !== "done" && (
                  <button type="button" onClick={() => moveCard(c.id, 1)} aria-label="Move right" className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-zinc-700">
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                <button type="button" onClick={() => removeCard(c.id)} aria-label="Remove" className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
      {cards.length < 15 && (
        <div className="flex items-center gap-2">
          <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCard())}
            placeholder={t("addPlaceholder")} maxLength={140}
            className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
          <button type="button" onClick={addCard} disabled={!draft.trim()} aria-label="Add card"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zen-sage text-white disabled:opacity-40">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
