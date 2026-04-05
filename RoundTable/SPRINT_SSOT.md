# ZenPlanner Production Sprint — Single Source of Truth
**Sprint Start:** 05-04-2026 | **Branch:** claude/spawn-agent-fvw52
**Goal:** Award-competitive, production-grade, 3-language, dark mode. Build pass. 99/100 DA score.

---

## Architecture Decisions (MT-Approved, BINDING)

| Decision | Implementation |
|----------|---------------|
| i18n | `next-intl` context-based (no URL routing). Cookie `NEXT_LOCALE`. Config: `i18n/request.ts`. |
| Dark mode | `next-themes` + CSS `html[data-theme="dark"]` overrides. `ThemeProvider` in `app/layout.tsx`. |
| Animal data | Single source: `lib/animal-data.ts` — `Record<SpiritAnimal, AnimalData>`. |
| LLM resilience | Max 3 retries, 1s/2s/4s backoff, 30s `AbortController`, Zod JSON validation. |
| LINE auth | Admin API `createUser` email=`line_${userId}@line.zenplanner.internal` → `signInWithPassword`. |
| XLSX generation | Server-side `Buffer` only. Upload to Supabase Storage `planners` bucket. Return signed URL. |
| New dependencies | `@supabase/ssr`, `@supabase/supabase-js`, `@line/liff`, `xlsx`, `qrcode`, `clsx`, `zod`, `next-themes`, `next-intl` |
| CSS framework | Tailwind v4 (existing). No changes to tailwind config. |

---

## File Ownership Map (STRICT — agents must NOT touch files owned by others)

| Agent | Code Name | Owns |
|-------|-----------|------|
| **DB Surgeon** | DB-01 | `supabase/migrations/002_production_hardening.sql` (NEW only) |
| **Backend Craftsman** | BE-02 | `package.json`, `lib/llm.ts`, `lib/planner-generator.ts`, `lib/qr-generator.ts`, `lib/sheet-builder.ts`, `lib/supabase/`, `app/api/auth/`, `app/api/payment/`, `app/api/planner/`, `app/api/blueprint/`, `app/api/line/` |
| **Quiz Psychologist** | QZ-03 | `lib/quiz-engine.ts`, `lib/quiz-data.ts`, `lib/archetype-map.ts`, `lib/quiz-prompts.ts` (NEW), `app/api/quiz/` |
| **Notioneer** | DS-04 | `app/globals.css`, `components/ui/zen-*.tsx`, `components/ui/theme-toggle.tsx` (NEW), `components/ui/language-switcher.tsx` (NEW) |
| **i18n Architect** | I18N-05 | `messages/en.json` (NEW), `messages/th.json` (NEW), `messages/zh.json` (NEW), `lib/animal-data.ts` (NEW), `i18n/request.ts` (NEW) |
| **Infrastructure** | INF-06 | `next.config.ts`, `middleware.ts`, `.env.example` (NEW), `lib/utils.ts`, `lib/theme-colors.ts`, `tsconfig.json` |
| **Quiz Flow Agent** | QF-07 | `components/quiz/`, `app/quiz/*/page.tsx`, `app/(auth)/*/page.tsx` |
| **Feature Pages Agent** | FP-08 | `components/dashboard/`, `components/planner/`, `components/export/`, `components/liff/`, `app/(app)/*/page.tsx`, `app/(app)/layout.tsx`, `app/layout.tsx`, `app/page.tsx`, `app/loading.tsx`, `app/not-found.tsx` |

---

## i18n Key Contract (ALL page agents must use these exact keys)

### Import pattern
```typescript
// Server components
import { getTranslations } from 'next-intl/server'
const t = await getTranslations('namespace')

// Client components
'use client'
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
```

### Language switcher (client component)
```typescript
import LanguageSwitcher from '@/components/ui/language-switcher'
// Sets cookie 'NEXT_LOCALE', calls router.refresh()
```

### Theme toggle
```typescript
import ThemeToggle from '@/components/ui/theme-toggle'
import { useTheme } from 'next-themes'
```

### Animal data
```typescript
import { ANIMALS, getAnimal } from '@/lib/animal-data'
// ANIMALS[animal].nameEn / .nameTh / .nameZh / .emoji / .gradient
```

### Complete Key Structure

#### Namespace: `common`
```
common.app.name = "ZenPlanner"
common.app.tagline = "Plan with your spirit"
common.nav.dashboard / quiz / planner / profile / settings / logout / login
common.actions.continue / back / save / cancel / generate / download / share / copy / copied / loading / error / retry / close / next / skip / done
common.theme.light / dark / system
common.language.en / th / zh
common.errors.notFound / serverError / unauthorized / networkError
```

#### Namespace: `auth`
```
auth.login.title / subtitle / lineButton / githubButton / noAccount / signUp / orDivider
auth.signup.title / hasAccount / signIn
```

#### Namespace: `quiz`
```
quiz.home.title / subtitle / startButton / modeClassic / modeChat / modeGame / estimatedTime
quiz.question.progress / back
quiz.reveal.title / subtitle / share / takeAgain / viewPlanner / copied / copyError
quiz.profile.title / chatPlaceholder / send / analyzing / complete
quiz.summary.title / traits / strengths / recommendation
```

