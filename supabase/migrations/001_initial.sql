-- ZenPlanner — Initial Database Migration (SSOT)
-- Run: supabase db push OR paste in Supabase SQL Editor
-- File: supabase/migrations/001_initial.sql
-- Agent: TYPES

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name     text,
  avatar_url       text,
  spirit_animal    text,                    -- e.g., "lion", "whale"
  archetype_code   text,                    -- axis-score derived code
  line_user_id     text UNIQUE,             -- LINE userId (from LIFF)
  line_display_name text,
  line_picture_url  text,
  created_at       timestamptz DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- QUIZ SESSIONS
-- ============================================================
CREATE TABLE quiz_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  mode             text DEFAULT 'minigame' CHECK (mode IN ('minigame', 'custom')),
  phase            text DEFAULT 'quiz' CHECK (phase IN ('quiz', 'reveal', 'profiling', 'complete')),
  conversation     jsonb DEFAULT '[]',      -- [{role, content}]
  axis_scores      jsonb,                   -- {energy, planning, social, decision, focus, drive}
  archetype_code   text,
  spirit_animal    text,
  lifestyle_profile jsonb,                  -- {schedule, energy_pattern, goals, obstacles, preferences}
  status           text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'complete')),
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- PLANNER BLUEPRINTS
-- ============================================================
CREATE TABLE planner_blueprints (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  quiz_session_id  uuid REFERENCES quiz_sessions ON DELETE SET NULL,
  title            text,
  description      text,
  spirit_animal    text,
  archetype_code   text,
  tool_selection   jsonb,                   -- ["daily_power_block", "habit_heatmap", ...]
  customization    jsonb,                   -- {color_scheme, language, wake_time, categories}
  status           text DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'generating', 'completed')),
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- GENERATION JOBS
-- ============================================================
CREATE TABLE generation_jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id     uuid REFERENCES planner_blueprints ON DELETE CASCADE,
  total_sheets     int DEFAULT 0,
  completed_sheets int DEFAULT 0,
  current_sheet    text,
  status           text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error            text,
  output_url       text,                    -- signed Supabase Storage URL
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- GENERATED PLANNERS (download history)
-- ============================================================
CREATE TABLE generated_planners (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  blueprint_id     uuid REFERENCES planner_blueprints ON DELETE CASCADE,
  format           text CHECK (format IN ('google_sheets', 'excel_vba', 'pdf')),
  download_url     text,
  expires_at       timestamptz,
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  blueprint_id     uuid REFERENCES planner_blueprints,
  amount_cents     int,
  currency         text DEFAULT 'THB',
  stripe_session_id text,
  status           text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- ACTIVITY LOG (heatmap + analytics)
-- ============================================================
CREATE TABLE activity_log (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES profiles ON DELETE CASCADE,
  activity_type    text,                    -- 'quiz_started', 'planner_generated', 'download', etc.
  metadata         jsonb,
  activity_date    date DEFAULT CURRENT_DATE,
  created_at       timestamptz DEFAULT now()
);

-- ============================================================
-- ANIMAL ASSETS (admin-uploadable illustrations)
-- ============================================================
CREATE TABLE animal_assets (
  animal_id        text PRIMARY KEY,       -- 'lion', 'whale', etc.
  image_url        text,                   -- Supabase Storage URL
  uploaded_by      uuid REFERENCES profiles,
  uploaded_at      timestamptz DEFAULT now()
);

-- Seed default animal IDs
INSERT INTO animal_assets (animal_id) VALUES
  ('lion'),('whale'),('dolphin'),('owl'),('fox'),('turtle'),
  ('eagle'),('octopus'),('mountain'),('wolf'),('sakura'),('cat'),
  ('crocodile'),('dove'),('butterfly'),('bamboo');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_assets     ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "own_profile"    ON profiles          FOR ALL USING (auth.uid() = id);
CREATE POLICY "own_quiz"       ON quiz_sessions      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_blueprints" ON planner_blueprints FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_jobs"       ON generation_jobs    FOR ALL USING (
  EXISTS (SELECT 1 FROM planner_blueprints WHERE id = generation_jobs.blueprint_id AND user_id = auth.uid())
);
CREATE POLICY "own_planners"   ON generated_planners FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_payments"   ON payments           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_activity"   ON activity_log       FOR ALL USING (auth.uid() = user_id);

-- Animal assets: public read, admin write only
CREATE POLICY "public_read_animals" ON animal_assets FOR SELECT USING (true);
CREATE POLICY "admin_write_animals" ON animal_assets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND display_name = 'admin')
);
