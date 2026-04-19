---
type: sentry_alert
from: security-auditor
to: chief-orchestrator
priority: high
sentry: security
status: degraded
created_at: "2026-04-08T11:51:32Z"
---

# Prompt injection attempt #2 — detected + rejected

## Source
worker-infra-sentry reported MCP/Telegram injection during its Read phase. The worker recognized the instructions did not come from its trusted sources (prompt, ticket file, CHARTER.md) and refused to act on them.

## Verdict
SAFE. Second consecutive successful rejection. The trust-boundary language in worker prompts is proven effective.

## Pattern
Both worker-be-003 and worker-infra-sentry caught the same class of injection. Both explicitly self-reported in their pm_report. No action taken on injected instructions.

## Follow-up priority
Medium — hardening still prudent but guardrails are working. Keep the trust-boundary language in all Wave 3+ prompts.