#### Namespace: `planner`
```
planner.blueprint.title / subtitle / spiritAnimal / selectedTools / customize / generate / noAnimal
planner.toolGrid.searchPlaceholder / allCategories / noResults / selected / addTool / removeTool
planner.customize.title / colorScheme / layout / paperSize / preview
planner.generate.title / step1..step5
planner.done.title / subtitle / downloadExcel / downloadSheets / shareTitle / shareLine / shareFacebook / shareTwitter / copyLink
planner.payment.title / subtitle / amount / scan / waiting / success / failed / retry
```

#### Namespace: `dashboard`
```
dashboard.title / welcome
dashboard.stats.currentStreak / longestStreak / plannersCreated / toolsUsed / daysActive / planners
dashboard.heatmap.title / less / more / tooltip / empty
dashboard.recentPlanners.title / empty / createFirst / viewAll
dashboard.quickActions.newPlanner / retakeQuiz / viewStats
```

#### Namespace: `profile`
```
profile.title / spiritAnimal / editProfile / planningStyle / keyTraits
profile.settings.title / notifications / privacy / language / theme / account / signOut / deleteAccount
```

---

## Component API Contracts

### ThemeToggle (`components/ui/theme-toggle.tsx`)
```typescript
// Props: none (uses next-themes internally)
// Renders: sun/moon icon button, toggles light/dark, persists in localStorage
import ThemeToggle from '@/components/ui/theme-toggle'
```

### LanguageSwitcher (`components/ui/language-switcher.tsx`)
```typescript
// Props: none (reads from next-intl useLocale())
// Renders: EN/ไทย/中文 buttons, sets cookie NEXT_LOCALE, calls window.location.reload()
import LanguageSwitcher from '@/components/ui/language-switcher'
```

### Animal Data (`lib/animal-data.ts`)
```typescript
export type AnimalData = {
  emoji: string
  nameTh: string
  nameEn: string  
  nameZh: string
  gradient: string  // CSS gradient string
  description: string  // English description
  archetypeTitle: string  // e.g. "The Strategic Planner"
  particleEffect?: string
  frameAnimation?: string
}
export const ANIMALS: Record<SpiritAnimal, AnimalData>
export function getAnimal(animal: SpiritAnimal): AnimalData
```

---

## P0 Issues Being Fixed (from Devil's Advocate audit)

| # | Fix | Agent |
|---|-----|-------|
| 1 | All runtime deps missing from package.json | BE-02 |
| 2 | Payment webhook signature verification | BE-02 |
| 3 | Payment simulation PUT unguarded | BE-02 |
| 4 | LINE auth never creates Supabase session | BE-02 |
| 5 | LLM infinite retry recursion | BE-02 |
| 6 | URL.createObjectURL on server | BE-02 |
| 7 | Quiz answers array resets every request | QZ-03 |
| 8 | Admin RLS policy bypassable | DB-01 |
| 9 | Zero dark mode | DS-04 |
| 10 | Zero reduced-motion / accessibility | DS-04 |
| 11 | Fox animal name in Chinese | I18N-05 + QF-07 |
| 12 | alert() for clipboard feedback | QF-07 |

---

## Done Criteria

- [ ] `npm run build` exits 0, zero TypeScript errors
- [ ] All 12 P0s resolved  
- [ ] i18n complete: EN/TH/ZH all text translated, switcher functional
- [ ] Dark mode: system preference + manual toggle + localStorage persistence
- [ ] LINE auth: creates real Supabase session, protected routes accessible
- [ ] Payment: webhook verified, simulation removed
- [ ] Quiz AI: personality narrative in selected language
- [ ] Devil's Advocate: all features ≥ 95/100, no P0/P1 remaining

---

## Agent Status (updated by each agent on completion)

| Agent | Status | Completed At | Notes |
|-------|--------|-------------|-------|
| DB-01 DB Surgeon | COMPLETE | 05-04-2026 | All 8 items delivered in 002_production_hardening.sql |
| BE-02 Backend Craftsman | COMPLETE | 05-04-2026 | All 14 files fixed: deps, LLM retry+timeout+Zod, Supabase Storage upload, CRC16-CCITT, LINE auth session, webhook HMAC, open redirect, pagination |
| QZ-03 Quiz Psychologist | COMPLETE | 05-04-2026 | All 5 fixes + lib/quiz-prompts.ts created |
| DS-04 Notioneer | COMPLETE | 05-04-2026 | Dark mode vars, reduced-motion, shimmer keyframe, ARIA on all zen-* components, ThemeToggle + LanguageSwitcher created, CSS bugs fixed |
| I18N-05 i18n Architect | COMPLETE | 05-04-2026 | All 5 files created. Fox Chinese name fixed (狐狸). All 16 animals. Full EN/TH/ZH key coverage. |
| INF-06 Infrastructure | COMPLETE | 05-04-2026 | All 5 items delivered. tailwind-merge dep needed from BE-02. |
| QF-07 Quiz Flow | COMPLETE | 05-04-2026 | All 11 files: i18n, dark mode, ARIA, sessionStorage persistence, alert->inline, window.location->router.push |
| FP-08 Feature Pages | PENDING | — | — |
| INT-09 Integration QA | PENDING | — | — |
| DA-10 Devil's Advocate | PENDING | — | — |
