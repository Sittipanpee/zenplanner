/**
 * lib/api/validate.ts
 *
 * Reusable Zod request-validation helpers for Next.js App Router API routes.
 * Extracts the duplicated parse-in-try-catch boilerplate found in
 * `app/api/tools/entries/route.ts`, `app/api/tools/aggregate/route.ts`, etc.
 *
 * Both helpers are pure: no logging, no side effects. They either return the
 * fully-typed parsed value, or a `NextResponse` with HTTP 400 and the Zod
 * issue list. Consumers use `instanceof NextResponse` to early-return.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ZodSchema, ZodIssue } from "zod";

/**
 * Validate a JSON request body against a Zod schema.
 *
 * Returns the parsed value `T` on success, or a `NextResponse` with status 400
 * carrying `{ error: "Invalid body", details: ZodIssue[] }` on failure.
 *
 * Both malformed JSON (e.g. empty body, syntax error) and schema mismatches
 * are reported as `Invalid body`. The `details` array is empty for parse
 * errors and populated with Zod issues for schema errors.
 *
 * @example
 * ```ts
 * const schema = z.object({ toolId: z.string(), entryDate: z.string() });
 * const body = await validateJsonBody(req, schema);
 * if (body instanceof NextResponse) return body; // early return on 400
 * // body is now typed as { toolId: string; entryDate: string }
 * ```
 */
export async function validateJsonBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid body", details: [] as ZodIssue[] },
      { status: 400 },
    );
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid body", details: result.error.issues },
      { status: 400 },
    );
  }

  return result.data;
}

/**
 * Validate request `searchParams` against a Zod schema.
 *
 * All query keys are extracted into a plain object first (last value wins for
 * repeated keys; use `z.array(...)` on the schema if you need multi-value),
 * then validated. Returns the parsed value `T` on success, or a `NextResponse`
 * with status 400 carrying `{ error: "Invalid query", details: ZodIssue[] }`
 * on failure.
 *
 * Note: searchParams values are always strings. Use Zod coercion
 * (`z.coerce.number()`, `z.coerce.boolean()`, etc.) for non-string fields.
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   toolId: z.string().optional(),
 *   from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
 * });
 * const query = validateQuery(req, schema);
 * if (query instanceof NextResponse) return query; // early return on 400
 * // query is now typed as { toolId?: string; from?: string }
 * ```
 */
export function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>,
): T | NextResponse {
  const params: Record<string, string> = {};
  req.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  const result = schema.safeParse(params);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid query", details: result.error.issues },
      { status: 400 },
    );
  }

  return result.data;
}
