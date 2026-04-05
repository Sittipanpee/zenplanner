# QZ-03 — Quiz Psychologist: Fix Quiz Engine, Prompts & API Routes

**Phase:** Production Sprint
**Team:** QZ-03 Quiz Psychologist
**Status:** [x] COMPLETE
**Depends on:** None
**Blocks:** INT-09

## Scope

Full overhaul of the quiz system covering:
1. `app/api/quiz/step/route.ts` — Fix answers array reset (P0), implement custom mode
2. `app/api/quiz/profile/route.ts` — Fix system prompt duplication, JSON regex, completion detection, add Zod validation
3. `app/api/quiz/complete/route.ts` — Add AI personality narrative via new generatePersonalityNarrative()
4. `lib/quiz-engine.ts` — Fix QuizState.phase type, fix axis score range
5. `lib/archetype-map.ts` — Remove unused variables, fix getArchetypeCode fallback
6. `lib/quiz-prompts.ts` (NEW) — Rich locale-aware prompt engineering module

## Acceptance Criteria

- [x] Quiz answers accumulate correctly across multiple requests (loaded from DB JSONB field)
- [x] Custom mode returns a meaningful LLM response instead of 501
- [x] Profile route does NOT send system prompt twice
- [x] Profile completion JSON extracted with `{...}` regex, not `[...]`
- [x] [PROFILE_COMPLETE] detection works: extract JSON first, then check tag
- [x] Zod schema validates parsed profile JSON
- [x] Complete route calls generatePersonalityNarrative() and stores/returns the narrative
- [x] QuizState.phase includes 'intro' in the union type
- [x] Axis score per-question contribution uses full axis value (not divided)
- [x] archetype-map.ts has no unused variable warnings
- [x] getArchetypeCode has a fallback return value
- [x] lib/quiz-prompts.ts exports: generatePersonalityNarrative, buildQuizSystemPrompt, buildScoringPrompt, buildNarrativePrompt
- [x] NarrativeSchema Zod validation applied to LLM output
- [x] Graceful LLM failure fallback returns sensible defaults

## Boundaries

- Do NOT touch: any file outside QZ-03 ownership list
- Do NOT modify: lib/types.ts, lib/llm.ts, supabase schema

## Notes

P0 bug #7 from SPRINT_SSOT: "Quiz answers array resets every request" — critical for quiz scoring correctness.
The `quiz_sessions` table has JSONB fields for storing answers/conversation.
