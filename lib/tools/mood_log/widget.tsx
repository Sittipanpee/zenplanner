"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Smile } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import type { MoodLogPayload } from "./index";

const MOOD_EMOJI = ["😢", "😕", "😐", "🙂", "😄"] as const;
const MOOD_LABEL_KEYS = [
  "emojiLabels.veryBad",
  "emojiLabels.bad",
  "emojiLabels.neutral",
  "emojiLabels.good",
  "emojiLabels.veryGood",
] as const;

export function MoodLogWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.moodLog");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find((e) => e.entry_date === todayIso);
  const todayMood =
    todayEntry && typeof (todayEntry.payload as MoodLogPayload).mood === "number"
      ? (todayEntry.payload as MoodLogPayload).mood
      : selected;

  const last7 = useMemo<Array<{ date: string; mood: number | null }>>(() => {
    const out: Array<{ date: string; mood: number | null }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const e = entries.find((x) => x.entry_date === iso);
      const m = e ? Number((e.payload as MoodLogPayload).mood) : null;
      out.push({ date: iso, mood: Number.isFinite(m as number) ? (m as number) : null });
    }
    return out;
  }, [entries]);

  const hasTrend = last7.some((d) => d.mood !== null);

  const handleSelect = async (mood: number) => {
    if (saving) return;
    setSelected(mood);
    setSaving(true);
    try {
      const payload: MoodLogPayload = {
        mood,
        ...(note.trim() ? { note: note.trim().slice(0, 200) } : {}),
      };
      await onEntryAdd(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Smile className="h-4 w-4 text-amber-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>

      <div className="grid grid-cols-5 gap-2">
        {MOOD_EMOJI.map((emoji, idx) => {
          const value = idx + 1;
          const isActive = todayMood === value;
          return (
            <button
              key={value}
              type="button"
              aria-label={t(MOOD_LABEL_KEYS[idx])}
              onClick={() => handleSelect(value)}
              disabled={saving}
              className={`flex min-h-[56px] items-center justify-center rounded-xl border text-2xl transition active:scale-95 disabled:opacity-50 ${
                isActive
                  ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-amber-950"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              }`}
            >
              {emoji}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShowNote((v) => !v)}
        className="self-start text-xs text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
      >
        {t("noteLabel")}
      </button>
      {showNote && (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 200))}
          maxLength={200}
          placeholder={t("noteLabel")}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
        />
      )}

      {hasTrend && (
        <div className="mt-1">
          <p className="mb-1 text-[10px] uppercase tracking-wide text-zinc-500">
            {t("trendLabel")}
          </p>
          <div className="flex h-8 items-end gap-1">
            {last7.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-sm bg-amber-200 dark:bg-amber-700"
                style={{
                  height: d.mood ? `${(d.mood / 5) * 100}%` : "4%",
                  opacity: d.mood ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
