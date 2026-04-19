"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, Plus, Trash2 } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { timeBoxingSchema, type TimeBoxingPayload } from "./index";

interface Block {
  id: string;
  hour: number;
  label: string;
}

const todayIso = (): string => new Date().toISOString().slice(0, 10);

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(hour: number): string {
  const hh = String(hour).padStart(2, "0");
  return `${hh}:00`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function TimeBoxingWidget({ entries, onEntryAdd }: ToolWidgetProps) {
  const t = useTranslations("tools.timeBoxing");

  const today = todayIso();
  const todayEntry = useMemo(
    () => entries.find((e) => e.entry_date === today),
    [entries, today]
  );

  const initialBlocks = useMemo<Block[]>(() => {
    if (!todayEntry) return [];
    const parsed = timeBoxingSchema.safeParse(todayEntry.payload);
    if (!parsed.success) return [];
    return parsed.data.blocks;
  }, [todayEntry]);

  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New block form state
  const [newHour, setNewHour] = useState<number>(8);
  const [newLabel, setNewLabel] = useState<string>("");

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const persist = useCallback(async () => {
    const payload: TimeBoxingPayload = { blocks: blocksRef.current };
    try {
      await onEntryAdd(payload);
    } catch {
      // Parent surfaces toast.
    }
  }, [onEntryAdd]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void persist();
    }, 400);
  }, [persist]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const addBlock = useCallback(() => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (blocks.length >= 12) return;

    const block: Block = { id: generateId(), hour: newHour, label: trimmed };
    setBlocks((prev) => {
      const next = [...prev, block];
      return next;
    });
    setNewLabel("");
    scheduleSave();
  }, [newLabel, newHour, blocks.length, scheduleSave]);

  const deleteBlock = useCallback(
    (id: string) => {
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      scheduleSave();
    },
    [scheduleSave]
  );

  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.hour - b.hour),
    [blocks]
  );

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-sky-500 dark:text-sky-400" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("title")}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t("subtitle")}
          </span>
        </div>
      </div>

      {/* Add block form */}
      <div className="flex gap-2">
        <select
          value={newHour}
          onChange={(e) => setNewHour(Number(e.target.value))}
          aria-label={t("addHour")}
          className="w-20 shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm text-zinc-800 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {formatHour(h)}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newLabel}
          placeholder={t("addLabel")}
          maxLength={200}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addBlock();
          }}
          aria-label={t("addLabel")}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />

        <button
          type="button"
          onClick={addBlock}
          disabled={!newLabel.trim() || blocks.length >= 12}
          aria-label={t("addButton")}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition active:scale-95 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("addButton")}</span>
        </button>
      </div>

      {/* Timeline */}
      {sorted.length > 0 ? (
        <ol className="flex flex-col gap-1">
          {sorted.map((block) => (
            <li
              key={block.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span className="w-12 shrink-0 font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                {formatHour(block.hour)}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-800 dark:text-zinc-100">
                {block.label}
              </span>
              <button
                type="button"
                onClick={() => deleteBlock(block.id)}
                aria-label={`Delete ${formatHour(block.hour)} block`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition active:scale-95 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("emptyHint")}
        </p>
      )}
    </div>
  );
}
