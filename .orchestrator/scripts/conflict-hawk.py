#!/usr/bin/env python3
"""
Conflict Hawk — PreToolUse hook for Edit/Write tool calls.

Reads the calling agent's department from env var AGENT_DEPT (set by
the orchestrator when dispatching). Looks up .orchestrator/state/ownership.json
to find the owner of the target file path. If owner != agent's dept,
blocks the call + files an incident in inbox/sentry-alerts/.

Exit codes:
  0 = allow
  1 = block (hook protocol)

Expected env:
  AGENT_DEPT          — the dept of the calling agent (e.g., "frontend-ui")
  HOOK_TOOL_INPUT     — JSON of tool input (contains file_path)

Chief Orchestrator (dept="chief-orchestrator") is allowed to write anywhere.
Workers of unknown dept are blocked by default.
"""
import json
import os
import sys
import fnmatch
import subprocess
from datetime import datetime, timezone

REPO = subprocess.check_output(["git", "rev-parse", "--show-toplevel"]).decode().strip()
OWNERSHIP_PATH = os.path.join(REPO, ".orchestrator/state/ownership.json")
ALERTS_DIR = os.path.join(REPO, ".orchestrator/inbox/sentry-alerts")

def journal(agent, action, **kv):
    try:
        subprocess.run(
            [os.path.join(REPO, ".orchestrator/scripts/journal.sh"), agent, action]
            + [f"{k}={v}" for k, v in kv.items()],
            check=False, capture_output=True,
        )
    except Exception:
        pass

def matches_any(path, patterns):
    rel = os.path.relpath(path, REPO) if os.path.isabs(path) else path
    for pat in patterns:
        if fnmatch.fnmatch(rel, pat):
            return True
    return False

def find_owner(path, ownership):
    # CO-only paths take precedence
    for pat in ownership.get("co_only", {}).get("paths", []):
        if fnmatch.fnmatch(path, pat):
            return "_co_only"
    # Shared readonly — no one may write
    for pat in ownership.get("shared_readonly", {}).get("paths", []):
        if fnmatch.fnmatch(path, pat):
            return "_readonly"
    # Department ownership
    for dept, info in ownership.get("departments", {}).items():
        for pat in info.get("owns", []):
            if fnmatch.fnmatch(path, pat):
                return dept
    # Tests shared
    ts = ownership.get("tests_shared", {})
    for pat in ts.get("paths", []):
        if fnmatch.fnmatch(path, pat):
            return ts.get("owner", "qa-cell")
    return None  # unowned = allow (for experimental paths)

def main():
    agent_dept = os.environ.get("AGENT_DEPT", "").strip()
    tool_input_raw = os.environ.get("HOOK_TOOL_INPUT", "{}")
    try:
        tool_input = json.loads(tool_input_raw)
    except json.JSONDecodeError:
        # Malformed input — allow (not our problem)
        sys.exit(0)

    path = tool_input.get("file_path", "")
    if not path:
        sys.exit(0)

    # CO can write anywhere
    if agent_dept == "chief-orchestrator":
        sys.exit(0)

    try:
        with open(OWNERSHIP_PATH) as f:
            ownership = json.load(f)
    except Exception:
        # Ownership file missing — fail open during bootstrap
        sys.exit(0)

    rel_path = os.path.relpath(path, REPO) if os.path.isabs(path) else path
    owner = find_owner(rel_path, ownership)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    if owner is None:
        # Unowned file — allow but log
        journal(agent_dept or "unknown", "write_unowned", path=rel_path)
        sys.exit(0)

    if owner == "_co_only":
        os.makedirs(ALERTS_DIR, exist_ok=True)
        alert_path = os.path.join(ALERTS_DIR, f"hawk-{ts.replace(':','').replace('-','')}.md")
        with open(alert_path, "w") as f:
            f.write(f"---\ntype: sentry_alert\nfrom: conflict-hawk\npriority: critical\n"
                    f"violation: co_only_write\nagent: {agent_dept}\npath: {rel_path}\n"
                    f"created_at: {ts}\n---\n\n## Blocked: CO-only file\n\n"
                    f"Agent `{agent_dept}` attempted to write `{rel_path}` which is "
                    f"Chief-Orchestrator-only per ownership.json.\n")
        journal("conflict-hawk", "block", offender=agent_dept, path=rel_path, reason="co_only")
        print(f"BLOCKED by Conflict Hawk: {rel_path} is CO-only", file=sys.stderr)
        sys.exit(1)

    if owner == "_readonly":
        journal("conflict-hawk", "block", offender=agent_dept, path=rel_path, reason="readonly")
        print(f"BLOCKED by Conflict Hawk: {rel_path} is read-only", file=sys.stderr)
        sys.exit(1)

    if agent_dept and owner != agent_dept:
        os.makedirs(ALERTS_DIR, exist_ok=True)
        alert_path = os.path.join(ALERTS_DIR, f"hawk-{ts.replace(':','').replace('-','')}.md")
        with open(alert_path, "w") as f:
            f.write(f"---\ntype: sentry_alert\nfrom: conflict-hawk\npriority: critical\n"
                    f"violation: cross_dept_write\nagent: {agent_dept}\nowner: {owner}\n"
                    f"path: {rel_path}\ncreated_at: {ts}\n---\n\n"
                    f"## Blocked: cross-department write\n\n"
                    f"Agent `{agent_dept}` tried to write `{rel_path}` but that path "
                    f"is owned by `{owner}`. File an escalation if this is intentional.\n")
        journal("conflict-hawk", "block", offender=agent_dept, path=rel_path,
                reason="cross_dept", owner=owner)
        print(f"BLOCKED by Conflict Hawk: {rel_path} is owned by {owner}, you are {agent_dept}",
              file=sys.stderr)
        sys.exit(1)

    # Allow
    journal(agent_dept or "unknown", "write_allowed", path=rel_path, owner=owner)
    sys.exit(0)

if __name__ == "__main__":
    main()
