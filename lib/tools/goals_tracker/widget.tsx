"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Goal, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { goalsTrackerSchema } from "./index";

interface GoalItem {
  id: string;
  text: string;
  progress: number;
}

const randomId = () => Math.random().toString(36).slice(2, 10);
const CONFIG_KEY = "goals";

export function GoalsTrackerWidget({ config, onConfigChange }: ToolWidgetProps) {
  const t = useTranslations("tools.goalsTracker");

  const initial = useMemo<GoalItem[]>(() => {
    const raw = (config as { [k: string]: unknown })[CONFIG_KEY];
    const parsed = goalsTrackerSchema.safeParse({ goals: raw });
    return parsed.success ? parsed.data.goals : [];
  }, [config]);

  const [goals, setGoals] = useState<GoalItem[]>(initial);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setGoals(initial);
  }, [initial]);

  const persist = async (next: GoalItem[]) => {
    try {
      await onConfigChange({ ...config, [CONFIG_KEY]: next });
    } catch {
      /* parent surfaces */
    }
  };

  const addGoal = () => {
    const text = draft.trim();
    if (!text || goals.length >= 8) return;
    const next = [...goals, { id: randomId(), text: text.slice(0, 140), progress: 0 }];
    setGoals(next);
    setDraft("");
    void persist(next);
  };

  const updateProgress = (id: string, progress: number) => {
    const next = goals.map((g) => (g.id === id ? { ...g, progress: Math.max(0, Math.min(100, progress)) } : g));
    setGoals(next);
    void persist(next);
  };

  const removeGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    void persist(next);
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Goal className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {goals.map((g) => (
          <li
            key={g.id}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-2">
              <span className="flex-1 text-sm text-zinc-900 dark:text-zinc-100">{g.text}</span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {g.progress}%
              </span>
              <button
                type="button"
                onClick={() => removeGoal(g.id)}
                aria-label="Remove goal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-400 active:scale-95 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={g.progress}
              onChange={(e) => updateProgress(g.id, parseInt(e.target.value))}
              aria-label={`Progress for ${g.text}`}
              className="h-2 w-full accent-amber-500"
            />
          </li>
        ))}
      </ul>

      {goals.length < 8 && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGoal();
              }
            }}
            placeholder={t("addPlaceholder")}
            maxLength={140}
            className="min-h-12 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={addGoal}
            disabled={!draft.trim()}
            aria-label="Add goal"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      )}

      {goals.length === 0 && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("emptyHint")}</p>
      )}
    </div>
  );
}
