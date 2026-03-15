# ZenPlanner — Anti-Hallucination Framework (SSOT)

> Orchestrator runs this protocol after EVERY agent delivery.
> Never skip. Never trust agent output without verification.

---

## Mandatory Agent Output Format

Every agent's final report MUST include:

```
## DELIVERY REPORT — [AGENT_NAME]

### Files Modified
- [path] — [what changed]

### SSOT Citations
- design-system.md: [specific tokens used]
- archetypes.md: [archetype fields used]
- schema.sql: [tables/columns referenced]
- tools-taxonomy.md: [tool IDs used]
- api-spec.md: [routes implemented]

### Self-Check Results
- [ ] All CSS uses ONLY zen-* variables (no #hex, no raw values)
- [ ] All TypeScript types from lib/types.ts (no ad-hoc inline types)
- [ ] No files outside my File Ownership scope were modified
- [ ] npm run build passes
- [ ] No console.log left in production code

### Verification Command Output
[Paste: npm run build output OR tsc --noEmit output]
```

---

## 8 Automated Detection Checks

Orchestrator runs these grep commands after each delivery:

```bash
# 1. GHOST FILES — agent claims to have created file but it doesn't exist
ls -la [claimed_files]

# 2. SCOPE VIOLATION — agent modified files outside their ownership
git diff --name-only HEAD~1 | grep -v "^[expected_paths]"

# 3. RAW COLOR INJECTION — hardcoded hex not using CSS variables
grep -r "#[0-9A-Fa-f]\{6\}" app/ components/ --include="*.tsx" --include="*.css" | grep -v "globals.css"

# 4. PHANTOM IMPORTS — imports from non-existent modules
grep -r "from './" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v node_modules

# 5. TYPE INVENTION — inline type declarations not from types.ts
grep -r "interface\|type.*=.*{" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "lib/types.ts"

# 6. CONSOLE POLLUTION — debug logs left in code
grep -r "console\.\(log\|warn\|error\|debug\)" app/ components/ lib/ --include="*.ts" --include="*.tsx"

# 7. TODO DEBT — unfinished placeholders
grep -rn "TODO\|FIXME\|PLACEHOLDER\|xxx\|HACK" app/ components/ lib/ --include="*.ts" --include="*.tsx"

# 8. BUILD CHECK — hard gates
npm run build 2>&1 | tail -20
```

---

## 3-Tier Severity Response

### 🟡 WARN — Minor issues, agent can self-correct

**Triggers**: console.log found, minor style inconsistency, TODO comment left
```
Action: Send correction note to agent
"[WARN] Found console.log in [file]. Remove and redeliver only that file."
Do NOT rollback. Do NOT stop the build.
```

### 🔴 HALT — Critical error, block next phase

**Triggers**:
- `npm run build` fails
- `tsc --noEmit` has errors
- Phantom import (module not found)
- Raw hex color used in component (not in globals.css)

```
Action:
1. HALT — do not dispatch next phase agents
2. Identify root cause exactly (which file, which line)
3. Re-dispatch ONLY the failing agent with specific correction:
   "[HALT] Build fails due to [error]. Fix ONLY:
   - File: [path]
   - Error: [exact error]
   - Expected: [SSOT reference]
   Redeliver ONLY this fix."
4. Re-run all 8 checks after re-delivery
```

### 🚨 ROLLBACK — Catastrophic, agent went rogue

**Triggers**:
- Agent modified files outside their ownership scope
- Agent created files not in their task (ghost files)
- Agent deleted or overwrote another agent's immutable files
- Agent invented DB tables or API routes not in SSOT

```
Action:
1. git stash (or git checkout -- [affected files])
2. Identify exactly which files were corrupted
3. DO NOT re-dispatch the same agent immediately
4. Root cause analysis: why did the agent go out of scope?
5. Re-dispatch with much more restrictive instructions:
   "[ROLLBACK] You modified [files] outside your scope.
   Your scope is ONLY: [explicit file list].
   Do NOT touch any other file. Redeliver with scope lock."
```

---

## Pre-Flight Gate (Before Dispatching Any Agent)

Before dispatching an agent, orchestrator verifies:

```
☐ Is this agent's dependency phase complete?
☐ Does this agent's input data exist? (types.ts, schema, etc.)
☐ Is the file ownership clear? (no overlap with running agents)
☐ Have I given the agent the SSOT file references they need?
```

Template dispatch message:
```
You are [AGENT_NAME] AGENT.

Read these SSOT files FIRST before writing any code:
- .claude/ssot/[relevant].md

Your scope is STRICTLY: [file list from agents.md ownership map]
You MUST NOT touch any file outside this list.

Dependencies are complete: [what's available]

[specific instructions]

CRITICAL: End with the DELIVERY REPORT format from anti-hallucinate.md
```

---

## Post-Flight Gate (After Each Agent Delivers)

```
☐ Does DELIVERY REPORT exist in agent output?
☐ All 8 automated checks passed?
☐ npm run build passes?
☐ Agent only modified their owned files?
☐ All SSOT citations are real (not hallucinated SSOT references)?
```

If ALL ☐ checked: mark agent COMPLETE, proceed to next phase.
If ANY ☐ failed: apply appropriate severity tier (WARN/HALT/ROLLBACK).

---

## Repeat Offender Protocol

If an agent fails 3 times on the same issue:

```
1. Log the pattern: "AGENT [X] repeatedly [hallucinating routes / touching wrong files / ...]"
2. Break the task into smaller atomic sub-tasks
3. Dispatch with a "locked" instruction that specifies EVERY file by name
4. After successful delivery, add the failure pattern to agent instructions as a warning
```

---

## Orchestrator Self-Check

Before marking the build complete, orchestrator runs:

```bash
# Final gate checklist
npm run build              # Must be clean (0 errors, 0 warnings)
tsc --noEmit               # Must pass
npm run lint               # Must pass (or known acceptable warns only)
git diff --stat            # Review ALL changed files

# Smoke test key user flows:
# 1. Landing page loads
# 2. Quiz start flow (mode 1 + mode 2)
# 3. Animal reveal renders correct theme
# 4. LINE LIFF initializes (test in LINE app)
# 5. Blueprint page loads
# 6. Download endpoint returns .xlsx
```

Only after ALL pass: print "🧘 ZENPLANNER BUILD COMPLETE"
