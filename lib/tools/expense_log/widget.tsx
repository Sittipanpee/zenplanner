"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { expenseLogSchema, todayIso } from "./index";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
}

const CATEGORIES = ["food", "transport", "shopping", "bills", "fun", "other"] as const;
const randomId = () => Math.random().toString(36).slice(2, 10);

export function ExpenseLogWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.expenseLog");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initial = useMemo<Expense[]>(() => {
    if (!todayEntry) return [];
    const parsed = expenseLogSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.expenses : [];
  }, [todayEntry]);

  const [expenses, setExpenses] = useState<Expense[]>(initial);
  const [draft, setDraft] = useState<{ amount: string; category: string; note: string }>({
    amount: "",
    category: "food",
    note: "",
  });

  useEffect(() => {
    setExpenses(initial);
  }, [initial]);

  const persist = async (next: Expense[]) => {
    try {
      await onEntryAdd({ expenses: next });
    } catch {
      /* parent surfaces */
    }
  };

  const addExpense = () => {
    const amt = parseFloat(draft.amount);
    if (!Number.isFinite(amt) || amt <= 0 || expenses.length >= 15) return;
    const next: Expense[] = [
      ...expenses,
      { id: randomId(), amount: Math.round(amt * 100) / 100, category: draft.category, note: draft.note.slice(0, 80) },
    ];
    setExpenses(next);
    setDraft({ amount: "", category: draft.category, note: "" });
    void persist(next);
  };

  const removeExpense = (id: string) => {
    const next = expenses.filter((x) => x.id !== id);
    setExpenses(next);
    void persist(next);
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
          </div>
        </div>
        {total > 0 && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            {t("total", { amount: total.toFixed(2) })}
          </span>
        )}
      </div>

      <ul className="flex flex-col gap-1">
        {expenses.map((x) => (
          <li
            key={x.id}
            className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {x.amount.toFixed(2)}
            </span>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {t(`categories.${x.category}`)}
            </span>
            <span className="flex-1 truncate text-xs text-zinc-500 dark:text-zinc-400">{x.note}</span>
            <button
              type="button"
              onClick={() => removeExpense(x.id)}
              aria-label="Remove expense"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 active:scale-95 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {expenses.length < 15 && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-300 p-2 dark:border-zinc-700">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min={0}
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              placeholder="0.00"
              className="min-h-10 w-24 rounded-md border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              className="min-h-10 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addExpense();
                }
              }}
              placeholder={t("notePlaceholder")}
              maxLength={80}
              className="min-h-10 flex-1 rounded-md border border-zinc-200 bg-white px-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={addExpense}
              disabled={!parseFloat(draft.amount)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-zinc-900 text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("emptyHint")}</p>
      )}
    </div>
  );
}
