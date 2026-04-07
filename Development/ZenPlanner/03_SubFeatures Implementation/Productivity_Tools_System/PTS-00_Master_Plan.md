# PTS-00 — Productivity Tools System: Master Plan
**Phase:** 8 (Core product rebuild)
**Team:** Overseer (coord) + Monolith (DB + tool framework) + Syndicate (API + relations) + Arcade (widgets + dashboard UI)
**Status:** [ ] PENDING — awaiting Commander approval of this master plan
**Depends on:** AQL-01 (deferred, not blocking)
**Blocks:** All PTS-01..PTS-04 phase tickets

---

## 1. Problem Statement

ZenPlanner's current state is a **shell without the loop**. The quiz works, the blueprint selector works, an `.xlsx` file comes out the other end — but the product's core value (tools you open every day to plan, track, reflect) does not exist inside the app. Users can only "select" tools as a shopping list that compiles into a static Excel file. Nothing is live. Nothing is interactive. Nothing compounds into insight over time.

Commander's verbatim verdict (2026-04-08): *"It doesn't work for real at all."*

This plan rebuilds the tools system from catalog → functional widgets → data relations → Excel export, in that order. After this is done, ZenPlanner is no longer a quiz that outputs a PDF-alike — it's a daily-use productivity environment.

---

## 2. Target Experience (User Story)

> I take the quiz. I get my spirit animal. The app **recommends 5–10 tools** that fit my archetype and explains each one in plain language. I **enable the ones I want**, ignore the ones I don't. My dashboard rebuilds around my selection — mobile-first, no clutter.
>
> Every morning I open the dashboard. I **tap to log today's habits**, **add my 3 priorities**, **log my mood with one tap**. The widgets save instantly. I can see my streak, my weekly completion rate, last month's mood trend — all computed from the same data I just entered.
>
> At any point I can **toggle a tool off** (keeps the data, hides the widget) or **toggle it back on**. I can **export my data to Excel** — and the Excel file has real formulas, a dashboard sheet, conditional formatting, and opens cleanly in Google Sheets.
>
> Everything works on my phone first. Landscape desktop is a bonus, not the default.

---

## 3. The Four Pillars

| # | Pillar | What it delivers |
|---|---|---|
| **P1** | **Tool Catalog (Lego blocks)** | Each tool is a self-contained module: a definition object + a React widget + a data schema + a default config. Users pick from ~40 pre-built tools. No user-authored tool building. |
| **P2** | **Functional Dashboard (mobile-first)** | Dashboard renders a grid of the user's enabled tool widgets. Each widget is a **full editor** — users interact with real data there, not a read-only summary. |
| **P3** | **Data Relations (harmony)** | Tools declare what data they consume and produce. A relation graph auto-populates downstream tools (e.g., habit completion feeds weekly compass). Cross-tool reports aggregate the graph. |
| **P4** | **Excel + Google Sheets Export** | ExcelJS replaces SheetJS. Generated file has bound formulas, a dashboard sheet with charts, styled input cells, data validation, freeze panes. One-click "Open in Google Sheets" via download+upload flow. |

---

## 4. Architecture: Tool as Lego Block

Every tool is defined by one spec object that contains everything the rest of the system needs:

```ts
// lib/tools/types.ts
interface ToolDefinition {
  // Identity
  id: ToolId;                       // 'habit_tracker' | 'mood_log' | ...
  category: ToolCategory;           // 'productivity' | 'wellbeing' | 'reflection' | ...

  // Presentation
  name: { en: string; th: string; zh: string };
  description: { en: string; th: string; zh: string };
  icon: LucideIcon;
  color: string;                    // tailwind token, e.g. 'zen-sage'

  // Archetype affinity — which spirit animals this tool is recommended for
  recommendedFor: SpiritAnimal[];
  recommendationReason: { en: string; th: string; zh: string };

  // Data shape
  schema: ZodSchema;                // runtime validation on every entry
  defaultConfig: Record<string, unknown>;  // per-user settings (e.g., habit list, mood scale)

  // The widget itself — rendered on dashboard
  Widget: React.ComponentType<ToolWidgetProps>;

  // Relations (Pillar 3)
  produces: string[];               // data keys this tool emits (e.g., 'habit.completion')
  consumes: string[];               // data keys this tool reads (e.g., 'mood.today')

  // Excel (Pillar 4)
  excel: {
    buildSheet: (entries, config) => WorkbookSheet;
    buildDashboardSection: (aggregates) => DashboardCell[];
  };
}
```

**All ~40 tools conform to this interface.** Adding a new tool = creating one file under `lib/tools/{id}/index.ts` exporting a `ToolDefinition`. The dashboard, blueprint, Excel generator, and relation graph pick it up automatically.

