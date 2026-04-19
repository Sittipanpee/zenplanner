#!/usr/bin/env bash
# halt-check.sh — called by CO polling loop every 30 seconds.
# Detects HALT file OR halt order from commander-orders/ OR bot.
# If halt detected, updates health.json and broadcasts halt-order to outbox.
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
HALT_FLAG="$ROOT/.orchestrator/HALT"
HEALTH="$ROOT/.orchestrator/state/health.json"
ORDERS="$ROOT/.orchestrator/inbox/commander-orders"
OUTBOX="$ROOT/.orchestrator/outbox/halt-orders"
mkdir -p "$ORDERS" "$OUTBOX"

HALT_ACTIVE=false
REASON=""
TRIGGER=""

# 1. File flag
if [ -f "$HALT_FLAG" ]; then
  HALT_ACTIVE=true
  REASON="$(cat "$HALT_FLAG" 2>/dev/null || echo 'file-flag')"
  TRIGGER="file-flag"
fi

# 2. Commander halt order message
for f in "$ORDERS"/halt*.md; do
  [ -f "$f" ] || continue
  HALT_ACTIVE=true
  REASON="$(grep -m1 '^reason:' "$f" | sed 's/^reason: *//' || echo 'commander-order')"
  TRIGGER="commander:$(basename "$f")"
  break
done

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

python3 - "$HEALTH" "$HALT_ACTIVE" "$REASON" "$TRIGGER" "$TS" << 'PYEOF'
import json, sys
path, active, reason, trigger, ts = sys.argv[1:]
with open(path) as f: d = json.load(f)
was_active = d.get("halt", {}).get("active", False)
is_active = active == "true"
d["halt"] = {
    "active": is_active,
    "reason": reason if reason else None,
    "triggered_at": ts if (is_active and not was_active) else d.get("halt", {}).get("triggered_at"),
    "triggered_by": trigger if trigger else None,
}
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
# Print state change only
if is_active and not was_active:
    print("HALT ACTIVATED: " + (reason or "unknown"))
elif not is_active and was_active:
    print("HALT CLEARED")
PYEOF

# 3. If halt just activated, broadcast to outbox
if [ "$HALT_ACTIVE" = "true" ]; then
  BROADCAST="$OUTBOX/halt-$(date -u +%Y%m%dT%H%M%SZ).md"
  if [ ! -f "$BROADCAST" ]; then
    cat > "$BROADCAST" << BROADCAST_EOF
---
type: halt_order
from: chief-orchestrator
to: all-pms
priority: highest
created_at: $TS
reason: $REASON
trigger: $TRIGGER
---

# HALT ORDER

All departments: finish current file write, then terminate gracefully.
Merge Queue: freeze immediately.
Workers: deregister from state/workers.json.

Resume requires explicit Commander order. Do not resume without authorization.
BROADCAST_EOF
    "$ROOT/.orchestrator/scripts/journal.sh" chief-orchestrator halt_broadcast reason="$REASON" trigger="$TRIGGER" >/dev/null
  fi
fi
