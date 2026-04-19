/**
 * GET /api/tools/aggregate?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Returns cross-tool aggregated metrics for the authenticated user
 * over the requested date range. Heavy query — cached private 60s.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { computeCrossToolSummary } from "@/lib/tools/aggregations";
import type { ToolEntry } from "@/lib/tools/types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const querySchema = z.object({
  from: z.string().regex(ISO_DATE),
  to: z.string().regex(ISO_DATE),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let q;
  try {
    q = querySchema.parse({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });
  } catch {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const userId = userData.user.id;

  // Fetch enabled tools
  const { data: userTools, error: toolsErr } = await supabase
    .from("user_tools")
    .select("tool_id, enabled")
    .eq("user_id", userId)
    .eq("enabled", true);

  if (toolsErr) {
    return NextResponse.json(
      { error: "Failed to load tools" },
      { status: 500 }
    );
  }

  const enabledIds = (userTools ?? []).map((t) => t.tool_id as string);

  // Fetch all entries in range across enabled tools
  let entries: ToolEntry[] = [];
  if (enabledIds.length > 0) {
    const { data: entryRows, error: entriesErr } = await supabase
      .from("tool_entries")
      .select("*")
      .eq("user_id", userId)
      .in("tool_id", enabledIds)
      .gte("entry_date", q.from)
      .lte("entry_date", q.to);

    if (entriesErr) {
      return NextResponse.json(
        { error: "Failed to load entries" },
        { status: 500 }
      );
    }
    entries = (entryRows ?? []) as ToolEntry[];
  }

  const grouped: Record<string, ToolEntry[]> = {};
  for (const id of enabledIds) grouped[id] = [];
  for (const e of entries) {
    if (!grouped[e.tool_id]) grouped[e.tool_id] = [];
    grouped[e.tool_id].push(e);
  }

  const summary = computeCrossToolSummary(userId, grouped, {
    from: new Date(q.from + "T00:00:00Z"),
    to: new Date(q.to + "T23:59:59Z"),
  });

  return NextResponse.json(
    {
      range: { from: q.from, to: q.to },
      metrics: summary.metrics,
      toolBreakdown: summary.toolBreakdown,
    },
    {
      headers: { "Cache-Control": "private, max-age=60" },
    }
  );
}
