import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const HealthResponse = z.object({
  status: z.literal("ok"),
  uptime: z.number(),
  ts: z.string(),
});

const startedAt = Date.now();

export async function GET() {
  const payload = HealthResponse.parse({
    status: "ok",
    uptime: (Date.now() - startedAt) / 1000,
    ts: new Date().toISOString(),
  });
  return NextResponse.json(payload);
}
