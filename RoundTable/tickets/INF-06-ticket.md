# INF-06 -- Infrastructure Hardening
**Phase:** Production Sprint
**Team:** Monolith (INF-06 Infrastructure Engineer)
**Status:** [x] COMPLETE
**Depends on:** None
**Blocks:** INT-09 (Integration QA), FP-08 (app/layout.tsx needs next-intl working)

## Scope
Harden infrastructure config files for production readiness:
1. next.config.ts -- complete rewrite with next-intl plugin, image domains, security headers
2. middleware.ts -- clean auth protection, remove dead code reference, add NEXT_LOCALE cookie
3. .env.example (NEW) -- document all required env vars
4. lib/utils.ts -- upgrade cn() helper to use tailwind-merge
5. tsconfig.json -- verify strict mode and path aliases

## Acceptance Criteria
- [ ] next.config.ts exports next-intl wrapped config with image domains and security headers
- [ ] middleware.ts protects all required routes, redirects auth users, handles NEXT_LOCALE
- [ ] .env.example documents all env vars needed for local development
- [ ] lib/utils.ts cn() uses twMerge(clsx(...)) pattern
- [ ] tsconfig.json has strict: true and correct path aliases
- [ ] lib/theme-colors.ts verified (no changes needed)

## Boundaries
- Do NOT touch: package.json (BE-02 owns), app/layout.tsx (FP-08 owns), any component files
- Do NOT touch: lib/supabase/middleware.ts (BE-02 owns cleanup of that dead file)

## Notes
- tailwind-merge is NOT in package.json yet. BE-02 must add it. cn() function written assuming it will be available.
- lib/supabase/middleware.ts is dead code -- root middleware.ts does not import it. No references in production code.
