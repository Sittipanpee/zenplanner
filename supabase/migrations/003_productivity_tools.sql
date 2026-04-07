-- ============================================================
-- ZenPlanner — Productivity Tools System Migration
-- File: supabase/migrations/003_productivity_tools.sql
-- Source ticket: PTS-00 (Productivity Tools System foundation)
-- Depends on: 001_initial.sql, 002_production_hardening.sql
--
-- Purpose:
--   Creates the two new tables that power the rebuilt productivity-tools
--   system: `user_tools` (per-user tool subscription + config) and
--   `tool_entries` (append-only event log for every widget interaction).
--
-- Tickets that depend on this migration:
--   - PTS-01-02 (this file)
--   - PTS-01-03 (API routes /api/tools/{catalog,mine,enable,disable,reorder,entries})
--   - PTS-02-* (every widget reads/writes tool_entries)
--   - PTS-03-* (relations + cross-tool reports)
--   - PTS-04-* (Excel export reads tool_entries)
--
-- Idempotent: every DDL uses IF NOT EXISTS / IF EXISTS so re-running is safe.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. user_tools — per-user enabled tools and per-tool config
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_tools (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id     text NOT NULL,                       -- matches ToolDefinition.id
  enabled     boolean NOT NULL DEFAULT true,
  config      jsonb NOT NULL DEFAULT '{}'::jsonb,  -- per-user customization
  position    int NOT NULL DEFAULT 0,              -- dashboard ordering
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_tools_user_tool_unique UNIQUE (user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tools_user_position
  ON public.user_tools (user_id, position ASC);

-- Auto-update updated_at via the shared trigger function from migration 002.
DROP TRIGGER IF EXISTS set_updated_at_user_tools ON public.user_tools;
CREATE TRIGGER set_updated_at_user_tools
  BEFORE UPDATE ON public.user_tools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------
-- 2. tool_entries — append-only log for every widget interaction
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tool_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id     text NOT NULL,           -- which tool this entry belongs to
  entry_date  date NOT NULL,           -- logical date (for time-series queries)
  payload     jsonb NOT NULL,          -- tool-specific, validated by Zod at write-time
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_entries_user_date
  ON public.tool_entries (user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_tool_entries_user_tool_date
  ON public.tool_entries (user_id, tool_id, entry_date DESC);

-- ------------------------------------------------------------
-- 3. Row-Level Security
-- ------------------------------------------------------------
ALTER TABLE public.user_tools   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_tools_own"   ON public.user_tools;
CREATE POLICY "user_tools_own"
  ON public.user_tools
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "tool_entries_own" ON public.tool_entries;
CREATE POLICY "tool_entries_own"
  ON public.tool_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

COMMIT;
