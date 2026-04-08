"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Rocket, Plus, Trash2, Star } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { ideaCaptureSchema, todayIso } from "./index";

interface Idea {
  id: string;
  title: string;
  notes: string;
  starred: boolean;
}

const randomId = () => Math.random().toString(36).slice(2, 10);

export function IdeaCaptureWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.ideaCapture");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initial = useMemo<Idea[]>(() => {
    if (!todayEntry) return [];
    const parsed = ideaCaptureSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.ideas : [];
  }, [todayEntry]);

  const [ideas, setIdeas] = useState<Idea[]>(initial);
  const [draft, setDraft] = useState({ title: "", notes: "" });

  useEffect(() => {
    setIdeas(initial);
  }, [initial]);

  const persist = async (next: Idea[]) => {
    try {
      await onEntryAdd({ ideas: next });
    } catch {
      /* parent surfaces */
    }
  };

  const addIdea = () => {
    const title = draft.title.trim();
    if (!title || ideas.length >= 10) return;
    const next: Idea[] = [
      ...ideas,
      {
        id: randomId(),
        title: title.slice(0, 120),
        notes: draft.notes.slice(0, 400),
        starred: false,
      },
    ];
    setIdeas(next);
    setDraft({ title: "", notes: "" });
    void persist(next);
  };

  const toggleStar = (id: string) => {
    const next = ideas.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i));
    setIdeas(next);
    void persist(next);
  };

  const removeIdea = (id: string) => {
    const next = ideas.filter((i) => i.id !== id);
    setIdeas(next);
    void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {ideas.map((idea) => (
          <li
            key={idea.id}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-2">
              <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{idea.title}</span>
              <button
                type="button"
                onClick={() => toggleStar(idea.id)}
                aria-label={idea.starred ? "Unstar idea" : "Star idea"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg active:scale-95 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <Star
                  className={`h-4 w-4 ${idea.starred ? "fill-amber-400 text-amber-500" : "text-zinc-300 dark:text-zinc-600"}`}
                />
              </button>
              <button
                type="button"
                onClick={() => removeIdea(idea.id)}
                aria-label="Remove idea"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 active:scale-95 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {idea.notes && <p className="text-xs text-zinc-500 dark:text-zinc-400">{idea.notes}</p>}
          </li>
        ))}
      </ul>

      {ideas.length < 10 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-2 dark:border-zinc-700">
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder={t("titlePlaceholder")}
            maxLength={120}
            className="min-h-10 rounded-md bg-white px-2 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
          />
          <textarea
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            placeholder={t("notesPlaceholder")}
            rows={2}
            maxLength={400}
            className="rounded-md bg-white px-2 py-1 text-xs outline-none dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addIdea}
            disabled={!draft.title.trim()}
            className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-amber-600 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addButton")}
          </button>
        </div>
      )}

      {ideas.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("emptyHint")}</p>
      )}
    </div>
  );
}
