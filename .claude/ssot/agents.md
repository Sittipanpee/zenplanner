# ZenPlanner — Agent Team Structure (SSOT)

> **14 agents total**: Agent 14 (PM) is the middle layer. Orchestrator → PM → Builders (1-13).
> Orchestrator dispatches PM only. PM dispatches builders. PM reports back to Orchestrator.

---

## Communication Hierarchy

```
[Antigravity — Chief of Staff]  ← reads .claude/status/ files only
        │
        ▼  (high-level: "Build Phase 2")
[Orchestrator — Claude Code]
        │
        ▼  (phase goal + context briefing)
[Agent 14: PM — Project Manager]    ← the only agent Orchestrator talks to directly
        │
   ┌────┼────┬────┬────┐
   ▼    ▼    ▼    ▼    ▼
[Agents 1-13: Builders]             ← PM dispatches, verifies, reports to Orchestrator
```

**Token saving**: Orchestrator sends 1 message to PM, receives 1 report. 
Orchestrator does NOT monitor 13 agents individually.

---

## Agent 14: `PM` — Project Manager (Token-Efficient Middle Layer)

**Scope**: `.claude/status/` (PROGRESS.md, TODOS.md, ERRORS.log), agent coordination
**Runs throughout**: All phases

### PM Token Protocol

```
ORCHESTRATOR → PM:  1 dispatch message per phase
PM → BUILDERS:      1 context-packed message per builder
BUILDERS → PM:      1 DELIVERY REPORT per builder
PM verification:    8 checks (from anti-hallucinate.md), npm run build
PM → ORCHESTRATOR:  1 report (≤ 10 lines) per phase

TOTAL ORCHESTRATOR TOKEN COST: 2 messages per phase (send + receive)
```

### PM Responsibilities

```
DISPATCH:
  1. Read SSOT files relevant to builder's task
  2. Craft builder prompt with ALL context (one-shot — no back-and-forth)
  3. Include exact file list the builder is allowed to touch

VERIFICATION (after each builder):
  1. Run 8 anti-hallucination checks (grep commands from anti-hallucinate.md)
  2. npm run build
  3. **FUNCTIONAL TESTING** (CRITICAL - NEW REQUIREMENT):
     - Use agent-browser to test actual functionality
     - Verify buttons work (click, observe action)
     - Verify forms submit (fill, submit, check result)
     - Verify data flows (check DB or localStorage)
     - Test full user journey end-to-end
  4. Update PROGRESS.md: mark agent ✅/❌
  5. Update TODOS.md: cross off completed items
  6. Update ERRORS.log: log any issues

FUNCTIONAL TESTING PROTOCOL (NEW):
  - NEVER trust static code analysis alone
  - ALWAYS test with agent-browser:
    1. Open page → snapshot
    2. Click button → wait → check result
    3. Fill form → submit → verify data saved
    4. Navigate full flow → verify start to end
  - If interaction fails → FAIL even if build passes
  - Report specific failure: "Button X doesn't trigger action Y"

COMPACT MANAGEMENT:
  - /compact after each full phase
  - /compact when build output > 200 lines
  - Before /compact: update all 3 status files
  - After /compact: read PROGRESS.md to restore state

ESCALATION to Orchestrator:
  - Agent fails 3 times → STOP, add to ERRORS.log, report BLOCKED
  - Build failure can't be root-caused → STOP + BLOCKED
  - SSOT conflict detected → STOP + BLOCKED
  - Never guess — always escalate ambiguous situations
```

### PM Report Format (to Orchestrator — strict brevity)

```
## PM REPORT — Phase [N] — [PASS/FAIL/BLOCKED]

✅ Done: [agent list]
❌ Failed: [agent]: [1-line reason]
🔴 Blocked: [issue] — awaiting Orchestrator decision
Build: [PASS/FAIL] + [error if fail]
Next: [Phase N+1 agents to dispatch] OR [needs user input: X]
```

### Status Files PM Must Maintain

```
.claude/status/PROGRESS.md — update after EVERY agent completion
.claude/status/TODOS.md    — cross off items as done, add new if scope changes
.claude/status/ERRORS.log  — log IMMEDIATELY when any error occurs

Format for PROGRESS.md update:
  Agent 01 SCAFFOLD: ✅ Complete [2026-03-14 04:00]
  Agent 02 FOUNDATION: 🔄 In Progress
  Build Phase 1: PASS

Format for ERRORS.log:
  [2026-03-14 04:15] [🔴 HALT] [FOUNDATION] css variable typo in line 42
    Fix: corrected --zen-sage to match design-system.md
    Status: ✅ Resolved
```

