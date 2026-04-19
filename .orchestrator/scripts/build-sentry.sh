#!/usr/bin/env bash
# build-sentry.sh — runs `npm run build`, updates health.json, alerts on fail
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HEALTH="$ROOT/.orchestrator/state/health.json"
ALERTS="$ROOT/.orchestrator/inbox/sentry-alerts"
mkdir -p "$ALERTS"

START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
TS_EPOCH_MS=$(($(date +%s) * 1000))
LOG=$(mktemp)
if (cd "$ROOT" && npm run build >"$LOG" 2>&1); then
  STATUS=pass
  DURATION_MS=$(( $(date +%s) * 1000 - TS_EPOCH_MS ))
  ERROR=null
else
  STATUS=fail
  DURATION_MS=$(( $(date +%s) * 1000 - TS_EPOCH_MS ))
  ERROR=$(tail -20 "$LOG" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  # File a critical alert
  ALERT="$ALERTS/build-$(date -u +%Y%m%dT%H%M%SZ).md"
  {
    echo "---"
    echo "type: sentry_alert"
    echo "from: build-sentry"
    echo "to: chief-orchestrator"
    echo "priority: critical"
    echo "sentry: build"
    echo "status: fail"
    echo "created_at: $START"
    echo "---"
    echo
    echo "## Build failed"
    echo
    echo '```'
    tail -40 "$LOG"
    echo '```'
  } > "$ALERT"
fi

python3 - "$HEALTH" "$STATUS" "$START" "$DURATION_MS" "$ERROR" << 'PYEOF'
import json, sys
path, status, ts, duration, error = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["build"] = {
    "status": status,
    "last_check": ts,
    "duration_ms": int(duration),
    "error": None if error == "null" else json.loads(error),
}
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PYEOF

"$ROOT/.orchestrator/scripts/journal.sh" build-sentry "sentry_check" sentry=build status="$STATUS" duration_ms="$DURATION_MS" >/dev/null
echo "build-sentry: $STATUS"
rm -f "$LOG"
