"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Timer, Play, Pause, RotateCcw, Settings } from "lucide-react";
import type { ToolWidgetProps, ToolEntry } from "../types";
import { DEFAULT_POMODORO_CONFIG, type PomodoroPayload, type PomodoroConfig } from "./index";

function playBeep(): void {
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
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
    setTimeout(() => ctx.close().catch(() => {}), 800);
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

function sumTodaySessions(entries: ToolEntry[]): { sessions: number; focus: number } {
  const today = todayIso();
  let sessions = 0;
  let focus = 0;
  for (const e of entries) {
    if (e.entry_date !== today) continue;
    const p = e.payload as Partial<PomodoroPayload>;
    sessions += p.sessions ?? 0;
    focus += p.focus ?? 0;
  }
  return { sessions, focus };
}

export function PomodoroWidget({ config, entries, onEntryAdd, onConfigChange }: ToolWidgetProps) {
  const t = useTranslations("tools.pomodoro");

  const cfg: PomodoroConfig = {
    sessionLength:
      typeof config.sessionLength === "number" ? config.sessionLength : DEFAULT_POMODORO_CONFIG.sessionLength,
    breakLength:
      typeof config.breakLength === "number" ? config.breakLength : DEFAULT_POMODORO_CONFIG.breakLength,
  };

  const [mode, setMode] = useState<"work" | "break">("work");
  const [secondsLeft, setSecondsLeft] = useState<number>(cfg.sessionLength * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todayCount = sumTodaySessions(entries).sessions;

  useEffect(() => {
    if (!running) {
      setSecondsLeft((mode === "work" ? cfg.sessionLength : cfg.breakLength) * 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.sessionLength, cfg.breakLength, mode]);

  const handleComplete = useCallback(async () => {
    playBeep();
    if (mode === "work") {
      try {
        await onEntryAdd({ sessions: 1, focus: cfg.sessionLength } satisfies PomodoroPayload);
      } catch {
        // swallow
      }
      setMode("break");
      setSecondsLeft(cfg.breakLength * 60);
      setRunning(true);
    } else {
      setMode("work");
      setSecondsLeft(cfg.sessionLength * 60);
      setRunning(false);
    }
  }, [mode, cfg.sessionLength, cfg.breakLength, onEntryAdd]);

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

  const totalSeconds = (mode === "work" ? cfg.sessionLength : cfg.breakLength) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const handleReset = () => {
    setRunning(false);
    setMode("work");
    setSecondsLeft(cfg.sessionLength * 60);
  };

  const handleConfigSave = async (sessionLength: number, breakLength: number) => {
    await onConfigChange({ sessionLength, breakLength });
    setShowSettings(false);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            🍅 {todayCount} {t("sessionsToday")}
          </span>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label={t("editLengths")}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
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
              className={
                mode === "work"
                  ? "text-amber-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
                  : "text-emerald-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatMMSS(secondsLeft)}
            </span>
            <span className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
              {mode === "work" ? t("workSession") : t("break")}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="flex h-16 min-w-[120px] items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 text-base font-semibold text-white shadow-sm transition active:scale-95 hover:bg-amber-600"
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

      {showSettings && (
        <SettingsSheet
          initial={cfg}
          onSave={handleConfigSave}
          onCancel={() => setShowSettings(false)}
          labels={{
            title: t("editLengths"),
            sessionLabel: t("sessionLengthLabel"),
            breakLabel: t("breakLengthLabel"),
          }}
        />
      )}
    </div>
  );
}

interface SettingsSheetProps {
  initial: PomodoroConfig;
  onSave: (sessionLength: number, breakLength: number) => Promise<void> | void;
  onCancel: () => void;
  labels: { title: string; sessionLabel: string; breakLabel: string };
}

function SettingsSheet({ initial, onSave, onCancel, labels }: SettingsSheetProps) {
  const [session, setSession] = useState<number>(initial.sessionLength);
  const [brk, setBrk] = useState<number>(initial.breakLength);
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{labels.title}</p>
      <label className="mb-2 block text-xs text-zinc-600 dark:text-zinc-400">
        {labels.sessionLabel}
        <input
          type="number"
          min={1}
          max={120}
          value={session}
          onChange={(e) => setSession(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <label className="mb-3 block text-xs text-zinc-600 dark:text-zinc-400">
        {labels.breakLabel}
        <input
          type="number"
          min={1}
          max={60}
          value={brk}
          onChange={(e) => setBrk(Math.max(1, Math.min(60, Number(e.target.value) || 1)))}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void onSave(session, brk)}
          className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
        >
          OK
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
