/**
 * useToolConfig — read/write the per-user `config` JSONB on user_tools.
 *
 * Reads from a passed-in initial config (the dashboard already fetched
 * `/api/tools/mine`, so we don't re-fetch here). Writes via
 * `POST /api/tools/config`.
 */

"use client";

import { useCallback, useState } from "react";

export interface UseToolConfigResult {
  config: Record<string, unknown>;
  setConfig: (next: Record<string, unknown>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useToolConfig(
  toolId: string,
  initialConfig: Record<string, unknown>
): UseToolConfigResult {
  const [config, setConfigState] = useState<Record<string, unknown>>(initialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setConfig = useCallback(
    async (next: Record<string, unknown>) => {
      const previous = config;
      setConfigState(next);
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/tools/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ toolId, config: next }),
        });
        if (!res.ok) throw new Error(`Config save failed (${res.status})`);
      } catch (err: unknown) {
        setConfigState(previous);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toolId, config]
  );

  return { config, setConfig, loading, error };
}
