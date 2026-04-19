-- ZenPlanner — Productivity Tools: per-day uniqueness (CRIT-02)
-- File: supabase/migrations/004_tool_entries_uniqueness.sql
-- Purpose: ensure a single row per (user_id, tool_id, entry_date) so
--          auto-save widgets (priorities, habits, mood, water, sleep,
--          energy, gratitude) upsert instead of creating duplicate rows.
-- Idempotent: CREATE UNIQUE INDEX IF NOT EXISTS.
-- Depends on: 003_productivity_tools.sql

-- Before adding the unique index we must delete any existing duplicates
-- created during Wave 1 testing. Keep only the most recent row per triple.
DELETE FROM public.tool_entries a
USING public.tool_entries b
WHERE a.user_id     = b.user_id
  AND a.tool_id     = b.tool_id
  AND a.entry_date  = b.entry_date
  AND a.created_at  < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_tool_entries_user_tool_date
  ON public.tool_entries (user_id, tool_id, entry_date);

COMMENT ON INDEX public.uniq_tool_entries_user_tool_date IS
  'Enforces one entry per (user, tool, day). Required for widget upsert.';
