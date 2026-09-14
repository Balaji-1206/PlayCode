"use client";

import {
  Clock,
  Database,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Cpu,
  ArrowRight,
} from "lucide-react";
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
  const score = analysis.qualityScore ?? 8;

  const scoreBadgeColor =
    score >= 9
      ? "bg-emerald-500 text-white shadow-emerald-500/30"
      : score >= 7
      ? "bg-blue-600 text-white shadow-blue-500/30"
      : score >= 4
      ? "bg-amber-500 text-white shadow-amber-500/30"
      : "bg-rose-500 text-white shadow-rose-500/30";

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-[#111827] p-5 text-slate-800 dark:text-slate-200 transition-colors text-xs">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* ── Top Hero Score & Overall Verdict ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4.5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-xl shadow-md ${scoreBadgeColor}`}
            >
              {score}
              <span className="text-[10px] font-normal opacity-80">/10</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Algorithmic Assessment
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    analysis.isOptimal
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/60"
                  }`}
                >
                  {analysis.isOptimal ? "Optimal Solution" : "Can Be Optimized"}
                </span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                {analysis.overallVerdict}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Score: {score >= 9 ? "Exceptional" : score >= 7 ? "Proficient" : "Needs Optimization"}</span>
            <span className="text-slate-400">Target: {optimalTime} · {optimalSpace}</span>
          </div>
        </div>

        {/* ── Approach Overview ── */}
        {analysis.approach && (
          <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-3.5">
            <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold mb-1">
              <Lightbulb className="h-4 w-4" />
              <span>Approach Recognized</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {analysis.approach}
            </p>
          </div>
        )}

        {/* ── Big-O Complexity Comparison Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time Complexity (TC) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Time Complexity
                </h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isTimeOptimal
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
                }`}
              >
                {isTimeOptimal ? "Optimal" : "Suboptimal"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-emerald-950/20 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400/80">
                  Target TC
                </span>
                <div className="mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-300">
                  {optimalTime}
                </div>
              </div>

              <div
                className={`rounded-xl border p-3 text-center ${
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
                  Your TC
                </span>
                <div
                  className={`mt-1 font-mono text-2xl font-black ${
                    isTimeOptimal ? "text-blue-600 dark:text-blue-300" : "text-amber-600 dark:text-amber-300"
                  }`}
                >
                  {userTime}
                </div>
              </div>
            </div>

            {analysis.timeComplexity.explanation && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysis.timeComplexity.explanation}
              </p>
            )}

            {analysis.timeComplexity.dominantOperations?.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400">Dominant Operations</span>
                {analysis.timeComplexity.dominantOperations.map((op, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                    <span className="text-blue-500">›</span>
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Space Complexity (SC) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4.5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/25">
                  <Database className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Auxiliary Space
                </h3>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isSpaceOptimal
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300"
                }`}
              >
                {isSpaceOptimal ? "Optimal" : "Suboptimal"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-white dark:bg-emerald-950/20 p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400/80">
                  Target SC
                </span>
                <div className="mt-1 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-300">
                  {optimalSpace}
                </div>
              </div>

              <div
                className={`rounded-xl border p-3 text-center ${
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
                  Your SC
                </span>
                <div
                  className={`mt-1 font-mono text-2xl font-black ${
                    isSpaceOptimal ? "text-indigo-600 dark:text-indigo-300" : "text-amber-600 dark:text-amber-300"
                  }`}
                >
                  {userSpace}
                </div>
              </div>
            </div>

            {analysis.spaceComplexity.explanation && (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysis.spaceComplexity.explanation}
              </p>
            )}

            {analysis.spaceComplexity.allocatedStructures?.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-200/80 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400">Allocated Memory</span>
                {analysis.spaceComplexity.allocatedStructures.map((struct, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                    <span className="text-indigo-500">›</span>
                    <span>{struct}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Strengths & Bottlenecks ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/15 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Strengths</span>
            </div>
            {analysis.strengths && analysis.strengths.length > 0 ? (
              <ul className="space-y-1.5">
                {analysis.strengths.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic text-[11px]">No specific strengths recorded.</p>
            )}
          </div>

          {/* Bottlenecks */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/15 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <AlertTriangle className="h-4 w-4" />
              <span>Bottlenecks & Correctness Risks</span>
            </div>
            {analysis.bottlenecks && analysis.bottlenecks.length > 0 ? (
              <ul className="space-y-1.5">
                {analysis.bottlenecks.map((bot, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>{bot}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs py-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero major performance bottlenecks detected!</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Optimization Suggestions ── */}
        {analysis.optimizationSuggestions && analysis.optimizationSuggestions.length > 0 && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#172033] p-4.5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span>Actionable Optimization Opportunities</span>
              </div>
              <span className="text-[10px] text-slate-400">Ordered by impact</span>
            </div>

            <div className="space-y-2.5">
              {analysis.optimizationSuggestions.map((opt, i) => {
                const impactColors = {
                  high: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400",
                  medium: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-400",
                  low: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-400",
                };

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {opt.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {opt.resultingComplexity && (
                          <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <ArrowRight className="h-2.5 w-2.5" />
                            {opt.resultingComplexity}
                          </span>
                        )}
                        <span
                          className={`rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            impactColors[opt.impact] ?? impactColors.medium
                          }`}
                        >
                          {opt.impact} impact
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Language Specific Idiomatic Feedback ── */}
        {analysis.languageSpecificFeedback && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F1F6FA] dark:bg-slate-800/40 p-3.5 flex items-start gap-2.5">
            <Cpu className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="block font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                Language Idioms & Best Practices
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {analysis.languageSpecificFeedback}
              </p>
            </div>
          </div>
        )}
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
          Analyzing Algorithmic Efficiency…
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Evaluating Big-O time and space complexity against theoretical bounds
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
