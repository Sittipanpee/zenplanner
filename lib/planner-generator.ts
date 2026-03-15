/**
 * ZenPlanner Generator
 * Orchestrates planner generation from blueprint to download
 */

import { generatePlannerWorkbook } from "./sheet-builder";
import { calculateToolRecommendations, ANIMAL_TOOLS } from "./archetype-map";
import { callLLMJson } from "./llm";
import type { PlannerBlueprint, AxisScores, LifestyleProfile, ToolId } from "./types";
import { ALL_TOOL_IDS } from "./types";
import { SupabaseClient } from "@supabase/supabase-js";

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
        .from('quiz_sessions')
        .select('lifestyle_profile, axis_scores')
        .eq('id', blueprint.quiz_session_id)
        .single();

      if (error) {
        console.warn(`Could not fetch quiz session ${blueprint.quiz_session_id}:`, error.message);
      }
      
      const axisScores = sessionData?.axis_scores as AxisScores | null;
      lifestyleProfile = sessionData?.lifestyle_profile as LifestyleProfile | null;

      if (axisScores) {
        console.log("Found axis scores. Calculating recommendations...");
        toolSelection = calculateToolRecommendations(axisScores);
      }
    }
    
    // Fallback if no tools were selected
    if (toolSelection.length === 0) {
      toolSelection = ANIMAL_TOOLS[blueprint.spirit_animal || 'bamboo'];
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
      console.log("Found lifestyle profile. Customizing tools with LLM...");
      finalTools = await customizeToolsWithProfile(toolSelection, lifestyleProfile);
    } else {
      console.log("No lifestyle profile found, using score-based or default tools.");
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
      format: "google_sheets", // Default to Google Sheets format
    });

    // Step 5: Upload to storage (placeholder)
    onProgress?.({
      total: 5,
      completed: 4,
      current: "Preparing download...",
      status: "running",
    });

    const blob = new Blob([workbookBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const downloadUrl = URL.createObjectURL(blob);

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
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
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
    // Use LLM to suggest tool modifications based on lifestyle
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
    console.warn("Failed to customize tools with LLM, using defaults:", e);
  }

  return baseTools;
}