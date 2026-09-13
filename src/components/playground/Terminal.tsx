"use client";

import {
  Terminal as TerminalIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import type { TestResult } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TerminalProps {
  isSubmitMode?: boolean;
}

// ─── Individual test result row ───────────────────────────────────────────────

function TestResultRow({ result }: { result: TestResult }) {
  const isPassing = result.status === "pass";
  const isError = result.status === "error";

  const borderColor = isPassing
    ? "border-emerald-700/40 bg-emerald-900/20"
    : isError
    ? "border-amber-700/40 bg-amber-900/20"
    : "border-red-700/40 bg-red-900/20";

  const Icon = isPassing ? CheckCircle2 : isError ? AlertTriangle : XCircle;
  const iconColor = isPassing
    ? "text-emerald-400"
    : isError
    ? "text-amber-400"
    : "text-red-400";

  const labelColor = isPassing
    ? "text-emerald-300"
    : isError
    ? "text-amber-300"
    : "text-red-300";

  return (
    <div className={`rounded-lg border p-3 text-xs font-mono ${borderColor}`}>
      <div className="mb-1 flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
        <span className={labelColor}>
          {isPassing ? "✓" : "✗"} Test Case {result.caseIndex + 1}
        </span>
        {result.executionTime !== undefined && result.executionTime > 0 && (
          <span className="ml-auto flex items-center gap-1 text-slate-500">
            <Clock className="h-3 w-3" />
            {result.executionTime} ms
          </span>
        )}
      </div>

      {!isPassing && (
        <div className="mt-2 space-y-1 pl-6 text-slate-400">
          <div>
            <span className="text-slate-500">Input:&nbsp;</span>
            <span className="text-slate-300">{result.input}</span>
          </div>
          <div>
            <span className="text-slate-500">Expected:&nbsp;</span>
            <span className="text-emerald-300">{result.expected}</span>
          </div>
          <div>
            <span className="text-slate-500">Received:&nbsp;</span>
            <span className={isError ? "text-amber-300" : "text-red-300"}>
              {result.received || "(no output)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Hidden test summary ──────────────────────────────────────────────────────

function HiddenTestSummary({ total, passed }: { total: number; passed: number }) {
  const allPassed = passed === total;
  const percentage = Math.round((passed / total) * 100);

  return (
    <div
      className={`rounded-lg border p-4 ${
        allPassed
          ? "border-emerald-700/40 bg-emerald-900/20"
          : "border-red-700/40 bg-red-900/20"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Lock className={`h-4 w-4 ${allPassed ? "text-emerald-400" : "text-red-400"}`} />
        <span className={`text-sm font-semibold ${allPassed ? "text-emerald-300" : "text-red-300"}`}>
          Hidden Tests
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            allPassed ? "bg-emerald-500" : passed / total >= 0.7 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">
          {passed} / {total} passed
        </span>
        <span className={allPassed ? "text-emerald-400" : "text-slate-500"}>
          {percentage}%
        </span>
      </div>

      {!allPassed && (
        <p className="mt-2 text-xs text-slate-500 italic">
          Hidden test inputs and outputs are not revealed.
        </p>
      )}
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export default function Terminal({ isSubmitMode = false }: TerminalProps) {
  const { output, isRunning, isSubmitting } = usePlaygroundStore();
  const isBusy = isRunning || isSubmitting;
  const busyLabel = isSubmitting ? "Running all tests…" : "Executing your solution…";

  const passedCount = output?.testResults.filter((r) => r.status === "pass").length ?? 0;
  const totalPublic = output?.testResults.length ?? 0;

  return (
    <div className="flex h-full flex-col bg-slate-950 text-sm">
      {/* ── Header ── */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-2.5">
        <TerminalIcon className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {isSubmitMode && output?.hiddenSummary ? "Submission Result" : "Output"}
        </span>

        {output && (
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            {output.executionTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {output.executionTime} ms
              </span>
            )}
            {output.memoryUsage > 0 && (
              <span>{output.memoryUsage.toFixed(1)} MB</span>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Running */}
        {isBusy && (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span className="text-sm">{busyLabel}</span>
          </div>
        )}

        {/* Idle */}
        {!isBusy && !output && (
          <p className="italic text-slate-600">
            Click{" "}
            <span className="font-semibold text-emerald-500">Run</span> to test
            against public cases, or{" "}
            <span className="font-semibold text-violet-400">Submit</span> to
            grade against all hidden tests.
          </p>
        )}

        {/* Results */}
        {!isBusy && output && (
          <div className="space-y-3">
            {/* Compile / runtime error banner */}
            {output.stderr && (
              <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-3">
                <p className="mb-1 text-xs font-semibold text-red-400">
                  {output.status === "error" && output.testResults.length === 0
                    ? "Compilation Error"
                    : "Runtime Error / stderr"}
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-red-300">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* Public test results */}
            {output.testResults.length > 0 && (
              <div className="space-y-2">
                {output.testResults.map((result) => (
                  <TestResultRow key={result.caseIndex} result={result} />
                ))}
              </div>
            )}

            {/* Public test summary */}
            {totalPublic > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">
                  Public tests: {passedCount} / {totalPublic} passed
                </span>
              </div>
            )}

            {/* Hidden test summary (submit only) */}
            {output.hiddenSummary && (
              <HiddenTestSummary
                total={output.hiddenSummary.total}
                passed={output.hiddenSummary.passed}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
