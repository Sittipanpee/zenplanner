# AQL-01 — Anonymous Quiz Result Logging
**Phase:** 7 (Post-launch data foundation)
**Team:** Monolith (DB schema) + Syndicate (API endpoint) + Arcade (client wiring)
**Status:** [ ] PENDING
**Depends on:** None
**Blocks:** Future AQL-02 (archetype calibration from empirical data)

## Scope

Log every quiz completion — including anonymous (unauthenticated) users — to Supabase so we can:

1. Monitor the live distribution of spirit animals in production (detect drift, detect buggy dominance like the pre-`a65f66d` Lion-for-everyone bug).
2. Measure algorithm quality empirically — what's the median z-distance gap between #1 and #2 archetypes? If 60%+ of users land in the hybrid zone (gap < 1.5), the profile grid is too sparse.
3. Build a calibration dataset for AQL-02 — if we ever want to replace the hand-tuned archetype profiles with empirical cluster centroids, we need raw user score vectors. Without this ticket, AQL-02 starts from zero.

Today, `/api/quiz/complete` only logs authenticated users to `quiz_sessions`. Most ZenPlanner quiz traffic is anonymous (landing → quiz → reveal without login), so >80% of results are silently discarded.

## Acceptance Criteria

### Database (Monolith)
- [ ] New table `quiz_results_anon` created via migration
- [ ] Schema:
  ```sql
  CREATE TABLE public.quiz_results_anon (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    -- 6-axis score vector as JSONB
    scores jsonb NOT NULL,  -- { energy, planning, social, decision, focus, drive }
    primary_animal text NOT NULL,
    secondary_animal text,
    tertiary_animal text,
    -- z-distance of primary match (how decisive the match was)
    primary_z_distance numeric(5,3),
    -- gap between #1 and #2 (small gap = hybrid / uncertain)
    secondary_gap numeric(5,3),
    locale text NOT NULL CHECK (locale IN ('en','th','zh')),
    -- Optional: coarse client fingerprint (NOT a user ID)
    user_agent_family text,  -- 'chrome', 'safari', 'firefox', 'other'
    -- NO IP, NO session, NO user identity
    CONSTRAINT primary_animal_valid CHECK (primary_animal ~ '^[a-z]+$')
  );

  -- Index for time-series analysis
  CREATE INDEX idx_quiz_results_anon_created_at ON public.quiz_results_anon(created_at DESC);
  -- Index for distribution queries
  CREATE INDEX idx_quiz_results_anon_primary_animal ON public.quiz_results_anon(primary_animal);
  ```
- [ ] RLS enabled with insert-only anonymous policy:
  ```sql
  ALTER TABLE public.quiz_results_anon ENABLE ROW LEVEL SECURITY;

  -- Anyone (including anon) can INSERT
  CREATE POLICY "anon_insert_quiz_results"
    ON public.quiz_results_anon
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

  -- Only service_role can SELECT (analytics access only)
  CREATE POLICY "service_role_select_quiz_results"
    ON public.quiz_results_anon
    FOR SELECT
    TO service_role
    USING (true);
  ```
- [ ] Migration file committed under `supabase/migrations/YYYYMMDDHHMMSS_quiz_results_anon.sql`
- [ ] Verify in Supabase dashboard: table exists, RLS on, policies attached

### API Endpoint (Syndicate)
- [ ] New route: `POST /api/quiz/log-anon`
- [ ] Request body (Zod-validated):
  ```typescript
  {
    scores: { energy: number, planning: number, social: number, decision: number, focus: number, drive: number },  // each 0-100
    locale: "en" | "th" | "zh"
  }
  ```
