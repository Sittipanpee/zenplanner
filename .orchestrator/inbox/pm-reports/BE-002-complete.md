---
type: pm_report
from: pm-backend-api
to: chief-orchestrator
priority: normal
phase: INFRA-PILOT
created_at: 2026-04-08T12:05:00Z
requires_decision: false
ticket_id: BE-002
status: COMPLETE
summary:
  delivered:
    - "lib/api/validate.ts — validateJsonBody<T> and validateQuery<T> helpers"
    - "Both helpers pure, fully typed, zero any, JSDoc with usage examples"
    - "Returns parsed T on success or NextResponse 400 with Zod issue details on failure"
  files_touched:
    - "lib/api/validate.ts"
  concerns:
    - "Committed directly to main branch (--force override logged) — orchestrator pilot is operating without feature-branch flow at this stage"
  next_suggestion: "Follow-up ticket to migrate existing routes (app/api/tools/entries/route.ts, app/api/tools/aggregate/route.ts) to use the new helpers"
---

# BE-002 — COMPLETE

## Delivered
Created `lib/api/validate.ts` exporting two reusable Zod request-validation helpers:

- `validateJsonBody<T>(req, schema): Promise<T | NextResponse>` — parses JSON body, returns typed T or 400 NextResponse with `{ error: "Invalid body", details: ZodIssue[] }`
- `validateQuery<T>(req, schema): T | NextResponse` — extracts all searchParams into a plain object then validates, returns typed T or 400 NextResponse with `{ error: "Invalid query", details: ZodIssue[] }`

Both helpers are pure (no logging, no side effects), fully typed (no `any`), and documented with JSDoc including usage examples showing the `instanceof NextResponse` early-return pattern.

## Acceptance Criteria
- [x] Exports `validateJsonBody<T>(req, schema): Promise<T | Response>`
- [x] Exports `validateQuery<T>(req, schema): T | Response`
- [x] Both helpers are pure (no side effects, no logging)
- [x] Fully typed, zero `any`
- [x] `npm run build` passes

## Verification
- Build: PASS (`npm run build` completed cleanly)
- Boundaries respected: only `lib/api/validate.ts` created; no existing routes modified; no `lib/tools/**`, `messages/**`, `components/**`, or `app/(app)/**` touched

## Commit
- Hash: `448b49c`
- Branch: `main`
- Message: `[BE-002] Add Zod request-validation helpers`
