/**
 * Daily Priorities — top 3 priorities for today.
 *
 * Mobile-first widget. Three editable rows. Auto-saves on change (debounced 400ms).
 * Renders today's entry only — if no entry exists for today, shows 3 empty slots.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Target, Trash2 } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps, WorkbookSheet } from "../types";

// ---------- Schema ----------

export const dailyPrioritiesSchema = z.object({
  priorities: z
    .array(
      z.object({
        text: z.string().min(1).max(140),
        done: z.boolean(),
      })
    )
    .max(3),
});

export type DailyPrioritiesPayload = z.infer<typeof dailyPrioritiesSchema>;

interface PrioritySlot {
  text: string;
  done: boolean;
}

const EMPTY_SLOTS: PrioritySlot[] = [
  { text: "", done: false },
  { text: "", done: false },
  { text: "", done: false },
];

const todayIso = (): string => new Date().toISOString().slice(0, 10);

// ---------- Widget ----------

function DailyPrioritiesWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.dailyPriorities");

  const today = todayIso();
  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initialSlots = useMemo<PrioritySlot[]>(() => {
    if (!todayEntry) return [...EMPTY_SLOTS];
    const parsed = dailyPrioritiesSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return [...EMPTY_SLOTS];
    const next = [...EMPTY_SLOTS];
    parsed.data.priorities.forEach((p, i) => {
      if (i < 3) next[i] = { text: p.text, done: p.done };
    });
    return next;
  }, [todayEntry]);

  const [slots, setSlots] = useState<PrioritySlot[]>(initialSlots);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-sync when entries from server change (e.g. after refresh).
  useEffect(() => {
    setSlots(initialSlots);
  }, [initialSlots]);

  const persist = useCallback(async () => {
    const filtered = slotsRef.current
      .filter((s) => s.text.trim().length > 0)
      .map((s) => ({ text: s.text.trim().slice(0, 140), done: s.done }));
    const payload: DailyPrioritiesPayload = { priorities: filtered };
    try {
      await onEntryAdd(payload);
    } catch {
      // Parent surfaces toast — we keep local state for retry on next change.
    }
  }, [onEntryAdd]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist();
    }, 400);
  }, [persist]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateSlot = (index: number, patch: Partial<PrioritySlot>) => {
    setSlots((prev) => {
      const next = prev.map((s, i) => (i === index ? { ...s, ...patch } : s));
      return next;
    });
    scheduleSave();
  };

  const clearSlot = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { text: "", done: false } : s))
    );
    scheduleSave();
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {slots.map((slot, index) => {
          const isEmpty = slot.text.trim().length === 0;
          return (
            <li
              key={index}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* 48x48 tap target wrapping the checkbox for WCAG 2.5.5 */}
              <label
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg transition active:scale-95 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                aria-label={`Priority ${index + 1} done`}
              >
                <input
                  type="checkbox"
                  checked={slot.done}
                  disabled={isEmpty}
                  onChange={(e) => updateSlot(index, { done: e.target.checked })}
                  className="h-6 w-6 cursor-pointer rounded border-zinc-300 text-emerald-600 transition focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
                />
              </label>
              <input
                type="text"
                value={slot.text}
                placeholder={t("addPlaceholder")}
                maxLength={140}
                onChange={(e) => updateSlot(index, { text: e.target.value })}
                onBlur={() => void persist()}
                aria-label={`Priority ${index + 1} text`}
                className={`min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
                  slot.done
                    ? "text-zinc-400 line-through dark:text-zinc-600"
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              />
              {/* 48x48 tap target for the trash action */}
              <button
                type="button"
                onClick={() => clearSlot(index)}
                disabled={isEmpty}
                aria-label={`Clear priority ${index + 1}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          );
        })}
      </ul>

      {slots.every((s) => s.text.trim().length === 0) && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("emptyHint")}
        </p>
      )}
    </div>
  );
}

// ---------- ToolDefinition ----------

export const dailyPriorities: ToolDefinition = {
  id: "daily_priorities",
  category: "productivity",
  name: {
    en: "Daily Priorities",
    th: "ลำดับความสำคัญวันนี้",
    zh: "今日要务",
  },
  description: {
    en: "Pick your top 3 priorities for today.",
    th: "เลือก 3 สิ่งสำคัญที่สุดสำหรับวันนี้",
    zh: "选择今天最重要的 3 件事",
  },
  icon: Target,
  color: "zen-sage",
  recommendedFor: ["lion", "eagle", "wolf", "mountain", "fox", "crocodile"],
  recommendationReason: {
    en: "Three clear priorities each day keep goal-driven minds focused on what actually moves the needle.",
    th: "สามสิ่งสำคัญต่อวันช่วยให้ผู้มุ่งเป้าหมายโฟกัสกับสิ่งที่สร้างผลลัพธ์จริง",
    zh: "每天三个清晰的要务，让目标驱动者专注于真正推动进展的事情。",
  },
  schema: dailyPrioritiesSchema,
  defaultConfig: {},
  Widget: DailyPrioritiesWidget,
  produces: ["priorities.doneCount", "priorities.total"],
  consumes: [],
  excel: {
    buildSheet: (entries): WorkbookSheet => ({
      name: "Daily Priorities",
      headers: [
        "Date",
        "Priority 1",
        "Done?",
        "Priority 2",
        "Done?",
        "Priority 3",
        "Done?",
      ],
      rows: entries.map((e) => {
        const parsed = dailyPrioritiesSchema.safeParse(e.payload);
        const list = parsed.success ? parsed.data.priorities : [];
        const slot = (i: number) => {
          const p = list[i];
          return p
            ? ([p.text, p.done] as [string, boolean])
            : (["", false] as [string, boolean]);
        };
        const [t1, d1] = slot(0);
        const [t2, d2] = slot(1);
        const [t3, d3] = slot(2);
        return [e.entry_date, t1, d1, t2, d2, t3, d3];
      }),
    }),
    buildDashboardSection: () => [
      {
        address: "B2",
        value: "Priorities Done This Week",
        style: "label",
      },
      {
        address: "C2",
        value: "=SUM(...)",
        style: "metric",
      },
    ],
  },
};
