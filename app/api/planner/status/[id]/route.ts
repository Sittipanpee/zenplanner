/**
 * Planner Status API
 * Check generation job status
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get generation job with blueprint info
    const { data: job, error } = await supabase
      .from("generation_jobs")
      .select(`
        *,
        planner_blueprints (
          title,
          spirit_animal,
          archetype_code
        )
      `)
      .eq("id", id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify user owns the job (via blueprint)
    const { data: blueprint } = await supabase
      .from("planner_blueprints")
      .select("user_id")
      .eq("id", job.blueprint_id)
      .single();

    if (!blueprint || blueprint.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate progress percentage
    const progress =
      job.total_sheets > 0
        ? Math.round((job.completed_sheets / job.total_sheets) * 100)
        : 0;

    return NextResponse.json({
      id: job.id,
      status: job.status,
      progress,
      totalSheets: job.total_sheets,
      completedSheets: job.completed_sheets,
      currentSheet: job.current_sheet,
      error: job.error,
      outputUrl: job.output_url,
      blueprint: job.planner_blueprints
        ? {
            title: job.planner_blueprints.title,
            spiritAnimal: job.planner_blueprints.spirit_animal,
            archetypeCode: job.planner_blueprints.archetype_code,
          }
        : null,
    });
  } catch (error) {
    console.error("Planner status error:", error);
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 });
  }
}
