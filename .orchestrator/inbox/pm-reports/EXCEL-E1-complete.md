---
type: pm_report
from: pm-excel-export
to: chief-orchestrator
priority: normal
phase: WAVE-5
created_at: "2026-04-08T13:43:52Z"
ticket_id: EXCEL-E1
status: COMPLETE
summary:
  delivered:
    - "ToolSheetSpec extended with consumesCell (ConsumesCellEntry[]) directive for declarative cross-sheet references"
    - "ToolSheetSpec extended with summaryCells (Record<string,string>) registry for named cell exposure"
    - "buildToolSheet renderer resolves cross-sheet references at render time via registered spec registry"
    - "New exports in build-tool-sheet.ts: registerSpecForToolId, getSheetNameForToolId, getRegisteredSpec, shiftCol"
    - "habit_heatmap spec now exposes summaryCells.weekTotalDone = 'I15' (W12 most-recent-week total column)"
    - "weekly_compass spec declares consumesCell pulling habit_heatmap.weekTotalDone into B16 with label 'Habits kept this week'"
    - "sheet-builder.ts split into Phase 1 (resolve+register all specs) and Phase 2 (render) — ensures cross-sheet lookups always resolve"
    - "Build passes cleanly (npm run build + npx tsc --noEmit — zero errors, zero warnings)"
    - "All new symbols confirmed present in compiled SSR chunk (_b84219f4._.js) and source maps"
  files_touched:
    - "lib/excel/build-tool-sheet.ts"
    - "lib/excel/tool-templates.ts"
    - "lib/sheet-builder.ts"
  concerns: []
  next_suggestion: "E2 and E3 can now use consumesCell for their tools — monthly_review and mood_tracker specs can declare cross-sheet refs using the same pattern; registerSpecForToolId is already called for all toolIds in Phase 1 of sheet-builder.ts"
---

# EXCEL-E1 done

Wave 5 foundation layer is shipped. Commit: `36a5d5d`.

The cross-sheet reference mechanism is fully operational:

- Any `ToolSheetSpec` can declare `summaryCells` to expose named cell addresses
- Any `ToolSheetSpec` can declare `consumesCell` entries to pull values from other tool sheets via Excel cross-sheet formulas (`='Target Sheet'!<cell>`)
- The spec registry (`registerSpecForToolId`) is populated in Phase 1 of `sheet-builder.ts` before any sheet is rendered, guaranteeing resolution at render time
- Backward compatibility preserved — existing specs without these fields work unchanged

**Wired link verified in source:** Weekly Compass B16 → `='Habit Heatmap'!I15` (most-recent week total done).
