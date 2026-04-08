"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Play, Pause, RotateCcw, Minus, Plus } from "lucide-react";
import type { ToolWidgetProps, ToolEntry } from "../types";
import {
  DEFAULT_MEDITATION_CONFIG,
  type MeditationTimerConfig,
  type MeditationTimerPayload,
} from "./index";

const PRESETS: ReadonlyArray<number> = [5, 10, 15, 20];

function playBell(): void {
  try {
    const AC =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 396;
    osc.type = "sine";
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    osc.start(now);
    osc.stop(now + 2.9);
    setTimeout(() => ctx.close().catch(() => {}), 3100);
  } catch {
    // graceful fallback
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMMSS(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function sumTodayMinutes(entries: ToolEntry[]): number {
  const today = todayIso();
  let total = 0;
  for (const e of entries) {
    if (e.entry_date !== today) continue;
    const p = e.payload as Partial<MeditationTimerPayload>;
    total += p.duration ?? 0;
  }
  return total;
}

export function MeditationTimerWidget({
  config,
  entries,
  onEntryAdd,
  onConfigChange,
}: ToolWidgetProps) {
  const t = useTranslations("tools.meditationTimer");

  const cfg: MeditationTimerConfig = {
    lastLength:
      typeof config.lastLength === "number"
        ? config.lastLength
        : DEFAULT_MEDITATION_CONFIG.lastLength,
  };

  const [length, setLength] = useState<number>(cfg.lastLength);
  const [secondsLeft, setSecondsLeft] = useState<number>(cfg.lastLength * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [justCompleted, setJustCompleted] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalToday = sumTodayMinutes(entries);

  // Reset when length changes while idle
  useEffect(() => {
    if (!running) {
      setSecondsLeft(length * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  const handleComplete = useCallback(async () => {
    playBell();
    setRunning(false);
    setJustCompleted(true);
    try {
      await onEntryAdd({
        duration: length,
        completedAt: new Date().toISOString(),
      } satisfies MeditationTimerPayload);
    } catch {
      // swallow
    }
    try {
      await onConfigChange({ lastLength: length });
    } catch {
      // swallow
    }
    setTimeout(() => setJustCompleted(false), 4000);
  }, [length, onEntryAdd, onConfigChange]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setTimeout(() => {
            void handleComplete();
          }, 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, handleComplete]);

  const totalSeconds = length * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(length * 60);
    setJustCompleted(false);
  };

  const handlePreset = (mins: number) => {
    setRunning(false);
    setLength(mins);
    setSecondsLeft(mins * 60);
    setJustCompleted(false);
  };

  const handleStep = (delta: number) => {
    const next = Math.max(1, Math.min(60, length + delta));
    setRunning(false);
    setLength(next);
    setSecondsLeft(next * 60);
    setJustCompleted(false);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("title")}
          </span>
        </div>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
          ✨ {totalToday} {t("totalToday")}
        </span>
      </div>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 220 220" className="-rotate-90">
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-200 dark:text-zinc-800"
            />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="text-indigo-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatMMSS(secondsLeft)}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
              {length} min
            </span>
          </div>
        </div>

        {justCompleted && (
          <div
            className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
            role="status"
          >
            {t("completedMessage")}
          </div>
        )}

        <div className="flex w-full flex-col gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("presetLabel")}</span>
          <div className="flex flex-wrap justify-center gap-2">
            {PRESETS.map((m) => {
              const active = m === length;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => handlePreset(m)}
                  className={
                    "min-h-[48px] min-w-[64px] rounded-xl px-4 text-sm font-semibold transition active:scale-95 " +
                    (active
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800")
                  }
                >
                  {m} min
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t("customLabel")}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              disabled={length <= 1}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition active:scale-95 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="decrement"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="w-16 text-center text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {length}
            </span>
            <button
              type="button"
              onClick={() => handleStep(1)}
              disabled={length >= 60}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-700 transition active:scale-95 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="increment"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="flex h-16 min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 text-base font-semibold text-white shadow-sm transition active:scale-95 hover:bg-indigo-600"
          >
            {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {running ? t("pause") : t("start")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-300 bg-white text-zinc-700 transition active:scale-95 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label={t("reset")}
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
