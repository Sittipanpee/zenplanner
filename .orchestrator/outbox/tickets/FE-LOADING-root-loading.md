---
type: ticket
id: FE-LOADING
dept: frontend-ui
priority: normal
phase: TIER-2
---

# FE-LOADING — Root loading.tsx with branded skeleton

## Scope
Add a root-level `app/loading.tsx` so route transitions show a branded shimmer instead of a blank screen.

## Files to create
- `app/loading.tsx` — simple full-screen skeleton with zen-sage spinner + "ZenPlanner" wordmark

## Acceptance criteria
- [ ] Renders during any route transition
- [ ] Centered, full viewport, matches zen-bg background
- [ ] Uses existing Loader2 icon from lucide-react
- [ ] Dark mode support
- [ ] Small enough to ship inline (no fetch)
- [ ] Build passes

## Boundary
Only create `app/loading.tsx`. Do NOT touch any other file.
