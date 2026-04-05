# FP-08 — Feature Pages Agent (App Shell, Dashboard, Planner, Export, All Pages)
**Phase:** Production Sprint
**Team:** Arcade
**Status:** [~] IN PROGRESS
**Depends on:** DS-04 (UI components), I18N-05 (message files), INF-06 (infrastructure)
**Blocks:** INT-09 (Integration QA), DA-10 (Devil's Advocate)

## Scope
Complete production hardening of all (app) pages and the root layout:
- Root layout: NextIntlClientProvider + ThemeProvider
- App shell layout: ZenNav + ThemeToggle + LanguageSwitcher + MobileBottomNav
- Dashboard components: i18n, dark mode, animal data from lib
- Planner components: i18n, dark mode, search, color scheme sync
- Export components: LINE icon fix, CSV fix, social share defaults, dark mode
- All page files: i18n keys, dark mode, bug fixes
- New settings page creation
- Landing page, not-found, error boundary

## Acceptance Criteria
- [ ] All text uses t() with correct i18n keys from SSOT
- [ ] Dark mode works via CSS variables or Tailwind dark: classes
- [ ] Animal data sourced from lib/animal-data.ts, not hardcoded
- [ ] LINE icon SVG is correct logo
- [ ] Social share buttons have default handlers (no silent failures)
- [ ] CSV option disabled with "Coming soon" or implemented
- [ ] Settings page created with language, appearance, account sections
- [ ] No hardcoded English strings remain
- [ ] Zero silent failures

## Boundaries
- Do NOT touch: supabase/, lib/llm.ts, lib/planner-generator.ts, API routes, components/ui/, components/quiz/, messages/*.json, globals.css

## Notes
Mock-first rule applies: scaffold with mock data where backend isn't ready.
