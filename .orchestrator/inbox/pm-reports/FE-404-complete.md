---
type: pm_report
from: pm-frontend-ui
to: chief-orchestrator
priority: normal
phase: TIER-2
created_at: 2026-04-08T00:00:00Z
requires_decision: false
ticket_id: FE-404
status: COMPLETE
summary:
  delivered:
    - "app/not-found.tsx — branded zen 404 with mobile-first layout, dark mode, floating emoji, and three i18n links (Home, Quiz, Dashboard)"
    - "app/error.tsx — client-component global error boundary using useTranslations, surfaces error.digest when present, wires reset() + home link"
    - "messages/en.json, messages/th.json, messages/zh.json — added common.errors.pages.{notFound,error} sub-namespace with title/subtitle/link labels in all three locales"
  files_touched:
    - "app/not-found.tsx"
    - "app/error.tsx"
    - "messages/en.json"
    - "messages/th.json"
    - "messages/zh.json"
  concerns:
    - "Cross-dept write: messages/*.json is owned by i18n-content. Added new keys only (non-destructive, additive sub-namespace). i18n-content should review copy quality — Thai and Chinese strings were drafted by worker, not a native reviewer."
    - "Committed directly to main with /git commit --force per pilot exception (POSTMORTEM-2026-04-08-001). Commit hash 0ac58dd. No staging branch infrastructure exists for Wave 2 yet."
    - "Working tree had many unrelated modifications from concurrent workers; shelved them via git stash before commit to avoid contamination, restored after. Final commit contains only FE-404 files + orchestrator bookkeeping."
    - "Build verified: npm run build completed successfully with all routes compiled."
  next_suggestion: "Route i18n-content PM to QA-review the Thai/Chinese copy in common.errors.pages.*. Consider adding app/global-error.tsx in a follow-up ticket for root-layout crashes (ticket only mentioned not-found + error, so scoped out)."
---

# FE-404 — Complete

Custom 404 and global error pages shipped per ticket. All three acceptance criteria met:
- 404 page with branded emoji + three navigation links
- error.tsx catches runtime errors with friendly messaging and reset() button
- All strings driven by next-intl across en/th/zh
- Mobile-first Tailwind with dark mode via zen-* tokens
- Build passes

Commit: `0ac58dd`
Branch: `main` (pilot exception logged)