- [ ] Server-side:
  1. Clamp all scores to `[0, 100]` (defense in depth)
  2. Call `getRankedAnimals(scores)` from `lib/archetype-map.ts` — server derives primary/secondary/tertiary, user cannot forge
  3. Compute `primary_z_distance = ranked[0].zDistance` and `secondary_gap = ranked[1].zDistance - ranked[0].zDistance`
  4. Extract `user_agent_family` from `User-Agent` header (simple substring match, bucket to 4 values)
  5. Insert row using a **service-role Supabase client** (not the user's anon client) to bypass RLS for this specific insert
- [ ] Rate limit: reuse the in-memory limiter pattern from `app/api/quiz/reveal-summary/route.ts` — 10 req/min per IP
- [ ] Never return anything user-identifying in the response (just `{ ok: true }` or an error)
- [ ] Must work when user is NOT authenticated (no Supabase auth cookie)

### Client Wiring (Arcade)
- [ ] In `app/quiz/[mode]/page.tsx` `saveQuizResult` flow:
  - If user IS authenticated: keep existing call to `/api/quiz/complete` (unchanged)
  - If user is NOT authenticated: call `/api/quiz/log-anon` instead
  - Both calls must be fire-and-forget — never block the reveal page navigation on the log request
  - Silent failure here is acceptable (it's telemetry, not UX) but the client must `.catch()` to prevent unhandled promise rejections
- [ ] Add a single integration test verifying that an anonymous user completing the quiz produces one row in `quiz_results_anon`

### Privacy & Compliance
- [ ] Update `app/privacy/page.tsx` (or create if missing) to disclose:
  - "We log aggregate quiz results (6-axis scores + resulting archetype) with no personal identifiers, for the purpose of improving the algorithm."
  - "No IP address, no device ID, no session token is stored."
- [ ] Confirm with Commander: GDPR/PDPA stance — anonymous aggregate data is generally exempt, but the disclosure is still expected
- [ ] `user_agent_family` uses only 4 buckets (`chrome`, `safari`, `firefox`, `other`) — NOT the full UA string, which would be fingerprintable

## Boundaries

- **Do NOT touch:**
  - The existing `quiz_sessions` table or the authenticated flow in `/api/quiz/complete` — that is out of scope
  - The client-side scoring logic in `calculateScores` — it is already correct as of `a65f66d`
  - The archetype profiles in `lib/archetype-map.ts` — data collection now, calibration in AQL-02 later
- **Do NOT log:**
  - IP addresses
  - Supabase user IDs (even if present)
  - Full User-Agent strings
  - Raw answer sequences (we only need final scores)
- **Do NOT add** any new third-party analytics (Google Analytics, Mixpanel, Amplitude) — this ticket is specifically about keeping analytics first-party and privacy-respecting

## Notes

**Why this matters:**
Commander's statistician review (2026-04-07) flagged that the archetype profiles are unfalsifiable without empirical ground truth. This ticket is the cheapest possible first step toward making them falsifiable: collect real user score distributions with no PII so a future calibration pass has data to work with.

**Related deliverables already shipped (reference only, do not touch):**
- `a65f66d` — Top-3 matches, z-score distance, honest framing copy
- `dc8032e` → `00bc418` — Fixed `calculateScores` (Lion-for-everyone bug)
- `Development/ZenPlanner/02_FeatureDescription/Quiz_Scoring/Animal_Criteria.md` — criteria doc per animal

**Analysis queries to run after 1 week of data** (for Verification Scholar):
```sql
-- Animal distribution
SELECT primary_animal, COUNT(*), ROUND(100.0*COUNT(*)/SUM(COUNT(*)) OVER (), 2) AS pct
FROM quiz_results_anon
GROUP BY primary_animal
ORDER BY COUNT(*) DESC;

-- Hybrid zone rate (gap < 1.5)
SELECT
  ROUND(100.0*COUNT(*) FILTER (WHERE secondary_gap < 1.5)/COUNT(*), 2) AS hybrid_pct
FROM quiz_results_anon;

-- Z-distance percentiles (how decisive is the median match?)
SELECT
  percentile_cont(0.25) WITHIN GROUP (ORDER BY primary_z_distance) AS p25,
  percentile_cont(0.50) WITHIN GROUP (ORDER BY primary_z_distance) AS p50,
  percentile_cont(0.75) WITHIN GROUP (ORDER BY primary_z_distance) AS p75
FROM quiz_results_anon;
```

**Success signal:** If after 1 week of ≥100 logged results, the top animal's share is <25% (not Lion-dominated), the matcher is behaving. If it's >40%, something is wrong.

**Follow-up ticket (do not include in this scope):**
- **AQL-02** — Empirical archetype calibration: after AQL-01 has logged ≥500 results, run k-means/GMM on the score vectors, compute cluster centroids, optionally replace the hand-tuned profiles in `lib/archetype-map.ts`. Separate ticket because it requires real data that doesn't exist yet.
