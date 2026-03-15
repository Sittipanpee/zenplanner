/**
 * Planner Generate API
 * Generate and return planner workbook
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlanner } from "@/lib/planner-generator";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blueprintId } = await request.json();

    // Get blueprint from DB
    const { data: blueprint, error: blueprintError } = await supabase
      .from("planner_blueprints")
      .select("*")
      .eq("id", blueprintId)
      .eq("user_id", user.id)
      .single();

    if (blueprintError || !blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    // Generate planner
    const result = await generatePlanner(supabase, blueprint, (progress) => {
      console.log("Generation progress:", progress);
    });

    // Store generated planner in DB
    await supabase.from("generated_planners").insert({
      user_id: user.id,
      blueprint_id: blueprintId,
      format: "google_sheets",
      download_url: result.downloadUrl,
      expires_at: result.expiresAt.toISOString(),
    });

    // Update blueprint status
    await supabase
      .from("planner_blueprints")
      .update({ status: "completed" })
      .eq("id", blueprintId);

    return NextResponse.json({
      downloadUrl: result.downloadUrl,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Generate planner error:", error);
    return NextResponse.json({ error: "Failed to generate planner" }, { status: 500 });
  }
}