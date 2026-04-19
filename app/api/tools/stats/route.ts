/**
 * GET /api/tools/stats
 *
 * Returns aggregate stats about the tool registry: total user-facing tool
 * count, per-category breakdown, and hidden synthetic tool count. Public —
 * no auth required.
 */

import { NextResponse } from "next/server";
import { ALL_TOOLS, CATALOG_TOOLS } from "@/lib/tools/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const byCategory: Record<string, number> = {};
  for (const tool of CATALOG_TOOLS) {
    byCategory[tool.category] = (byCategory[tool.category] ?? 0) + 1;
  }

  const body = {
    totalTools: CATALOG_TOOLS.length,
    byCategory,
    syntheticCount: ALL_TOOLS.length - CATALOG_TOOLS.length,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
