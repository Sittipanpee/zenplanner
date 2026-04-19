---
type: ticket
id: INFRA-ANALYTICS
dept: infrastructure
priority: normal
phase: TIER-2
---

# INFRA-ANALYTICS — Wire Vercel Analytics

## Scope
Add Vercel Analytics to the app so we can see real traffic without third-party trackers (PDPA-friendly).

## Files to modify / create
- `package.json` — add `@vercel/analytics` dependency
- `app/layout.tsx` — import `Analytics` component from `@vercel/analytics/next` and render before `</body>`

## Acceptance criteria
- [ ] `@vercel/analytics` installed via `npm install @vercel/analytics`
- [ ] `<Analytics />` rendered in the root layout (inside `<body>`, after the children)
- [ ] No new env vars required (Vercel injects automatically in production)
- [ ] Build passes
- [ ] Zero impact on dev experience (Analytics component is a no-op outside production)

## Boundary
You own `package.json` AND `app/layout.tsx` (the ROOT layout, not `(app)/layout.tsx` which is frontend-ui territory). The root `app/layout.tsx` is under the path ownership overlap — but since this ticket is about wiring a library into the root shell, it's infrastructure territory. Proceed.

Do NOT touch `app/(app)/layout.tsx` (that's frontend-ui).
