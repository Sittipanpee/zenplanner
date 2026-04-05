/**
 * Quiz Complete API
 * Finalize quiz results and calculate archetype
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { determineAnimal, generateInsight } from "@/lib/quiz-engine";
import { generatePersonalityNarrative } from "@/lib/quiz-prompts";
import type { AxisScores, SpiritAnimal } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      sessionId,
      axisScores,
      spiritAnimal,
      lifestyleProfile,
    } = await request.json();

    // Validate required fields
    if (!axisScores) {
      return NextResponse.json({ error: "Missing axis scores" }, { status: 400 });
    }

    // Detect locale from Accept-Language header or query param
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    const localeParam = request.nextUrl.searchParams.get("locale") ?? "";
    let locale: "en" | "th" | "zh" = "th";
    if (localeParam === "en" || localeParam === "zh") {
      locale = localeParam;
    } else if (localeParam === "th") {
      locale = "th";
    } else if (acceptLanguage.startsWith("zh")) {
      locale = "zh";
    } else if (acceptLanguage.startsWith("en")) {
      locale = "en";
    }

    // Calculate archetype if not provided
    let finalAnimal: SpiritAnimal;
    let finalScores: AxisScores;
    let insight = "";

    if (spiritAnimal) {
      finalAnimal = spiritAnimal;
      finalScores = axisScores;
      insight = await generateInsight(finalAnimal, finalScores);
    } else {
      finalScores = axisScores;
      finalAnimal = determineAnimal(finalScores);
      insight = await generateInsight(finalAnimal, finalScores);
    }

    // Determine archetype code from animal
    const archetypeCode = getArchetypeCode(finalAnimal);

    // Generate AI personality narrative
    const archetypeTitle = getArchetypeTitle(finalAnimal);
    const narrative = await generatePersonalityNarrative({
      spiritAnimal: finalAnimal,
      axisScores: finalScores,
      archetypeTitle,
      locale,
    });

    // Update or create quiz session
    if (sessionId) {
      const { error: updateError } = await supabase
        .from("quiz_sessions")
        .update({
          axis_scores: finalScores,
          spirit_animal: finalAnimal,
          archetype_code: archetypeCode,
          lifestyle_profile: lifestyleProfile,
          status: "complete",
          phase: "complete",
          narrative: narrative,
        })
        .eq("id", sessionId);

      if (updateError) {
        console.error("Failed to update quiz session:", updateError);
      }
    }

    // Update user profile with spirit animal
    await supabase
      .from("profiles")
      .update({
        spirit_animal: finalAnimal,
        archetype_code: archetypeCode,
      })
      .eq("id", user.id);

    // Log activity
    await supabase.from("activity_log").insert({
      user_id: user.id,
      activity_type: "quiz_complete",
      metadata: {
        spirit_animal: finalAnimal,
        archetype_code: archetypeCode,
      },
    });

    return NextResponse.json({
      spiritAnimal: finalAnimal,
      archetypeCode,
      axisScores: finalScores,
      insight,
      narrative,
    });
  } catch (error) {
    console.error("Quiz complete error:", error);
    return NextResponse.json({ error: "Failed to complete quiz" }, { status: 500 });
  }
}

/**
 * Get archetype code from spirit animal
 */
function getArchetypeCode(animal: SpiritAnimal): string {
  const codes: Record<SpiritAnimal, string> = {
    lion: "DASESL",
    whale: "NASHLG",
    dolphin: "NSSGKS",
    owl: "NAHPLG",
    fox: "DASPLS",
    turtle: "NAHHKG",
    eagle: "DASBLG",
    octopus: "NSSGKS",
    mountain: "NAHHLS",
    wolf: "DASGLS",
    sakura: "NAHPKG",
    cat: "NAHPLS",
    crocodile: "NASBLS",
    dove: "NAHPKG",
    butterfly: "NSSGKG",
    bamboo: "NAHHLG",
  };
  // Fallback to first archetype code if animal not found (should not happen)
  return codes[animal] ?? "DASESL";
}

/**
 * Get human-readable archetype title for narrative generation
 */
function getArchetypeTitle(animal: SpiritAnimal): string {
  const titles: Record<SpiritAnimal, string> = {
    lion: "The Radiant Commander",
    whale: "The Deep Thinker",
    dolphin: "The Joyful Connector",
    owl: "The Wise Observer",
    fox: "The Clever Adaptor",
    turtle: "The Steady Pace Keeper",
    eagle: "The Visionary Soarer",
    octopus: "The Creative Problem Solver",
    mountain: "The Unshakable Anchor",
    wolf: "The Loyal Pack Leader",
    sakura: "The Gentle Bloomer",
    cat: "The Graceful Independent",
    crocodile: "The Strategic Hunter",
    dove: "The Peaceful Harmonizer",
    butterfly: "The Transformational Explorer",
    bamboo: "The Steady Grower",
  };
  return titles[animal] ?? "The Unique Soul";
}
