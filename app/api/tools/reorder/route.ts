/**
 * POST /api/tools/reorder
 *
 * Body: { ordering: Array<{ toolId: string; position: number }> }
 * Updates the position of each user_tool row in a single batched operation.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  ordering: z
    .array(
      z.object({
        toolId: z.string().min(1),
        position: z.number().int().min(0),
      })
    )
    .min(1)
    .max(200),
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

  // Update each row individually but in parallel — RLS guarantees
  // we can only touch rows owned by auth.uid().
  const userId = userData.user.id;
  const results = await Promise.all(
    parsed.ordering.map(({ toolId, position }) =>
      supabase
        .from("user_tools")
        .update({ position })
        .eq("user_id", userId)
        .eq("tool_id", toolId)
    )
  );

  const failure = results.find((r) => r.error);
  if (failure?.error) {
    return NextResponse.json({ error: "Failed to reorder tools" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
