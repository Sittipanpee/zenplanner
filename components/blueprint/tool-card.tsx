"use client";

/**
 * ToolCard — single tool tile in the blueprint catalog.
 * Tap anywhere to toggle. Shows enabled/disabled state and recommended badge.
 */

import { useTranslations } from "next-intl";
import * as LucideIcons from "lucide-react";
import { Check, Sparkles, Box, type LucideIcon } from "lucide-react";
import type { Locale, ToolCategory } from "@/lib/tools/types";

export interface ToolCardData {
  id: string;
  category: ToolCategory;
  name: { en: string; th: string; zh: string };
  description: { en: string; th: string; zh: string };
  iconName: string;
  color: string;
}

interface ToolCardProps {
  tool: ToolCardData;
  enabled: boolean;
  recommended: boolean;
  busy: boolean;
  locale: Locale;
  onToggle: (toolId: string, nextEnabled: boolean) => void;
}

function resolveIcon(iconName: string): LucideIcon {
  const lib = LucideIcons as unknown as Record<string, LucideIcon>;
  return lib[iconName] ?? Box;
}

export function ToolCard({
  tool,
  enabled,
  recommended,
  busy,
  locale,
  onToggle,
}: ToolCardProps) {
  const t = useTranslations("tools.catalog");
  const Icon = resolveIcon(tool.iconName);
  // Defensive: tool.name can be undefined for a malformed catalog row.
  // Fall back to en, then to tool.id, before giving up. Never crash render.
  const name = tool.name?.[locale] ?? tool.name?.en ?? tool.id;
  const description = tool.description?.[locale] ?? tool.description?.en ?? "";

  const handleClick = () => {
    if (busy) return;
    onToggle(tool.id, !enabled);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={enabled}
      className={[
        "group relative w-full text-left rounded-2xl border p-4 transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-sage",
        enabled
          ? "border-emerald-400/60 bg-emerald-50/60 dark:bg-emerald-900/20 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_24px_-12px_rgba(16,185,129,0.45)]"
          : "border-zen-border bg-zen-surface hover:border-zen-sage/60 hover:shadow-md",
        busy ? "opacity-60 cursor-wait" : "cursor-pointer",
      ].join(" ")}
    >
      {recommended && (
        <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-zen-gold/90 text-white text-[10px] font-semibold px-2 py-0.5 shadow">
          <Sparkles className="w-3 h-3" />
          {t("recommended")}
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={[
            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
            enabled
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
              : "bg-zen-bg text-zen-sage",
          ].join(" ")}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-zen-text truncate">{name}</h3>
            <span
              className={[
                "shrink-0 inline-flex items-center justify-center rounded-full text-[10px] font-medium px-2 py-0.5",
                "bg-zen-bg text-zen-text-secondary border border-zen-border",
              ].join(" ")}
            >
              {tool.category}
            </span>
          </div>
          <p className="mt-1 text-sm text-zen-text-secondary line-clamp-2">
            {description}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span
              className={[
                "text-xs font-medium",
                enabled ? "text-emerald-600 dark:text-emerald-300" : "text-zen-text-secondary",
              ].join(" ")}
            >
              {enabled ? t("enabled") : t("enable")}
            </span>
            <span
              role="switch"
              aria-checked={enabled}
              className={[
                "relative inline-block w-10 h-6 rounded-full transition-colors",
                enabled ? "bg-emerald-500" : "bg-zen-border",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center transition-transform",
                  enabled ? "translate-x-4" : "translate-x-0",
                ].join(" ")}
              >
                {enabled && <Check className="w-3 h-3 text-emerald-600" />}
              </span>
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
