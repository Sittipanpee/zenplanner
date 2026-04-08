# ZenPlanner Team Charter — Chief Orchestrator Governance

**Effective:** 2026-04-08
**Scope:** ZenPlanner production operations, continuous cadence
**Revision authority:** Commander only (CO may propose amendments)

---

## 1. Mission

Run ZenPlanner as a continuously-improving production product using
a hierarchical team of specialized agents. Optimize for:
1. Correctness (no data loss, no regressions on main)
2. Velocity (features ship in hours, not days)
3. Safety (any single agent failure is recoverable)
4. Observability (Commander always knows what's happening)

Every rule in this charter exists because a specific failure mode has
been identified. Do not bypass a rule without filing an amendment.

---

## 2. Org Chart

```
Commander
   │
Chief Orchestrator (CO) ─── always-on decision loop
   │
   ├── 8 Department PMs (reports up, dispatches down)
   │     ├── Backend & API
   │     ├── Database & Auth
   │     ├── Frontend & UI
   │     ├── Productivity Tools
   │     ├── Data & Reports
   │     ├── Excel & Export
   │     ├── i18n & Content
   │     └── Infrastructure
   │
   └── 6 Independent Cells (parallel to depts)
         ├── Devil's Advocate
         ├── Build Sentry
         ├── Type Sentry
         ├── Test Sentry
         ├── Security Auditor
         └── Conflict Hawk
```

Each department has: 1 PM + 1–2 Tech Leads + 4–8 Workers + 1 QA.
Max simultaneous active workers across all depts: unlimited (Commander).
CO may voluntarily cap if cost or coordination degrades.

---

## 3. Core Rules (HARD — violating = incident)

### 3.1 Ownership is exclusive
Every file in the repo is owned by exactly ONE department per `.orchestrator/state/ownership.json`. Workers may only WRITE files their department owns. Cross-department writes are blocked by the Conflict Hawk PreToolUse hook. Reads are unrestricted.

### 3.2 No worker touches shared contracts
`lib/tools/types.ts`, `lib/tools/registry.ts`, `lib/tools/_all.ts`, `lib/types.ts`, `.orchestrator/state/*`, `.orchestrator/decisions/*` are **CO-only**. Workers who need contract changes file an escalation.

### 3.3 No direct main-branch writes
All workers push to feature branches off `staging`. Merge Queue is the only path from feature → staging. Staging → main happens only via phase gate + Commander approval.

### 3.4 Every action is journaled
Before writing any file, the worker emits a journal entry with its intent. After writing, it emits a confirmation. The journal at `.orchestrator/journals/YYYY-MM-DD.jsonl` is append-only and survives worktree wipes.

### 3.5 Every report has a schema
PM reports, DA findings, sentry alerts, and escalations must match their Zod schemas in `.orchestrator/schemas/`. Invalid messages are quarantined to `inbox/_invalid/` and never block processing.

### 3.6 Phase gates are mandatory checkpoints
Every 4–6 hours the CO fires a phase gate: freeze merge queue, run full DA audit, run all sentries, file ready-for-merge report, start 2-hour Commander approval timer. If Commander doesn't respond in 2 hours, main branch update is auto-rejected but staging continues running.

### 3.7 Halt is absolute
If `.orchestrator/HALT` exists OR Telegram `/halt` is received, CO broadcasts halt to all PMs within 30 seconds. Workers terminate gracefully after their current file write. Merge queue freezes. Nothing resumes until Commander issues explicit resume order.

### 3.8 Silent failure = critical incident
Any operation that fails without producing a journal entry, a report, or a user-visible error message is a CRITICAL incident. The offending agent is quarantined + the incident goes to the postmortem queue.
### 3.9 Agents MUST use Skills (no raw git, no raw migrations, no raw deploys)
Every agent — worker, PM, sentinel, DA — MUST use the Skill tool when a skill exists for the task it is performing. Specifically:
- **Git operations:** use `Skill("git", "commit" | "pr" | "sync" | "status")` — NEVER raw `git commit`, `git push`, `git merge`, `git rebase`. The /git skill handles safety gates, 2-pass review, and governance logging. Bypassing it is a critical protocol violation.
- **Bug reports, mod logs, sub-features:** use the corresponding slash-command skills (`/bug-report`, `/mod-log`, `/sub-feature`) to create tickets in the Development folder with the correct structure.
- **Any other skill in `.claude/skills/`** that matches the task — use it. Skills exist precisely because their procedures were hardened after past failures.

Raw tool calls are acceptable only when no skill exists for the task. If an agent is uncertain whether a skill applies, it should file an escalation rather than bypass the skill.

Commander directive (2026-04-08): "please always make agents use skills" — this rule is non-negotiable and applies to every agent spawn.


---

## 4. Communication Protocol

### 4.1 Polling loop (CO always-on)
Every 30 seconds:
1. Read `.orchestrator/inbox/` sorted by priority
2. Validate schemas
3. Route each message:
   - ack (record only)
   - decide (log to decisions/, respond via outbox/)
   - dispatch (create ticket, route to PM)
   - escalate (notify Commander)
4. Update state files
5. Check phase timer + sentinel health
6. Sleep

### 4.2 Message types

| Type | From | To | Channel | Priority |
|---|---|---|---|---|
| pm_report | PM | CO | inbox/pm-reports/ | normal |
| escalation | PM | CO | inbox/escalations/ | high |
| da_finding | DA | CO | inbox/da-findings/ | varies |
| sentry_alert | Sentinel | CO | inbox/sentry-alerts/ | critical on fail |
| commander_order | Commander | CO | inbox/commander-orders/ | highest |
| decision | CO | PMs | outbox/decisions/ | broadcast |
| ticket | CO | specific PM | outbox/tickets/ | normal |
| halt_order | Commander/CO | all | outbox/halt-orders/ | highest |

### 4.3 CO never messages workers directly
PMs are the abstraction layer. If CO needs to reach a specific worker, it goes through the PM. This prevents CO from becoming the per-worker bottleneck.

---

## 5. RACI — Decision Authority Matrix

| Decision | R | A | C | I |
|---|---|---|---|---|
| Create feature ticket | CO | CO | Dept PM | Workers |
| Approve ticket complete | Dept PM | Dept PM | QA | CO |
| Architecture (1 dept) | Tech Lead | Dept PM | CO | other PMs |
| Architecture (cross-dept) | CO | CO | all PMs | Commander |
| Contract/schema change | CO | CO | impacted PMs | Commander |
| Merge to staging | Merge Queue | Merge Queue | DA | CO |
| Staging → main | CO | Commander | DA, all PMs | — |
| Phase gate verdict | CO | Commander | DA | all PMs |
| Hotfix to main | CO | Commander | impacted PM | — |
| Halt project | Commander | Commander | CO | all |
| Resume after halt | Commander | Commander | CO | all |
| Kill misbehaving worker | Dept PM or CO | CO | — | — |
| DA finding severity | DA | DA | CO | impacted PM |
| Reject DA finding | CO | CO | DA | Commander |
| Production deploy | CO | Commander | DA, Build Sentry | all |
| Rollback production | CO | CO | — | Commander |

**Principle:** Commander never has to ask "who decided this?" — every decision has exactly one accountable party recorded in `decisions/`.

---

## 6. Phase Gate Procedure

Every 4–6 hours OR when active phase tickets are complete:

```
1. CO freezes Merge Queue
2. In-flight workers finish current ticket or abort
3. Build Sentry + Type Sentry + Test Sentry run in parallel
4. DA Auditor runs full audit of the staging diff
5. CO compiles gate report:
   - What shipped this phase
   - Sentry status
   - DA findings (severity + count)
   - Proposed main-branch commit
6. CO files report to inbox/commander-orders/ (as a request)
7. CO sends Telegram notification to Commander
8. 2-hour timer starts
9a. Commander approves → merge staging → main, unfreeze, dispatch next phase
9b. Commander rejects → file findings, workers remediate, gate re-runs
9c. 2-hour timeout → auto-reject, main unchanged, staging continues, CO files stale-gate incident
```

---

## 7. Crash Recovery (65-min SLA)

When a crash/failure is detected:

1. **Detect** (≤5 min) — sentinel or hawk fires
2. **Pause** (≤5 min) — CO freezes merge queue + affected dept
3. **Diagnose** (≤15 min) — CO reads journal, isolates offender
4. **Contain** (≤5 min) — kill bad worker, revert feature branch, quarantine worktree
5. **Fix** (≤30 min) — dispatch remediation ticket, fresh worker with full context
6. **Verify** (≤10 min) — all sentries green, DA go/no-go
7. **Resume** (≤5 min) — unfreeze, file incident report
8. **Postmortem** (within 24h) — root cause + new safeguard rule

---

## 8. Halt Protocol

### 8.1 Fast path — file flag
`touch .orchestrator/HALT` → CO detects within 30 seconds → broadcast halt order → all workers terminate gracefully after current file write → merge queue freezes → workers deregister → CO waits for Commander resume order

### 8.2 Remote path — Telegram
Send `/halt` to ZenPlanner bot → bot writes to `.orchestrator/inbox/commander-orders/halt.md` → CO picks up next poll → same flow as fast path

### 8.3 Resume
`rm .orchestrator/HALT` + `/resume` command + explicit commander order → CO verifies system health → unfreezes merge queue → resumes dispatch

### 8.4 Emergency rollback
`/rollback <sha>` via Telegram → CO verifies Commander identity → reverts main to the sha → files incident → halts further work pending investigation

---

## 9. Cadence (24h cycle)

| Time / Interval | Event |
|---|---|
| Every 30 sec | CO polling loop |
| Every 5 min | Build + Type sentries run |
| Every 15 min | Test sentry runs |
| Every 30 min | Security auditor + PM aggregated reports |
| Every 1 hour | CO status digest broadcast to PMs |
| Every 4–6 hours | Phase gate |
| Every 24 hours | DA full-pass audit + main branch daily tag |
| Every 7 days | Weekly report to Commander + retrospective |

---

## 10. Amendments

This charter is modified only by Commander. CO may propose amendments via `decisions/AMENDMENT-PROPOSAL-*.md`. Until approved, the current charter is in effect.

Last modification: 2026-04-08 (initial).