---

## 13 Sub-agents, their scopes, dependencies, and file ownership.
> Orchestrator dispatches agents in phases — never codes itself.

---

## Dependency DAG

```
SCAFFOLD ──┬── FOUNDATION ──┬── AUTH_UI ────────┬── DASHBOARD
           │                │                   │
           ├── TYPES ───────┼── LLM_ENGINE ─────┼── QUIZ_UI ─── BLUEPRINT_UI ─── EXPORT_UI
           │                │                   │
           │                └── SHEET_ENGINE ────┴── API_ROUTES
           │                                    │
           ├── MIDDLEWARE                        │
           └── LIFF_INTEGRATION ────────────────┘
```

---

## Orchestration Phases

### Phase 1: Foundation (Sequential)
```
1. Dispatch SCAFFOLD → wait → verify: npm run dev starts
2. Dispatch FOUNDATION + TYPES in parallel → wait
3. Run: npm run build → must pass before Phase 2
```

### Phase 2: Core Logic (Parallel)
```
Dispatch simultaneously:
- LLM_ENGINE      (needs: TYPES)
- SHEET_ENGINE    (needs: TYPES)
- AUTH_UI         (needs: FOUNDATION)
- MIDDLEWARE      (needs: SCAFFOLD)
- LIFF_INTEGRATION (needs: SCAFFOLD + TYPES)
```

### Phase 3: Features (Parallel, after Phase 2)
```
Dispatch simultaneously:
- QUIZ_UI    (needs: FOUNDATION + TYPES + LLM_ENGINE + LIFF_INTEGRATION)
- DASHBOARD  (needs: FOUNDATION + TYPES + AUTH_UI)
- API_ROUTES (needs: TYPES + LLM_ENGINE + SHEET_ENGINE + LIFF_INTEGRATION)
```

### Phase 4: Integration (Sequential)
```
1. BLUEPRINT_UI (needs: QUIZ_UI + LLM_ENGINE)
2. EXPORT_UI    (needs: SHEET_ENGINE + API_ROUTES + BLUEPRINT_UI)
3. Full build + integration test
4. LIFF verify: test in LINE app on real device
```

---

## File Ownership Map

| Path | Owner | Notes |
|---|---|---|
| `app/globals.css` | FOUNDATION | Immutable after Phase 1 |
| `app/layout.tsx` | FOUNDATION | Immutable after Phase 1 |
| `app/page.tsx` | FOUNDATION | Landing page |
| `lib/types.ts` | TYPES | ❌ IMMUTABLE after creation |
| `supabase/migrations/*` | TYPES | ❌ IMMUTABLE after creation |
| `lib/llm.ts` | LLM_ENGINE | |
| `lib/quiz-engine.ts` | LLM_ENGINE | |
| `lib/archetype-map.ts` | LLM_ENGINE | |
| `lib/sheet-builder.ts` | SHEET_ENGINE | |
| `lib/planner-generator.ts` | SHEET_ENGINE | |
| `lib/vba-templates/*` | SHEET_ENGINE | |
| `lib/liff.ts` | LIFF_INTEGRATION | |
| `components/liff/*` | LIFF_INTEGRATION | |
| `app/api/*` | API_ROUTES | (except `/api/line/*` shared) |
| `app/api/line/*` | API_ROUTES + LIFF_INTEGRATION | Coordinate |
| `app/(auth)/*` | AUTH_UI | |
| `components/ui/*` | AUTH_UI | |
| `app/(app)/quiz/*` | QUIZ_UI | |
| `components/quiz/*` | QUIZ_UI | |
| `app/(app)/dashboard/*` | DASHBOARD | |
| `components/dashboard/*` | DASHBOARD | |
| `app/(app)/blueprint/*` | BLUEPRINT_UI | |
| `components/planner/*` | BLUEPRINT_UI | |
| `app/(app)/generate/*` | EXPORT_UI | |
| `components/export/*` | EXPORT_UI | |
| `middleware.ts` | MIDDLEWARE | |
| `app/(app)/layout.tsx` | MIDDLEWARE + DASHBOARD | Coordinate |

---

## Agent Specifications

### Agent 1: `SCAFFOLD`
**Scope**: Project root setup
**When**: Phase 1, step 1
```
TASKS:
1. npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --no-src-dir
2. npm install @supabase/ssr @supabase/supabase-js lucide-react xlsx @line/liff
3. Create dirs: components/{ui,quiz,planner,export,dashboard,liff}/ lib/supabase/ public/animals/ supabase/migrations/
4. Create .env.example (see CLAUDE.md env vars)
5. Create lib/supabase/{client,server,middleware}.ts
6. Create middleware.ts skeleton
7. Add viewport-fit=cover meta in layout.tsx
VERIFY: npm run dev starts clean
```

