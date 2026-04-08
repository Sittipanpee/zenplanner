"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, ArrowRight } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { todayIso, type DailyReflectionPayload } from "./index";

export function DailyReflectionWidget({ entries }: ToolWidgetProps) {
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
