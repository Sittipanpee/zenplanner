#!/usr/bin/env bash
# phase-gate.sh — execute the phase gate procedure.
# Freezes merge queue, runs all sentries, files ready-for-merge report,
# starts 2-hour timer for Commander approval.
#
# Usage: phase-gate.sh fire <phase_id>
#        phase-gate.sh status
#        phase-gate.sh approve <phase_id>      # Commander only
#        phase-gate.sh reject <phase_id> <reason>  # Commander only
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
PHASE="$ROOT/.orchestrator/state/phase.json"
JOURNAL="$ROOT/.orchestrator/scripts/journal.sh"
ORDERS="$ROOT/.orchestrator/inbox/commander-orders"
mkdir -p "$ORDERS"

cmd="${1:-status}"

case "$cmd" in
  fire)
    PHASE_ID="${2:-PHASE-$(date -u +%Y%m%dT%H%M%SZ)}"
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    EXPIRY=$(date -u -v+2H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || \
             date -u -d "+2 hours" +%Y-%m-%dT%H:%M:%SZ)
    
    echo "[phase-gate] firing gate for $PHASE_ID"
    
    # 1. Run all sentries
    echo "[phase-gate] running sentries..."
    "$ROOT/.orchestrator/scripts/type-sentry.sh" || true
    "$ROOT/.orchestrator/scripts/build-sentry.sh" || true
    
    TYPE_STATUS=$(python3 -c "import json; print(json.load(open('$ROOT/.orchestrator/state/health.json'))['type']['status'])")
    BUILD_STATUS=$(python3 -c "import json; print(json.load(open('$ROOT/.orchestrator/state/health.json'))['build']['status'])")
    
    # 2. Collect diff from last gate
    LAST_COMMIT=$(python3 -c "
import json
h = json.load(open('$PHASE'))['history']
print(h[-1]['commit'] if h and 'commit' in h[-1] else 'HEAD~10')
")
    CURRENT=$(git rev-parse HEAD)
    DIFF_SUMMARY=$(git log --oneline "$LAST_COMMIT..HEAD" 2>/dev/null | head -20 || echo "(no diff available)")
    FILES_CHANGED=$(git diff --stat "$LAST_COMMIT..HEAD" 2>/dev/null | tail -1 || echo "unknown")
    
    # 3. File ready-for-merge report
    REPORT="$ORDERS/phase-gate-$PHASE_ID.md"
    cat > "$REPORT" << REPORT_EOF
---
type: commander_order
from: chief-orchestrator
to: commander
priority: highest
created_at: $TS
order: approve_phase_gate
reason: phase $PHASE_ID ready for staging→main merge
target: $CURRENT
acknowledge_required: true
expires_at: $EXPIRY
---

# Phase Gate — $PHASE_ID

**Status:** awaiting Commander decision  
**Expires:** $EXPIRY (2-hour timeout → auto-reject)  
**Proposed commit:** \`$CURRENT\`

## Sentry Status
| Sentry | Status |
|---|---|
| Type | $TYPE_STATUS |
| Build | $BUILD_STATUS |

## Diff Summary
\`\`\`
$FILES_CHANGED
\`\`\`

## Commits Since Last Gate
\`\`\`
$DIFF_SUMMARY
\`\`\`

## Decision Required
Reply with:
- \`phase-gate.sh approve $PHASE_ID\` to merge staging → main
- \`phase-gate.sh reject $PHASE_ID <reason>\` to hold and request changes

If no response within 2 hours, the gate auto-rejects (main branch unchanged, staging continues to accept new work).
REPORT_EOF
    
    # 4. Update phase state
    python3 - "$PHASE" "$PHASE_ID" "$TS" "$EXPIRY" "$TYPE_STATUS" "$BUILD_STATUS" "$CURRENT" << 'PY'
import json, sys
path, phase_id, ts, expiry, type_s, build_s, commit = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["gate_status"] = "pending_commander"
d["next_gate_at"] = expiry
d["current_gate"] = {
    "phase_id": phase_id,
    "fired_at": ts,
    "expires_at": expiry,
    "type_status": type_s,
    "build_status": build_s,
    "proposed_commit": commit,
}
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PY
    
    "$JOURNAL" chief-orchestrator phase_gate_fire phase="$PHASE_ID" commit="$CURRENT" \
      type="$TYPE_STATUS" build="$BUILD_STATUS" >/dev/null
    
    echo "[phase-gate] fired. Report: $REPORT"
    echo "[phase-gate] expires at: $EXPIRY"
    ;;
  
  status)
    python3 - "$PHASE" << 'PY'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
print(f"current phase: {d['current_phase']}")
print(f"gate status: {d['gate_status']}")
if d.get("current_gate"):
    g = d["current_gate"]
    print(f"gate fired:  {g['fired_at']}")
    print(f"expires at:  {g['expires_at']}")
    print(f"type/build:  {g['type_status']}/{g['build_status']}")
    print(f"commit:      {g['proposed_commit'][:12]}")
PY
    ;;
  
  approve)
    PHASE_ID="$2"
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    python3 - "$PHASE" "$PHASE_ID" "$TS" << 'PY'
import json, sys
path, phase_id, ts = sys.argv[1:]
with open(path) as f: d = json.load(f)
gate = d.get("current_gate")
if not gate or gate["phase_id"] != phase_id:
    print(f"no matching gate for {phase_id}", file=sys.stderr); sys.exit(1)
d.setdefault("history", []).append({
    "phase": phase_id, "verdict": "approved",
    "commit": gate["proposed_commit"],
    "approved_at": ts,
    "started_at": gate["fired_at"],
    "ended_at": ts,
})
d["current_gate"] = None
d["gate_status"] = "open"
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
print(f"approved: {phase_id}")
PY
    "$JOURNAL" chief-orchestrator phase_gate_approve phase="$PHASE_ID" >/dev/null
    ;;
  
  reject)
    PHASE_ID="$2"; REASON="${3:-no reason}"
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    python3 - "$PHASE" "$PHASE_ID" "$TS" "$REASON" << 'PY'
import json, sys
path, phase_id, ts, reason = sys.argv[1:]
with open(path) as f: d = json.load(f)
gate = d.get("current_gate")
if not gate or gate["phase_id"] != phase_id:
    print(f"no matching gate for {phase_id}", file=sys.stderr); sys.exit(1)
d.setdefault("history", []).append({
    "phase": phase_id, "verdict": "rejected",
    "reason": reason,
    "commit": gate["proposed_commit"],
    "rejected_at": ts,
    "started_at": gate["fired_at"],
    "ended_at": ts,
})
d["current_gate"] = None
d["gate_status"] = "open"
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
print(f"rejected: {phase_id} ({reason})")
PY
    "$JOURNAL" chief-orchestrator phase_gate_reject phase="$PHASE_ID" reason="$REASON" >/dev/null
    ;;
  
  *)
    echo "usage: phase-gate.sh {fire [phase_id] | status | approve <phase_id> | reject <phase_id> <reason>}" >&2
    exit 2
    ;;
esac
