# SPRINT-01 — Production Award Sprint
**Phase:** 6
**Team:** All Teams (10-agent parallel sprint)
**Status:** [~] IN PROGRESS
**Depends on:** Phase 5 (Complete)
**Blocks:** None

## Scope
Full production-grade restructure of ZenPlanner to achieve:
- Notion Design Award / Best Planner Site viability
- 3-language internationalization (TH / EN / ZH)
- Dark mode with system preference detection + manual toggle
- All P0-P3 issues from Devil's Advocate audit (Session 2) resolved
- Clean build (zero TypeScript errors)
- 99/100 Devil's Advocate score

## Acceptance Criteria
- [ ] `npm run build` exits 0, zero TypeScript errors
- [ ] All 12 P0 issues resolved (see SPRINT_SSOT.md)
- [ ] EN/TH/ZH language switcher functional on every page
- [ ] Dark mode toggle functional, system preference detected, localStorage persisted
- [ ] LINE auth creates valid Supabase session
- [ ] Payment webhook verifies signature
- [ ] Quiz generates AI personality narrative in selected language
- [ ] Planner XLSX generates and downloads successfully
- [ ] Devil's Advocate final score ≥ 99/100

## Boundaries
- Do NOT modify: `.claude/`, `tests/`, `supabase/.temp/`
- Do NOT push to main/master

## Notes
- Commander authorized: "Approve, do the work to finish all phase without asking me"
- SSOT: `RoundTable/SPRINT_SSOT.md`
- Todo: `RoundTable/SPRINT_TODO.md`
- Session 2 audit: `RoundTable/05-04-2026_RoundTable_Vol1.md`
