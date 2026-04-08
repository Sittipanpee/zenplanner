---
type: ticket
id: INFRA-SENTRY
dept: infrastructure
priority: normal
phase: TIER-2
---

# INFRA-SENTRY — Wire error monitoring

## Scope
Use Vercel's native error tracking (no Sentry — avoids external dependency for PDPA).
Vercel has a built-in "Error Monitoring" that works via `reportError()` + Next.js instrumentation.
Alternatively, use `@sentry/nextjs` if Commander prefers full Sentry.

Per CO decision: go with the LIGHTWEIGHT path — use the Next.js `onUncaughtException` + `onRequestError` instrumentation hooks to emit structured logs that Vercel captures. No external SaaS.

## Files to create
- `instrumentation.ts` (Next.js convention — new file at repo root)
- `instrumentation-client.ts` (Next.js convention — client-side error hook)

## Acceptance criteria
- [ ] `instrumentation.ts` exports `register()` that no-ops in development and in production wires `onRequestError` to log structured JSON
- [ ] `instrumentation-client.ts` exports `onRouterTransitionStart` (optional) and handles client-side errors by posting to a stub `/api/monitoring/error` endpoint (mark as TODO — actual endpoint is out of scope)
- [ ] Both files are fully typed, no `any`
- [ ] Build passes
- [ ] No new dependencies installed

## Boundary
You own instrumentation.ts, instrumentation-client.ts, next.config.ts (for experimental.instrumentationHook if needed). Do NOT touch app/, components/, or lib/.
