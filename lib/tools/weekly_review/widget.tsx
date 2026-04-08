"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, ArrowRight } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { mondayOfWeek, type WeeklyReviewPayload } from "./index";

export function WeeklyReviewWidget({ entries }: ToolWidgetProps) {
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