### Agent 2: `FOUNDATION`
**Scope**: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
**Dependencies**: SCAFFOLD
```
TASKS:
1. app/globals.css — ALL tokens from design-system.md SSOT, all animations,
   all utility classes (.zen-card, .zen-button, .zen-input, .zen-bottom-bar)
   MOBILE FIRST: base at 375px, min-width only queries
2. app/layout.tsx — Google Fonts import, Supabase provider, LiffProvider wrapper,
   html lang="th", viewport-fit=cover, SEO metadata
3. app/page.tsx — Landing page with 2 mode CTAs:
   - "🎮 ค้นหาสัตว์ประจำตัวคุณ" → /quiz (mini-game mode)
   - "📋 สร้าง Planner สำหรับฉัน" → /planner (custom mode)
   MOBILE: single column, full-width, bottom-anchored CTA
   DESKTOP: max-w-4xl, 2-col hero
VERIFY: Both CTAs present, renders at 375px + 1024px
```

### Agent 3: `TYPES`
**Scope**: `lib/types.ts`, `supabase/migrations/`
**Dependencies**: SCAFFOLD
```
TASKS:
1. lib/types.ts — ALL interfaces from schema.sql SSOT:
   Profile, QuizSession, AxisScore, SpiritAnimal (union of 16),
   LifestyleProfile, PlannerBlueprint, ToolSelection, GenerationJob,
   GeneratedPlanner, Payment, ActivityLog, AnimalAsset, LIFFContext
   PlannerToolId (union of all tool IDs from tools-taxonomy.md)
2. supabase/migrations/001_initial.sql — copy from schema.sql SSOT exactly
CRITICAL: All type names must match DB column names. No inventing new types.
VERIFY: tsc --noEmit passes
```

### Agent 4: `LLM_ENGINE`
**Scope**: `lib/llm.ts`, `lib/quiz-engine.ts`, `lib/archetype-map.ts`
**Dependencies**: TYPES
```
TASKS:
1. lib/llm.ts — callLLM() from api-spec.md SSOT exactly
2. lib/quiz-engine.ts:
   - QUIZ_SYSTEM_PROMPT: scenario questions, tracks 6 axes, outputs [QUIZ_COMPLETE] + axisScores JSON
   - PROFILING_SYSTEM_PROMPT: lifestyle questions based on archetype, outputs [PROFILE_COMPLETE] + lifestyleProfile JSON
   - BLUEPRINT_SYSTEM_PROMPT: selects 8-15 tools from taxonomy, outputs JSON blueprint
   - quizStep(), profileStep(), generateBlueprint() export functions
3. lib/archetype-map.ts:
   - calculateAnimal(axisScores): nearest-neighbor mapping to 16 animal codes
   - getAnimalInfo(code): returns full archetype object from archetypes.md SSOT
   - All 16 archetype definitions hard-coded (descriptions from SSOT — do not modify)
VERIFY: tsc passes, pure functions (no side effects except callLLM)
```

### Agent 5: `QUIZ_UI`
**Scope**: `app/(app)/quiz/`, `components/quiz/`
**Dependencies**: FOUNDATION + TYPES + LLM_ENGINE + LIFF_INTEGRATION
```
MODE 1 PAGES:
- /quiz — intro: "ค้นหาสัตว์ประจำตัวคุณ" + start button + animated icon
- /quiz/game — swipeable question cards (mobile-first, touch swipe):
    Pre-defined questions, 4 choices per question, progress dots
    LLM NOT used here — questions are static for speed
- /quiz/reveal — dramatic animal reveal:
    Per-animal theme (gradient, frame animation, particles from archetypes.md SSOT)
    Axis breakdown bars, LLM-generated personal insight, share button (LIFF)
    CTA: "สร้าง Planner ที่ออกแบบมาเพื่อคุณ →"
- /quiz/profile — follow-up lifestyle chat (LLM, animal-specific prompts)

COMPONENTS: chat-bubble.tsx, axis-indicator.tsx, animal-card.tsx, progress-dots.tsx, quiz-option.tsx
VERIFY: Full quiz flow works, reveal shows correct animal theme
```

