---
type: ticket
id: BE-RATE-2
dept: backend-api
priority: normal
phase: TIER-2
---

# BE-RATE-2 — Wire rate-limit helper into entries POST

## Scope
Micro-ticket. Follow-up from BE-RATE (filed by worker-be-rate's next_suggestion).
Wire the existing `lib/api/rate-limit.ts` helper into `app/api/tools/entries/route.ts`
POST handler with a 20 req/min per IP cap. Same pattern as reveal-summary.

## Files to modify
- `app/api/tools/entries/route.ts`

## Acceptance criteria
- [ ] POST /api/tools/entries checks rate limit BEFORE parsing body (cheap reject fast)
- [ ] Uses identifier `"entries-post:${ip}"` to avoid bucket collision with reveal-summary
- [ ] Returns 429 with Retry-After header on excess
- [ ] 20 req/min per IP cap
- [ ] Import from `@/lib/api/rate-limit`
- [ ] Build passes
- [ ] GET handler is NOT rate-limited (reads are cheap)

## Boundary
You own app/api/**. Only touch the entries route. Do NOT touch lib/api/rate-limit.ts (it's already correct).
