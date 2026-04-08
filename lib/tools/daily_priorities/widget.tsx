"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { dailyPrioritiesSchema, type DailyPrioritiesPayload } from "./index";

interface PrioritySlot {
  text: string;
  done: boolean;
}

const EMPTY_SLOTS: PrioritySlot[] = [
  { text: "", done: false },
  { text: "", done: false },
  { text: "", done: false },
];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export function DailyPrioritiesWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.dailyPriorities");

  const today = todayIso();
  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initialSlots = useMemo<PrioritySlot[]>(() => {
    if (!todayEntry) return [...EMPTY_SLOTS];
    const parsed = dailyPrioritiesSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return [...EMPTY_SLOTS];
    const next = [...EMPTY_SLOTS];
    parsed.data.priorities.forEach((p, i) => {
      if (i < 3) next[i] = { text: p.text, done: p.done };
    });
    return next;
  }, [todayEntry]);

  const [slots, setSlots] = useState<PrioritySlot[]>(initialSlots);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  const persist = useCallback(async () => {
    const filtered = slotsRef.current
      .filter((s) => s.text.trim().length > 0)
      .map((s) => ({ text: s.text.trim().slice(0, 140), done: s.done }));
    const payload: DailyPrioritiesPayload = { priorities: filtered };
    try {
      await onEntryAdd(payload);
    } catch {
      // Parent surfaces toast.
    }
  }, [onEntryAdd]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist();
    }, 400);
  }, [persist]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateSlot = (index: number, patch: Partial<PrioritySlot>) => {
    setSlots((prev) => {
      const next = prev.map((s, i) => (i === index ? { ...s, ...patch } : s));
      return next;
    });
    scheduleSave();
  };

  const clearSlot = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { text: "", done: false } : s))
    );
    scheduleSave();
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {slots.map((slot, index) => {
          const isEmpty = slot.text.trim().length === 0;
          return (
            <li
              key={index}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <label
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg transition active:scale-95 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                aria-label={`Priority ${index + 1} done`}
              >
                <input
                  type="checkbox"
                  checked={slot.done}
                  disabled={isEmpty}
                  onChange={(e) => updateSlot(index, { done: e.target.checked })}
                  className="h-6 w-6 cursor-pointer rounded border-zinc-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
                />
              </label>
              <input
                type="text"
                value={slot.text}
                placeholder={t("addPlaceholder")}
                maxLength={140}
                onChange={(e) => updateSlot(index, { text: e.target.value })}
                onBlur={() => void persist()}
                aria-label={`Priority ${index + 1} text`}
                className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                  slot.done
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              />
              <button
                type="button"
                onClick={() => clearSlot(index)}
                disabled={isEmpty}
                aria-label={`Clear priority ${index + 1}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          );
        })}
      </ul>

      {slots.every((s) => s.text.trim().length === 0) && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("emptyHint")}
        </p>
      )}
    </div>
  );
}
