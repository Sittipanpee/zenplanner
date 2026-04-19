/**
 * GET /api/tools/mine
 *
 * Returns the authenticated user's enabled tools, ordered by `position ASC`.
 * RLS-enforced via auth.uid() in `user_tools_own` policy.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_tools")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("position", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to load tools" }, { status: 500 });
  }

  return NextResponse.json({ tools: data ?? [] });
}
