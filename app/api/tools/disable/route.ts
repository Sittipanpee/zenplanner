/**
 * POST /api/tools/disable
 *
 * Body: { toolId: string }
 * Sets enabled=false on the user's row. Does NOT delete — preserves history.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase
    .from("user_tools")
    .update({ enabled: false })
    .eq("user_id", userData.user.id)
    .eq("tool_id", parsed.toolId);

  if (error) {
    return NextResponse.json({ error: "Failed to disable tool" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
