/**
 * ZenPlanner Generator
 * Orchestrates planner generation from blueprint to download
 */

import { generatePlannerWorkbook } from "./sheet-builder";
import { calculateToolRecommendations, ANIMAL_TOOLS } from "./archetype-map";
import { callLLMJson } from "./llm";
import type { PlannerBlueprint, AxisScores, LifestyleProfile, ToolId } from "./types";
import { ALL_TOOL_IDS } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface GenerationProgress {
  total: number;
  completed: number;
  current: string;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}

/**
 * Generate complete planner from blueprint
 */
export async function generatePlanner(
  supabase: SupabaseClient,
  blueprint: PlannerBlueprint,
  onProgress?: (progress: GenerationProgress) => void
): Promise<{
  blueprint: PlannerBlueprint;
  downloadUrl: string;
  expiresAt: Date;
}> {
  try {
    onProgress?.({
      total: 5,
      completed: 0,
      current: "Initializing...",
      status: "running",
    });

    let toolSelection = blueprint.tool_selection as ToolId[];
    let lifestyleProfile: LifestyleProfile | null = null;

    // Step 1 & 2: Fetch session data & get base tool recommendations
    if (blueprint.quiz_session_id) {
      onProgress?.({
        total: 5,
        completed: 1,
        current: "Analyzing profile...",
        status: "running",
      });

      const { data: sessionData, error } = await supabase
        .from("quiz_sessions")
        .select("lifestyle_profile, axis_scores")
        .eq("id", blueprint.quiz_session_id)
        .single();

      if (error) {
        if (process.env.DEBUG_MODE === "true") {
          console.warn(`[DBG] Could not fetch quiz session ${blueprint.quiz_session_id}:`, error.message);
        }
      }

      const axisScores = sessionData?.axis_scores as AxisScores | null;
      lifestyleProfile = sessionData?.lifestyle_profile as LifestyleProfile | null;

      if (axisScores) {
        toolSelection = calculateToolRecommendations(axisScores);
      }
    }

    // Fallback if no tools were selected
    if (toolSelection.length === 0) {
      toolSelection = ANIMAL_TOOLS[blueprint.spirit_animal || "bamboo"];
    }

    // Step 3: Customize tools with LLM if a lifestyle profile exists
    onProgress?.({
      total: 5,
      completed: 2,
      current: "Customizing tools with AI...",
      status: "running",
    });

    let finalTools = toolSelection;
    if (lifestyleProfile && Object.keys(lifestyleProfile).length > 0) {
      finalTools = await customizeToolsWithProfile(toolSelection, lifestyleProfile);
    }

    // Step 4: Generate workbook
    onProgress?.({
      total: 5,
      completed: 3,
      current: "Generating planner...",
      status: "running",
    });

    const workbookBuffer = await generatePlannerWorkbook({
      blueprint: {
        ...blueprint,
        tool_selection: finalTools,
      },
      format: "google_sheets",
    });

    // Step 5: Upload to Supabase Storage
    onProgress?.({
      total: 5,
      completed: 4,
      current: "Uploading planner...",
      status: "running",
    });

    const userId = blueprint.user_id;
    const jobId = blueprint.id || crypto.randomUUID();
    const storagePath = `${userId}/${jobId}.xlsx`;

    const { error: uploadError } = await supabase.storage
      .from("planners")
      .upload(storagePath, Buffer.from(workbookBuffer), {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // Get signed URL (1 hour expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("planners")
      .createSignedUrl(storagePath, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message || "No URL returned"}`);
    }

    const downloadUrl = signedUrlData.signedUrl;
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    // Update generation_jobs record if it exists
    await supabase
      .from("generation_jobs")
      .update({ download_url: downloadUrl, status: "completed" })
      .eq("blueprint_id", blueprint.id);

    onProgress?.({
      total: 5,
      completed: 5,
      current: "Done!",
      status: "completed",
    });

    return {
      blueprint: {
        ...blueprint,
        tool_selection: finalTools,
      },
      downloadUrl,
      expiresAt,
    };
  } catch (error) {
    onProgress?.({
      total: 5,
      completed: 0,
      current: "Error",
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw error;
  }
}

/**
 * Customize tools based on lifestyle profile using LLM
 */
async function customizeToolsWithProfile(
  baseTools: ToolId[],
  profile: LifestyleProfile
): Promise<ToolId[]> {
  try {
    const response = await callLLMJson<{ tools: string[] }>(
      `You are a planner tool expert. Based on the user's lifestyle profile, recommend which tools to include or remove from their planner.

Current tools: ${baseTools.join(", ")}

User profile:
- Schedule: ${profile.schedule}
- Energy pattern: ${profile.energy_pattern}
- Goals: ${profile.goals?.join(", ") || "Not specified"}
- Obstacles: ${profile.obstacles?.join(", ") || "Not specified"}

Return a JSON with "tools" array of tool IDs (from this list only):
${ALL_TOOL_IDS.join(", ")}

Keep 6-10 tools maximum.`,
      [],
      { maxTokens: 500 }
    );

    if (response.tools && Array.isArray(response.tools)) {
      return response.tools as ToolId[];
    }
  } catch (e) {
    if (process.env.DEBUG_MODE === "true") {
      console.warn("[DBG] Failed to customize tools with LLM, using defaults:", e);
    }
  }

  return baseTools;
}
