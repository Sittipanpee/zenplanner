# DB-01 -- Production Database Hardening
**Phase:** 6
**Team:** Monolith (DB Surgeon)
**Status:** [x] COMPLETE
**Depends on:** None
**Blocks:** BE-02 (schema changes affect backend queries)

## Scope
Fix all database-level P0/P1 issues found in the Devil's Advocate audit. Create migration 002_production_hardening.sql with:
1. updated_at columns + auto-update triggers on all stateful tables
2. Indexes on all foreign key columns and common query patterns
3. Fix admin RLS policy (CRITICAL SECURITY) -- replace display_name check with role column
4. Fix handle_new_user() trigger for LINE metadata fields
5. Fix payments.blueprint_id ON DELETE behavior
6. Add NOT NULL constraints on critical nullable columns
7. Fix QuizState phase CHECK constraint (add 'intro')
8. Add JSONB validation CHECK constraints

## Acceptance Criteria
- [x] Migration file created at supabase/migrations/002_production_hardening.sql
- [x] All DDL uses IF NOT EXISTS / IF EXISTS for idempotency
- [x] Transaction-wrapped
- [x] All 8 items from scope addressed
- [x] No destructive changes to existing data

## Boundaries
- Do NOT touch: any file except supabase/migrations/002_production_hardening.sql
- Do NOT touch: 001_initial.sql

## Notes
- Commander authorized full sprint execution without approval gates
- SSOT: RoundTable/SPRINT_SSOT.md
