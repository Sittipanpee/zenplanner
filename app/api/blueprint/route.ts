/**
 * Blueprint API
 * Create, update, get planner blueprints
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: blueprints, error } = await supabase
      .from("planner_blueprints")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ blueprints });
  } catch (error) {
    console.error("Get blueprints error:", error);
    return NextResponse.json({ error: "Failed to get blueprints" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const blueprint = await request.json();

    const { data, error } = await supabase
      .from("planner_blueprints")
      .insert({
        user_id: user.id,
        quiz_session_id: blueprint.quiz_session_id,
        title: blueprint.title,
        description: blueprint.description,
        spirit_animal: blueprint.spirit_animal,
        archetype_code: blueprint.archetype_code,
        tool_selection: blueprint.tool_selection || [],
        customization: blueprint.customization || {},
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ blueprint: data });
  } catch (error) {
    console.error("Create blueprint error:", error);
    return NextResponse.json({ error: "Failed to create blueprint" }, { status: 500 });
  }
}