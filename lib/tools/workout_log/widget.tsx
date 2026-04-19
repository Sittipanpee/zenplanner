"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Dumbbell, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { workoutLogSchema, todayIso } from "./index";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  minutes: number;
}

const randomId = () => Math.random().toString(36).slice(2, 10);

export function WorkoutLogWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.workoutLog");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initial = useMemo<Exercise[]>(() => {
    if (!todayEntry) return [];
    const parsed = workoutLogSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.exercises : [];
  }, [todayEntry]);

  const [exercises, setExercises] = useState<Exercise[]>(initial);
  const [draft, setDraft] = useState({ name: "", sets: 3, reps: 10, minutes: 0 });

  useEffect(() => {
    setExercises(initial);
  }, [initial]);

  const persist = async (next: Exercise[]) => {
    try {
      await onEntryAdd({ exercises: next });
    } catch {
      /* parent surfaces toast */
    }
  };

  const addExercise = () => {
    const name = draft.name.trim();
    if (!name || exercises.length >= 10) return;
    const next: Exercise[] = [
      ...exercises,
      {
        id: randomId(),
        name: name.slice(0, 80),
        sets: Math.max(1, Math.min(20, draft.sets)),
        reps: Math.max(0, Math.min(100, draft.reps)),
        minutes: Math.max(0, Math.min(240, draft.minutes)),
      },
    ];
    setExercises(next);
    setDraft({ name: "", sets: 3, reps: 10, minutes: 0 });
    void persist(next);
  };

  const removeExercise = (id: string) => {
    const next = exercises.filter((x) => x.id !== id);
    setExercises(next);
    void persist(next);
  };

  const totalMinutes = exercises.reduce((sum, e) => sum + e.minutes, 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
          </div>
        </div>
        {totalMinutes > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            {t("totalMinutes", { count: totalMinutes })}
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-1">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{ex.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {ex.sets} × {ex.reps} · {ex.minutes} min
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeExercise(ex.id)}
              aria-label="Remove exercise"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {exercises.length < 10 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-2 dark:border-zinc-700">
          <input
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder={t("namePlaceholder")}
            maxLength={80}
            className="min-h-10 rounded-md bg-white px-2 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
          />
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("sets")}
              <input
                type="number"
                min={1}
                max={20}
                value={draft.sets}
                onChange={(e) => setDraft({ ...draft, sets: parseInt(e.target.value) || 1 })}
                className="mt-0.5 w-full rounded-md bg-white px-2 py-1 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("reps")}
              <input
                type="number"
                min={0}
                max={100}
                value={draft.reps}
                onChange={(e) => setDraft({ ...draft, reps: parseInt(e.target.value) || 0 })}
                className="mt-0.5 w-full rounded-md bg-white px-2 py-1 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t("minutes")}
              <input
                type="number"
                min={0}
                max={240}
                value={draft.minutes}
                onChange={(e) => setDraft({ ...draft, minutes: parseInt(e.target.value) || 0 })}
                className="mt-0.5 w-full rounded-md bg-white px-2 py-1 text-sm outline-none dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addExercise}
            disabled={!draft.name.trim()}
            className="flex min-h-11 items-center justify-center gap-1 rounded-lg bg-rose-600 text-xs font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("addButton")}
          </button>
        </div>
      )}

      {exercises.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("emptyHint")}</p>
      )}
    </div>
  );
}
