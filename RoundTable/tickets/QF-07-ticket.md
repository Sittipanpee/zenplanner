# QF-07 — Quiz Flow Agent: i18n, Dark Mode, Accessibility, Critical Fixes
**Phase:** Production Sprint
**Team:** Arcade
**Status:** [~] IN PROGRESS
**Depends on:** I18N-05 (animal-data.ts, messages/*.json), DS-04 (theme-toggle, language-switcher, globals.css dark mode vars)
**Blocks:** INT-09 (integration QA)

## Scope
Apply i18n (next-intl), dark mode, ARIA accessibility, and critical bug fixes across all quiz flow components and auth pages.

## Acceptance Criteria
- [ ] All quiz components use CSS variables / dark: classes for dark mode
- [ ] All user-visible text uses useTranslations from next-intl
- [ ] animal-card.tsx uses getAnimal() from lib/animal-data.ts (no hardcoded data)
- [ ] progress-dots.tsx ProgressBar width bug fixed
- [ ] quiz-card.tsx has ARIA role="region" and aria-label
- [ ] axis-indicator.tsx has ARIA on score indicators
- [ ] app/quiz/[mode]/page.tsx has sessionStorage persistence + "previous question" button
- [ ] app/quiz/reveal/page.tsx replaces alert() with inline copied state + uses animal-data.ts
- [ ] app/quiz/profile/page.tsx has cancel/skip button (no forced redirect)
- [ ] app/(auth)/login/page.tsx replaces window.location.href with router.push
- [ ] app/(auth)/login/page.tsx and signup/page.tsx have ThemeToggle + LanguageSwitcher
- [ ] animate-shimmer class defined or referenced from globals.css

## Boundaries
- Do NOT touch: lib/animal-data.ts (I18N-05), globals.css (DS-04), components/ui/* (DS-04)

## Notes
- Mock-First Rule: import from lib/animal-data.ts and components/ui/theme-toggle — these will exist when code runs
- Fox Chinese name fix handled by importing from animal-data.ts canonical source