---

## 5. Data Model (Supabase)

### New tables

```sql
-- Per-user enabled tools + their config
CREATE TABLE public.user_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,              -- matches ToolDefinition.id
  enabled boolean NOT NULL DEFAULT true,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,  -- per-user customization
  position int NOT NULL DEFAULT 0,    -- dashboard ordering
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- Event log for every interaction (habit check, mood log, priority add, etc.)
CREATE TABLE public.tool_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,              -- which tool this entry belongs to
  entry_date date NOT NULL,           -- logical date of the entry (for time-series)
  payload jsonb NOT NULL,             -- tool-specific, validated by tool's zod schema
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Indexes for the hot paths
  INDEX idx_tool_entries_user_date (user_id, entry_date DESC),
  INDEX idx_tool_entries_user_tool_date (user_id, tool_id, entry_date DESC)
);

-- RLS: users can only read/write their own rows
ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_tools_own" ON public.user_tools FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "tool_entries_own" ON public.tool_entries FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

### Why this shape
- **`user_tools` is the subscription table** — flipping `enabled: false` hides a widget without losing history.
- **`tool_entries` is append-only event log** — mood logs, habit checks, priorities, reflections all live here. Querying "my last 30 days" is one index hit.
- **`payload jsonb`** keeps each tool's data shape flexible without schema migrations for every new tool. Zod validates at write time.
- **No per-tool tables.** Adding a new tool does not require a migration.

---

## 6. Phase Breakdown

### 🧱 **Phase M1 — Tool Catalog + Enable/Disable**  (foundation, ~1 sprint)
**Goal:** Users can see a catalog, read what each tool does, enable/disable from blueprint AND dashboard. No functional widgets yet — just subscription management.

**Tickets:**
- `PTS-01-01` — Define `ToolDefinition` interface + ~40 tool stubs (name, description, recommendedFor, category, icon, color). No widget, no schema yet.
- `PTS-01-02` — Supabase migration: create `user_tools` + `tool_entries` tables + RLS. File: `supabase/migrations/003_productivity_tools.sql`.
- `PTS-01-03` — API routes: `GET /api/tools/catalog`, `GET /api/tools/mine`, `POST /api/tools/enable`, `POST /api/tools/disable`, `POST /api/tools/reorder`.
- `PTS-01-04` — Blueprint page rewrite: catalog grid with filter by category, archetype match highlight ("Recommended for your Lion profile"), enable toggle per card. Mobile-first cards, 1-col → 2-col at sm: breakpoint.
- `PTS-01-05` — Post-quiz recommendation screen: after reveal, inject a "Your recommended toolkit" card that lists the top 5-8 tools matched to the user's archetype with a "Enable all" shortcut.
- `PTS-01-06` — Dashboard placeholder: show list of enabled tools as read-only cards with "Coming soon" badge. No widgets yet — this is the M1 visible deliverable.

**Done when:** Logged-in user can enable 5 tools from the catalog, see them on dashboard as placeholders, toggle one off, see it disappear from dashboard (but still shown as disabled in catalog).

---

### 🧠 **Phase M2 — Functional Widgets on Dashboard**  (~2 sprints)
**Goal:** Every enabled tool renders a real, interactive widget on the dashboard. Users can log / check / edit / reflect — all from the dashboard, mobile-first.

**Widget layout principles (MANDATORY — do not violate):**
- **Mobile first.** Every widget renders at 360px width without horizontal scroll.
- **Progressive disclosure.** Each widget shows the "today" view by default. Tapping the widget header opens a full-page editor for history/config.
- **Collapsible.** Each widget has a chevron to collapse to header-only (saves space when many tools are enabled).
- **Heavy data → full-page.** Tools with large data (weekly review, monthly reflection) show a summary on dashboard and route to a dedicated page for editing.
- **No masonry, no drag-drop (yet).** Fixed linear list, user-reorderable via position field.

**Tickets:**
- `PTS-02-01` — Widget framework: `<ToolWidget>` wrapper (header, collapse, actions) + `useToolEntries(toolId)` hook (reads today's + recent entries) + `useToolConfig(toolId)` hook.
- `PTS-02-02` — Implement **10 core tools** first (priority by usefulness, not alphabet):
  1. Daily Priorities (top-3)
  2. Habit Tracker
  3. Mood Log
  4. Gratitude Journal
  5. Water Tracker
  6. Sleep Log
  7. Pomodoro Counter
  8. Weekly Review (full-page route)
  9. Daily Reflection
  10. Energy Level
- `PTS-02-03` — Remaining 30 tools as follow-up sub-tickets. Each = 1 tool = 1 file = 1 PR.
- `PTS-02-04` — Dashboard renders enabled user_tools sorted by position. Each renders its tool's Widget. Empty state: "Enable tools from the catalog to get started".
- `PTS-02-05` — Reorder UI: long-press or up/down arrows (mobile-first, no HTML5 drag) to reorder widgets.
- `PTS-02-06` — Disabled-tool UX: toggle-off button inside widget header, confirm dialog "Hide this tool? Your data is kept.", instant optimistic UI.

**Done when:** A user enables 10 tools, opens dashboard on a phone, logs real data into each, sees the data persist across refresh and across devices.

---

### 🔗 **Phase M3 — Relations + Cross-Tool Reports**  (~1 sprint)
**Goal:** Tools stop being islands. Data flows between them automatically. Cross-tool reports surface insight the user couldn't see from any single tool.

**Tickets:**
- `PTS-03-01` — Relation registry: each `ToolDefinition.produces` + `consumes` builds a dependency graph at module load. Validate no cycles.
- `PTS-03-02` — Aggregation functions: `aggregateToolData(userId, toolId, { from, to })` — runs on the server, returns pre-computed rollups (completion rate, streak, mean, trend).
- `PTS-03-03` — Implement the 4 confirmed relations:
  1. Habit completion → Weekly Compass "habits kept" auto-filled
  2. Daily Mood → Monthly Horizon mood trend line
  3. Daily Priorities done count → global streak counter
  4. All tools → unified "Reflection" report for week + month
- `PTS-03-04` — Reports page `/reports`: segmented tabs `[Week | Month | Quarter | Year]`, filter by tool category, aggregate charts + text summary.
- `PTS-03-05` — Dashboard summary card: shows top-of-mind cross-tool stats ("5-day streak · mood trend ↑ · 12 priorities done this week") — refreshed on every dashboard visit.

**Done when:** User logs a week of data, opens the weekly report, sees charts fed from multiple tools with no manual aggregation.

---

### 📊 **Phase M4 — Excel + Google Sheets Export**  (~1 sprint)
**Goal:** Replace SheetJS with ExcelJS. Generated file is production-quality — real formulas, dashboard sheet, styled input cells, data validation, conditional formatting, freeze panes.

**Tickets:**
- `PTS-04-01` — Swap SheetJS → ExcelJS in `lib/planner-generator.ts`. Preserve public API of `generatePlanner()` so callers don't change.
- `PTS-04-02` — Per-tool Excel sheet builder: each `ToolDefinition.excel.buildSheet` returns a sheet with bound formulas (not text), styled header row, data validation dropdowns where applicable.
- `PTS-04-03` — Dashboard sheet (new): aggregates all enabled tools via real cross-sheet formulas (`=COUNTIF(Habits!B2:B32,TRUE)`, `=AVERAGE(Mood!B:B)`), conditional formatting for progress bars, a small chart per metric.
- `PTS-04-04` — Input cell styling: light yellow fill + bold border on cells the user should fill, frozen header row, column widths pre-set, print-friendly margins.
- `PTS-04-05` — "Open in Google Sheets" button: generates `.xlsx`, downloads it, shows instructions "Drop into Drive → opens automatically". Phase 1 is manual upload; OAuth-based one-click creation is PTS-05 follow-up.
- `PTS-04-06` — Verify ExcelJS output in: desktop Excel 365, Excel 2016, LibreOffice Calc, Google Sheets (via upload), Numbers (macOS). Document any quirks.

**Done when:** User downloads their planner, opens it in Google Sheets, every formula computes correctly, the dashboard sheet looks professional, input cells are obvious.

---

## 7. Out of Scope (Explicit)

These are intentionally NOT part of this plan:

- **User-created custom tools.** Confirmed by Commander — catalog only, no custom builder.
- **Drag-drop reordering.** Long-press or arrow buttons only (M2). HTML5 drag-drop adds mobile pain for low value.
- **Offline support for widgets.** Requires service worker + IndexedDB conflict resolution. Out of scope; add later if telemetry shows demand.
- **Real-time collaboration.** One user per workspace.
- **Google Sheets OAuth one-click create.** M4 delivers download + manual upload. OAuth flow is a separate ticket (PTS-05).
- **Migration of existing `quiz_sessions` data** into the new tool system. Old data stays in old tables; new tool data lives in new tables. No backfill.
- **Removing the `planners` / SheetJS pipeline immediately.** Keep it running in parallel until PTS-04 is proven in production for 1 week, then remove in a follow-up cleanup ticket.

---

## 8. Risks + Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 40 tools is a lot of component code | High | Medium | Enforce the `ToolDefinition` shape strictly. Ship 10 first (M2-02), measure, then parallelize the remaining 30 across agents. |
| Mobile-first layout breaks when many tools are enabled | Medium | High | Collapsible widgets mandatory from M2-01. Default-collapse tools after the first 5. Add "compact view" mode later if needed. |
| Relation graph introduces cycles | Low | High | Static validation at module load — throw at boot, not runtime. Unit test covers cycle detection. |
| ExcelJS output differs subtly between Excel + Google Sheets | Medium | Medium | M4-06 explicit verification matrix. Document quirks. Prefer formulas both apps support (avoid `LET`, `LAMBDA`, dynamic arrays). |
| Data model change breaks existing quiz flow | Low | High | New tables only. No ALTER on `quiz_sessions`. Old flow untouched. |
| Tool config schemas drift between client and server | Medium | Medium | Single source of truth: Zod schema in `lib/tools/{id}/schema.ts` imported by both. |

---

## 9. Success Metrics (measured from Supabase logs)

After M2 ships to production, these are the signals we care about:

- **Activation:** % of users who complete quiz → enable ≥1 tool → log ≥1 entry within 24h. Target: ≥40%.
- **D1 retention:** % of users who log at least one entry the day after activation. Target: ≥25%.
- **D7 retention:** % of users who log at least one entry 7 days after activation. Target: ≥15%.
- **Tools per user:** median count of enabled tools. Target: 5–8 (not too few, not overwhelming).
- **Entries per user per day:** median. Target: ≥3 after D3.

Below any of these targets by 50% = pause M3/M4 and diagnose the UX.

---

## 10. Dependencies + Order

```
M1 (foundation) ─┬─> M2 (widgets) ─┬─> M3 (relations) ─> M4 (Excel)
                 │                  │
                 └─> (parallel)     └─> (parallel with M2-03 tail)
