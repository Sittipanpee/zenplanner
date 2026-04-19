---
type: ticket
id: BE-RATE
dept: backend-api
priority: normal
phase: TIER-2
---

# BE-RATE — Extract rate-limit helper

## Scope
`app/api/quiz/reveal-summary/route.ts` already contains an in-memory rate limiter (Map + resetAt + 10 req/min). Extract it into a reusable helper and leave the reveal-summary route wired to the new helper.

## Files to create / modify
- Create `lib/api/rate-limit.ts` (new)
- Modify `app/api/quiz/reveal-summary/route.ts` (refactor to use the helper)

## Acceptance criteria
- [ ] Export `checkRateLimit(identifier: string, opts: { max, windowMs }): { ok: boolean; retryAfter?: number }`
- [ ] Export `getClientIp(req: NextRequest): string` (reads x-forwarded-for then x-real-ip)
- [ ] The helper uses a module-scoped Map — same in-memory approach as before
- [ ] Fully typed, no `any`
- [ ] reveal-summary route produces the same behavior as before (10 req/min per IP, returns 429 on excess)
- [ ] Build passes
- [ ] You may ALSO wire the helper into `app/api/tools/entries/route.ts` POST (20 req/min per IP) since that's a hot write endpoint — OPTIONAL

## Boundary
You own `app/api/**`. You may create `lib/api/rate-limit.ts` (new file in your territory for this ticket). Do NOT touch `lib/tools/**` or other dept territory.
