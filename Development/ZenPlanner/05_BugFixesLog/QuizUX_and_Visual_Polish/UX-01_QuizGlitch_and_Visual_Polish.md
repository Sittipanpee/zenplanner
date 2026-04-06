# UX-01 — Quiz Glitch & Visual Polish Fix
**Phase:** 6 (Post-Sprint Polish)
**Team:** Arcade
**Status:** [~] IN PROGRESS
**Depends on:** None
**Blocks:** None

## Scope

Fix 5 P1 UX bugs and 7 P2 visual issues identified in Session 6 audit.

## P1 Fixes (Critical UX)

### P1-A: Quiz question flash (500ms old-question re-render)
- **File:** `app/quiz/[mode]/page.tsx` line 84
- **Fix:** Remove `await new Promise((r) => setTimeout(r, 500))` — artificial delay causes old question to flash during transition
- **File:** `app/quiz/[mode]/page.tsx` line 234
- **Fix:** Add `key={currentQuestion}` to `<QuizCard>` — forces React to unmount/remount on question change

### P1-B: Quiz hint text shows progress string, not a hint
- **File:** `components/quiz/quiz-card.tsx` line 143-145
- **Fix:** Replace `{t("question.progress", ...)}` with a meaningful hint or remove

### P1-C: Both landing cards show identical tagline
- **File:** `app/page.tsx` lines 113, 130
- **Fix:** Give each card its own specific description key (`landing.card1.desc`, `landing.card2.desc`)

### P1-D: Hero H1 uses `text-zen-sage` — brand name is muted
- **File:** `app/page.tsx` line 32
- **Fix:** Change to `text-zen-text` for presence; move colour to a subtitle or decoration

### P1-E: Double progress display in quiz
- **File:** `app/quiz/[mode]/page.tsx` — `<QuizProgress>` dot row AND QuizCard's internal progress bar both visible
- **Fix:** Remove the `<QuizProgress>` component from the parent (QuizCard already has a polished bar with percentage)

## P2 Fixes (Visual Consistency)

### P2-A: Mixed dark mode tokens in QuizCard
- **File:** `components/quiz/quiz-card.tsx`
- **Fix:** Replace `dark:bg-zinc-900`, `dark:border-zinc-700`, `dark:bg-zinc-800/50` with zen token equivalents (`bg-zen-surface`, `border-zen-border`, `bg-zen-surface-alt`)

### P2-B: Redundant `dark:bg-zinc-950` on quiz/[mode] page
- **File:** `app/quiz/[mode]/page.tsx`
- **Fix:** Remove `dark:bg-zinc-950` from both `<main>` elements — `bg-zen-bg` already adapts

### P2-C: Feature highlight blocks on landing have no visual container
- **File:** `app/page.tsx` lines 55-94
- **Fix:** Wrap each feature block in a card (`bg-zen-surface border border-zen-border rounded-zen-lg`) for visual structure

### P2-D: Landing hover inconsistency
- **File:** `app/page.tsx`
- **Fix:** Unify hover border colour — both cards should use `hover:border-zen-sage` (or both `hover:border-zen-gold`). Currently one is gold, one is sage.

### P2-E: QuizProgress 22 dots overflow on mobile
- **File:** `components/quiz/quiz-card.tsx` (QuizProgress component) — ONLY if P1-E does not remove it
- **Fix:** If keeping QuizProgress: add `flex-wrap gap-1` and reduce dot size to `w-2 h-2` on small screens

### P2-F: `console.log` in production quiz save
- **File:** `app/quiz/[mode]/page.tsx` line 153
- **Fix:** Remove `console.log("Quiz saved successfully:", data)`

### P2-G: Desktop sidebar — no logo mark
- **File:** `app/(app)/layout.tsx` line 58
- **Fix:** Add spirit animal emoji 🌿 or a small icon before the "ZenPlanner" wordmark

## Acceptance Criteria
- [ ] Clicking a quiz answer transitions smoothly — no flash of old question
- [ ] Quiz page shows one progress indicator only (the card's internal bar)
- [ ] Landing page cards have distinct, specific descriptions
- [ ] Hero brand name has visual weight / presence
- [ ] Quiz card uses only zen design tokens (no zinc overrides)
- [ ] Feature highlights have card containers
- [ ] Build passes clean after changes
- [ ] No console.log in production code

## Boundaries
- Do NOT touch: quiz scoring logic, i18n message files (add keys only if needed), database logic, API routes
- Do NOT redesign pages — polish only
