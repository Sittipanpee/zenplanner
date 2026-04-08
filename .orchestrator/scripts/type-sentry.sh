#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HEALTH="$ROOT/.orchestrator/state/health.json"
ALERTS="$ROOT/.orchestrator/inbox/sentry-alerts"
mkdir -p "$ALERTS"

START=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LOG=$(mktemp)
if (cd "$ROOT" && npx tsc --noEmit >"$LOG" 2>&1); then
  STATUS=pass
  ERR_COUNT=0
else
  STATUS=fail
  ERR_COUNT=$(grep -c "error TS" "$LOG" || echo 0)
  ALERT="$ALERTS/type-$(date -u +%Y%m%dT%H%M%SZ).md"
  {
    echo "---"
    echo "type: sentry_alert"
    echo "from: type-sentry"
    echo "priority: critical"
    echo "sentry: type"
    echo "status: fail"
    echo "error_count: $ERR_COUNT"
    echo "created_at: $START"
    echo "---"
    echo
    echo "## TypeScript errors ($ERR_COUNT)"
    echo '```'
    head -40 "$LOG"
    echo '```'
  } > "$ALERT"
fi

python3 - "$HEALTH" "$STATUS" "$START" "$ERR_COUNT" << 'PYEOF'
import json, sys
path, status, ts, count = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["type"] = {"status": status, "last_check": ts, "error_count": int(count), "errors": []}
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PYEOF

"$ROOT/.orchestrator/scripts/journal.sh" type-sentry sentry_check sentry=type status="$STATUS" errors="$ERR_COUNT" >/dev/null
echo "type-sentry: $STATUS ($ERR_COUNT errors)"
rm -f "$LOG"
