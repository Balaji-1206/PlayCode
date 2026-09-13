"use client";

import {
  Clock,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Zap,
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
  return "text-red-400";
}

function qualityLabel(score: number): string {
  if (score === 10) return "Perfect";
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Good";
  if (score >= 4) return "Fair";
  return "Needs Work";
}

function qualityRingColor(score: number): string {
  if (score >= 8) return "#10b981"; // emerald-500
  if (score >= 5) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}

function impactBadge(impact: OptimizationSuggestion["impact"]) {
  const styles = {
    high: "bg-red-500/10 text-red-400 border-red-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${styles[impact]}`}
    >
      {impact} impact
    </span>
  );
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
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
          />
          {/* Progress circle */}
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
      <span className={`text-xs font-semibold ${qualityColor(score)}`}>
        {qualityLabel(score)}
      </span>
    </div>
  );
}

// ─── Complexity badge ─────────────────────────────────────────────────────────

function ComplexityBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/60 px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-lg font-bold text-violet-300">{value}</span>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-950 p-4 text-sm">
      {/* ── Header row: optimal badge + quality ring ── */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Optimal badge */}
          <div className="flex items-center gap-2">
            {analysis.isOptimal ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Zap className="h-3 w-3" />
                Optimal Solution
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                <TrendingUp className="h-3 w-3" />
                Can be improved · optimal is {analysis.optimalComplexity}
              </span>
            )}
          </div>

          {/* Verdict */}
          <p className="text-xs leading-relaxed text-slate-400">
            {analysis.overallVerdict}
          </p>

          {/* Approach */}
          <p className="text-xs text-slate-500">
            <span className="font-medium text-slate-400">Approach: </span>
            {analysis.approach}
          </p>
        </div>

        {/* Quality ring */}
        <div className="ml-4 shrink-0">
          <QualityRing score={analysis.qualityScore} />
        </div>
      </div>

      {/* ── Complexity section ── */}
      <section className="mb-4 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          Time Complexity
        </h2>

        <div className="mb-3 grid grid-cols-3 gap-2">
          <ComplexityBadge value={analysis.timeComplexity.best} label="Best" />
          <ComplexityBadge value={analysis.timeComplexity.average} label="Average" />
          <ComplexityBadge value={analysis.timeComplexity.worst} label="Worst" />
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          {analysis.timeComplexity.explanation}
        </p>
      </section>

      <section className="mb-4 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          <Database className="h-3.5 w-3.5" />
          Space Complexity
        </h2>

        <div className="mb-3 flex items-center gap-3">
          <span className="font-mono text-lg font-bold text-violet-300">
            {analysis.spaceComplexity.value}
          </span>
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            {analysis.spaceComplexity.isAuxiliary ? "Auxiliary" : "Including input"}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          {analysis.spaceComplexity.explanation}
        </p>
      </section>

      {/* ── Strengths ── */}
      {analysis.strengths.length > 0 && (
        <section className="mb-4 rounded-lg border border-emerald-700/30 bg-emerald-900/10 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Strengths
          </h2>
          <ul className="space-y-1.5">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Bottlenecks ── */}
      {analysis.bottlenecks.length > 0 && (
        <section className="mb-4 rounded-lg border border-amber-700/30 bg-amber-900/10 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            Bottlenecks
          </h2>
          <ul className="space-y-1.5">
            {analysis.bottlenecks.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Optimization suggestions ── */}
      {analysis.optimizationSuggestions.length > 0 && (
        <section className="mb-4 space-y-2">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <Lightbulb className="h-3.5 w-3.5 text-violet-400" />
            Optimization Suggestions
          </h2>
          {analysis.optimizationSuggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3"
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-white">{s.title}</span>
                {impactBadge(s.impact)}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{s.description}</p>
              {s.resultingComplexity && (
                <p className="mt-1.5 text-xs text-violet-400">
                  → Resulting complexity: {s.resultingComplexity}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* ── Language-specific feedback ── */}
      {analysis.languageSpecificFeedback && (
        <section className="mb-4 rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
            <p className="text-xs leading-relaxed text-slate-400">
              <span className="font-medium text-slate-300">Tip: </span>
              {analysis.languageSpecificFeedback}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

export function AnalysisLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-slate-950 p-4">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        <Sparkles className="h-6 w-6 text-violet-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-300">Analyzing your solution…</p>
        <p className="mt-1 text-xs text-slate-500">
          AI is computing complexity and code quality
        </p>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

export function AnalysisError({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center bg-slate-950 p-4">
      <div className="flex items-start gap-3 rounded-lg border border-red-700/40 bg-red-900/20 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
        <div>
          <p className="text-sm font-semibold text-red-300">Analysis failed</p>
          <p className="mt-1 text-xs text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  );
}
