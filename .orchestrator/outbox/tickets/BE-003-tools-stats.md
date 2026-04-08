---
type: ticket
id: BE-003
from: chief-orchestrator
to: pm-backend-api
dept: backend-api
priority: normal
phase: INFRA-PILOT
created_at: 2026-04-08T11:22:03Z
title: Add /api/tools/stats endpoint
---

# BE-003 — Add /api/tools/stats endpoint

## Scope
Read-only summary of the tool registry + aggregate user engagement metrics.
Used by the dashboard "X / Y tools active" chip and the eventual admin panel.

## Files to create
- `app/api/tools/stats/route.ts` (new)

## Acceptance criteria
- [ ] GET /api/tools/stats, public (no auth — public counts only)
- [ ] Returns JSON: { totalTools: number, byCategory: Record<category, number>, syntheticCount: number }
- [ ] Reads from `CATALOG_TOOLS` and `ALL_TOOLS` in `lib/tools/registry.ts`
- [ ] `export const dynamic = "force-dynamic"`
- [ ] `npm run build` passes

## Boundaries
- Do NOT modify `lib/tools/registry.ts` — it's CO-only. Import from it, don't edit.
- You only own `app/api/**`.

## Workflow (MANDATORY)
1. Journal start
2. Write file
3. Journal wrote
4. `npm run build`
5. Use **Skill tool** (`skill: "git"`, `args: "commit"`) for commit — NO raw git
6. Journal complete
7. File pm_report
