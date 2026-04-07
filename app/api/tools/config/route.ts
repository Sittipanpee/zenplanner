/**
 * POST /api/tools/config
 *
 * Body: { toolId: string, config: Record<string, unknown> }
 * Updates the `config` JSONB field on the user's user_tools row.
 * RLS enforces ownership via auth.uid().
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  toolId: z.string().min(1),
  config: z.record(z.string(), z.unknown()),
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
    .update({ config: parsed.config, updated_at: new Date().toISOString() })
    .eq("user_id", userData.user.id)
    .eq("tool_id", parsed.toolId);

  if (error) {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
