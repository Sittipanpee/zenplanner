---
type: ticket
id: BE-001
from: chief-orchestrator
to: pm-backend-api
dept: backend-api
priority: normal
phase: INFRA-PILOT
created_at: 2026-04-08T11:22:03Z
title: Add /api/health endpoint
---

# BE-001 — Add /api/health endpoint

## Scope
Create a tiny health-check endpoint that returns service status in JSON.
Used by infrastructure monitoring (Vercel health, uptime checks, sentinel liveness probes).

## Files to create
- `app/api/health/route.ts` (new)

## Acceptance criteria
- [ ] GET /api/health returns 200 with JSON: { status: "ok", uptime: <seconds since process start>, ts: <ISO> }
- [ ] Route is public (no auth required — it's a liveness probe)
- [ ] Uses Zod to define the response shape
- [ ] `export const dynamic = "force-dynamic"` (no prerender)
- [ ] `npm run build` passes

## Boundaries
- Do NOT modify any other file.
- Do NOT touch env vars, middleware, auth, or existing routes.
- You own only `app/api/**`. The Conflict Hawk will block any other write.

## Workflow (MANDATORY)
1. Journal your start: `./.orchestrator/scripts/journal.sh worker-be-001 start ticket=BE-001`
2. Create the file with Write tool
3. Journal: `./.orchestrator/scripts/journal.sh worker-be-001 wrote path=app/api/health/route.ts`
4. Run `npm run build` to self-verify (via Bash tool)
5. Use the **Skill tool** with `skill: "git"` and `args: "commit"` to commit your change
   (do NOT run raw git commands — use the /git skill)
6. Journal complete: `./.orchestrator/scripts/journal.sh worker-be-001 complete ticket=BE-001`
7. File your pm_report into `.orchestrator/inbox/pm-reports/BE-001-$TS.md` with
   YAML frontmatter matching `.orchestrator/schemas/pm_report.schema.json`

## pm_report template
```yaml
---
type: pm_report
from: pm-backend-api
to: chief-orchestrator
priority: normal
phase: INFRA-PILOT
created_at: <ISO timestamp>
ticket_id: BE-001
status: COMPLETE
summary:
  delivered:
    - /api/health endpoint returning status/uptime/ts
  files_touched:
    - app/api/health/route.ts
  concerns: []
  next_suggestion: Wire health check into Vercel monitoring
---
```
