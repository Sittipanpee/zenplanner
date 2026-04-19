/**
 * lib/api/rate-limit.ts
 *
 * Reusable in-memory, per-identifier rate limiter for Next.js App Router
 * API routes. Extracted from `app/api/quiz/reveal-summary/route.ts` so that
 * multiple hot endpoints can share the same limiter semantics without
 * duplicating the Map-and-resetAt bookkeeping.
 *
 * Storage is a module-scoped Map — process-local, not distributed. Suitable
 * for single-instance deployments and best-effort abuse dampening. Swap to
 * a Redis-backed implementation behind the same interface if/when we scale
 * horizontally.
 *
 * Usage:
 * ```ts
 * import { checkRateLimit, getClientIp } from "@/lib/api/rate-limit";
 *
 * export async function GET(request: NextRequest) {
 *   const ip = getClientIp(request);
 *   const result = checkRateLimit(`reveal-summary:${ip}`, {
 *     max: 10,
 *     windowMs: 60_000,
 *   });
 *   if (!result.ok) {
 *     return NextResponse.json(
 *       { error: "Too many requests" },
 *       { status: 429, headers: { "Retry-After": String(result.retryAfter ?? 60) } },
 *     );
 *   }
 *   // ... handle request
 * }
 * ```
 */

import type { NextRequest } from "next/server";

/** Options controlling a rate-limit bucket. */
export interface RateLimitOptions {
  /** Maximum number of requests allowed per window. */
  max: number;
  /** Length of the sliding-reset window, in milliseconds. */
  windowMs: number;
}

/** Result of a rate-limit check. */
export interface RateLimitResult {
  /** True if the request is within the allowed budget. */
  ok: boolean;
  /** Seconds until the bucket resets, present only when `ok === false`. */
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Module-scoped store. Keyed by caller-supplied identifier (typically
 * `"<route>:<ip>"`). Process-local — lost on server restart, which is
 * acceptable for best-effort limiting.
 */
const store = new Map<string, RateLimitEntry>();

/**
 * Check whether the given identifier is within its rate-limit budget, and
 * atomically record the current request against its bucket.
 *
 * @param identifier Stable key for the bucket. Include the route name to
 *   prevent collisions between different endpoints sharing the same IP.
 * @param opts Bucket size and window.
 * @returns `{ ok: true }` if allowed, `{ ok: false, retryAfter }` if not.
 */
export function checkRateLimit(
  identifier: string,
  opts: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true };
  }

  if (entry.count >= opts.max) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { ok: false, retryAfter };
  }

  entry.count += 1;
  return { ok: true };
}

/**
 * Extract the best-guess client IP from request headers.
 *
 * Checks `x-forwarded-for` first (taking the left-most entry, which is the
 * original client per convention), then `x-real-ip`, then falls back to
 * `"unknown"`. Never throws.
 */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}
