/**
 * Quiz Complete API
 * Finalize quiz results and calculate archetype
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { determineAnimal, generateInsight } from "@/lib/quiz-engine";
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

    // Calculate archetype if not provided
    let finalAnimal: SpiritAnimal;
    let finalScores: AxisScores;
    let insight = "";

    if (spiritAnimal) {
      finalAnimal = spiritAnimal;
      finalScores = axisScores;
      // Generate insight
      insight = await generateInsight(finalAnimal, finalScores);
    } else {
      finalScores = axisScores;
      finalAnimal = determineAnimal(finalScores);
      insight = await generateInsight(finalAnimal, finalScores);
    }

    // Determine archetype code from animal
    const archetypeCode = getArchetypeCode(finalAnimal);

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
  return codes[animal];
}
