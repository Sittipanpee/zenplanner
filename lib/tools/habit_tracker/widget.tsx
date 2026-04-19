"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Repeat, Check, Flame } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import {
  habitTrackerSchema,
  type HabitTrackerPayload,
  DEFAULT_HABITS,
} from "./index";

interface HabitConfig {
  habitList: string[];
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);
const yesterdayIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const habitId = (name: string, index: number): string =>
  `${index}_${name.replace(/\s+/g, "_").toLowerCase()}`;

interface ToolEntryLike {
  entry_date: string;
  payload: unknown;
}

export function HabitTrackerWidget({
  config,
  entries,
  onEntryAdd,
  onConfigChange,
}: ToolWidgetProps) {
  const t = useTranslations("tools.habitTracker");

  const habitList = useMemo<string[]>(() => {
    const cfg = config as Partial<HabitConfig>;
    if (Array.isArray(cfg.habitList) && cfg.habitList.length > 0) {
      return cfg.habitList.filter(
        (h): h is string => typeof h === "string" && h.trim().length > 0
      );
    }
    return DEFAULT_HABITS;
  }, [config]);

  const today = todayIso();
  const yesterday = yesterdayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const todayHabits = useMemo<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    if (!todayEntry) return map;
    const parsed = habitTrackerSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return map;
    parsed.data.habits.forEach((h) => map.set(h.id, h.done));
    return map;
  }, [todayEntry]);

  const [localDone, setLocalDone] = useState<Map<string, boolean>>(
    () => new Map(todayHabits)
  );

  const todaySig = useMemo(
    () => Array.from(todayHabits.entries()).map(([k, v]) => `${k}:${v}`).join("|"),
    [todayHabits]
  );
  useEffect(() => {
    setLocalDone(new Map(todayHabits));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaySig]);

  const doneCount = useMemo(() => {
    let n = 0;
    habitList.forEach((name, i) => {
      if (localDone.get(habitId(name, i))) n++;
    });
    return n;
  }, [habitList, localDone]);

  const total = habitList.length;

  const streakDays = useMemo(() => {
    const byDate = new Map<string, ToolEntryLike>();
    for (const e of entries) byDate.set(e.entry_date, e);
    let streak = 0;
    const cursor = new Date(yesterday);
    for (let i = 0; i < 365; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      const entry = byDate.get(iso);
      if (!entry) break;
      const parsed = habitTrackerSchema.safeParse(entry.payload);
      if (!parsed.success) break;
      const habits = parsed.data.habits;
      if (habits.length === 0) break;
      const allDone = habits.every((h) => h.done);
      if (!allDone) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [entries, yesterday]);

  const persistHabits = useCallback(
    async (next: Map<string, boolean>) => {
      const payload: HabitTrackerPayload = {
        habits: habitList.map((name, i) => {
          const id = habitId(name, i);
          return { id, name, done: next.get(id) === true };
        }),
      };
      try {
        await onEntryAdd(payload);
      } catch {
        // Parent surfaces toast.
      }
    },
    [habitList, onEntryAdd]
  );

  const toggleHabit = (id: string) => {
    setLocalDone((prev) => {
      const next = new Map(prev);
      next.set(id, !prev.get(id));
      void persistHabits(next);
      return next;
    });
  };

  const addHabit = async () => {
    const name = `Habit ${habitList.length + 1}`;
    const nextList = [...habitList, name].slice(0, 10);
    try {
      await onConfigChange({ ...(config ?? {}), habitList: nextList });
    } catch {
      // Parent surfaces toast.
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("title")}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("subtitle")}
            </span>
          </div>
        </div>
        {streakDays > 0 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Flame className="h-3 w-3" />
            <span>{t("streak", { days: streakDays })}</span>
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {t("todayCount", { done: doneCount, total })}
        </div>
      )}

      {total === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("noHabits")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {habitList.map((name, i) => {
            const id = habitId(name, i);
            const done = localDone.get(id) === true;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => toggleHabit(id)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition active:scale-[0.98] ${
                    done
                      ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                      : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  }`}
                  aria-pressed={done}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950"
                    }`}
                  >
                    {done && <Check className="h-4 w-4" strokeWidth={3} />}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      done
                        ? "text-emerald-800 dark:text-emerald-200"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {habitList.length < 10 && (
        <button
          type="button"
          onClick={() => void addHabit()}
          className="flex items-center justify-center gap-1 rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
        >
          <Plus className="h-3 w-3" />
          {t("addHabit")}
        </button>
      )}
    </div>
  );
}
