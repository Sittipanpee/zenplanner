# ZenPlanner — Planner Tool Taxonomy (SSOT)

> The LLM selects a subset of these tools based on archetype + profiling.
> Tool IDs are the canonical identifiers — used in DB, types, and sheet generation.

---

## Productivity

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `daily_power_block` | Daily Power Block | Top-3 priorities + time blocks (ref: High Performance Planner) | Cols: Date, Priority 1-3, Time Start, Time End, Done ✓, Score |
| `weekly_compass` | Weekly Compass | Week overview with top goals, habits, review | Rows: Mon-Sun + Weekend Review, Cols: Task, Priority, Done |
| `monthly_horizon` | Monthly Horizon | Month-level goal setting + milestone tracking | Grid: 31 days × goal categories, summary row |
| `quarterly_vision` | Quarterly Vision Board | 90-day OKR-style planning | Sections: Objective, Key Results (3 each), Progress % |
| `pomodoro_tracker` | Pomodoro Tracker | Focus sessions with break scheduling | Cols: Date, Task, Sessions Done, Break Count, Notes |
| `eisenhower_matrix` | Eisenhower Matrix | Urgent/Important quadrant sorter | 4-quadrant grid with drag-drop (VBA) |
| `kanban_board` | Kanban Board | To Do / Doing / Done columns | 3-column layout, WIP limit column |
| `time_boxing` | Time Boxing | Hour-by-hour day planner | Rows: 05:00-23:00 in 30min blocks, cols: Mon-Sun |

---

## Reflection & Mindfulness

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `morning_clarity` | Morning Clarity | 5-minute morning prompt (gratitude, intention, affirmation) | Date, 3 Gratitudes, Today's Intention, Affirmation |
| `evening_reflection` | Evening Reflection | What went well, what to improve, tomorrow's focus | Date, Win of Day, Lesson, Tomorrow's #1 Focus, Mood |
| `weekly_review` | Weekly Review | Score the week, lessons, adjustments | Week #, Score (1-10), Wins, Lessons, Adjustments |
| `mood_tracker` | Mood Tracker | Daily mood logging with emoji/color scale | Date, Mood (dropdown 1-5), Energy, Notes, auto-chart |
| `energy_map` | Energy Map | Track energy levels throughout the day | Hour-by-hour energy log, weekly pattern chart |
| `gratitude_log` | Gratitude Log | 3 things grateful for daily | Date, Gratitude 1-3, Why it matters |
| `journal_prompt` | Journal Prompt | LLM-generated daily reflection question | Date, Prompt (from API), Response area |
| `mindfulness_bell` | Mindfulness Bell | Scheduled breathing/pause reminders | Time slots, type (breathe/pause/gratitude), done ✓ |

---

## Habit & Streak

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `habit_heatmap` | Habit Heatmap | GitHub-tile style check-in grid | 7×52 grid, conditional formatting (green gradient), streak count |
| `habit_stack` | Habit Stack | Chain habits together (if X then Y) | Trigger, Habit, Reward, Stack order, Streak |
| `streak_tracker` | Streak Tracker | Consecutive day counter with freeze tokens | Habit, Current Streak, Best Streak, Freeze Used, Chart |
| `21day_challenge` | 21-Day Challenge | Focused habit formation sprint | Habit, Days 1-21 (✓/ ), Star on day 7/14/21 |

---

## Goal & Progress

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `quest_system` | Quest System | Goals framed as RPG quests with XP | Quest Name, XP Value, Difficulty, Status (dropdown), Rewards, Total XP formula |
| `level_up` | Level-Up Tracker | Skill tree visualization | Skills tree (nested), Current Level, XP per skill, Progress bar |
| `milestone_map` | Milestone Map | Visual roadmap of key checkpoints | Timeline, Milestone Name, Target Date, Status, Notes |
| `progress_bars` | Progress Bars | Percentage completion for each goal area | Goal, Target, Current, % formula, data bar conditional format |

---

## Creative & Visual

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `bujo_spread` | Bujo Spread | Bullet journal template with custom keys | Key legend, Daily log (•task, ○event, ✕done, →migrate) |
| `moodboard` | Moodboard | Visual inspiration collage area | Image placeholders (16:9 each), caption, theme color |
| `brain_dump` | Brain Dump | Unstructured capture space | Free-form rows + category tag column |
| `mind_map` | Mind Map | Central idea → branching thoughts | Nested indented list + visual branch lines (VBA) |
| `doodle_zone` | Doodle Zone | Free drawing area within planner | Merged cell area + drawing mode note |

---

## Self-Scoring

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `life_wheel` | Life Wheel | Score 8 life areas (health, career, etc.) | Areas: Health, Career, Finance, Family, Fun, Growth, Spirituality, Relationships; Score 1-10 each; spider chart |
| `weekly_scorecard` | Weekly Scorecard | Rate yourself 1-10 on key dimensions | Dimensions: Productivity, Energy, Mindset, Relationships; Week-over-week trend |
| `hp_clarity_chart` | HP Clarity Chart | Ref: High Performance Planner clarity score | Clarity prompt, score 1-10, trend chart |
| `nps_self` | Self NPS | "How likely would you recommend your week to a friend?" | Score 0-10, reasoning, what would make it better |

---

## Finance & Life

| Tool ID | Name | Description | Sheet Spec |
|---|---|---|---|
| `budget_tracker` | Budget Tracker | Income/expense/savings tracker | Date, Category (dropdown), Amount, Type (income/expense), Running balance |
| `meal_planner` | Meal Planner | Weekly meal planning grid | Mon-Sun × Breakfast/Lunch/Dinner/Snack, shopping list auto-tab |
| `fitness_log` | Fitness Log | Workout tracking + body metrics | Date, Workout type, Duration, Notes, Weight, Progress chart |
| `reading_list` | Reading List | Books queue + notes | Title, Author, Format, Status, Key Takeaway, Rating |
| `project_tracker` | Project Tracker | Multi-project status dashboard | Project, Owner, Priority, Status (dropdown), Due, % Done, Notes |
