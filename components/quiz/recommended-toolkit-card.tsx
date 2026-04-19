"use client";

/**
 * RecommendedToolkitCard
 * Post-quiz "Your recommended toolkit" section (PTS-01-05).
 * Renders the 5-8 tools matched to the user's spirit animal and
 * routes to /blueprint?autoEnable=1 for one-tap setup.
 */

import Link from "next/link";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { SpiritAnimal } from "@/lib/types";
import { getRecommendedToolIds } from "@/lib/tools/recommendations";
import { getToolById } from "@/lib/tools/registry";
import type { ToolDefinition, Locale as AppLocale } from "@/lib/tools/types";
import { ZenCard } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { Sparkles, ArrowRight } from "lucide-react";

interface RecommendedToolkitCardProps {
  animalKey: SpiritAnimal;
  animalName: string;
}

const TOP_PICK_COUNT = 3;

export function RecommendedToolkitCard({
  animalKey,
  animalName,
}: RecommendedToolkitCardProps) {
  const t = useTranslations("quiz.reveal.toolkit");
  const locale = useLocale() as AppLocale;

  const tools: ToolDefinition[] = useMemo(() => {
    const ids = getRecommendedToolIds(animalKey);
    return ids
      .map((id) => getToolById(id))
      .filter((t): t is ToolDefinition => Boolean(t));
  }, [animalKey]);

  if (tools.length === 0) return null;

  // next-intl doesn't support ICU {animal} as a plain placeholder without
  // declaring it — we hand-interpolate after translating the template.
  const subtitleRaw = t("subtitle", { animal: animalName });

  return (
    <div className="max-w-md mx-auto px-4 pt-4" data-testid="recommended-toolkit">
      <ZenCard className="p-5">
        <p className="text-xs font-semibold text-zen-sage uppercase tracking-widest mb-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          {t("title")}
        </p>
        <p className="text-xs text-zen-text-muted dark:text-zinc-500 mb-4">
          {subtitleRaw}
        </p>

        {/* Mobile: horizontal scroll snap. sm+: 2-col grid. */}
        <div
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-1 px-1 pb-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:pb-0"
          role="list"
        >
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            const isTopPick = i < TOP_PICK_COUNT;
            const name = tool.name?.[locale] ?? tool.name?.en ?? tool.id;
            const desc = tool.description?.[locale] ?? tool.description?.en ?? "";
            return (
              <div
                key={tool.id}
                role="listitem"
                className={`relative snap-start flex-shrink-0 w-40 sm:w-auto rounded-xl border p-3 bg-zen-surface dark:bg-zinc-800/60 ${
                  isTopPick
                    ? "border-zen-sage/40 dark:border-zen-sage/40 ring-1 ring-zen-sage/20"
                    : "border-zen-border dark:border-zinc-700"
                }`}
              >
                {isTopPick && (
                  <span className="absolute -top-2 right-2 text-[10px] font-semibold bg-zen-sage text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    {t("topPickBadge")}
                  </span>
                )}
                <div className="flex items-start gap-2 mb-1.5">
                  <Icon className="w-4 h-4 text-zen-sage flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-zen-text dark:text-zinc-100 leading-tight">
                    {name}
                  </p>
                </div>
                <p className="text-xs text-zen-text-muted dark:text-zinc-500 line-clamp-2">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>

        <Link href="/blueprint?autoEnable=1" className="block mt-4 sm:max-w-xs sm:mx-auto">
          <ZenButton fullWidth>
            {t("ctaSetup")}
            <ArrowRight className="w-4 h-4 ml-2" />
          </ZenButton>
        </Link>
      </ZenCard>
    </div>
  );
}
