"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { gratitudeThreeSchema, todayIso } from "./index";

export function GratitudeThreeWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.gratitudeThree");
  const today = todayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initial = useMemo<[string, string, string]>(() => {
    if (!todayEntry) return ["", "", ""];
    const parsed = gratitudeThreeSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return ["", "", ""];
    const items = parsed.data.items;
    return [items[0] ?? "", items[1] ?? "", items[2] ?? ""];
  }, [todayEntry]);

  const [slots, setSlots] = useState<[string, string, string]>(initial);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSlots(initial);
  }, [initial]);

  const persist = async (next: [string, string, string]) => {
    try {
      await onEntryAdd({ items: next.filter((s) => s.trim().length > 0) });
    } catch {
      /* parent surfaces toast */
    }
  };

  const schedule = (next: [string, string, string]) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void persist(next), 500);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const updateSlot = (i: 0 | 1 | 2, value: string) => {
    const next: [string, string, string] = [...slots] as [string, string, string];
    next[i] = value.slice(0, 200);
    setSlots(next);
    schedule(next);
  };

  const allFilled = slots.every((s) => s.trim().length > 0);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 to-amber-50 p-4 shadow-sm dark:border-zinc-800 dark:from-rose-950/20 dark:to-amber-950/20">
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      {(["0", "1", "2"] as const).map((idx) => {
        const i = Number(idx) as 0 | 1 | 2;
        return (
          <div key={idx} className="flex items-start gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
              {i + 1}
            </span>
            <textarea
              value={slots[i]}
              onChange={(e) => updateSlot(i, e.target.value)}
              onBlur={() => void persist(slots)}
              placeholder={t(`placeholder${i + 1}`)}
              rows={2}
              maxLength={200}
              className="min-h-12 w-full resize-none rounded-xl border border-rose-200 bg-white/80 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-rose-400 dark:border-rose-900/40 dark:bg-zinc-900/60 dark:text-zinc-100"
            />
          </div>
        );
      })}

      {allFilled && (
        <p className="text-center text-xs text-rose-600 dark:text-rose-400">✨ {t("completeMessage")}</p>
      )}
    </div>
  );
}
