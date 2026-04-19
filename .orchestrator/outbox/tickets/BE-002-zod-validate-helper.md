---
type: ticket
id: BE-002
from: chief-orchestrator
to: pm-backend-api
dept: backend-api
priority: normal
phase: INFRA-PILOT
created_at: 2026-04-08T11:22:03Z
title: Add Zod request-validation helper
---

# BE-002 — Add lib/api/validate.ts helper

## Scope
Every API route currently duplicates the same Zod-parse-in-try-catch boilerplate
(see `app/api/tools/entries/route.ts` or `app/api/tools/aggregate/route.ts`).
Extract a reusable helper so future routes stay consistent.

## Files to create
- `lib/api/validate.ts` (new)

## Acceptance criteria
- [ ] Exports `validateJsonBody<T>(req, schema): Promise<T | Response>` —
  returns parsed T on success, or a NextResponse.json({error: "Invalid body"}, {status: 400}) on failure
- [ ] Exports `validateQuery<T>(req, schema): T | Response` —
  same pattern for searchParams
- [ ] Both helpers are pure (no side effects, no logging)
- [ ] Fully typed, zero `any`
- [ ] `npm run build` passes

## Boundaries
- Do NOT modify any existing route.
- You own only `lib/supabase/server.ts`, `lib/llm.ts`, `lib/quiz-engine.ts`, `middleware.ts`, and `app/api/**`.
  `lib/api/` is a NEW directory — treat it as yours for this ticket.
- Do NOT touch `lib/tools/**` (owned by productivity-tools dept).

## Workflow (MANDATORY)
1. Journal start
2. Write file
3. Journal wrote
4. `npm run build`
5. Use **Skill tool** (`skill: "git"`, `args: "commit"`) — NO raw git
6. Journal complete
7. File pm_report in `.orchestrator/inbox/pm-reports/`
