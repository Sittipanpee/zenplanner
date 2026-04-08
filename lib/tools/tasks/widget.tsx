"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckSquare, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { tasksSchema, type TasksPayload } from "./index";

interface TaskItem {
  id: string;
  text: string;
  done: boolean;
}

const MAX_ITEMS = 8;

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const genId = (): string =>
  `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function TasksWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.tasks");

  const today = todayIso();
  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initialItems = useMemo<TaskItem[]>(() => {
    if (!todayEntry) return [];
    const parsed = tasksSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return [];
    return parsed.data.items.map((i) => ({ ...i }));
  }, [todayEntry]);

  const [items, setItems] = useState<TaskItem[]>(initialItems);
  const [draft, setDraft] = useState("");
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const persist = useCallback(async () => {
    const payload: TasksPayload = {
      items: itemsRef.current
        .filter((i) => i.text.trim().length > 0)
        .slice(0, MAX_ITEMS)
        .map((i) => ({
          id: i.id,
          text: i.text.trim().slice(0, 140),
          done: i.done,
        })),
    };
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

  const addTask = () => {
    const text = draft.trim();
    if (text.length === 0) return;
    if (items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, { id: genId(), text, done: false }]);
    setDraft("");
    // Instant save on add — no debounce needed for create.
    setTimeout(() => void persist(), 0);
  };

  const toggleDone = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
    // Instant save for toggle per spec.
    setTimeout(() => void persist(), 0);
  };

  const removeTask = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    scheduleSave();
  };

  const canAdd = draft.trim().length > 0 && items.length < MAX_ITEMS;

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          placeholder={t("addPlaceholder")}
          maxLength={140}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTask();
            }
          }}
          aria-label={t("addPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
        <button
          type="button"
          onClick={addTask}
          disabled={!canAdd}
          aria-label={t("addButton")}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition active:scale-95 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("emptyHint")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <label
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg transition active:scale-95 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                aria-label={`Task ${item.text} done`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleDone(item.id)}
                  className="h-6 w-6 cursor-pointer rounded border-zinc-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700"
                />
              </label>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${
                  item.done
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {item.text}
              </span>
              <button
                type="button"
                onClick={() => removeTask(item.id)}
                aria-label={`Remove ${item.text}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
