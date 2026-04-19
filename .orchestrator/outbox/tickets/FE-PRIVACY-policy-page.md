---
type: ticket
id: FE-PRIVACY
dept: frontend-ui
priority: normal
phase: TIER-2
---

# FE-PRIVACY — PDPA-compliant privacy policy page

## Scope
Create /privacy route with a PDPA (Thailand Personal Data Protection Act)
compliant policy. Trilingual (EN/TH/ZH). Minimum required sections.

## Files to create
- `app/privacy/page.tsx` (server component)

## Required sections
1. **What data we collect** — email (Supabase auth), quiz responses (scores + animal result), tool entries (user-input data), cookies for theme/locale/session
2. **Why we collect it** — deliver the service, compute archetype, render dashboard, persist progress
3. **Who we share it with** — nobody except the subprocessors listed below
4. **Subprocessors** — Supabase (Frankfurt region, EU data storage), Vercel (global edge), Pollinations.ai (LLM inference, anonymized scores only)
5. **Your rights** — access, correction, deletion, data export. Email privacy@zenplanner.app (placeholder)
6. **Cookies** — 3 cookies: theme, locale, session. No ad trackers, no third-party analytics, no fingerprinting
7. **Retention** — account data kept until deletion request. Quiz results kept 24 months (for cohort analytics). Tool entries kept indefinitely (your journal)
8. **Contact** — privacy@zenplanner.app

## Acceptance criteria
- [ ] Route renders at /privacy (public, no auth)
- [ ] All text via next-intl — add keys to `messages/{en,th,zh}.json` under `legal.privacy.*`
- [ ] Mobile-first layout, readable prose (max-w-prose, leading-relaxed)
- [ ] Dark mode support
- [ ] Footer link to /terms
- [ ] Build passes

## Boundary
You own `app/privacy/**` (new). Add i18n keys to `messages/*.json` (shared). Do NOT touch any other file.
