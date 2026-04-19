"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import type { WeeklyIntentionsPayload } from "./index";
import { mondayOfCurrentWeek } from "./index";

export function WeeklyIntentionsWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.weeklyIntentions");

  const weekKey = useMemo(() => mondayOfCurrentWeek(), []);

  const weekEntry = entries.find((e) => e.entry_date === weekKey);

  const initial = useMemo<[string, string, string]>(() => {
    const intentions =
      (weekEntry?.payload as Partial<WeeklyIntentionsPayload>)?.intentions ?? [];
    return [intentions[0] ?? "", intentions[1] ?? "", intentions[2] ?? ""];
  }, [weekEntry]);

  const [values, setValues] = useState<[string, string, string]>(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  const placeholders = [
    t("placeholder1"),
    t("placeholder2"),
    t("placeholder3"),
  ];

  const persist = async (next: [string, string, string]) => {
    const intentions = next.map((v) => v.trim());
    const hasAny = intentions.some((v) => v.length > 0);
    if (!hasAny) return;
    try {
      await onEntryAdd({
        intentions,
        setAt: new Date().toISOString(),
      });
    } catch {
      // swallow — silent errors are acceptable here; user can retry on next blur
    }
  };

  const handleChange = (idx: number, v: string) => {
    const next: [string, string, string] = [...values] as [string, string, string];
    next[idx] = v.slice(0, 300);
    setValues(next);
  };

  const handleBlur = () => {
    void persist(values);
  };

  // Derive week-of display string from weekKey (YYYY-MM-DD)
  const weekOfDisplay = useMemo(() => {
    const d = new Date(weekKey + "T00:00:00");
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [weekKey]);

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-sm dark:border-green-950 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-emerald-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
          {t("title")}
        </span>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      {/* Week label */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        {t("weekOf")} {weekOfDisplay}
      </p>

      {/* Intention inputs */}
      <div className="flex flex-col gap-2">
        {([0, 1, 2] as const).map((idx) => (
          <div key={idx} className="relative">
            <Flag className="pointer-events-none absolute left-3 top-3 h-3.5 w-3.5 text-emerald-300" />
            <textarea
              aria-label={placeholders[idx]}
              value={values[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholders[idx]}
              maxLength={300}
              rows={2}
              className="w-full resize-none rounded-xl border border-green-100 bg-white/70 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-300 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
