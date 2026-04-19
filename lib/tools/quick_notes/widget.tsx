"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { NotebookPen, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { quickNotesSchema, todayIso } from "./index";

interface Note {
  id: string;
  text: string;
  created_at: string;
}

export function QuickNotesWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.quickNotes");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initialNotes = useMemo<Note[]>(() => {
    if (!todayEntry) return [];
    const parsed = quickNotesSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.notes : [];
  }, [todayEntry]);

  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const persist = async (next: Note[]) => {
    try {
      await onEntryAdd({ notes: next });
    } catch {
      /* parent surfaces toast */
    }
  };

  const addNote = () => {
    const text = draft.trim();
    if (!text || notes.length >= 20) return;
    const next: Note[] = [
      ...notes,
      { id: Math.random().toString(36).slice(2, 10), text: text.slice(0, 200), created_at: new Date().toISOString() },
    ];
    setNotes(next);
    setDraft("");
    void persist(next);
  };

  const removeNote = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <NotebookPen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-1">
        {notes.map((n) => (
          <li
            key={n.id}
            className="flex min-h-12 items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-100">{n.text}</span>
            <button
              type="button"
              onClick={() => removeNote(n.id)}
              aria-label="Remove note"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {notes.length < 20 && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNote();
              }
            }}
            placeholder={t("addPlaceholder")}
            maxLength={200}
            className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 outline-none focus:border-sky-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addNote}
            disabled={!draft.trim()}
            aria-label="Add note"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}

      {notes.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("emptyHint")}</p>
      )}
      {notes.length > 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("noteCount", { count: notes.length })}</p>
      )}
    </div>
  );
}
