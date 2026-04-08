#!/usr/bin/env bash
# co-poll.sh — Chief Orchestrator polling tick.
# Run this every 30 seconds via a cron/launchd OR manually as a heartbeat.
# It's stateless — safe to re-run any time.
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# 1. Halt check (highest priority — other checks don't run if halted)
./.orchestrator/scripts/halt-check.sh >/dev/null

HALTED=$(python3 -c "import json; print(json.load(open('.orchestrator/state/health.json'))['halt']['active'])")

if [ "$HALTED" = "True" ]; then
  echo "[CO] HALTED — skipping dispatch + sentry runs"
  ./.orchestrator/scripts/journal.sh chief-orchestrator poll_halted >/dev/null
  exit 0
fi

# 2. Count new inbox messages by priority
count_files() { find "$1" -type f -name '*.md' 2>/dev/null | wc -l | tr -d ' '; }
ESC=$(count_files .orchestrator/inbox/escalations)
CMD=$(count_files .orchestrator/inbox/commander-orders)
SENTRY=$(count_files .orchestrator/inbox/sentry-alerts)
PM=$(count_files .orchestrator/inbox/pm-reports)
DA=$(count_files .orchestrator/inbox/da-findings)

# 3. Summary line
echo "[CO] poll $(date -u +%H:%M:%SZ) inbox: esc=$ESC cmd=$CMD sentry=$SENTRY pm=$PM da=$DA"

# 4. Journal the tick
./.orchestrator/scripts/journal.sh chief-orchestrator poll_tick \
  escalations="$ESC" commander="$CMD" sentry="$SENTRY" pm="$PM" da="$DA" >/dev/null
