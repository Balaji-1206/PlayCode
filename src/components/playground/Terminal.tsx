"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import TestCaseTabs from "@/components/playground/TestCaseTabs";
import VerdictBanner from "@/components/playground/VerdictBanner";
import type { TestResult } from "@/types";

// ─── Single test case detail view ─────────────────────────────────────────────

function TestCaseDetail({ result }: { result: TestResult }) {
  const isPassing = result.status === "pass";
  const isError = result.status === "error";

  return (
    <div className="space-y-3 text-xs font-mono">
      {/* Status line */}
      <div className="flex items-center gap-2">
        {isPassing ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : isError ? (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
        <span
          className={
            isPassing
              ? "text-emerald-300"
              : isError
              ? "text-amber-300"
              : "text-red-300"
          }
        >
          {isPassing ? "Passed" : isError ? "Error" : "Failed"}
        </span>
        {result.executionTime !== undefined && result.executionTime > 0 && (
          <span className="ml-auto flex items-center gap-1 text-slate-500">
            <Clock className="h-3 w-3" />
            {result.executionTime} ms
          </span>
        )}
      </div>

      {/* Input */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Input
        </p>
        <pre className="whitespace-pre-wrap text-slate-200">{result.input}</pre>
      </div>

      {!isPassing && (
        <>
          {/* Expected */}
          <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/10 p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
              Expected Output
            </p>
            <pre className="whitespace-pre-wrap text-emerald-300">{result.expected}</pre>
          </div>

          {/* Received */}
          <div className="rounded-lg border border-red-700/30 bg-red-900/10 p-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-red-600">
              Your Output
            </p>
            <pre className="whitespace-pre-wrap text-red-300">
              {result.received || "(no output)"}
            </pre>
          </div>
        </>
      )}

      {isPassing && (
        <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/10 p-3">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-600">
            Output
          </p>
          <pre className="whitespace-pre-wrap text-emerald-300">{result.received || result.expected}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Hidden test summary ──────────────────────────────────────────────────────

function HiddenTestSummary({ total, passed }: { total: number; passed: number }) {
  const allPassed = passed === total;
  const pct = Math.round((passed / total) * 100);

  return (
    <div
      className={`rounded-lg border p-4 ${
        allPassed
          ? "border-emerald-700/40 bg-emerald-900/20"
          : "border-slate-700/50 bg-slate-900/40"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <Lock className={`h-4 w-4 ${allPassed ? "text-emerald-400" : "text-slate-500"}`} />
        <span className={`text-sm font-semibold ${allPassed ? "text-emerald-300" : "text-slate-300"}`}>
          Hidden Test Cases
        </span>
        <span className="ml-auto text-xs text-slate-500">
          {passed} / {total} passed
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            allPassed
              ? "bg-emerald-500"
              : pct >= 70
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {!allPassed && (
        <p className="mt-2 text-xs italic text-slate-600">
          Hidden test inputs and expected outputs are not revealed.
        </p>
      )}
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export default function Terminal() {
  const { output, isRunning, isSubmitting } = usePlaygroundStore();
  const [selectedCase, setSelectedCase] = useState(0);

  const isBusy = isRunning || isSubmitting;

  // Reset to first test case whenever new results arrive
  useEffect(() => {
    if (output?.testResults.length) {
      setSelectedCase(0);
    }
  }, [output]);

  const hasResults = !!output?.testResults.length;
  const activeResult = output?.testResults[selectedCase];

  return (
    <div className="flex h-full flex-col bg-slate-950 text-sm">
      {/* ── Header: test case tabs or idle label ── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-700/60 bg-slate-900/50 px-3 py-1.5">
        {hasResults ? (
          <TestCaseTabs
            results={output!.testResults}
            selectedIndex={selectedCase}
            onSelect={setSelectedCase}
          />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Output
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Running spinner */}
        {isBusy && (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span className="text-sm">
              {isSubmitting ? "Running all tests…" : "Executing your solution…"}
            </span>
          </div>
        )}

        {/* Idle hint */}
        {!isBusy && !output && (
          <p className="italic text-slate-600">
            Press{" "}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
              Ctrl+Enter
            </kbd>{" "}
            to run, or{" "}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
              Ctrl+Shift+Enter
            </kbd>{" "}
            to submit.
          </p>
        )}

        {/* Results */}
        {!isBusy && output && (
          <div className="space-y-3">
            {/* Verdict banner (submit only) */}
            {output.hiddenSummary && (
              <VerdictBanner result={output} />
            )}

            {/* Compile error */}
            {output.stderr && output.testResults.length === 0 && (
              <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-3">
                <p className="mb-1 text-xs font-semibold text-red-400">Compilation Error</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-red-300">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* Selected test case detail */}
            {activeResult && <TestCaseDetail result={activeResult} />}

            {/* Runtime stderr (if any, for the selected case) */}
            {activeResult && output.stderr && output.testResults.length > 0 && (
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-3">
                <p className="mb-1 text-xs font-semibold text-slate-500">stderr</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-400">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* Hidden test summary */}
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