### Agent 6: `BLUEPRINT_UI`
**Scope**: `app/(app)/blueprint/`, `components/planner/`
**Dependencies**: QUIZ_UI + LLM_ENGINE
```
PAGES:
- /blueprint — tool grid review:
    Animal header, tools grouped by category, toggle ON/OFF each tool
    Customization panel (color scheme, language, wake time)
    Summary + "Generate My Planner" CTA
- /blueprint/customize — deep customization:
    5 zen color palettes, schedule preferences, category naming

COMPONENTS: tool-card.tsx, tool-grid.tsx, customization-panel.tsx, preview-mini.tsx
VERIFY: Toggles work, customization saves to DB
```

### Agent 7: `SHEET_ENGINE`
**Scope**: `lib/sheet-builder.ts`, `lib/planner-generator.ts`, `lib/vba-templates/`
**Dependencies**: TYPES
```
TASKS:
1. lib/sheet-builder.ts:
   - buildWorkbook(blueprint): multi-sheet .xlsx workbook via SheetJS
   - addSheet(wb, toolConfig): columns + formulas per tool-taxonomy.md SSOT
   - applyTheme(wb, colorScheme): zen colors
   - injectVBA(wb, macros): Excel VBA macro injection

2. lib/planner-generator.ts:
   - generatePlanner(blueprint): orchestrate parallel sheet generation (like KodeCode pattern)
   - Returns ArrayBuffer (download-ready)

3. lib/vba-templates/:
   - auto-date.vba, conditional-format.vba, dropdown-shortcuts.vba, summary-dash.vba

VERIFY: Generated .xlsx opens in Google Sheets + Excel without errors
```

### Agent 8: `API_ROUTES`
**Scope**: `app/api/`
**Dependencies**: TYPES + LLM_ENGINE + SHEET_ENGINE + LIFF_INTEGRATION
```
Build all routes from api-spec.md SSOT exactly.
Every route: auth check → validate → lib functions only → return.
LINE webhook: verify HMAC-SHA256 signature, not Supabase auth.
LINE auth bridge: verify LINE token → create/link Supabase user.
VERIFY: All routes return correct status codes
```

### Agent 9: `AUTH_UI`
**Scope**: `app/(auth)/`, `components/ui/`
**Dependencies**: SCAFFOLD + FOUNDATION
```
PAGES:
- /login — Zen login card: LINE login button (primary), GitHub OAuth, magic link
  Background: ink-wash gradient (CSS only)

COMPONENTS (Zen-themed, reusable):
- zen-button.tsx (primary/secondary/ghost/line variants)
- zen-input.tsx (label + input + error state)
- zen-card.tsx (card container)
- zen-nav.tsx (top nav OR bottom tab nav based on viewport)
- zen-badge.tsx

VERIFY: LINE login works end-to-end, other OAuth works
```

### Agent 10: `DASHBOARD`
**Scope**: `app/(app)/dashboard/`, `components/dashboard/`
**Dependencies**: FOUNDATION + TYPES + AUTH_UI
```
PAGES:
- /dashboard — user home:
    Animal profile card (if quiz done) OR "Start Quiz" CTA
    Generated planners list (download history)
    Activity heatmap (GitHub-tile, last 90 days)
    Quick stats (planners generated, days active)

COMPONENTS: animal-profile.tsx, heatmap.tsx, planner-history.tsx, stats-grid.tsx
VERIFY: Dashboard shows correct user data from Supabase
```

### Agent 11: `EXPORT_UI`
**Scope**: `app/(app)/generate/`, `components/export/`
**Dependencies**: SHEET_ENGINE + API_ROUTES + BLUEPRINT_UI
```
PAGES:
- /generate — generation progress:
    Animated progress bar (sheet by sheet, polls /api/planner/status/[id])
    "Generating your 🦁 Lion Planner..."
    Current sheet name + icon
- /generate/done — download page:
    SuccessAnimation (zen-ripple)
    Download buttons: Google Sheets, Excel VBA
    Share animal result button (LIFF)
    "Retake Quiz" option

COMPONENTS: generation-progress.tsx, download-card.tsx, share-card.tsx
VERIFY: Progress updates in real-time, download button produces valid .xlsx
```

### Agent 12: `MIDDLEWARE`
**Scope**: `middleware.ts`, `app/(app)/layout.tsx`
**Dependencies**: SCAFFOLD + AUTH_UI
```
TASKS:
1. middleware.ts:
   - Protect: /dashboard /quiz /blueprint /generate
   - Public: / /login /api/payment/webhook /api/line/webhook
   - LIFF bridge: if LIFF logged in but no Supabase session → call /api/auth/line

2. app/(app)/layout.tsx:
   - Authenticated wrapper, fetch user profile
   - MOBILE: bottom tab nav (4 tabs: Home, Quiz, Blueprint, Profile)
   - DESKTOP: top zen-nav
   - Show LINE picture if available

VERIFY: Redirect works, LIFF users auto-auth
```

