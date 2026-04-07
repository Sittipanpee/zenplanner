/**
 * useToolEntries — fetches tool_entries for a single tool over a date range.
 *
 * Includes a tiny in-module cache keyed by (toolId, from, to) so multiple
 * widgets mounting the same data don't double-fetch within a session.
 *
 * Exposes `addEntry` for optimistic insert + POST to /api/tools/entries.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ToolEntry } from "@/lib/tools/types";

interface CacheValue {
  entries: ToolEntry[];
  fetchedAt: number;
}

const CACHE = new Map<string, CacheValue>();
const CACHE_TTL_MS = 60_000; // 60s soft cache

function cacheKey(toolId: string, from: string, to: string): string {
  return `${toolId}|${from}|${to}`;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface UseToolEntriesResult {
  entries: ToolEntry[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addEntry: (payload: Record<string, unknown>, entryDate?: string) => Promise<void>;
}

export function useToolEntries(
  toolId: string,
  from: Date,
  to: Date
): UseToolEntriesResult {
  const fromIso = isoDate(from);
  const toIso = isoDate(to);
  const key = cacheKey(toolId, fromIso, toIso);

  const cached = CACHE.get(key);
  const [entries, setEntries] = useState<ToolEntry[]>(cached?.entries ?? []);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/tools/entries?toolId=${encodeURIComponent(
        toolId
      )}&from=${fromIso}&to=${toIso}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load entries (${res.status})`);
      const json = (await res.json()) as { entries: ToolEntry[] };
      const list = json.entries ?? [];
      CACHE.set(key, { entries: list, fetchedAt: Date.now() });
      if (mountedRef.current) setEntries(list);
    } catch (err: unknown) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [toolId, fromIso, toIso, key]);

  useEffect(() => {
    const fresh = CACHE.get(key);
    if (fresh && Date.now() - fresh.fetchedAt < CACHE_TTL_MS) {
      setEntries(fresh.entries);
      setLoading(false);
      return;
    }
    void fetchEntries();
  }, [key, fetchEntries]);

  const addEntry = useCallback(
    async (payload: Record<string, unknown>, entryDate?: string) => {
      const date = entryDate ?? isoDate(new Date());
      // Optimistic insert
      const optimistic: ToolEntry = {
        id: `optimistic-${Date.now()}`,
        user_id: "self",
        tool_id: toolId,
        entry_date: date,
        payload,
        created_at: new Date().toISOString(),
      };
      const next = [optimistic, ...entries];
      setEntries(next);
      CACHE.set(key, { entries: next, fetchedAt: Date.now() });

      try {
        const res = await fetch("/api/tools/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ toolId, entryDate: date, payload }),
        });
        if (!res.ok) throw new Error(`Save failed (${res.status})`);
        const json = (await res.json()) as { entry: ToolEntry };
        // Replace optimistic with server row
        const replaced = next.map((e) =>
          e.id === optimistic.id && json.entry ? json.entry : e
        );
        setEntries(replaced);
        CACHE.set(key, { entries: replaced, fetchedAt: Date.now() });
      } catch (err: unknown) {
        // Roll back
        setEntries(entries);
        CACHE.set(key, { entries, fetchedAt: Date.now() });
        throw err instanceof Error ? err : new Error("Save failed");
      }
    },
    [toolId, entries, key]
  );

  return { entries, loading, error, refetch: fetchEntries, addEntry };
}
