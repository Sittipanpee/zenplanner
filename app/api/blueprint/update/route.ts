/**
 * Blueprint Update API
 * Update blueprint tool selection or customization
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isToolId } from "@/lib/types";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { blueprintId, toolSelection, customization } = await request.json();

    if (!blueprintId) {
      return NextResponse.json({ error: "Missing blueprintId" }, { status: 400 });
    }

    // Verify blueprint belongs to user
    const { data: blueprint, error: fetchError } = await supabase
      .from("planner_blueprints")
      .select("*")
      .eq("id", blueprintId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    // Validate tool selection if provided
    let validatedToolSelection = blueprint.tool_selection;
    if (toolSelection && Array.isArray(toolSelection)) {
      validatedToolSelection = toolSelection.filter((tool) => isToolId(tool));
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (validatedToolSelection) {
      updateData.tool_selection = validatedToolSelection;
    }
    if (customization) {
      updateData.customization = { ...blueprint.customization, ...customization };
    }

    // Update blueprint
    const { data: updatedBlueprint, error: updateError } = await supabase
      .from("planner_blueprints")
      .update(updateData)
      .eq("id", blueprintId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update blueprint:", updateError);
      return NextResponse.json({ error: "Failed to update blueprint" }, { status: 500 });
    }

    return NextResponse.json({
      blueprint: updatedBlueprint,
    });
  } catch (error) {
    console.error("Blueprint update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
