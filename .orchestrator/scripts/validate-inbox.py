#!/usr/bin/env python3
"""
validate-inbox.py — validate every message in .orchestrator/inbox/ against
its schema. Invalid messages are moved to inbox/_invalid/ with a reason file.

Message format: YAML frontmatter between --- lines + markdown body.
The frontmatter is what gets validated.

Exit codes: always 0 (errors are logged and quarantined, never block CO).
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone

try:
    import datetime as _dt
    import yaml
except ImportError:
    print("PyYAML not installed. Install with: pip install pyyaml", file=sys.stderr)
    # Skip validation gracefully — don't block CO
    sys.exit(0)

def _normalize(value):
    """YAML parses bare ISO timestamps as datetime objects; schemas expect
    strings. Recursively convert datetime/date to ISO strings so agents
    don't have to remember to quote their created_at fields."""
    if isinstance(value, (_dt.datetime, _dt.date)):
        return value.isoformat().replace("+00:00", "Z")
    if isinstance(value, dict):
        return {k: _normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_normalize(v) for v in value]
    return value

try:
    from jsonschema import Draft7Validator
except ImportError:
    print("jsonschema not installed. Install with: pip install jsonschema", file=sys.stderr)
    sys.exit(0)

REPO = subprocess.check_output(["git", "rev-parse", "--show-toplevel"]).decode().strip()
INBOX = os.path.join(REPO, ".orchestrator/inbox")
INVALID = os.path.join(REPO, ".orchestrator/inbox/_invalid")
SCHEMAS_DIR = os.path.join(REPO, ".orchestrator/schemas")
os.makedirs(INVALID, exist_ok=True)

# Load all schemas
SCHEMAS = {}
for f in os.listdir(SCHEMAS_DIR):
    if f.endswith(".schema.json"):
        with open(os.path.join(SCHEMAS_DIR, f)) as fh:
            s = json.load(fh)
            SCHEMAS[s["$id"]] = Draft7Validator(s)

# Subdir → expected schema id
SUBDIR_SCHEMA = {
    "pm-reports": "pm_report",
    "escalations": "escalation",
    "sentry-alerts": "sentry_alert",
    "da-findings": "da_finding",
    "commander-orders": "commander_order",
}

def parse_frontmatter(text):
    if not text.startswith("---"):
        return None, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None, text
    try:
        fm = yaml.safe_load(parts[1])
        return fm, parts[2]
    except yaml.YAMLError:
        return None, text

errors = 0
validated = 0
for subdir, schema_id in SUBDIR_SCHEMA.items():
    path = os.path.join(INBOX, subdir)
    if not os.path.isdir(path):
        continue
    for fname in os.listdir(path):
        if not fname.endswith(".md"):
            continue
        fpath = os.path.join(path, fname)
        with open(fpath) as fh:
            content = fh.read()
        fm, _body = parse_frontmatter(content)
        if fm is None:
            # Missing frontmatter
            shutil.move(fpath, os.path.join(INVALID, fname))
            with open(os.path.join(INVALID, fname + ".reason"), "w") as fh:
                fh.write(f"Missing or malformed YAML frontmatter. Expected schema: {schema_id}\n")
            errors += 1
            continue
        # Normalize datetime objects to ISO strings before schema validation
        fm = _normalize(fm)
        validator = SCHEMAS.get(schema_id)
        if not validator:
            continue
        validation_errors = list(validator.iter_errors(fm))
        if validation_errors:
            shutil.move(fpath, os.path.join(INVALID, fname))
            with open(os.path.join(INVALID, fname + ".reason"), "w") as fh:
                fh.write(f"Schema validation failed: {schema_id}\n\n")
                for e in validation_errors:
                    fh.write(f"- {e.message}\n")
            errors += 1
            continue
        validated += 1

print(f"[validate-inbox] validated={validated} errors={errors}")
sys.exit(0)
