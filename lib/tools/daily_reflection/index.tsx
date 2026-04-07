/**
 * Daily Reflection — heavy-data reflection tool.
 *
 * Dashboard widget: summary/CTA linking to full-page editor.
 * Full editor route: app/(app)/tools/daily-reflection/page.tsx
 */

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, ArrowRight } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps } from "../types";

// ---------- Schema ----------

export const dailyReflectionSchema = z.object({
  highlight: z.string().max(400),
  challenge: z.string().max(400),
  tomorrowIntent: z.string().max(400),
});

export type DailyReflectionPayload = z.infer<typeof dailyReflectionSchema>;

/** Today as YYYY-MM-DD (local-day resolution). */
export function todayIso(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// ---------- Widget ----------

function DailyReflectionWidget({ entries }: ToolWidgetProps) {
  const t = useTranslations("tools.dailyReflection");
  const today = todayIso();
  const todays = entries.find((e) => e.entry_date === today);
  const payload = todays?.payload as Partial<DailyReflectionPayload> | undefined;
  const hasHighlight = Boolean(payload?.highlight?.trim());

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-pink-500" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>
      {hasHighlight ? (
        <>
          <p className="line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
            {payload?.highlight}
          </p>
          <Link
            href="/tools/daily-reflection"
            className="inline-flex items-center gap-1 text-sm font-medium text-pink-600 hover:underline dark:text-pink-400"
          >
            {t("title")} <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-500">{t("noReflection")}</p>
          <Link
            href="/tools/daily-reflection"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("ctaReflect")}
          </Link>
        </>
      )}
    </div>
  );
}

// ---------- ToolDefinition ----------

export const dailyReflection: ToolDefinition = {
  id: "daily_reflection",
  category: "reflection",
  name: {
    en: "Daily Reflection",
    th: "ทบทวนประจำวัน",
    zh: "每日反思",
  },
  description: {
    en: "Three short prompts to close the day mindfully.",
    th: "สามคำถามสั้นๆ ปิดท้ายวันอย่างมีสติ",
    zh: "三个简短的问题，用心结束一天",
  },
  icon: BookOpen,
  color: "zen-blossom",
  recommendedFor: [
    "whale",
    "sakura",
    "dove",
    "cat",
    "bamboo",
    "butterfly",
    "turtle",
  ],
  recommendationReason: {
    en: "Your archetype grows through gentle, reflective journaling.",
    th: "อาร์คีไทป์ของคุณเติบโตผ่านการเขียนทบทวนอย่างอ่อนโยน",
    zh: "你的原型通过温柔的反思式写作而成长",
  },
  schema: dailyReflectionSchema,
  defaultConfig: {},
  Widget: DailyReflectionWidget,
  produces: ["reflection.completedDays", "reflection.weeklyHighlights"],
  consumes: [],
  excel: {
    buildSheet: (entries) => ({
      name: "Daily Reflection",
      headers: ["Date", "Highlight", "Challenge", "Tomorrow intent"],
      rows: entries.map((e) => {
        const p = e.payload as Partial<DailyReflectionPayload>;
        return [
          e.entry_date,
          p.highlight ?? "",
          p.challenge ?? "",
          p.tomorrowIntent ?? "",
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      {
        address: "B2",
        value: "Days reflected",
        style: "label",
      },
      {
        address: "C2",
        value:
          typeof aggregates["reflection.completedDays"] === "number"
            ? aggregates["reflection.completedDays"]
            : 0,
        style: "metric",
      },
    ],
  },
};
