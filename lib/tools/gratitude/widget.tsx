"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Sparkles } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import type { GratitudePayload } from "./index";

export function GratitudeWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.gratitude");

  const todayIso = new Date().toISOString().slice(0, 10);
  const yesterdayIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const todayEntry = entries.find((e) => e.entry_date === todayIso);
  const yesterdayEntry = entries.find((e) => e.entry_date === yesterdayIso);

  const initial = useMemo<[string, string, string]>(() => {
    const items = (todayEntry?.payload as Partial<GratitudePayload>)?.items ?? [];
    return [items[0] ?? "", items[1] ?? "", items[2] ?? ""];
  }, [todayEntry]);

  const [values, setValues] = useState<[string, string, string]>(initial);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showYesterday, setShowYesterday] = useState(false);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const placeholders = [t("placeholder1"), t("placeholder2"), t("placeholder3")];

  const allFilled = values.every((v) => v.trim().length > 0);

  const persist = async (next: [string, string, string]) => {
    const items = next.map((v) => v.trim()).filter((v) => v.length > 0);
    if (items.length === 0) return;
    try {
      await onEntryAdd({ items });
      if (items.length === 3) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }
    } catch {
      // swallow
    }
  };

  const handleChange = (idx: number, v: string) => {
    const next: [string, string, string] = [...values] as [string, string, string];
    next[idx] = v.slice(0, 200);
    setValues(next);
  };

  const handleBlur = () => {
    void persist(values);
  };

  const yesterdayItems =
    (yesterdayEntry?.payload as Partial<GratitudePayload>)?.items ?? [];

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm dark:border-pink-950 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-400" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          {t("title")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="relative">
            <Sparkles className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-rose-300" />
            <textarea
              value={values[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholders[idx]}
              maxLength={200}
              rows={2}
              className="w-full resize-none rounded-xl border border-pink-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-300 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-100"
            />
          </div>
        ))}
      </div>

      {showCelebration && allFilled && (
        <div className="rounded-lg bg-rose-100 px-3 py-2 text-center text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {t("completeMessage")}
        </div>
      )}

      {yesterdayItems.length > 0 && (
        <div className="mt-1 border-t border-pink-100 pt-2 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setShowYesterday((v) => !v)}
            className="text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            {t("yesterdayLabel")}
          </button>
          {showYesterday && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-600 dark:text-zinc-400">
              {yesterdayItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
