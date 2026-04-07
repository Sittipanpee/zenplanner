/**
 * Weekly Review — heavy-data reflection tool.
 *
 * Dashboard widget: summary card linking to the full-page editor.
 * Full editor route: app/(app)/tools/weekly-review/page.tsx
 */

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, ArrowRight } from "lucide-react";
import { z } from "zod";
import type { ToolDefinition, ToolWidgetProps } from "../types";

// ---------- Schema ----------

export const weeklyReviewSchema = z.object({
  wins: z.array(z.string().min(1).max(400)).max(5),
  losses: z.array(z.string().min(1).max(400)).max(5),
  nextWeekFocus: z.string().max(400),
  overallRating: z.number().int().min(1).max(5),
});

export type WeeklyReviewPayload = z.infer<typeof weeklyReviewSchema>;

// ---------- Shared helpers ----------

/** Monday of current ISO week, as YYYY-MM-DD. Exported for the route page. */
export function mondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

// ---------- Widget ----------

function WeeklyReviewWidget({ entries }: ToolWidgetProps) {
  const t = useTranslations("tools.weeklyReview");
  const weekKey = mondayOfWeek();
  const thisWeek = entries.find((e) => e.entry_date === weekKey);
  const payload = thisWeek?.payload as Partial<WeeklyReviewPayload> | undefined;

  const winsCount = payload?.wins?.length ?? 0;
  const hasFocus = Boolean(payload?.nextWeekFocus?.trim());

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("title")}
        </span>
      </div>
      {thisWeek ? (
        <>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {winsCount} {t("winsLabel").toLowerCase()}
            {hasFocus ? ` · 1 ${t("nextFocusLabel").toLowerCase()}` : ""}
          </p>
          <Link
            href="/tools/weekly-review"
            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            {t("title")} <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-500">{t("noReviewYet")}</p>
          <Link
            href="/tools/weekly-review"
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

export const weeklyReview: ToolDefinition = {
  id: "weekly_review",
  category: "reflection",
  name: {
    en: "Weekly Review",
    th: "รีวิวประจำสัปดาห์",
    zh: "每周回顾",
  },
  description: {
    en: "Reflect on your week — wins, losses, focus, and rating.",
    th: "ทบทวนสัปดาห์ของคุณ — ชัยชนะ ความท้าทาย โฟกัส และคะแนน",
    zh: "回顾你的一周 — 成就、挑战、重点和评分",
  },
  icon: CalendarDays,
  color: "zen-sage",
  recommendedFor: ["mountain", "owl", "eagle", "lion", "crocodile", "turtle"],
  recommendationReason: {
    en: "Your archetype thrives on structured reflection and deliberate next-step planning.",
    th: "อาร์คีไทป์ของคุณเติบโตจากการทบทวนอย่างเป็นระบบและการวางแผนก้าวต่อไปอย่างตั้งใจ",
    zh: "你的原型善于通过结构化的回顾和有意识地规划下一步来成长。",
  },
  schema: weeklyReviewSchema,
  defaultConfig: {},
  Widget: WeeklyReviewWidget,
  produces: ["weeklyReview.winsCount", "weeklyReview.averageRating"],
  consumes: ["habit.completionRate", "priorities.doneCount"],
  excel: {
    buildSheet: (entries) => ({
      name: "Weekly Review",
      headers: [
        "Week of",
        "Wins",
        "Losses",
        "Next week focus",
        "Rating",
      ],
      rows: entries.map((e) => {
        const p = e.payload as Partial<WeeklyReviewPayload>;
        return [
          e.entry_date,
          (p.wins ?? []).join(" | "),
          (p.losses ?? []).join(" | "),
          p.nextWeekFocus ?? "",
          typeof p.overallRating === "number" ? p.overallRating : "",
        ];
      }),
    }),
    buildDashboardSection: (aggregates) => [
      {
        address: "B2",
        value: "Average weekly rating",
        style: "label",
      },
      {
        address: "C2",
        value:
          typeof aggregates.averageRating === "number"
            ? aggregates.averageRating
            : 0,
        style: "metric",
      },
    ],
  },
};
