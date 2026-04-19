"use client";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { PiggyBank } from "lucide-react";
import type { ToolWidgetProps } from "../types";
import { savingsGoalSchema } from "./index";

export function SavingsGoalWidget({ config, onConfigChange }: ToolWidgetProps) {
  const t = useTranslations("tools.savingsGoal");
  const initial = useMemo(() => {
    const p = savingsGoalSchema.safeParse({
      targetAmount: (config as { targetAmount?: number }).targetAmount ?? 10000,
      currentAmount: (config as { currentAmount?: number }).currentAmount ?? 0,
      label: (config as { label?: string }).label ?? "",
    });
    return p.success ? p.data : { targetAmount: 10000, currentAmount: 0, label: "" };
  }, [config]);

  const [data, setData] = useState(initial);
  useEffect(() => setData(initial), [initial]);

  const persist = (next: typeof data) => {
    void onConfigChange({ ...config, ...next }).catch(() => {});
  };

  const update = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => {
    const next = { ...data, [key]: value };
    setData(next); persist(next);
  };

  const pct = data.targetAmount > 0 ? Math.round((data.currentAmount / data.targetAmount) * 100) : 0;

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <PiggyBank className="h-4 w-4 text-rose-500" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{t("title")}</span>
          <span className="text-xs text-zinc-500">{t("subtitle")}</span>
        </div>
      </div>
      <input type="text" value={data.label} onChange={(e) => update("label", e.target.value.slice(0, 80))}
        placeholder={t("labelPlaceholder")} maxLength={80}
        className="min-h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          {t("currentLabel")}
          <input type="number" min={0} value={data.currentAmount}
            onChange={(e) => update("currentAmount", Math.max(0, parseFloat(e.target.value) || 0))}
            className="min-h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          {t("targetLabel")}
          <input type="number" min={1} value={data.targetAmount}
            onChange={(e) => update("targetAmount", Math.max(1, parseFloat(e.target.value) || 1))}
            className="min-h-12 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
        </label>
      </div>
      <div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{pct}%</span>
          <span>{data.currentAmount.toFixed(0)} / {data.targetAmount.toFixed(0)}</span>
        </div>
        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all"
            style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      </div>
    </div>
  );
}
