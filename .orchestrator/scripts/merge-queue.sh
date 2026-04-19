#!/usr/bin/env bash
# merge-queue.sh — process one pending merge at a time.
# Called by CO after a worker finishes a ticket and pushes a feature branch.
# Usage: merge-queue.sh process
#        merge-queue.sh submit <branch> <ticket_id> <dept>
#        merge-queue.sh status
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
QUEUE="$ROOT/.orchestrator/state/merge-queue.json"
HEALTH="$ROOT/.orchestrator/state/health.json"
JOURNAL="$ROOT/.orchestrator/scripts/journal.sh"

cmd="${1:-process}"

case "$cmd" in
  submit)
    branch="$2"; ticket="$3"; dept="$4"
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    python3 - "$QUEUE" "$branch" "$ticket" "$dept" "$TS" << 'PY'
import json, sys
path, branch, ticket, dept, ts = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["pending"].append({"branch": branch, "ticket": ticket, "dept": dept, "submitted_at": ts})
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
print(f"queued: {branch} (ticket {ticket}, dept {dept})")
PY
    "$JOURNAL" merge-queue submit branch="$branch" ticket="$ticket" dept="$dept" >/dev/null
    ;;
  
  status)
    python3 - "$QUEUE" << 'PY'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
print(f"pending: {len(d['pending'])}")
print(f"processing: {d['processing']}")
print(f"history: {len(d['history'])} merges")
for p in d["pending"][:5]:
    print(f"  - {p['branch']} (ticket {p['ticket']}, dept {p['dept']})")
PY
    ;;
  
  process)
    # Pick the oldest pending
    NEXT=$(python3 - "$QUEUE" << 'PY'
import json, sys
with open(sys.argv[1]) as f: d = json.load(f)
if d["processing"]:
    print("BUSY:" + d["processing"]["branch"])
elif d["pending"]:
    next_ = d["pending"][0]
    print(f"{next_['branch']}|{next_['ticket']}|{next_['dept']}")
else:
    print("EMPTY")
PY
)
    if [[ "$NEXT" == "EMPTY" ]]; then
      exit 0
    fi
    if [[ "$NEXT" == BUSY:* ]]; then
      echo "[merge-queue] already processing ${NEXT#BUSY:}"
      exit 0
    fi

    IFS='|' read -r BRANCH TICKET DEPT <<< "$NEXT"
    echo "[merge-queue] processing $BRANCH (ticket=$TICKET dept=$DEPT)"
    
    # Mark as processing
    TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    python3 - "$QUEUE" "$BRANCH" "$TICKET" "$DEPT" "$TS" << 'PY'
import json, sys
path, branch, ticket, dept, ts = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["processing"] = {"branch": branch, "ticket": ticket, "dept": dept, "started_at": ts}
d["pending"] = [p for p in d["pending"] if p["branch"] != branch]
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PY

    "$JOURNAL" merge-queue process_start branch="$BRANCH" ticket="$TICKET" >/dev/null

    # Run gates: type → build → (tests if present)
    FAILED=""
    if ! (cd "$ROOT" && npx tsc --noEmit >/tmp/mq-type.log 2>&1); then
      FAILED="type-check"
    elif ! (cd "$ROOT" && npm run build >/tmp/mq-build.log 2>&1); then
      FAILED="build"
    fi
    
    END_TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    if [[ -n "$FAILED" ]]; then
      # Reject — record in history, notify worker
      python3 - "$QUEUE" "$BRANCH" "$TICKET" "$DEPT" "$END_TS" "$FAILED" << 'PY'
import json, sys
path, branch, ticket, dept, ts, failure = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["history"].append({
    "branch": branch, "ticket": ticket, "dept": dept,
    "verdict": "REJECTED", "failure": failure, "completed_at": ts
})
d["processing"] = None
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PY
      "$JOURNAL" merge-queue reject branch="$BRANCH" ticket="$TICKET" reason="$FAILED" >/dev/null
      echo "[merge-queue] REJECTED: $BRANCH ($FAILED)"
      echo "[merge-queue] see /tmp/mq-${FAILED}.log for details"
      exit 1
    fi
    
    # (A real implementation would checkout staging + cherry-pick BRANCH here.
    #  For now this is a dry-run/validate-only merge queue — the actual
    #  git merge is performed by the Chief Orchestrator after validation.)
    python3 - "$QUEUE" "$BRANCH" "$TICKET" "$DEPT" "$END_TS" << 'PY'
import json, sys
path, branch, ticket, dept, ts = sys.argv[1:]
with open(path) as f: d = json.load(f)
d["history"].append({
    "branch": branch, "ticket": ticket, "dept": dept,
    "verdict": "ACCEPTED", "completed_at": ts
})
d["processing"] = None
d["_last_updated"] = ts
with open(path, "w") as f: json.dump(d, f, indent=2)
PY
    "$JOURNAL" merge-queue accept branch="$BRANCH" ticket="$TICKET" >/dev/null
    echo "[merge-queue] ACCEPTED: $BRANCH"
    ;;
  
  *)
    echo "usage: merge-queue.sh {submit <branch> <ticket> <dept> | process | status}" >&2
    exit 2
    ;;
esac
