-- ZenPlanner — Production Hardening Migration
-- File: supabase/migrations/002_production_hardening.sql
-- Agent: DB-01 (DB Surgeon)
-- Purpose: Fix all P0/P1 database issues from Devil's Advocate audit
-- Idempotent: All DDL uses IF NOT EXISTS / IF EXISTS for safe re-runs

BEGIN;

-- ============================================================
-- 1. UPDATED_AT COLUMNS + AUTO-UPDATE TRIGGER FUNCTION
-- ============================================================

-- Create the shared trigger function (once, reused by all tables)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- quiz_sessions
ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_quiz_sessions ON quiz_sessions;
CREATE TRIGGER set_updated_at_quiz_sessions
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- planner_blueprints
ALTER TABLE planner_blueprints
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_planner_blueprints ON planner_blueprints;
CREATE TRIGGER set_updated_at_planner_blueprints
  BEFORE UPDATE ON planner_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- generation_jobs
ALTER TABLE generation_jobs
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_generation_jobs ON generation_jobs;
CREATE TRIGGER set_updated_at_generation_jobs
  BEFORE UPDATE ON generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- generated_planners
ALTER TABLE generated_planners
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_generated_planners ON generated_planners;
CREATE TRIGGER set_updated_at_generated_planners
  BEFORE UPDATE ON generated_planners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payments
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_payments ON payments;
CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- activity_log
ALTER TABLE activity_log
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_activity_log ON activity_log;
CREATE TRIGGER set_updated_at_activity_log
  BEFORE UPDATE ON activity_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- animal_assets
ALTER TABLE animal_assets
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_animal_assets ON animal_assets;
CREATE TRIGGER set_updated_at_animal_assets
  BEFORE UPDATE ON animal_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- 2. INDEXES ON FOREIGN KEYS AND COMMON QUERY PATTERNS
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id
  ON quiz_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_planner_blueprints_user_id
  ON planner_blueprints (user_id);

CREATE INDEX IF NOT EXISTS idx_generated_planners_user_id
  ON generated_planners (user_id);

CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON payments (user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_date
  ON activity_log (user_id, activity_date);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_blueprint_id
  ON generation_jobs (blueprint_id);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_status
  ON generation_jobs (status);

CREATE INDEX IF NOT EXISTS idx_payments_status
  ON payments (status);


-- ============================================================
-- 3. FIX ADMIN RLS POLICY (CRITICAL SECURITY FIX)
-- ============================================================

-- 3a. Add role column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- Add CHECK constraint for role values (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_role_check'
      AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 3b. Drop the broken admin_write_animals policy that checks display_name = 'admin'
DROP POLICY IF EXISTS "admin_write_animals" ON animal_assets;

-- 3c. Create new role-based admin policy for animal_assets
CREATE POLICY "admin_write_animals" ON animal_assets
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- 3d. Prevent non-admin users from escalating their own role
DROP POLICY IF EXISTS "users_cannot_set_admin_role" ON profiles;

CREATE POLICY "users_cannot_set_admin_role" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    role = 'user'
    OR (SELECT p.role FROM profiles p WHERE p.id = auth.uid()) = 'admin'
  );


-- ============================================================
-- 4. FIX handle_new_user() TRIGGER
-- ============================================================
-- Update to handle both GitHub (full_name) and LINE (displayName, display_name) metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',        -- GitHub
      NEW.raw_user_meta_data->>'displayName',       -- LINE (camelCase)
      NEW.raw_user_meta_data->>'display_name',      -- LINE (snake_case)
      NEW.raw_user_meta_data->>'name',              -- Generic fallback
      'User'                                         -- Ultimate fallback
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',        -- GitHub
      NEW.raw_user_meta_data->>'pictureUrl',         -- LINE (camelCase)
      NEW.raw_user_meta_data->>'picture_url',        -- LINE (snake_case)
      NEW.raw_user_meta_data->>'picture'             -- Generic fallback
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The trigger on_auth_user_created already exists from 001_initial.sql
-- and references this function, so replacing the function is sufficient.


-- ============================================================
-- 5. FIX payments.blueprint_id FOREIGN KEY (ADD ON DELETE SET NULL)
-- ============================================================

-- Drop the existing FK constraint, then recreate with ON DELETE SET NULL
DO $$
DECLARE
  _constraint_name text;
BEGIN
  -- Find the actual constraint name for payments.blueprint_id FK
  SELECT tc.constraint_name INTO _constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  WHERE tc.table_name = 'payments'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'blueprint_id'
    AND tc.table_schema = 'public';

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', _constraint_name);
  END IF;
END $$;

ALTER TABLE payments
  ADD CONSTRAINT payments_blueprint_id_fkey
  FOREIGN KEY (blueprint_id)
  REFERENCES planner_blueprints (id)
  ON DELETE SET NULL;


-- ============================================================
-- 6. ADD NOT NULL CONSTRAINTS ON CRITICAL NULLABLE COLUMNS
-- ============================================================

-- activity_log.activity_type: set existing NULLs to 'unknown' then add NOT NULL
UPDATE activity_log
  SET activity_type = 'unknown'
  WHERE activity_type IS NULL;

DO $$
BEGIN
  -- Only alter if column is currently nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'activity_log'
      AND column_name = 'activity_type'
      AND is_nullable = 'YES'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE activity_log ALTER COLUMN activity_type SET NOT NULL;
  END IF;
END $$;

-- quiz_sessions.mode: set existing NULLs to 'minigame' then add NOT NULL
UPDATE quiz_sessions
  SET mode = 'minigame'
  WHERE mode IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quiz_sessions'
      AND column_name = 'mode'
      AND is_nullable = 'YES'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE quiz_sessions ALTER COLUMN mode SET NOT NULL;
  END IF;
END $$;


-- ============================================================
-- 7. FIX QuizState phase CHECK CONSTRAINT (ADD 'intro')
-- ============================================================

-- Drop the existing CHECK constraint on quiz_sessions.phase and recreate with 'intro'
DO $$
DECLARE
  _constraint_name text;
BEGIN
  -- Find the CHECK constraint on the phase column
  SELECT con.conname INTO _constraint_name
  FROM pg_constraint con
  JOIN pg_attribute att ON att.attrelid = con.conrelid
    AND att.attnum = ANY(con.conkey)
  WHERE con.conrelid = 'quiz_sessions'::regclass
    AND con.contype = 'c'
    AND att.attname = 'phase';

  IF _constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE quiz_sessions DROP CONSTRAINT %I', _constraint_name);
  END IF;
END $$;

ALTER TABLE quiz_sessions
  ADD CONSTRAINT quiz_sessions_phase_check
  CHECK (phase IN ('intro', 'quiz', 'reveal', 'profiling', 'complete'));


-- ============================================================
-- 8. JSONB VALIDATION CHECK CONSTRAINTS
-- ============================================================

-- axis_scores must be a valid JSONB object (not array, not scalar) when quiz is complete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'quiz_sessions_axis_scores_valid'
      AND conrelid = 'quiz_sessions'::regclass
  ) THEN
    ALTER TABLE quiz_sessions
      ADD CONSTRAINT quiz_sessions_axis_scores_valid
      CHECK (
        -- axis_scores can be NULL while quiz is in progress,
        -- but when status = 'complete', axis_scores must be a non-null JSONB object
        (status != 'complete')
        OR (axis_scores IS NOT NULL AND jsonb_typeof(axis_scores) = 'object')
      );
  END IF;
END $$;


COMMIT;
