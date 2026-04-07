/**
 * ToolWidgetWrapper
 *
 * Wraps any ToolDefinition.Widget with a consistent dashboard chrome:
 *  - Header (icon + name + chevron + kebab menu)
 *  - Collapsible body
 *  - Loading state while entries are fetched
 *  - Error boundary so one broken tool doesn't crash the dashboard
 *
 * Mobile-first: header is full-width with a 48px tap target for collapse.
 */

"use client";

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  EyeOff,
  Loader2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import type {
  Locale,
  ToolDefinition,
  ToolEntry,
  UserTool,
} from "@/lib/tools/types";
import { useToolEntries } from "@/lib/hooks/use-tool-entries";
import { useToolConfig } from "@/lib/hooks/use-tool-config";

interface ToolWidgetWrapperProps {
  tool: ToolDefinition;
  userTool: UserTool;
  userId: string;
  locale: Locale;
  defaultExpanded: boolean;
  onDisable: (toolId: string) => Promise<void> | void;
  onMoveUp?: (toolId: string) => Promise<void> | void;
  onMoveDown?: (toolId: string) => Promise<void> | void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

class WidgetErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: true } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("[ToolWidget] crash:", error, info);
  }
  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function ToolWidgetWrapper({
  tool,
  userTool,
  userId,
  locale,
  defaultExpanded,
  onDisable,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ToolWidgetWrapperProps) {
  const t = useTranslations("tools");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { from, to } = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return { from: start, to: today };
  }, []);

  const { entries, loading, error, addEntry } = useToolEntries(
    tool.id,
    from,
    to
  );
  const { config, setConfig } = useToolConfig(tool.id, userTool.config ?? {});

  const Icon = tool.icon;
  const name = tool.name[locale] ?? tool.name.en;

  const handleEntryAdd = useCallback(
    async (payload: unknown) => {
      await addEntry(payload as Record<string, unknown>);
    },
    [addEntry]
  );

  const handleConfigChange = useCallback(
    async (next: Record<string, unknown>) => {
      await setConfig(next);
    },
    [setConfig]
  );

  const handleDisableClick = () => {
    setMenuOpen(false);
    setConfirming(true);
  };

  const confirmDisable = async () => {
    setConfirming(false);
    await onDisable(tool.id);
  };

  const Widget = tool.Widget;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-zen-border bg-zen-surface shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      aria-labelledby={`tool-${tool.id}-title`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-zen-border/60 px-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-h-[48px] flex-1 items-center gap-3 py-2 text-left"
          aria-expanded={expanded}
          aria-controls={`tool-${tool.id}-body`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zen-sage/10 text-zen-sage">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span
            id={`tool-${tool.id}-title`}
            className="flex-1 truncate text-sm font-semibold text-zen-text dark:text-zinc-100"
          >
            {name}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-zen-text-muted" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zen-text-muted" aria-hidden="true" />
          )}
        </button>

        {/* Kebab menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-lg text-zen-text-muted hover:bg-zen-surface-alt"
            aria-label="Tool actions"
          >
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-zen-border bg-zen-surface shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              {onMoveUp && (
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={async () => {
                    setMenuOpen(false);
                    if (canMoveUp) await onMoveUp(tool.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zen-text hover:bg-zen-surface-alt disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" /> Move up
                </button>
              )}
              {onMoveDown && (
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={async () => {
                    setMenuOpen(false);
                    if (canMoveDown) await onMoveDown(tool.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zen-text hover:bg-zen-surface-alt disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" /> Move down
                </button>
              )}
              <button
                type="button"
                onClick={handleDisableClick}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <EyeOff className="h-4 w-4" /> {t("widget.delete")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        id={`tool-${tool.id}-body`}
        className={`transition-all duration-300 ${
          expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!expanded}
      >
        {expanded && (
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-zen-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            ) : (
              <WidgetErrorBoundary
                fallback={
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>This widget failed to render. Other tools are unaffected.</span>
                  </div>
                }
              >
                <Widget
                  userId={userId}
                  toolId={tool.id}
                  config={config}
                  entries={entries as ToolEntry[]}
                  onEntryAdd={handleEntryAdd}
                  onConfigChange={handleConfigChange}
                  locale={locale}
                />
              </WidgetErrorBoundary>
            )}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-zen-surface p-4 shadow-xl dark:bg-zinc-900">
            <p className="mb-4 text-sm text-zen-text dark:text-zinc-100">
              {t("widget.confirmDisable")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="flex-1 rounded-xl border border-zen-border px-4 py-2 text-sm font-medium text-zen-text dark:border-zinc-700 dark:text-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDisable}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                {t("widget.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
