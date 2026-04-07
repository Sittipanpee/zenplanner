/**
 * Cross-tool aggregations (PTS-03-02 / PTS-03-03)
 *
 * Pure functions that turn raw `tool_entries` into the headline numbers
 * surfaced on the /reports page and the dashboard summary card.
 *
 * The 4 confirmed relations:
 *   1. habit.completionRate  — % of habits done today, averaged over last 7d
 *   2. mood.weekAverage      — mean of mood entries in the last 7 days
 *   3. priorities.doneCount  — count of priorities with `done: true` in range
 *   4. streak.currentDays    — consecutive days with ≥1 entry across any tool
 */

import type { RelationKey } from "./relations";
import type { ToolEntry, ToolId } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

function withinRange(entry: ToolEntry, from: Date, to: Date): boolean {
  const t = new Date(entry.entry_date + "T00:00:00Z").getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function asNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// ────────────────────────────────────────────────────────────────
// 1. habit.completionRate
// ────────────────────────────────────────────────────────────────

interface HabitPayload {
  habits?: Array<{ done?: boolean; completed?: boolean }>;
  done?: number;
  total?: number;
}

function habitDayRate(entry: ToolEntry): number | null {
  const p = entry.payload as HabitPayload;
  if (Array.isArray(p?.habits) && p.habits.length > 0) {
    const done = p.habits.filter((h) => h?.done === true || h?.completed === true).length;
    return done / p.habits.length;
  }
  if (typeof p?.done === "number" && typeof p?.total === "number" && p.total > 0) {
    return p.done / p.total;
  }
  return null;
}

export function computeHabitCompletionRate(entries: ToolEntry[]): number | null {
  const since = daysAgo(6); // last 7 days inclusive
  const recent = entries.filter((e) => {
    const d = new Date(e.entry_date + "T00:00:00Z");
    return d.getTime() >= since.getTime();
  });
  if (recent.length === 0) return null;

  // Average rate per day, then average across days
  const byDay = new Map<string, number[]>();
  for (const e of recent) {
    const r = habitDayRate(e);
    if (r === null) continue;
    const arr = byDay.get(e.entry_date) ?? [];
    arr.push(r);
    byDay.set(e.entry_date, arr);
  }
  if (byDay.size === 0) return null;

  let sum = 0;
  for (const arr of byDay.values()) {
    sum += arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  return sum / byDay.size;
}

// ────────────────────────────────────────────────────────────────
// 2. mood.weekAverage
// ────────────────────────────────────────────────────────────────

export function computeMoodWeekAverage(entries: ToolEntry[]): number | null {
  const since = daysAgo(6);
  const values: number[] = [];
  for (const e of entries) {
    const d = new Date(e.entry_date + "T00:00:00Z");
    if (d.getTime() < since.getTime()) continue;
    const p = e.payload as { score?: unknown; mood?: unknown; value?: unknown };
    const v = asNumber(p.score) ?? asNumber(p.mood) ?? asNumber(p.value);
    if (v !== null) values.push(v);
  }
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ────────────────────────────────────────────────────────────────
// 3. priorities.doneCount
// ────────────────────────────────────────────────────────────────

interface PrioritiesPayload {
  priorities?: Array<{ done?: boolean; completed?: boolean }>;
  done?: boolean;
}

export function computePrioritiesDoneCount(
  entries: ToolEntry[],
  range?: { from: Date; to: Date }
): number {
  let count = 0;
  for (const e of entries) {
    if (range && !withinRange(e, range.from, range.to)) continue;
    const p = e.payload as PrioritiesPayload;
    if (Array.isArray(p?.priorities)) {
      count += p.priorities.filter(
        (it) => it?.done === true || it?.completed === true
      ).length;
    } else if (p?.done === true) {
      count += 1;
    }
  }
  return count;
}

// ────────────────────────────────────────────────────────────────
// 4. streak.currentDays
// ────────────────────────────────────────────────────────────────

export function computeCurrentStreak(allEntries: ToolEntry[]): number {
  if (allEntries.length === 0) return 0;
  const days = new Set<string>();
  for (const e of allEntries) days.add(e.entry_date);

  let streak = 0;
  let cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);

  // If no entry today, start the count from yesterday so an unfinished
  // current day doesn't reset a multi-day streak too eagerly.
  if (!days.has(toIsoDate(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS);
    if (!days.has(toIsoDate(cursor))) return 0;
  }

  while (days.has(toIsoDate(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

// ────────────────────────────────────────────────────────────────
// Generic dispatcher
// ────────────────────────────────────────────────────────────────

export function aggregateForKey(
  key: RelationKey,
  entries: ToolEntry[]
): number | string | null {
  switch (key) {
    case "habit.completionRate":
      return computeHabitCompletionRate(entries);
    case "mood.weekAverage":
      return computeMoodWeekAverage(entries);
    case "priorities.doneCount":
      return computePrioritiesDoneCount(entries);
    case "streak.currentDays":
      return computeCurrentStreak(entries);
    default:
      return null;
  }
}

// ────────────────────────────────────────────────────────────────
// computeCrossToolSummary
// ────────────────────────────────────────────────────────────────

export interface CrossToolSummary {
  metrics: Record<string, number | string>;
  toolBreakdown: Record<string, { entries: number; lastEntryDate: string | null }>;
}

export function computeCrossToolSummary(
  _userId: string,
  entries: Record<string, ToolEntry[]>,
  range: { from: Date; to: Date }
): CrossToolSummary {
  const habitEntries = entries["habit_tracker"] ?? [];
  const moodEntries = [
    ...(entries["mood_log"] ?? []),
    ...(entries["mood_score"] ?? []),
  ];
  const prioritiesEntries = entries["daily_priorities"] ?? [];

  const allEntries: ToolEntry[] = [];
  for (const list of Object.values(entries)) allEntries.push(...list);

  const metrics: Record<string, number | string> = {};

  const habit = computeHabitCompletionRate(habitEntries);
  if (habit !== null) metrics["habit.completionRate"] = Math.round(habit * 100) / 100;

  const mood = computeMoodWeekAverage(moodEntries);
  if (mood !== null) metrics["mood.weekAverage"] = Math.round(mood * 100) / 100;

  metrics["priorities.doneCount"] = computePrioritiesDoneCount(
    prioritiesEntries,
    range
  );

  metrics["streak.currentDays"] = computeCurrentStreak(allEntries);

  const toolBreakdown: Record<string, { entries: number; lastEntryDate: string | null }> = {};
  for (const [toolId, list] of Object.entries(entries)) {
    const inRange = list.filter((e) => withinRange(e, range.from, range.to));
    const sorted = [...inRange].sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
    toolBreakdown[toolId] = {
      entries: inRange.length,
      lastEntryDate: sorted[0]?.entry_date ?? null,
    };
  }

  return { metrics, toolBreakdown };
}

export type { ToolId };
