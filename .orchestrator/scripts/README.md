# .orchestrator/scripts — Orchestration runtime

## Live scripts

| Script | Purpose | Cadence |
|---|---|---|
| `journal.sh <agent> <action> [k=v ...]` | Append event to daily journal | Called by every agent before/after any action |
| `co-poll.sh` | Chief Orchestrator polling tick | Every 30 seconds (cron or manual) |
| `halt-check.sh` | Detect HALT flag or commander halt order | Called by co-poll.sh (part of tick) |
| `build-sentry.sh` | Run npm run build, update health.json | Every 5 min (cron) OR on-demand |
| `type-sentry.sh` | Run tsc --noEmit, update health.json | Every 5 min (cron) OR on-demand |
| `conflict-hawk.py` | PreToolUse hook for Edit/Write | Wired to Claude Code hook config |

## Wiring Conflict Hawk into Claude Code

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": ".orchestrator/scripts/conflict-hawk.py",
            "env": {
              "AGENT_DEPT": "${AGENT_DEPT}"
            }
          }
        ]
      }
    ]
  }
}
```

Set `AGENT_DEPT` when spawning a worker subagent so the hook knows
which department the worker belongs to. Chief Orchestrator runs with
`AGENT_DEPT=chief-orchestrator` and bypasses all ownership checks.

## Running sentries on a schedule

On macOS with launchd, create `~/Library/LaunchAgents/zenplanner.orchestrator.plist`
that runs `co-poll.sh` every 30s. For development, just run it in a terminal loop:

```bash
while true; do
  .orchestrator/scripts/co-poll.sh
  .orchestrator/scripts/build-sentry.sh &
  .orchestrator/scripts/type-sentry.sh &
  wait
  sleep 30
done
```

## Journal format

One JSON object per line in `.orchestrator/journals/YYYY-MM-DD.jsonl`.
Append-only. Never rewritten. Survives worktree wipes.

Every entry has at minimum: `ts`, `agent`, `action`.
Common additional fields: `path`, `sha`, `ticket`, `status`, `duration_ms`,
`reason`, `owner`, `offender`.
