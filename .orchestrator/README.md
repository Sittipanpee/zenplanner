# .orchestrator/ — Team Operations Root

Chief Orchestrator governance directory for ZenPlanner continuous production.

## Before doing ANY work — read these in order:
1. [CHARTER.md](CHARTER.md) — governance + RACI + rules (MANDATORY)
2. [state/ownership.json](state/ownership.json) — what your dept owns
3. [state/phase.json](state/phase.json) — current phase + active depts
4. [state/health.json](state/health.json) — system pulse

## Directory Map

| Path | Purpose |
|---|---|
| `inbox/` | Messages waiting for CO to read |
| `inbox/pm-reports/` | Dept PMs → CO |
| `inbox/da-findings/` | Devil's Advocate → CO |
| `inbox/sentry-alerts/` | Sentinels → CO |
| `inbox/escalations/` | PMs → CO (urgent) |
| `inbox/commander-orders/` | Commander → CO |
| `inbox/_invalid/` | Quarantined malformed messages |
| `outbox/` | CO → team |
| `outbox/tickets/` | New tickets dispatched |
| `outbox/decisions/` | Broadcast decisions |
| `outbox/halt-orders/` | Halt broadcasts |
| `state/` | Single source of truth |
| `journals/` | Append-only audit trail (daily rotated) |
| `decisions/` | CO's immutable decision log |
| `reports/` | Weekly reports for Commander |
| `schemas/` | Zod schemas for all message types |
| `scripts/` | Sentinel + queue + hook scripts |
| `worktrees/` | Per-worker isolated git worktrees |

## Emergency Halt

- Fast: `touch .orchestrator/HALT` (detected within 30 seconds)
- Remote: send `/halt` to ZenPlanner Telegram bot
- Resume: `rm .orchestrator/HALT` + explicit Commander resume order

## Current Phase

See `state/phase.json`. As of 2026-04-08: **INFRA-BUILD**
(building the orchestrator itself; no dept workers dispatched yet).
