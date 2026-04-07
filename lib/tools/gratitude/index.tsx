"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Sparkles } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps, ToolEntry } from "../types";

// ---------- Schema ----------

export const gratitudeSchema = z.object({
  items: z.array(z.string().min(1).max(200)).min(1).max(5),
});

export type GratitudePayload = z.infer<typeof gratitudeSchema>;

// ---------- Widget ----------

function GratitudeWidget({ entries, onEntryAdd }: ToolWidgetProps) {
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
      // swallow — parent surfaces error toast via onEntryAdd contract
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

// ---------- ToolDefinition ----------

export const gratitude: ToolDefinition = {
  id: "gratitude",
  category: "reflection",
  name: {
    en: "Gratitude",
    th: "ความขอบคุณ",
    zh: "感恩日记",
  },
  description: {
    en: "Three things you're grateful for today.",
    th: "สามสิ่งที่คุณขอบคุณในวันนี้",
    zh: "今天你感激的三件事",
  },
  icon: Heart,
  color: "zen-blossom",
  recommendedFor: ["dove", "sakura", "butterfly", "whale", "bamboo", "cat", "turtle"],
  recommendationReason: {
    en: "A reflective practice that nurtures gentle, appreciative hearts.",
    th: "การฝึกใคร่ครวญที่หล่อเลี้ยงหัวใจที่อ่อนโยนและรู้คุณค่า",
    zh: "一种滋养温柔感恩之心的反思练习",
  },
  schema: gratitudeSchema,
  defaultConfig: {},
  Widget: GratitudeWidget,
  produces: ["gratitude.count", "gratitude.streakDays"],
  consumes: [],
  excel: {
    buildSheet: (entries: ToolEntry[]) => ({
      name: "Gratitude",
      headers: ["Date", "Item 1", "Item 2", "Item 3"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<GratitudePayload>;
        const items = p.items ?? [];
        return [e.entry_date, items[0] ?? "", items[1] ?? "", items[2] ?? ""];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      { address: "B2", value: "Gratitude entries", style: "label" },
      {
        address: "C2",
        value:
          typeof aggregates["gratitude.count"] === "number"
            ? (aggregates["gratitude.count"] as number)
            : 0,
        style: "metric",
      },
      { address: "B3", value: "Streak (days)", style: "label" },
      {
        address: "C3",
        value:
          typeof aggregates["gratitude.streakDays"] === "number"
            ? (aggregates["gratitude.streakDays"] as number)
            : 0,
        style: "metric",
      },
    ],
  },
};
