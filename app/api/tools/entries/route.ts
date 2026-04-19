/**
 * /api/tools/entries
 *
 * GET  ?toolId=...&from=YYYY-MM-DD&to=YYYY-MM-DD  → list entries for a tool
 * POST { toolId, entryDate, payload }             → insert a new entry
 *
 * On POST: payload is validated against the tool's Zod schema
 * (via getToolByIdString(toolId).schema). RLS enforces ownership.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getToolByIdString } from "@/lib/tools/registry";
import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const getQuerySchema = z.object({
  // Optional: omit to return entries across ALL of the user's tools in range.
  // Useful for the dashboard "entries today" aggregate.
  toolId: z.string().min(1).optional(),
  from: z.string().regex(ISO_DATE).optional(),
  to: z.string().regex(ISO_DATE).optional(),
});

const postBodySchema = z.object({
  toolId: z.string().min(1),
  entryDate: z.string().regex(ISO_DATE),
  payload: z.record(z.string(), z.unknown()),
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
    // searchParams.get() returns null for missing keys; Zod's .optional()
    // accepts undefined but rejects null — coalesce explicitly.
    q = getQuerySchema.parse({
      toolId: searchParams.get("toolId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    });
  } catch {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  let query = supabase
    .from("tool_entries")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("entry_date", { ascending: false });

  if (q.toolId) query = query.eq("tool_id", q.toolId);
  if (q.from) query = query.gte("entry_date", q.from);
  if (q.to) query = query.lte("entry_date", q.to);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: "Failed to load entries" }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`entries-post:${ip}`, { max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 60) } }
    );
  }

  const supabase = await createClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed;
  try {
    parsed = postBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const tool = getToolByIdString(parsed.toolId);
  if (!tool) {
    return NextResponse.json({ error: "Unknown tool" }, { status: 404 });
  }

  // Validate payload against the tool's own Zod schema (skip if absent).
  if (tool.schema) {
    const validation = tool.schema.safeParse(parsed.payload);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Payload failed tool schema validation" },
        { status: 422 }
      );
    }
  }

  // Upsert on (user_id, tool_id, entry_date) so widgets that auto-save
  // on every edit don't create duplicate rows per day. Requires migration
  // 004 (uniq_tool_entries_user_tool_date).
  const { data, error } = await supabase
    .from("tool_entries")
    .upsert(
      {
        user_id: userData.user.id,
        tool_id: parsed.toolId,
        entry_date: parsed.entryDate,
        payload: parsed.payload,
      },
      { onConflict: "user_id,tool_id,entry_date" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save entry" }, { status: 500 });
  }

  return NextResponse.json({ entry: data });
}
