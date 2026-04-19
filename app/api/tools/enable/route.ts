/**
 * POST /api/tools/enable
 *
 * Body: { toolId: string }
 * Upserts a `user_tools` row with enabled=true. Validates that the
 * toolId exists in the productivity-tools registry.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getToolByIdString } from "@/lib/tools/registry";

const bodySchema = z.object({
  toolId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!getToolByIdString(parsed.toolId)) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("user_tools")
    .upsert(
      {
        user_id: userData.user.id,
        tool_id: parsed.toolId,
        enabled: true,
      },
      { onConflict: "user_id,tool_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to enable tool" }, { status: 500 });
  }

  return NextResponse.json({ tool: data });
}
