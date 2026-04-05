# ZenPlanner Production Sprint — Todo Tracker
**Last updated:** 05-04-2026 | Sprint start

---

## Wave 1 — Parallel Workers

### DB-01: DB Surgeon
- [x] Create `supabase/migrations/002_production_hardening.sql`
  - [x] Add `updated_at` columns + auto-update triggers on all stateful tables
  - [x] Add indexes: quiz_sessions(user_id), planner_blueprints(user_id), generated_planners(user_id), payments(user_id), activity_log(user_id, activity_date), generation_jobs(blueprint_id), generation_jobs(status), payments(status)
  - [x] Fix admin RLS: replace `display_name = 'admin'` with `role` column approach
  - [x] Add NOT NULL constraints on critical columns (activity_type, mode)
  - [x] Fix `handle_new_user()` trigger to handle LINE metadata fields (COALESCE chain)
  - [x] Fix `payments.blueprint_id` ON DELETE SET NULL
  - [x] Add QuizState phase constraint fix (add 'intro' to CHECK)
  - [x] Add JSONB validation CHECK on axis_scores (must be object when complete)
- **STATUS:** [x] COMPLETE

### BE-02: Backend Craftsman
- [x] `package.json`: add all missing deps (@supabase/ssr, @supabase/supabase-js, @line/liff, xlsx, qrcode, clsx, zod, next-themes, next-intl)
- [x] `lib/llm.ts`: fix infinite retry, add timeout, add Zod validation
- [x] `lib/planner-generator.ts`: fix URL.createObjectURL → server Buffer + Supabase Storage
- [x] `lib/qr-generator.ts`: fix CRC16, fix malformed PromptPay string
- [x] `lib/sheet-builder.ts`: remove console.logs, ensure server-compatible
- [x] `lib/supabase/server.ts`: fix silent catch{}, add env validation
- [x] `lib/supabase/client.ts`: add env validation
- [x] `app/api/auth/line/route.ts`: create real Supabase session for LINE users
- [x] `app/api/auth/callback/route.ts`: fix open redirect (next param)
- [x] `app/api/payment/webhook/route.ts`: enable signature verification, remove/gate simulation PUT
- [x] `app/api/payment/create-qr/route.ts`: fix DB insert swallow, use crypto.randomUUID
- [x] `app/api/line/share-flex/route.ts`: add auth check
- [x] `app/api/planner/generate/route.ts`: (upstream planner-generator.ts now handles server-side pipeline)
- [x] `app/api/planner/download/[id]/route.ts`: (already returns Supabase Storage signed URL via planner-generator)
- [x] `app/api/blueprint/route.ts`: add pagination, validate spirit_animal enum
- **STATUS:** [x] COMPLETE

### QZ-03: Quiz Psychologist
- [x] `lib/quiz-engine.ts`: fix QuizState.phase type (add 'intro'), improve scoring range
- [x] `lib/quiz-data.ts`: all 22 questions verified — proper axis weights confirmed
- [x] `lib/archetype-map.ts`: remove unused variables, fix getArchetypeCode fallback
- [x] `lib/quiz-prompts.ts` (NEW): rich prompt templates for AI personality narrative (TH/EN/ZH)
- [x] `app/api/quiz/step/route.ts`: fix answers array reset (load from DB), fix custom/minigame modes
- [x] `app/api/quiz/complete/route.ts`: integrate AI narrative generation, Zod validate LLM output
- [x] `app/api/quiz/profile/route.ts`: fix system prompt duplication, fix profile JSON regex, fix completion detection
- **STATUS:** [x] COMPLETE

### DS-04: Notioneer (Design System)
- [x] `app/globals.css`: full dark mode variable system (html[data-theme="dark"]), reduced-motion, fix invalid CSS (ring->outline)
- [x] `components/ui/zen-button.tsx`: ARIA labels, dark mode classes, reduced-motion
- [x] `components/ui/zen-card.tsx`: ARIA roles, dark mode, fix double border
- [x] `components/ui/zen-input.tsx`: ARIA, dark mode, fix focus ring
- [x] `components/ui/zen-nav.tsx`: dark mode, ARIA landmark, mobile responsive
- [x] `components/ui/zen-badge.tsx`: dark mode, ARIA
- [x] `components/ui/theme-toggle.tsx` (NEW): sun/moon toggle, next-themes, accessible
- [x] `components/ui/language-switcher.tsx` (NEW): EN/TH/ZH buttons, sets NEXT_LOCALE cookie
- **STATUS:** [x] COMPLETE

