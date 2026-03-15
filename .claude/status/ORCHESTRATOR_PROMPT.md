# 🧘 ZenPlanner Orchestrator Prompt

## Context Summary

You are building **ZenPlanner** - a personalized planner web application with Spirit Animal Quiz (16 animals) and Custom Planner Builder. The project uses Next.js 16, TypeScript, Tailwind CSS v4, Supabase, and LINE LIFF.

### Current Status (2026-03-15)
- ✅ **13/13 Agents Completed** (initial build)
- ✅ **7 Testing Loops Passed**
- ✅ **Build passes** (`npm run build`)
- ⚠️ **Known Issues Remaining** (from Smart Goals analysis)

---

## 📊 SMART GOALS ANALYSIS

### 🔴 HIGH PRIORITY Issues

| # | Issue | Location | Description |
|---|-------|----------|-------------|
| 1 | Excel Formulas Missing | `lib/sheet-builder.ts` | Excel has no working formulas (SUM, COUNT, auto-date) |
| 2 | VBA Not Working | `lib/sheet-builder.ts` | VBA macros not actually injected into Excel |
| 3 | Dashboard Habits | `/dashboard` | Uses checkbox list instead of GitHub-style tiles |
| 4 | Blueprint Empty | `/blueprint` | Tools not loading from database (empty state) |
| 5 | Generate Page | `/generate` | Button exists but no actual file generated |

### 🟡 MEDIUM PRIORITY (Visual Previews)

| # | Tool | Status |
|---|------|--------|
| 1-6 | habit_heatmap, streak_tracker, 21day_challenge, quest_system, progress_bars, level_up | ✅ Have Previews |
| 7-38 | Remaining 32 tools | ❌ No Previews |

### 🟢 LOW PRIORITY
- Mood tracker emoji visualization
- Life wheel radar chart
- Eisenhower matrix 2x2 preview

---

## 🎯 REMAINING WORK PACKAGES

### Package A: Excel & VBA Fixes
1. **Add Formulas** to sheet-builder.ts:
   - `daily_power_block`: Auto-calculate daily score
   - `mood_tracker`: Mood average formula
   - `quest_system`: Total XP SUM formula
   - `streak_tracker`: Current streak counter

2. **Implement VBA Injection**:
   - Auto-populate today's date on sheet open
   - Conditional formatting macros
   - Dropdown shortcuts
   - Summary dashboard auto-generate

### Package B: Dashboard Visualization
1. **Habit Tiles**: Replace checkbox list with GitHub-style 7x52 grid
2. **Mood Visual**: Add emoji representation (😢😕😐🙂😊)
3. **Streak Counters**: Display as flame icon + number
4. **Connect to Database**: Fetch real data instead of localStorage

### Package C: Blueprint Fixes
1. **Load Tools from DB**: Fix empty blueprint state
2. **Add 10 Key Previews**:
   - daily_power_block, mood_tracker, kanban_board
   - life_wheel, eisenhower_matrix, weekly_compass
   - milestone_map, budget_tracker, energy_map, morning_clarity

### Package D: Generate Flow
1. **Fix Generation**: Make /generate actually produce downloadable Excel
2. **Connect to Blueprint**: Use selected tools from database
3. **Error Handling**: Add proper error states

---

## 📁 Key Files Reference

| File | Purpose | Owner |
|------|---------|-------|
| `lib/sheet-builder.ts` | Excel generation engine | SHEET_ENGINE |
| `lib/types.ts` | ToolId type definition (38 tools) | TYPES |
| `components/planner/tool-card.tsx` | Tool selection card | BLUEPRINT_UI |
| `components/planner/special-tool-previews.tsx` | 6 tool previews | BLUEPRINT_UI |
| `app/(app)/blueprint/page.tsx` | Tool selection page | BLUEPRINT_UI |
| `app/(app)/dashboard/page.tsx` | User dashboard | DASHBOARD |
| `app/(app)/generate/page.tsx` | Planner generation | EXPORT_UI |
| `components/dashboard/heatmap.tsx` | Activity heatmap | DASHBOARD |

---

## 🔧 Commands to Run

```bash
# Development
npm run dev

# Build
npm run build

# Lint
npm run lint
```

---

## 📋 Orchestrator Instructions

When commanding the work:

1. **Never write code yourself** - dispatch to agents only
2. **Use Anti-Hallucination Protocol** - verify all changes
3. **One file one owner** - respect File Ownership Map
4. **Test with agent-browser** - verify fixes work

### Agent Dispatch Order (Recommended)

```
1. SHEET_ENGINE → Fix Excel formulas + VBA injection
2. BLUEPRINT_UI → Fix empty state + add 10 previews
3. DASHBOARD → Fix habit tiles + connect to DB
4. EXPORT_UI → Fix generate flow
5. Final Verification → Run agent-browser tests
```

---

## ✅ Verification Checklist

After each fix:
- [ ] `npm run build` passes
- [ ] Page loads without errors
- [ ] Interactive elements work (buttons, toggles)
- [ ] Data flows correctly (form submits, data saves)
- [ ] Visual design matches Zen Design System

---

## 📞 Emergency Rollback

If something breaks:
```bash
git checkout -- .
git status
```

---

*Last Updated: 2026-03-15*
*Status: Waiting for Phase 2 Fixes*
