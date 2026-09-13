"use client";

import { useState } from "react";
import {
  Clock,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Info,
} from "lucide-react";
import type { CodeAnalysis, OptimizationSuggestion } from "@/lib/schemas/analysis";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnalysisPanelProps {
  analysis: CodeAnalysis;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function qualityColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 5) return "text-amber-400";
  return "text-rose-400";
}

function qualityLabel(score: number): string {
  if (score === 10) return "Optimal & Clean";
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good Solution";
  if (score >= 4) return "Can Be Improved";
  return "Suboptimal";
}

function qualityRingColor(score: number): string {
  if (score >= 8) return "#10b981"; // emerald-500
  if (score >= 5) return "#f59e0b"; // amber-500
  return "#f43f5e"; // rose-500
}

function impactBadge(impact: OptimizationSuggestion["impact"]) {
  const styles = {
    high: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[impact]}`}
    >
      {impact} impact
    </span>
  );
}

// ─── Big-O Spectrum Scale ─────────────────────────────────────────────────────

const BIG_O_SPECTRUM = [
  { label: "O(1)", name: "Constant", color: "emerald" },
  { label: "O(log n)", name: "Logarithmic", color: "emerald" },
  { label: "O(n)", name: "Linear", color: "sky" },
  { label: "O(n log n)", name: "Linearithmic", color: "indigo" },
  { label: "O(n²)", name: "Quadratic", color: "amber" },
  { label: "O(2ⁿ)", name: "Exponential", color: "rose" },
];

function getBigOIndex(str: string): number {
  const normalized = str.toLowerCase().replace(/\s+/g, "");
  if (normalized.includes("1")) return 0;
  if (normalized.includes("logn") && !normalized.includes("nlogn")) return 1;
  if (normalized.includes("nlogn")) return 3;
  if (normalized.includes("n2") || normalized.includes("n²") || normalized.includes("n^2")) return 4;
  if (normalized.includes("2^n") || normalized.includes("2ⁿ") || normalized.includes("n!")) return 5;
  if (normalized.includes("n")) return 2;
  return 2;
}

// ─── Quality score ring ───────────────────────────────────────────────────────

function QualityRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="-rotate-90" width="80" height="80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={qualityRingColor(score)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute text-center">
          <div className={`text-xl font-bold ${qualityColor(score)}`}>{score}</div>
          <div className="text-[9px] text-slate-500">/10</div>
        </div>
      </div>
      <span className={`text-[11px] font-semibold ${qualityColor(score)}`}>
        {qualityLabel(score)}
      </span>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const [selectedCase, setSelectedCase] = useState<"best" | "average" | "worst">("average");

  const userTimeIndex = getBigOIndex(analysis.timeComplexity.average);
  const optimalTimeIndex = getBigOIndex(analysis.optimalComplexity);

  const dominantOps = analysis.timeComplexity.dominantOperations ?? [];
  const allocatedStructures = analysis.spaceComplexity.allocatedStructures ?? [];
  const auxSpace = analysis.spaceComplexity.auxiliary || analysis.spaceComplexity.value;
  const optimalSpace = analysis.optimalSpaceComplexity || "O(1)";

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-950 p-4 text-sm text-slate-200">
      {/* ── Header: Verdict & Overall Quality ── */}
      <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {analysis.isOptimal ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 shadow-xs shadow-emerald-500/10">
                <Zap className="h-3.5 w-3.5" />
                Optimal Complexity
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
                <TrendingUp className="h-3.5 w-3.5" />
                Target is {analysis.optimalComplexity}
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              Theoretical Big-O Evaluation
            </span>
          </div>

          <p className="text-xs leading-relaxed text-slate-300 font-medium">
            {analysis.overallVerdict}
          </p>

          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Approach: </span>
            {analysis.approach}
          </p>
        </div>

        <div className="shrink-0">
          <QualityRing score={analysis.qualityScore} />
        </div>
      </div>

      {/* ── Visual Big-O Complexity Spectrum ── */}
      <section className="mb-4 rounded-xl border border-slate-800/90 bg-slate-900/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            Big-O Complexity Scale
          </h2>
          <span className="text-[11px] text-slate-500">
            Optimal: <span className="font-mono text-emerald-400 font-semibold">{analysis.optimalComplexity}</span>
          </span>
        </div>

        {/* The horizontal spectrum bar */}
        <div className="relative mb-2 grid grid-cols-6 gap-1.5 rounded-xl bg-slate-950/80 p-2 border border-slate-800">
          {BIG_O_SPECTRUM.map((item, idx) => {
            const isUser = idx === userTimeIndex;
            const isOptimal = idx === optimalTimeIndex;

            return (
              <div
                key={item.label}
                className={`relative flex flex-col items-center justify-center rounded-lg py-2 px-1 text-center transition-all ${
                  isUser
                    ? "bg-indigo-500/20 border border-indigo-400/50 shadow-md shadow-indigo-500/10"
                    : isOptimal
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : "bg-slate-900/40 border border-transparent"
                }`}
              >
                {isUser && (
                  <span className="absolute -top-2.5 rounded-full bg-indigo-500 px-1.5 py-0.2 text-[8px] font-bold text-white uppercase tracking-wider shadow-xs">
                    Your Code
                  </span>
                )}
                <span
                  className={`font-mono text-xs font-bold ${
                    isUser
                      ? "text-indigo-300"
                      : isOptimal
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
                <span className="mt-0.5 text-[9px] text-slate-500 hidden sm:block">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Side-by-Side Target Comparison ── */}
      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Time Comparison */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              Time Complexity (Average)
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                analysis.isOptimal
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {analysis.isOptimal ? "Optimal" : "Suboptimal"}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-xl font-bold text-sky-300">
              {analysis.timeComplexity.average}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowRight className="h-3 w-3" />
              <span>Target: </span>
              <span className="font-mono font-semibold text-emerald-400">
                {analysis.optimalComplexity}
              </span>
            </div>
          </div>
        </div>

        {/* Space Comparison */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <Database className="h-3.5 w-3.5 text-violet-400" />
              Auxiliary Space (Memory)
            </span>
            <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-300 tracking-wide">
              Auxiliary
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-mono text-xl font-bold text-violet-300">
              {auxSpace}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <ArrowRight className="h-3 w-3" />
              <span>Target: </span>
              <span className="font-mono font-semibold text-emerald-400">
                {optimalSpace}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Time Complexity Breakdown: Best / Average / Worst ── */}
      <section className="mb-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            Time Complexity Breakdown
          </h2>
          <div className="flex gap-1 rounded-lg bg-slate-950 p-1 border border-slate-800">
            {(["best", "average", "worst"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCase(c)}
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                  selectedCase === c
                    ? "bg-sky-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Complexity Cards */}
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div
            onClick={() => setSelectedCase("best")}
            className={`cursor-pointer rounded-lg border p-2.5 text-center transition-all ${
              selectedCase === "best"
                ? "border-sky-500/60 bg-sky-500/10 shadow-xs"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Best Case</span>
            <div className="font-mono text-base font-bold text-sky-300 mt-0.5">
              {analysis.timeComplexity.best}
            </div>
          </div>

          <div
            onClick={() => setSelectedCase("average")}
            className={`cursor-pointer rounded-lg border p-2.5 text-center transition-all ${
              selectedCase === "average"
                ? "border-sky-500/60 bg-sky-500/10 shadow-xs"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Average Case</span>
            <div className="font-mono text-base font-bold text-sky-300 mt-0.5">
              {analysis.timeComplexity.average}
            </div>
          </div>

          <div
            onClick={() => setSelectedCase("worst")}
            className={`cursor-pointer rounded-lg border p-2.5 text-center transition-all ${
              selectedCase === "worst"
                ? "border-sky-500/60 bg-sky-500/10 shadow-xs"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Worst Case</span>
            <div className="font-mono text-base font-bold text-sky-300 mt-0.5">
              {analysis.timeComplexity.worst}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs leading-relaxed text-slate-300 mb-3">
          {analysis.timeComplexity.explanation}
        </p>

        {/* Dominant Operations if available */}
        {dominantOps.length > 0 && (
          <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800/80">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Dominant Operations Driving Complexity
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {dominantOps.map((op, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span className="font-mono text-[11px]">{op}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── Space Complexity Breakdown: Auxiliary vs Input ── */}
      <section className="mb-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Database className="h-3.5 w-3.5 text-violet-400" />
            Space Complexity Analysis
          </h2>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
            Auxiliary: {auxSpace}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-300 mb-3">
          {analysis.spaceComplexity.explanation}
        </p>

        {/* Allocated data structures */}
        {allocatedStructures.length > 0 && (
          <div className="rounded-lg bg-slate-950/80 p-3 border border-slate-800/80">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Allocated Data Structures
            </h4>
            <ul className="space-y-1 text-xs text-slate-300">
              {allocatedStructures.map((struct, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="font-mono text-[11px]">{struct}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── Strengths ── */}
      {analysis.strengths.length > 0 && (
        <section className="mb-4 rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Solution Strengths
          </h2>
          <ul className="space-y-1.5">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Bottlenecks & Optimization Suggestions ── */}
      {analysis.optimizationSuggestions.length > 0 && (
        <section className="mb-4 space-y-2.5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            Optimization Roadmap
          </h2>
          {analysis.optimizationSuggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">{s.title}</span>
                {impactBadge(s.impact)}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{s.description}</p>
              {s.resultingComplexity && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
                  <span>→ Resulting complexity:</span>
                  <span>{s.resultingComplexity}</span>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Language Specific Feedback ── */}
      {analysis.languageSpecificFeedback && (
        <section className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-3.5 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Language Style: </span>
          {analysis.languageSpecificFeedback}
        </section>
      )}
    </div>
  );
}

// ─── Loading State ────────────────────────────────────────────────────────────

export function AnalysisLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-indigo-500/20" />
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-300">
          Analyzing Algorithmic Complexity…
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Evaluating Time Complexity (Big-O), Space Complexity, and optimization bottlenecks
        </p>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

export function AnalysisError({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <div className="rounded-full bg-rose-500/10 p-2.5 text-rose-400">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold text-rose-300">
        Analysis Unavailable
      </p>
      <p className="max-w-md text-[11px] text-slate-400">
        {message}
      </p>
    </div>
  );
}

