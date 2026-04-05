/**
 * Blueprint API
 * Create, update, get planner blueprints
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSpiritAnimal } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination params
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10) || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10) || 0, 0);

    const { data: blueprints, error, count } = await supabase
      .from("planner_blueprints")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      blueprints,
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    });
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

    // Validate spirit_animal if provided
    if (blueprint.spirit_animal && !isSpiritAnimal(blueprint.spirit_animal)) {
      return NextResponse.json(
        { error: `Invalid spirit_animal: ${blueprint.spirit_animal}` },
        { status: 400 }
      );
    }

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
