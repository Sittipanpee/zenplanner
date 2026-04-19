"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { quarterlyVisionSchema, periodKey } from "./index";

export function QuarterlyVisionWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.quarterlyVision");
  const key = periodKey();
  const current = useMemo(() => entries.find((e) => e.entry_date === key), [entries, key]);
  const initial = useMemo(() => {
    if (!current) return { objective: "", keyResults: "", reflection: "" };
    const p = quarterlyVisionSchema.safeParse(current.payload);
    return p.success ? p.data : { objective: "", keyResults: "", reflection: "" };
  }, [current]);

  const [data, setData] = useState(initial);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setData(initial), [initial]);

  const schedule = (next: typeof data) => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      void onEntryAdd(next).catch(() => {});
    }, 600);
  };

  const update = (field: keyof typeof data, value: string) => {
    const next = { ...data, [field]: value.slice(0, 400) };
    setData(next); schedule(next);
  };

  useEffect(() => () => { if (debounce.current) clearTimeout(debounce.current); }, []);

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Compass className="h-4 w-4 text-zen-clay" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{t("title")}</span>
          <span className="text-xs text-zinc-500">{t("subtitle")}</span>
        </div>
      </div>
      <div key="objective" className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("fields.objective")}</label><textarea value={data.objective} onChange={(e) => update("objective", e.target.value)} placeholder={t("placeholders.objective")} rows={3} maxLength={400} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
      <div key="keyResults" className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("fields.keyResults")}</label><textarea value={data.keyResults} onChange={(e) => update("keyResults", e.target.value)} placeholder={t("placeholders.keyResults")} rows={3} maxLength={400} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
      <div key="reflection" className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t("fields.reflection")}</label><textarea value={data.reflection} onChange={(e) => update("reflection", e.target.value)} placeholder={t("placeholders.reflection")} rows={3} maxLength={400} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
      <p className="text-right text-xs text-zinc-400">{key}</p>
    </div>
  );
}
