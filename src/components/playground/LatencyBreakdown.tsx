"use client";

import { useMemo } from "react";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import {
  calculateLatencyStats,
  getExecutionSpeedTier,
} from "@/lib/diffUtils";
import type { TestResult } from "@/types";

interface LatencyBreakdownProps {
  results: TestResult[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  timeoutBudgetMs?: number;
  className?: string;
}

export default function LatencyBreakdown({
  results,
  selectedIndex,
  onSelectIndex,
  timeoutBudgetMs = 2000,
  className = "",
}: LatencyBreakdownProps) {
  const stats = useMemo(() => calculateLatencyStats(results), [results]);

  const maxSpeedTier = useMemo(
    () => getExecutionSpeedTier(stats.max, timeoutBudgetMs),
    [stats.max, timeoutBudgetMs]
  );

  // If there are no results or no execution times recorded, omit the breakdown
  if (results.length === 0 || stats.total === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-slate-200/90 dark:border-[#263244] bg-white/70 dark:bg-[#131c2e]/70 backdrop-blur-xs p-2.5 shadow-2xs space-y-2 ${className}`}
    >
      {/* ── Top Header Row: Title & Aggregate Stats ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Execution Telemetry
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${maxSpeedTier.badgeClass}`}
          >
            {maxSpeedTier.label}
          </span>
        </div>

        {/* Aggregate metrics pill */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
          <span>
            Avg: <strong className="text-slate-800 dark:text-slate-200">{stats.avg} ms</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            Max: <strong className="text-slate-800 dark:text-slate-200">{stats.max} ms</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            Budget:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {((stats.max / timeoutBudgetMs) * 100).toFixed(1)}%
            </strong>
          </span>
        </div>
      </div>

      {/* ── Interactive Test Latency Bars / Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 pt-1">
        {results.map((res, idx) => {
          const isSelected = idx === selectedIndex;
          const time = res.executionTime ?? 0;
          const tier = getExecutionSpeedTier(time, timeoutBudgetMs);
          const isPassed = res.status === "pass";

          // Calculate relative percentage against max time or budget for visual representation
          const maxTimeOrBudget = Math.max(stats.max, 50);
          const barPct = Math.min(100, Math.max(8, Math.round((time / maxTimeOrBudget) * 100)));

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={`group flex flex-col rounded-lg border p-1.5 text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40 ring-1 ring-blue-500/50"
                  : "border-slate-200/80 dark:border-slate-800 bg-[#F8FAFC]/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  {isPassed ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-2.5 w-2.5 text-rose-500" />
                  )}
                  Case {idx + 1}
                </span>
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {time} ms
                </span>
              </div>

              {/* Mini latency bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    tier.tier === "blazing"
                      ? "bg-emerald-500"
                      : tier.tier === "optimal"
                      ? "bg-blue-500"
                      : tier.tier === "moderate"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