```

- **M1 must complete before M2** (tables + API are prerequisites)
- **M2 core 10 tools must complete before M3** (relations need real data flowing)
- **M2 remaining 30 tools can run in parallel with M3**
- **M4 can start after M3 relations are defined** (needs aggregation functions for the dashboard sheet)

---

## 11. What I need from Commander before writing any code

Three green lights:

1. ✅ **Scope approval** — the 4-pillar breakdown + phase order matches your intent.
2. ✅ **Tech choices** — Zod for schemas, ExcelJS for export, Supabase jsonb for payloads, mobile-first with collapsible widgets (no drag-drop).
3. ✅ **Tool priority list for M2-02** — the 10 tools listed (Daily Priorities, Habit Tracker, Mood Log, Gratitude, Water, Sleep, Pomodoro, Weekly Review, Daily Reflection, Energy Level). Want to swap any?

Once I get those three confirmations, I'll:

1. File the individual phase tickets (PTS-01-01 through PTS-04-06) in
   `Development/ZenPlanner/03_SubFeatures Implementation/Productivity_Tools_System/`
   with status `[ ] PENDING`.
2. File `PTS-01_Phase_Briefing.md` for the implementing team.
3. Start Phase M1 (the `ToolDefinition` interface + the Supabase migration — lowest-risk foundation work).

**No source code will be written until Commander signs off on this master plan.**

---

## 12. Estimated Scope

| Phase | Files touched | Lines added (rough) |
|---|---|---|
| M1 | ~12 (migration, API routes, blueprint rewrite, dashboard placeholder) | ~1,500 |
| M2 | ~20 (widget framework + 10 tool widgets + dashboard grid) | ~3,000 |
| M2 tail | ~30 (remaining 30 tool widgets) | ~2,500 |
| M3 | ~8 (relation graph, aggregation, reports page) | ~1,200 |
| M4 | ~15 (ExcelJS rewrite + dashboard sheet + per-tool builders) | ~2,000 |
| **Total** | **~85 files** | **~10,000 lines** |

This is a legitimate multi-week effort. Commander should expect phase M1 to land in ~2 days of focused work; M2 core in ~4 days; M2 tail + M3 in ~5 days; M4 in ~3 days. Total ~2 weeks of continuous work, longer if interleaved with other priorities.

---

## Notes

- All UI copy uses the `next-intl` pipeline from day one (EN/TH/ZH) — no inline strings.
- All new API routes use the Zod validation pattern from `app/api/quiz/reveal-summary/route.ts`.
- All new tables have RLS enabled before any INSERT ships.
- Mobile-first is non-negotiable and will be reviewed at every M2 widget PR.
- Anonymous quiz logging (AQL-01, deferred) is independent of this plan and can ship in parallel whenever Commander wants.
