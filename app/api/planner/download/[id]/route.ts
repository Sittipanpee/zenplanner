/**
 * Planner Download API
 * Download generated planner file
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

    // Get generated planner record
    const { data: planner, error } = await supabase
      .from("generated_planners")
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

    if (error || !planner) {
      return NextResponse.json({ error: "Planner not found" }, { status: 404 });
    }

    // Verify user owns the planner
    if (planner.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if download URL is expired
    if (planner.expires_at && new Date(planner.expires_at) < new Date()) {
      return NextResponse.json({ error: "Download link expired" }, { status: 410 });
    }

    // If we have a direct URL, redirect to it
    if (planner.download_url) {
      // Log download activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        activity_type: "planner_download",
        metadata: {
          planner_id: id,
          blueprint_id: planner.blueprint_id,
          format: planner.format,
        },
      });

      return NextResponse.redirect(planner.download_url);
    }

    // If no URL, return error
    return NextResponse.json({ error: "No download available" }, { status: 404 });
  } catch (error) {
    console.error("Planner download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
