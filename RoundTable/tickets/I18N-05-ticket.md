# I18N-05 — i18n System: Translation Files, Animal Data, Request Config
**Phase:** Production Sprint Wave 1
**Team:** I18N-05 i18n Architect
**Status:** [x] COMPLETE
**Depends on:** None
**Blocks:** QF-07, FP-08, INT-09

## Scope
Create the complete internationalization system for ZenPlanner:
- `i18n/request.ts` — next-intl getRequestConfig reading NEXT_LOCALE cookie
- `messages/en.json` — Complete English translations per SSOT key contract
- `messages/th.json` — Complete Thai translations (natural, warm Thai)
- `messages/zh.json` — Complete Simplified Chinese translations
- `lib/animal-data.ts` — Canonical ANIMALS record for all 16 spirit animals with
  nameTh/nameEn/nameZh, gradients, archetypes, traits. Fixes fox Chinese name bug.

## Acceptance Criteria
- [ ] All 5 files created and compilable
- [ ] All SSOT namespaces covered: common, auth, quiz, planner, dashboard, profile
- [ ] All 16 SpiritAnimal values from lib/types.ts have entries in ANIMALS record
- [ ] Fox Chinese name correctly set to 狐狸 (was broken in prior codebase)
- [ ] Thai translations use natural, warm language (กรุณา/คุณ appropriately)
- [ ] Chinese translations use Simplified Chinese (简体中文)
- [ ] Animal Thai names accurate (not phonetic)
- [ ] Animal Chinese names accurate
- [ ] getAnimal() and getAnimalName() helpers exported

## Boundaries
- Do NOT touch: any file not in the ownership list above
- Do NOT modify: lib/types.ts, any existing component, any config files

## Notes
- SpiritAnimal values from types.ts: lion, whale, dolphin, owl, fox, turtle, eagle,
  octopus, mountain, wolf, sakura, cat, crocodile, dove, butterfly, bamboo
- P0 Issue #11: Fox animal name in Chinese — this ticket fixes it canonically
- SSOT key contract at RoundTable/SPRINT_SSOT.md is the binding reference
