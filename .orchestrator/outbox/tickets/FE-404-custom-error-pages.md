---
type: ticket
id: FE-404
dept: frontend-ui
priority: normal
phase: TIER-2
---

# FE-404 — Custom 404 + global error pages

## Scope
Replace the default Next.js error pages with branded, helpful ones.

## Files to create
- `app/not-found.tsx` — custom 404 page (mobile-first, i18n)
- `app/error.tsx` — global error boundary (client component per Next docs)

## Acceptance criteria
- [ ] 404 page shows a branded zen illustration/emoji, "Page not found" heading, and 3 links: Home, Quiz, Dashboard
- [ ] Error page catches runtime errors, shows a friendly "Something went wrong" message with a "Try again" button that calls the `reset()` prop
- [ ] Both pages use next-intl for all strings (add keys to `messages/{en,th,zh}.json` under `errors.pages.*`)
- [ ] Mobile-first Tailwind, dark mode support
- [ ] Build passes
