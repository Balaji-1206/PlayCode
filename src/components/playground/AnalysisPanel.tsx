"use client";

import { Clock, Database } from "lucide-react";
import type { CodeAnalysis } from "@/lib/schemas/analysis";

interface AnalysisPanelProps {
  analysis: CodeAnalysis;
}

function normalizeBigO(str: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/\s+/g, "");
}

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const userTime = analysis.timeComplexity.average || analysis.timeComplexity.worst || "O(n)";
  const optimalTime = analysis.optimalComplexity || "O(n)";
  const userSpace = analysis.spaceComplexity.auxiliary || analysis.spaceComplexity.value || "O(1)";
  const optimalSpace = analysis.optimalSpaceComplexity || "O(1)";

  const isTimeOptimal = normalizeBigO(userTime) === normalizeBigO(optimalTime);
  const isSpaceOptimal = normalizeBigO(userSpace) === normalizeBigO(optimalSpace);

  return (
    <div className="flex h-full items-center justify-center bg-white dark:bg-[#111827] p-4 transition-colors">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ── Time Complexity (TC) ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Time Complexity (TC)
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                isTimeOptimal
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
              }`}
            >
              {isTimeOptimal ? "Optimal" : "Suboptimal"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Expected TC */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-emerald-950/20 p-4 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400/80">
                Expected TC
              </span>
              <div className="mt-1.5 font-mono text-3xl font-black text-emerald-600 dark:text-emerald-300">
                {optimalTime}
              </div>
            </div>

            {/* Code's TC */}
            <div
              className={`rounded-xl border p-4 text-center shadow-2xs ${
                isTimeOptimal
                  ? "border-blue-200 dark:border-blue-500/25 bg-white dark:bg-blue-950/20"
                  : "border-amber-200 dark:border-amber-500/25 bg-white dark:bg-amber-950/20"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isTimeOptimal ? "text-blue-700 dark:text-blue-400/80" : "text-amber-700 dark:text-amber-400/80"
                }`}
              >
                Code&apos;s TC
              </span>
              <div
                className={`mt-1.5 font-mono text-3xl font-black ${
                  isTimeOptimal ? "text-blue-600 dark:text-blue-300" : "text-amber-600 dark:text-amber-300"
                }`}
              >
                {userTime}
              </div>
            </div>
          </div>
        </div>

        {/* ── Space Complexity (SC) ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25">
                <Database className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Space Complexity (SC)
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                isSpaceOptimal
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
              }`}
            >
              {isSpaceOptimal ? "Optimal" : "Suboptimal"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Expected SC */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-emerald-950/20 p-4 text-center shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400/80">
                Expected SC
              </span>
              <div className="mt-1.5 font-mono text-3xl font-black text-emerald-600 dark:text-emerald-300">
                {optimalSpace}
              </div>
            </div>

            {/* Code's SC */}
            <div
              className={`rounded-xl border p-4 text-center shadow-2xs ${
                isSpaceOptimal
                  ? "border-indigo-200 dark:border-indigo-500/25 bg-white dark:bg-indigo-950/20"
                  : "border-amber-200 dark:border-amber-500/25 bg-white dark:bg-amber-950/20"
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isSpaceOptimal ? "text-indigo-700 dark:text-indigo-400/80" : "text-amber-700 dark:text-amber-400/80"
                }`}
              >
                Code&apos;s SC
              </span>
              <div
                className={`mt-1.5 font-mono text-3xl font-black ${
                  isSpaceOptimal ? "text-indigo-600 dark:text-indigo-300" : "text-amber-600 dark:text-amber-300"
                }`}
              >
                {userSpace}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

export function AnalysisLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-blue-500/20" />
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-300">
          Analyzing Complexity…
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluating Expected vs Code Time & Space Complexity
        </p>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

export function AnalysisError({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 p-2.5">
        <Database className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
        Analysis Unavailable
      </p>
      <p className="max-w-md text-[11px] text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}