### I18N-05: i18n Architect
- [x] `i18n/request.ts` (NEW): next-intl getRequestConfig reading NEXT_LOCALE cookie
- [x] `messages/en.json` (NEW): complete English translations per SSOT key contract
- [x] `messages/th.json` (NEW): complete Thai translations
- [x] `messages/zh.json` (NEW): complete Simplified Chinese translations
- [x] `lib/animal-data.ts` (NEW): canonical ANIMALS record with nameTh/nameEn/nameZh, fix fox entry
- **STATUS:** [x] COMPLETE

### INF-06: Infrastructure Engineer
- [x] `next.config.ts`: next-intl plugin, image domains (supabase storage, line profile pics), security headers
- [x] `middleware.ts`: remove dead lib/supabase/middleware.ts reference, clean up, ensure auth protection correct
- [x] `.env.example` (NEW): document all required env vars
- [x] `lib/utils.ts`: add tailwind-merge (twMerge + clsx pattern: `cn()` helper)
- [x] `tsconfig.json`: verified — strict: true, @/* path alias correct, no additional aliases needed
- **STATUS:** [x] COMPLETE
- **NOTE:** tailwind-merge is NOT in package.json yet — BE-02 must add it as a dependency

### QF-07: Quiz Flow Agent
- [x] `components/quiz/quiz-card.tsx`: i18n, dark mode, ARIA, define `animate-shimmer` keyframe
- [x] `components/quiz/animal-card.tsx`: use lib/animal-data.ts, i18n animal names, dark mode
- [x] `components/quiz/progress-dots.tsx`: fix conditional style bug, dark mode, ARIA
- [x] `components/quiz/axis-indicator.tsx`: dark mode, ARIA
- [x] `components/quiz/chat-bubble.tsx`: dark mode, ARIA
- [x] `app/quiz/page.tsx`: i18n, dark mode, use ThemeToggle + LanguageSwitcher in nav
- [x] `app/quiz/[mode]/page.tsx`: sessionStorage persistence for quiz state, i18n, dark mode
- [x] `app/quiz/reveal/page.tsx`: fix fox name (use animal-data.ts), replace alert() with toast/inline feedback, i18n
- [x] `app/quiz/profile/page.tsx`: i18n, dark mode, fix auto-redirect (add cancel button)
- [x] `app/(auth)/login/page.tsx`: i18n, dark mode, fix window.location.href → router.push
- [x] `app/(auth)/signup/page.tsx`: i18n, dark mode
- **STATUS:** [x] COMPLETE

### FP-08: Feature Pages Agent
- [x] `app/layout.tsx`: add ThemeProvider (next-themes) + NextIntlClientProvider, ThemeToggle + LanguageSwitcher in global nav
- [x] `app/(app)/layout.tsx`: mount ZenBottomNav (mobile) + ZenSidebar (desktop) as actual shared app shell
- [x] `components/dashboard/heatmap.tsx`: dark mode, i18n labels, fix month alignment
- [x] `components/dashboard/stats-grid.tsx`: dark mode, i18n, use real streak data (or clear stub with TODO comment)
- [x] `components/dashboard/animal-profile.tsx`: use lib/animal-data.ts, dark mode, i18n
- [x] `components/dashboard/planner-history.tsx`: dark mode, i18n
- [x] `components/planner/tool-grid.tsx`: add search/filter, dark mode, i18n
- [x] `components/planner/tool-card.tsx`: dark mode, i18n
- [x] `components/planner/special-tool-previews.tsx`: dark mode (hardcoded empty color replaced with CSS var)
- [x] `components/planner/customization-panel.tsx`: sync color scheme IDs with blueprint/customize/page.tsx, dark mode, i18n
- [x] `components/planner/preview-mini.tsx`: dark mode (hardcoded empty color replaced with CSS var)
- [x] `components/export/share-card.tsx`: fix LINE icon SVG, fix silent Facebook/Twitter handlers (inline SVG icons), dark mode, i18n
- [x] `components/export/download-card.tsx`: fix CSV option (disabled with "Coming soon"), dark mode, i18n
- [x] `components/export/generation-progress.tsx`: dark mode, i18n
- [x] `components/liff/line-login-button.tsx`: fix LINE icon SVG, dark mode (zen CSS vars already in use)
- [x] `components/liff/share-animal-button.tsx`: replaced hardcoded ANIMAL_NAMES/ANIMAL_EMOJI with lib/animal-data.ts
- [x] `app/(app)/dashboard/page.tsx`: i18n (all embedded tool labels), dark mode (surface-alt for heatmap), locale-aware animal names
- [x] `app/(app)/blueprint/page.tsx`: fix hardcoded "lion" (fetches from Supabase profile), i18n, dark mode
- [x] `app/(app)/blueprint/customize/page.tsx`: sync customization IDs, i18n, dark mode
- [x] `app/(app)/generate/page.tsx`: i18n (all 6 status states), dark mode
- [x] `app/(app)/generate/done/page.tsx`: fix hardcoded "8 tools" (uses toolCount), fix CSV toggle, i18n, dark mode
- [x] `app/(app)/profile/page.tsx`: replace alert("coming soon") with Link to /settings, i18n, dark mode
- [x] `app/(app)/payment/page.tsx`: i18n, dark mode
- [x] `app/(app)/stats/page.tsx`: i18n, dark mode
- [x] `app/(app)/tools/page.tsx`: i18n, dark mode
- [x] `app/(app)/settings/page.tsx` (NEW): real settings page (language, theme, account)
- [x] `app/page.tsx`: landing/splash, i18n, dark mode
- [x] `app/not-found.tsx`: i18n, dark mode
- [x] `app/(app)/error.tsx`: i18n, dark mode
- [x] `app/loading.tsx` + `app/(app)/loading.tsx`: dark mode ready
- [x] `messages/en.json`: added generate.*, dashboard.mood/priorities/habits/plannerTools/quickActions keys
- [x] `messages/th.json`: added matching Thai translations
- [x] `messages/zh.json`: added matching Chinese translations
- **STATUS:** [x] COMPLETE

---

## Wave 2 — Integration QA (after Wave 1 complete)

### INT-09: Integration QA
- [x] Read all changed files, check for TypeScript errors across boundaries
- [x] Fix any import path issues between agents' outputs
- [x] Verify i18n keys in pages match messages/*.json (no missing keys)
- [x] Verify all new components are properly exported/imported
- [x] Run `npm install` to install new deps
- [x] Run `npm run build` — fix all errors
- [x] Verify build output clean (zero TypeScript errors, zero warnings that block)
- **STATUS:** [x] COMPLETE

---

## Wave 3 — Devil's Advocate (after Wave 2 complete)

### DA-10: Devil's Advocate
- [x] Re-run full audit against P0-P3 issue list from Session 2
- [x] Score each feature domain 0-100
- [x] Verify dark mode works across all pages
- [x] Verify i18n: all visible text translated in all 3 languages
- [x] Verify LINE auth flow creates session
- [x] Verify planner download works
- [x] Verify quiz AI narrative generates
- [x] Verify payment webhook is secured
- [x] Target: all domains >= 95/100, no P0 or P1 remaining -- v1 FAILED (82/100, 7 P1). v2 PASS on P1 gate (87/100, 0 P1 remaining). Verdict: BORDERLINE.
- **STATUS:** [x] COMPLETE — v2 Score: 87/100, Verdict: BORDERLINE

---

## Sprint Completion Gate
- [ ] Wave 1: All 8 agents COMPLETE
- [x] Wave 2: Build passes clean
- [ ] Wave 3: DA score ≥ 99/100
- [ ] All changes committed and pushed to claude/spawn-agent-fvw52
