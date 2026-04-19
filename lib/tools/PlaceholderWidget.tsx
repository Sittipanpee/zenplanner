/**
 * Preview widget for stub tools that don't yet have a real implementation.
 *
 * These tools are intentionally listed in the catalog so users can see
 * the full planned toolkit, but their interactive experience is not yet
 * built. The preview widget makes this clear without apologizing.
 *
 * A "preview" badge is shown on the card and the body invites the user
 * to check back soon. Clicking the widget routes to a feedback form
 * (stubbed to /blueprint for now).
 */

"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ToolWidgetProps } from "./types";

const COPY: Record<"en" | "th" | "zh", {
  preview: string;
  title: string;
  body: string;
  cta: string;
}> = {
  en: {
    preview: "Preview",
    title: "This tool is on the roadmap",
    body: "It's already reserved in your toolkit. The interactive widget will ship in a future update.",
    cta: "Browse other tools",
  },
  th: {
    preview: "กำลังพัฒนา",
    title: "เครื่องมือนี้อยู่ในแผนงาน",
    body: "จองไว้ในชุดเครื่องมือของคุณแล้ว ส่วนที่โต้ตอบได้จะปล่อยในรอบอัปเดตถัดไป",
    cta: "ดูเครื่องมืออื่น",
  },
  zh: {
    preview: "预览",
    title: "此工具已在规划中",
    body: "已为你预留在工具包内，互动功能将在后续更新中发布。",
    cta: "浏览其他工具",
  },
};

export function PlaceholderWidget({ locale, toolId }: ToolWidgetProps) {
  const copy = COPY[locale] ?? COPY.en;
  return (
    <div className="relative flex w-full flex-col gap-3 rounded-2xl border border-zen-sage/30 bg-gradient-to-br from-zen-sage/5 to-zen-gold/5 p-4 text-sm dark:border-zen-sage/40 dark:from-zen-sage/10 dark:to-zen-gold/10">
      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-zen-sage/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zen-sage dark:bg-zen-sage/20">
        <Sparkles className="h-3 w-3" />
        {copy.preview}
      </span>
      <div className="flex flex-col gap-1 pr-20">
        <span className="font-semibold text-zen-text dark:text-zinc-100">
          {copy.title}
        </span>
        <span className="text-xs leading-relaxed text-zen-text-secondary dark:text-zinc-400">
          {copy.body}
        </span>
      </div>
      <Link
        href="/blueprint"
        className="inline-flex w-fit items-center gap-1 rounded-full border border-zen-sage/30 bg-white/40 px-3 py-1 text-xs font-medium text-zen-sage hover:bg-white/70 dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70"
      >
        {copy.cta} →
      </Link>
      <p className="sr-only">Tool id: {toolId}</p>
    </div>
  );
}
