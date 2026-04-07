/**
 * Shared placeholder widget used by every Wave-0 stub ToolDefinition.
 * Wave-1 agents replace this with the real per-tool Widget component.
 */

"use client";

import type { ToolWidgetProps } from "./types";

const COPY: Record<"en" | "th" | "zh", { title: string; body: string }> = {
  en: { title: "Coming soon", body: "This tool is being built. Check back shortly." },
  th: { title: "กำลังจะมาเร็วๆ นี้", body: "เครื่องมือนี้กำลังพัฒนา โปรดกลับมาตรวจสอบอีกครั้ง" },
  zh: { title: "即将推出", body: "此工具正在开发中，请稍后查看。" },
};

export function PlaceholderWidget({ locale }: ToolWidgetProps) {
  const copy = COPY[locale] ?? COPY.en;
  return (
    <div className="flex w-full flex-col items-start gap-1 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className="font-medium text-zinc-800 dark:text-zinc-100">{copy.title}</span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{copy.body}</span>
    </div>
  );
}
