"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlignJustify, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { eisenhowerMatrixSchema, todayIso, type EisenhowerQuadrant } from "./index";

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const QUADRANT_ORDER: EisenhowerQuadrant[] = ["do", "schedule", "delegate", "delete"];
const QUADRANT_COLORS: Record<EisenhowerQuadrant, string> = {
  do: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
  schedule: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
  delegate: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
  delete: "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900",
};

const EMPTY: Record<EisenhowerQuadrant, Task[]> = {
  do: [],
  schedule: [],
  delegate: [],
  delete: [],
};

const randomId = () => Math.random().toString(36).slice(2, 10);

export function EisenhowerMatrixWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.eisenhowerMatrix");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initial = useMemo<Record<EisenhowerQuadrant, Task[]>>(() => {
    if (!todayEntry) return { ...EMPTY };
    const parsed = eisenhowerMatrixSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.quadrants : { ...EMPTY };
  }, [todayEntry]);

  const [quadrants, setQuadrants] = useState(initial);
  const [drafts, setDrafts] = useState<Record<EisenhowerQuadrant, string>>({
    do: "",
    schedule: "",
    delegate: "",
    delete: "",
  });

  useEffect(() => {
    setQuadrants(initial);
  }, [initial]);

  const persist = async (next: Record<EisenhowerQuadrant, Task[]>) => {
    try {
      await onEntryAdd({ quadrants: next });
    } catch {
      /* parent surfaces toast */
    }
  };

  const addTask = (q: EisenhowerQuadrant) => {
    const text = drafts[q].trim();
    if (!text || quadrants[q].length >= 4) return;
    const next = {
      ...quadrants,
      [q]: [...quadrants[q], { id: randomId(), text: text.slice(0, 140), done: false }],
    };
    setQuadrants(next);
    setDrafts({ ...drafts, [q]: "" });
    void persist(next);
  };

  const toggleTask = (q: EisenhowerQuadrant, id: string) => {
    const next = {
      ...quadrants,
      [q]: quadrants[q].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    };
    setQuadrants(next);
    void persist(next);
  };

  const removeTask = (q: EisenhowerQuadrant, id: string) => {
    const next = { ...quadrants, [q]: quadrants[q].filter((t) => t.id !== id) };
    setQuadrants(next);
    void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <AlignJustify className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {QUADRANT_ORDER.map((q) => (
          <div
            key={q}
            className={`flex flex-col gap-2 rounded-xl border p-3 ${QUADRANT_COLORS[q]}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
              {t(`quadrants.${q}`)}
            </span>
            <ul className="flex flex-col gap-1">
              {quadrants[q].map((task) => (
                <li
                  key={task.id}
                  className="flex min-h-12 items-center gap-2 rounded-lg bg-white/70 px-2 py-1 dark:bg-zinc-900/70"
                >
                  <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => toggleTask(q, task.id)}
                      className="h-5 w-5 cursor-pointer rounded"
                    />
                  </label>
                  <span
                    className={`flex-1 text-xs ${
                      task.done ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTask(q, task.id)}
                    aria-label="Remove task"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded text-zinc-400 active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            {quadrants[q].length < 4 && (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={drafts[q]}
                  onChange={(e) => setDrafts({ ...drafts, [q]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTask(q);
                    }
                  }}
                  placeholder={t("addPlaceholder")}
                  maxLength={140}
                  className="min-h-10 flex-1 rounded-md border border-zinc-200 bg-white/70 px-2 text-xs text-zinc-900 outline-none dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => addTask(q)}
                  disabled={!drafts[q].trim()}
                  aria-label="Add task"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
