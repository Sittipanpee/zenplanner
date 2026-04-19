"use client";

/**
 * RecommendationSection — wraps the "recommended for your archetype" tools.
 * Provides "Enable all" bulk action that fires parallel POST /api/tools/enable.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { ToolCard, type ToolCardData } from "./tool-card";
import type { Locale } from "@/lib/tools/types";

interface RecommendationSectionProps {
  tools: ToolCardData[];
  enabledIds: Set<string>;
  busyIds: Set<string>;
  locale: Locale;
  onToggle: (toolId: string, nextEnabled: boolean) => void;
  onEnableAll: (toolIds: string[]) => Promise<void>;
}

export function RecommendationSection({
  tools,
  enabledIds,
  busyIds,
  locale,
  onToggle,
  onEnableAll,
}: RecommendationSectionProps) {
  const t = useTranslations("tools.catalog");
  const tRec = useTranslations("tools.recommendation");
  const [enablingAll, setEnablingAll] = useState(false);

  if (tools.length === 0) return null;

  const remainingIds = tools.filter((tool) => !enabledIds.has(tool.id)).map((tool) => tool.id);
  const allEnabled = remainingIds.length === 0;

  const handleEnableAll = async () => {
    if (allEnabled || enablingAll) return;
    setEnablingAll(true);
    try {
      await onEnableAll(remainingIds);
    } finally {
      setEnablingAll(false);
    }
  };

  return (
    <section className="mb-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-zen-gold" />
          <h2 className="font-display text-lg font-semibold text-zen-text">
            {tRec("title")}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleEnableAll}
          disabled={allEnabled || enablingAll}
          className={[
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-sage",
            allEnabled
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 cursor-default"
              : "bg-zen-gold text-white hover:brightness-110",
            enablingAll && "opacity-60 cursor-wait",
          ].join(" ")}
        >
          {allEnabled ? t("enabled") : tRec("enableAll")}
        </button>
      </div>
      <p className="text-sm text-zen-text-secondary mb-4">{tRec("subtitle")}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="transition-all duration-300"
          >
            <ToolCard
              tool={tool}
              enabled={enabledIds.has(tool.id)}
              recommended={true}
              busy={busyIds.has(tool.id)}
              locale={locale}
              onToggle={onToggle}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
