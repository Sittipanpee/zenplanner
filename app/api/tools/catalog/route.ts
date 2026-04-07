/**
 * GET /api/tools/catalog
 *
 * Returns the entire ToolDefinition registry with non-serializable
 * fields (Widget, schema, excel, icon) stripped. Public — no auth required.
 */

import { NextResponse } from "next/server";
import { CATALOG_TOOLS, toSerializable } from "@/lib/tools/registry";

// Dynamic: registry contains React component refs (via `icon`) which are
// problematic under force-static prerender. Runtime serialization is cheap.
export const dynamic = "force-dynamic";

export async function GET() {
  // CATALOG_TOOLS filters out synthetic tools (period_reflection etc.)
  // so they never appear in the blueprint or dashboard.
  const tools = CATALOG_TOOLS.map(toSerializable);
  return NextResponse.json({ tools });
}
