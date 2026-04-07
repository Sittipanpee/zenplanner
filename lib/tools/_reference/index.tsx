/**
 * Reference Tool — "Word of the Day"
 *
 * This is the canonical example Wave-1 agents COPY when implementing
 * a real ToolDefinition. It is intentionally NOT registered in
 * `lib/tools/_all.ts` and not part of the 40-tool registry — it exists
 * purely as a copy-paste template.
 *
 * What it demonstrates:
 *   - A complete `ToolDefinition` with every field populated.
 *   - A working React widget using `useTranslations` from next-intl.
 *   - A tool-specific Zod schema for entry payloads.
 *   - `produces` / `consumes` arrays.
 *   - `excel.buildSheet` and `excel.buildDashboardSection` placeholders
 *     that return clear shapes for the M4 Excel agent to fill in.
 *   - Mobile-first Tailwind classes.
 *
 * Wave-1 file convention:
 *   lib/tools/{tool_id}/index.tsx   ← Widget + ToolDefinition export
 *   lib/tools/{tool_id}/schema.ts   ← (optional) extracted Zod schema
 *
 * The exported `wordOfTheDay` here is what your `_all.ts` entry should
 * look like once your real tool replaces a stub.
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps } from "../types";

// ---------- Schema ----------

export const wordOfTheDaySchema = z.object({
  word: z.string().min(1).max(64),
  learnedAt: z.string(), // ISO timestamp
});

export type WordOfTheDayPayload = z.infer<typeof wordOfTheDaySchema>;

// ---------- Sample word source ----------

const SAMPLE_WORDS: Record<"en" | "th" | "zh", string> = {
  en: "Equanimity",
  th: "อุเบกขา",
  zh: "平等心",
};

// ---------- Widget ----------

function WordOfTheDayWidget({ entries, onEntryAdd, locale }: ToolWidgetProps) {
  const t = useTranslations("tools");
  const [saving, setSaving] = useState(false);
  const word = SAMPLE_WORDS[locale] ?? SAMPLE_WORDS.en;

  const todayIso = new Date().toISOString().slice(0, 10);
  const learnedToday = entries.some((e) => e.entry_date === todayIso);

  const handleLearn = async () => {
    if (saving || learnedToday) return;
    setSaving(true);
    try {
      const payload: WordOfTheDayPayload = {
        word,
        learnedAt: new Date().toISOString(),
      };
      await onEntryAdd(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Word of the Day
        </span>
      </div>
      <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{word}</p>
      <button
        type="button"
        onClick={handleLearn}
        disabled={saving || learnedToday}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {learnedToday ? t("entry.savedToast") : t("widget.expand")}
      </button>
    </div>
  );
}

// ---------- ToolDefinition ----------

/**
 * Reference ToolDefinition. NOTE: the `id` here is intentionally NOT in
 * the `ToolId` union — we cast it because this tool is not registered.
 * Your real tool's `id` MUST be a real `ToolId` literal.
 */
export const wordOfTheDay: ToolDefinition = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: "_reference_word_of_the_day" as any,
  category: "creativity",
  name: {
    en: "Word of the Day",
    th: "คำศัพท์ประจำวัน",
    zh: "每日一词",
  },
  description: {
    en: "Learn one new word every day.",
    th: "เรียนรู้คำศัพท์ใหม่ทุกวัน",
    zh: "每天学习一个新词",
  },
  icon: Sparkles,
  color: "zen-amber",
  recommendedFor: [],
  recommendationReason: {
    en: "A daily micro-habit for curious minds.",
    th: "นิสัยเล็กๆ รายวันสำหรับผู้อยากรู้",
    zh: "为好奇心提供的每日微习惯",
  },
  schema: wordOfTheDaySchema,
  defaultConfig: {
    sourceLanguage: "en",
  },
  Widget: WordOfTheDayWidget,
  produces: [],
  consumes: [],
  excel: {
    buildSheet: (entries) => ({
      name: "Word of the Day",
      headers: ["Date", "Word", "Learned At"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<WordOfTheDayPayload>;
        return [e.entry_date, p.word ?? "", p.learnedAt ?? ""];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      {
        address: "B2",
        value: "Words learned",
        style: "label",
      },
      {
        address: "C2",
        value: typeof aggregates.totalWords === "number" ? aggregates.totalWords : 0,
        style: "metric",
      },
    ],
  },
};
