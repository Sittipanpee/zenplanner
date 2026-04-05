/**
 * Blueprint Page
 * Tool selection and customization for planner
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ZenCard, ZenCardHeader } from "@/components/ui/zen-card";
import { ZenButton } from "@/components/ui/zen-button";
import { ToolGrid } from "@/components/planner/tool-grid";
import { getAnimal, getAnimalName } from "@/lib/animal-data";
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import type { ToolId, BlueprintCustomization, SpiritAnimal } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

// Default tool recommendations based on common patterns
const DEFAULT_TOOLS: ToolId[] = [
  "daily_power_block",
  "weekly_compass",
  "morning_clarity",
  "habit_heatmap",
  "mood_tracker",
  "eisenhower_matrix",
  "gratitude_log",
  "streak_tracker",
  "mindfulness_bell",
];

export default function BlueprintPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedTools, setSelectedTools] = useState<ToolId[]>(DEFAULT_TOOLS);
  const [customization, setCustomization] = useState<BlueprintCustomization>({
    color_scheme: "zen-sage",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [spiritAnimal, setSpiritAnimal] = useState<SpiritAnimal | null>(null);
  const locale = useLocale() as 'en' | 'th' | 'zh';
  const t = useTranslations('planner.blueprint');

  // Fetch user's existing blueprint AND spirit_animal from profile on mount
  useEffect(() => {
    const fetchBlueprint = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch spirit_animal from profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("spirit_animal")
            .eq("id", user.id)
            .single();

          if (profile?.spirit_animal) {
            setSpiritAnimal(profile.spirit_animal as SpiritAnimal);
          }

          const { data: blueprints } = await supabase
            .from("planner_blueprints")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (blueprints) {
            setBlueprintId(blueprints.id);
            setSelectedTools(blueprints.tool_selection || []);
            if (blueprints.customization) {
              setCustomization(blueprints.customization);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching blueprint:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlueprint();
  }, [supabase]);

  const handleToggleTool = async (toolId: ToolId) => {
    const newSelection = selectedTools.includes(toolId)
      ? selectedTools.filter((t) => t !== toolId)
      : [...selectedTools, toolId];

    setSelectedTools(newSelection);

    // Save to localStorage for fallback
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("zenplanner_selected_tools", JSON.stringify(newSelection));
      } catch {}
    }

    // Save to database
    if (blueprintId) {
      await supabase
        .from("planner_blueprints")
        .update({ tool_selection: newSelection })
        .eq("id", blueprintId);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Not logged in - use mock generation
        setTimeout(() => {
          router.push("/generate");
        }, 1500);
        return;
      }

      // Create or update blueprint
      let bid = blueprintId;

      if (!bid) {
        // Create new blueprint
        const { data: newBlueprint, error } = await supabase
          .from("planner_blueprints")
          .insert({
            user_id: user.id,
            title: "My ZenPlanner",
            description: "Personalized planner based on spirit animal",
            spirit_animal: spiritAnimal || "lion",
            archetype_code: spiritAnimal ? `${spiritAnimal}-default` : "lion-leader",
            tool_selection: selectedTools,
            customization,
            status: "draft",
          })
          .select()
          .single();

        if (error) throw error;
        bid = newBlueprint?.id;
      }

      // Navigate to generate page with blueprint ID
      router.push(`/generate?blueprintId=${bid}`);
    } catch (error) {
      console.error("Error creating blueprint:", error);
      // Fallback to mock generation
      setTimeout(() => {
        router.push("/generate");
      }, 1500);
    }

    setIsGenerating(false);
  };

  // Loading skeleton component
  if (isLoading) {
    return (
      <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
        {/* Header */}
        <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 md:px-8 py-4">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <button onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
            </button>
            <div>
              <h1 className="font-display text-xl md:text-2xl font-bold text-zen-text">
                {t('title')}
              </h1>
              <p className="text-sm text-zen-text-secondary">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="max-w-4xl mx-auto px-4 mt-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-zen-sage animate-spin mb-4" />
            <p className="text-zen-text-secondary">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zen-bg pb-20 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-zen-bg/95 backdrop-blur-sm border-b border-zen-border z-10 px-4 md:px-8 py-4">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-5 h-5 text-zen-text-secondary" />
          </button>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-zen-text">
              {t('title')}
            </h1>
            <p className="text-sm text-zen-text-secondary">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <ZenCard>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-5 h-5 text-zen-gold" />
            <span className="font-semibold text-zen-text">
              {t('spiritAnimal')}: {spiritAnimal ? `${getAnimalName(spiritAnimal, locale)} ${getAnimal(spiritAnimal).emoji}` : t('noAnimal')}
            </span>
          </div>
          <p className="text-sm text-zen-text-secondary">
            {t('subtitle')}
          </p>
        </ZenCard>
      </div>

      {/* Tool Selection */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zen-text">
            {t('selectedTools')} ({selectedTools.length})
          </h2>
        </div>

        <ToolGrid selectedTools={selectedTools} onToggleTool={handleToggleTool} customization={customization} />
      </div>

      {/* Action - Fixed on mobile, inline on desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-zen-surface border-t border-zen-border p-4 md:relative md:bg-transparent md:border-0 md:p-0 pb-safe">
        <div className="max-w-md md:max-w-4xl mx-auto">
          <ZenButton
            fullWidth
            size="lg"
            onClick={handleGenerate}
            isLoading={isGenerating}
          >
            {t('generate')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </ZenButton>
        </div>
      </div>
    </main>
  );
}