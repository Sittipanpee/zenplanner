/**
 * Blueprint Page — Productivity Tools Catalog (PTS-01-04)
 *
 * Browse all ~40 productivity tools, filter by category, see which are
 * recommended for the user's spirit animal, enable/disable each tool.
 */

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Loader2, Search, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAnimal, getAnimalName } from "@/lib/animal-data";
import { getRecommendedToolIds } from "@/lib/tools/recommendations";
import type { SpiritAnimal } from "@/lib/types";
import type { Locale, ToolCategory } from "@/lib/tools/types";
import { ToolCard, type ToolCardData } from "@/components/blueprint/tool-card";
import { CategoryFilter, type CategoryFilterValue } from "@/components/blueprint/category-filter";
import { RecommendationSection } from "@/components/blueprint/recommendation-section";

interface CatalogTool extends ToolCardData {
  recommendedFor: SpiritAnimal[];
}

interface UserToolRow {
  tool_id: string;
  enabled: boolean;
}

export default function BlueprintPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const locale = useLocale() as Locale;
  const t = useTranslations("tools.catalog");

  const [isLoading, setIsLoading] = useState(true);
  const [catalog, setCatalog] = useState<CatalogTool[]>([]);
  const [enabledIds, setEnabledIds] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [spiritAnimal, setSpiritAnimal] = useState<SpiritAnimal | null>(null);
  const [category, setCategory] = useState<CategoryFilterValue>("all");
  const [search, setSearch] = useState("");

  // Initial parallel fetch: catalog + mine + profile
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const userPromise = supabase.auth.getUser();
        const catalogPromise = fetch("/api/tools/catalog").then((r) => r.json());

        const [{ data: userData }, catalogJson] = await Promise.all([
          userPromise,
          catalogPromise,
        ]);

        const profilePromise = userData?.user
          ? supabase
              .from("profiles")
              .select("spirit_animal")
              .eq("id", userData.user.id)
              .single()
          : Promise.resolve({ data: null });

        const minePromise = userData?.user
          ? fetch("/api/tools/mine").then((r) => (r.ok ? r.json() : { tools: [] }))
          : Promise.resolve({ tools: [] });

        const [profileRes, mineJson] = await Promise.all([profilePromise, minePromise]);

        if (cancelled) return;

        const tools: CatalogTool[] = (catalogJson.tools ?? []).map((t: CatalogTool) => ({
          id: t.id,
          category: t.category,
          name: t.name,
          description: t.description,
          iconName: t.iconName,
          color: t.color,
          recommendedFor: t.recommendedFor ?? [],
        }));

        const enabled = new Set<string>(
          ((mineJson.tools ?? []) as UserToolRow[])
            .filter((row) => row.enabled)
            .map((row) => row.tool_id)
        );

        setCatalog(tools);
        setEnabledIds(enabled);
        if (profileRes?.data?.spirit_animal) {
          setSpiritAnimal(profileRes.data.spirit_animal as SpiritAnimal);
        }
      } catch (err) {
        // Surface failure visibly — never silently swallow
        // eslint-disable-next-line no-console
        console.error("[blueprint] Failed to load catalog:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  // ----------------------------------------------------------------
  // Toggle: optimistic enable/disable
  // ----------------------------------------------------------------
  const setBusy = useCallback((toolId: string, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (busy) next.add(toolId);
      else next.delete(toolId);
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    async (toolId: string, nextEnabled: boolean) => {
      setBusy(toolId, true);
      // Optimistic
      setEnabledIds((prev) => {
        const next = new Set(prev);
        if (nextEnabled) next.add(toolId);
        else next.delete(toolId);
        return next;
      });

      try {
        const res = await fetch(nextEnabled ? "/api/tools/enable" : "/api/tools/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        // Rollback on failure
        // eslint-disable-next-line no-console
        console.error("[blueprint] Toggle failed:", err);
        setEnabledIds((prev) => {
          const next = new Set(prev);
          if (nextEnabled) next.delete(toolId);
          else next.add(toolId);
          return next;
        });
      } finally {
        setBusy(toolId, false);
      }
    },
    [setBusy]
  );

  const handleEnableAll = useCallback(
    async (toolIds: string[]) => {
      // Optimistic + parallel
      setEnabledIds((prev) => {
        const next = new Set(prev);
        toolIds.forEach((id) => next.add(id));
        return next;
      });
      toolIds.forEach((id) => setBusy(id, true));

      const results = await Promise.allSettled(
        toolIds.map((toolId) =>
          fetch("/api/tools/enable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toolId }),
          }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r;
          })
        )
      );

      // Rollback failures
      const failedIds: string[] = [];
      results.forEach((result, idx) => {
        if (result.status === "rejected") failedIds.push(toolIds[idx]);
      });
      if (failedIds.length > 0) {
        // eslint-disable-next-line no-console
        console.error("[blueprint] Enable-all partial failure:", failedIds);
        setEnabledIds((prev) => {
          const next = new Set(prev);
          failedIds.forEach((id) => next.delete(id));
          return next;
        });
      }
      toolIds.forEach((id) => setBusy(id, false));
    },
    [setBusy]
  );

  // ----------------------------------------------------------------
  // Derived: recommended + filtered catalog
  // ----------------------------------------------------------------
  const recommendedTools = useMemo(() => {
    if (!spiritAnimal) return [] as CatalogTool[];
    const recIds = new Set(getRecommendedToolIds(spiritAnimal));
    // Preserve recommendation order
    const order = getRecommendedToolIds(spiritAnimal);
    const byId = new Map(catalog.map((t) => [t.id, t]));
    return order.map((id) => byId.get(id)).filter((t): t is CatalogTool => Boolean(t)).filter((t) => recIds.has(t.id as never));
  }, [catalog, spiritAnimal]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return catalog.filter((tool) => {
      if (category !== "all" && tool.category !== (category as ToolCategory)) return false;
      if (!q) return true;
      // Defensive: tool.name can be undefined for a malformed row — fall back
      // to en, then to tool.id, before giving up. Never crash the catalog.
      const name = (tool.name?.[locale] ?? tool.name?.en ?? tool.id).toLowerCase();
      return name.includes(q);
    });
  }, [catalog, category, search, locale]);

  const animalLabel = spiritAnimal
    ? `${getAnimal(spiritAnimal).emoji} ${getAnimalName(spiritAnimal, locale)}`
    : "";

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="min-h-screen bg-zen-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zen-text-secondary">
          <Loader2 className="w-8 h-8 text-zen-sage animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-28 md:pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border px-4 md:px-8 py-4">
        <div className="flex items-center gap-3 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="p-2 rounded-lg hover:bg-zen-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-sage"
          >
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </button>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-zen-text">
              {t("heroTitle")}
            </h1>
            <p className="text-sm text-zen-text-secondary">
              {spiritAnimal
                ? t("heroSubtitleWithAnimal", { animal: animalLabel })
                : t("heroSubtitleNoAnimal")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6">
        {/* Recommended section */}
        {spiritAnimal && (
          <RecommendationSection
            tools={recommendedTools}
            enabledIds={enabledIds}
            busyIds={busyIds}
            locale={locale}
            onToggle={handleToggle}
            onEnableAll={handleEnableAll}
          />
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zen-text-secondary pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-zen-surface border border-zen-border text-sm text-zen-text placeholder:text-zen-text-secondary focus:outline-none focus:border-zen-sage focus:ring-2 focus:ring-zen-sage/20"
          />
        </div>

        {/* Category filter */}
        <div className="mb-5">
          <CategoryFilter value={category} onChange={setCategory} />
        </div>

        {/* Catalog grid */}
        {filteredCatalog.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zen-border py-12 text-center text-zen-text-secondary">
            {category === "all" ? t("empty") : t("emptyCategory")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCatalog.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                enabled={enabledIds.has(tool.id)}
                recommended={
                  spiritAnimal
                    ? getRecommendedToolIds(spiritAnimal).includes(tool.id as never)
                    : false
                }
                busy={busyIds.has(tool.id)}
                locale={locale}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-zen-surface/95 backdrop-blur-sm border-t border-zen-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-zen-text">
            {t("enabledCount", { count: enabledIds.size })}
          </span>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zen-sage text-white text-sm font-semibold shadow hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-zen-sage"
          >
            {t("goToDashboard")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