### Agent 13: `LIFF_INTEGRATION`
**Scope**: `lib/liff.ts`, `components/liff/`
**Dependencies**: SCAFFOLD + TYPES + AUTH_UI
```
TASKS:
1. lib/liff.ts — full LIFF wrapper from api-spec.md SSOT
2. components/liff/liff-provider.tsx — React context, auto-init, graceful fallback
3. components/liff/share-animal-button.tsx — liff.shareTargetPicker() + Web Share API fallback
4. components/liff/line-login-button.tsx — LINE login in LIFF + standalone modes

MOBILE:
- Handle LIFF redirects (page reload after liff.login())
- Use sessionStorage (not localStorage) for LINE in-app browser compat
- Detect iOS/Android for platform-specific tweaks

VERIFY: Works in LINE app, fallback works in desktop browser
```

---

## FIXER Agents (Phase 5: Bug Fixes)

### Agent F1: `EXCEL_FIXER` — Excel Formulas & VBA
**Scope**: `lib/sheet-builder.ts`
**Priority**: HIGH
```
TASKS:
1. Add working Excel formulas:
   - daily_power_block: Score = SUM(priority columns)
   - mood_tracker: Average mood formula
   - quest_system: Total XP = SUM(all quest XP)
   - streak_tracker: Current streak counter
   - habit_heatmap: COUNTIF for completed days

2. Implement VBA injection:
   - auto-date: Auto-populate TODAY() on sheet open
   - conditional-format: Color coding based on values
   - dropdown-shortcuts: Data validation dropdowns
   - summary-dash: Auto-generate summary sheet

3. Test: Generate Excel → open in Excel → verify formulas calculate

VERIFY: Formulas work in Excel, VBA macros execute on open
```

### Agent F2: `BLUEPRINT_FIXER` — Tool Loading & Previews
**Scope**: `app/(app)/blueprint/page.tsx`, `components/planner/special-tool-previews.tsx`
**Priority**: HIGH
```
TASKS:
1. Fix empty blueprint loading:
   - Fetch tools from database properly
   - Show default tool selection if no blueprint exists
   - Handle loading/error states

2. Add 10 tool previews:
   - daily_power_block: Priority grid preview
   - mood_tracker: Emoji selector preview
   - kanban_board: 3-column board preview
   - life_wheel: Radar chart preview
   - eisenhower_matrix: 2x2 quadrant preview
   - weekly_compass: Week grid preview
   - milestone_map: Timeline preview
   - budget_tracker: Table preview
   - energy_map: Curve chart preview
   - morning_clarity: Card prompt preview

3. Test: Open /blueprint → verify tools display → verify previews show

VERIFY: All 38 tools have visual previews
```

### Agent F3: `DASHBOARD_FIXER` — Visualization & Data
**Scope**: `app/(app)/dashboard/page.tsx`
**Priority**: HIGH
```
TASKS:
1. Fix habit visualization:
   - Replace checkbox list with GitHub-style tiles
   - Show streak count with flame icon
   - Color coding by completion rate

2. Fix mood tracker:
   - Add emoji representation (😢😕😐🙂😊)
   - Show visual mood chart

3. Connect to real data:
   - Fetch from Supabase instead of localStorage
   - Show actual user activity

4. Test: Open /dashboard → verify habit tiles → verify mood emojis

VERIFY: Dashboard shows real data with proper visualization
```

### Agent F4: `GENERATE_FIXER` — Generation Flow
**Scope**: `app/(app)/generate/page.tsx`, `lib/sheet-builder.ts`
**Priority**: HIGH
```
TASKS:
1. Fix generation flow:
   - Connect to blueprint tool selection
   - Pass selected tools to sheet-builder
   - Generate actual downloadable Excel

2. Add error handling:
   - Show specific error messages
   - Retry mechanism
   - Loading states

3. Test: Select tools → click generate → verify download works

VERIFY: Full generate flow produces working Excel file
```

### Agent F5: `FINAL_TESTER` — Comprehensive Verification
**Scope**: All pages
**Priority**: CRITICAL
```
TASKS:
1. Test all user journeys:
   - Signup → Quiz → Blueprint → Generate → Download
   - Login → Dashboard → View History
   - Verify data persists

2. Test all interactive elements:
   - All buttons clickable
   - All forms submit
   - All toggles work
   - All navigation works

3. Test edge cases:
   - Empty states
   - Error states
   - Loading states

4. Test visual:
   - Mobile responsive
   - Desktop responsive
   - Zen design system applied

VERIFY: Full app functional, ready for production
```
