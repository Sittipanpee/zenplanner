"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Brain } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { brainDumpSchema, todayIso, yesterdayIso } from "./index";

export function BrainDumpWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.brainDump");
  const today = todayIso();
  const yesterday = yesterdayIso();

  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );
  const yesterdayEntry = useMemo(
    () => entries.find((e) => e.entry_date === yesterday),
    [entries, yesterday]
  );

  const initial = useMemo(() => {
    if (!todayEntry) return "";
    const parsed = brainDumpSchema.safeParse(todayEntry.payload);
    return parsed.success ? parsed.data.content : "";
  }, [todayEntry]);

  const [content, setContent] = useState(initial);
  const [showYesterday, setShowYesterday] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  const persist = async (value: string) => {
    try {
      await onEntryAdd({ content: value.slice(0, 2000) });
    } catch {
      /* parent surfaces toast */
    }
  };

  const schedule = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void persist(value), 800);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const yesterdayContent = useMemo(() => {
    if (!yesterdayEntry) return "";
    const parsed = brainDumpSchema.safeParse(yesterdayEntry.payload);
    return parsed.success ? parsed.data.content : "";
  }, [yesterdayEntry]);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</span>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          schedule(e.target.value);
        }}
        onBlur={() => void persist(content)}
        placeholder={t("placeholder")}
        rows={6}
        maxLength={2000}
        className="min-h-32 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
      />

      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{t("charCount", { count: content.length, max: 2000 })}</span>
        {yesterdayContent && (
          <button
            type="button"
            onClick={() => setShowYesterday((v) => !v)}
            className="underline transition hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {t("yesterdayLabel")}
          </button>
        )}
      </div>

      {showYesterday && yesterdayContent && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {yesterdayContent}
        </div>
      )}
    </div>
  );
}
