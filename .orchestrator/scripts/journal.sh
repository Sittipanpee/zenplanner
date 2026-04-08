#!/usr/bin/env bash
# journal.sh — append an event to the daily journal
# Usage: journal.sh <agent> <action> <key=value> [<key=value> ...]
# Example: ./.orchestrator/scripts/journal.sh worker-be-01 file_write path=app/api/foo/route.ts sha=abc
#
# Every event is a JSON object with ts, agent, action, + caller-provided kv pairs.
# Append-only. Never truncate. Survives worktree wipes (in repo root).

set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "usage: journal.sh <agent> <action> [<k=v>...]" >&2
  exit 1
fi

JOURNAL_DIR="$(git rev-parse --show-toplevel)/.orchestrator/journals"
mkdir -p "$JOURNAL_DIR"
DATE="$(date -u +%Y-%m-%d)"
FILE="$JOURNAL_DIR/$DATE.jsonl"

AGENT="$1"; shift
ACTION="$1"; shift

# Build the JSON safely by piping through jq if available, else quick manual
TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if command -v jq >/dev/null 2>&1; then
  ARGS=("--arg" "ts" "$TS" "--arg" "agent" "$AGENT" "--arg" "action" "$ACTION")
  JQ_BUILD='{ts:$ts,agent:$agent,action:$action}'
  for kv in "$@"; do
    k="${kv%%=*}"
    v="${kv#*=}"
    ARGS+=("--arg" "$k" "$v")
    JQ_BUILD="$JQ_BUILD + {$k:\$$k}"
  done
  jq -nc "${ARGS[@]}" "$JQ_BUILD" >> "$FILE"
else
  # Fallback: manual escape
  esc() { printf '%s' "$1" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'; }
  LINE='{"ts":'"$(esc "$TS")"',"agent":'"$(esc "$AGENT")"',"action":'"$(esc "$ACTION")"
  for kv in "$@"; do
    k="${kv%%=*}"; v="${kv#*=}"
    LINE="$LINE"',"'"$k"'":'"$(esc "$v")"
  done
  LINE="$LINE"'}'
  echo "$LINE" >> "$FILE"
fi
