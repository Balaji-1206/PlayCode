"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import TestCaseTabs from "@/components/playground/TestCaseTabs";
import VerdictBanner from "@/components/playground/VerdictBanner";
import type { TestResult, FailedHiddenCase } from "@/types";

// ─── Single test case detail view ─────────────────────────────────────────────

function TestCaseDetail({ result }: { result: TestResult }) {
  const isPassing = result.status === "pass";
  const isError = result.status === "error";

  return (
    <div className="space-y-3 text-xs font-mono">
      {/* Status line */}
      <div className="flex items-center gap-2">
        {isPassing ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : isError ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span
          className={
            isPassing
              ? "font-semibold text-emerald-600 dark:text-emerald-400"
              : isError
              ? "font-semibold text-amber-600 dark:text-amber-400"
              : "font-semibold text-red-600 dark:text-red-400"
          }
        >
          {isPassing ? "Passed" : isError ? "Error" : "Failed"}
        </span>
        {result.executionTime !== undefined && result.executionTime > 0 && (
          <span className="ml-auto flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Clock className="h-3 w-3" />
            {result.executionTime} ms
          </span>
        )}
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F1F6FA] dark:bg-[#111827] p-3 shadow-2xs">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Input
        </p>
        <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{result.input}</pre>
      </div>

      {!isPassing && (
        <>
          {/* Expected */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 shadow-2xs">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Expected Output
            </p>
            <pre className="whitespace-pre-wrap text-emerald-700 dark:text-emerald-300 font-semibold">{result.expected}</pre>
          </div>

          {/* Received */}
          <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-3 shadow-2xs">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Your Output
            </p>
            <pre className="whitespace-pre-wrap text-red-700 dark:text-red-300 font-semibold">
              {result.received || "(no output)"}
            </pre>
          </div>
        </>
      )}

      {isPassing && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 shadow-2xs">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Output
          </p>
          <pre className="whitespace-pre-wrap text-emerald-700 dark:text-emerald-300 font-semibold">{result.received || result.expected}</pre>
        </div>
      )}
    </div>
  );
}

// ─── Hidden test summary ──────────────────────────────────────────────────────

function HiddenTestSummary({
  total,
  passed,
  failedCase,
}: {
  total: number;
  passed: number;
  failedCase?: FailedHiddenCase | null;
}) {
  const [showHiddenCase, setShowHiddenCase] = useState(false);
  const allPassed = passed === total;
  const pct = Math.round((passed / total) * 100);

  return (
    <div
      className={`rounded-xl border p-4 shadow-2xs transition-all ${
        allPassed
          ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20"
          : "border-slate-200 bg-[#F8FAFC] dark:border-slate-800 dark:bg-[#172033]"
      }`}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <Lock className={`h-4 w-4 ${allPassed ? "text-emerald-500" : "text-slate-400"}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${allPassed ? "text-emerald-700 dark:text-emerald-300" : "text-slate-700 dark:text-slate-300"}`}>
          Hidden Test Cases
        </span>
        <span className="ml-auto text-xs font-mono text-slate-500">
          {passed} / {total} passed
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
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
        <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
          {failedCase ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>
                    Failed on Hidden Test #{failedCase.caseIndex}
                    {failedCase.description ? ` · ${failedCase.description}` : ""}
                  </span>
                </div>

                <button
                  type="button"
                  id="view-hidden-test-case-btn"
                  onClick={() => setShowHiddenCase(!showHiddenCase)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs transition-all hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-800 active:scale-98 cursor-pointer"
                >
                  {showHiddenCase ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-rose-500" />
                      <span>Hide Hidden Test Case</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5 text-rose-500" />
                      <span>View 1 Hidden Test Case</span>
                    </>
                  )}
                </button>
              </div>

              {showHiddenCase && (
                <div className="rounded-xl border border-rose-200/90 dark:border-rose-900/60 bg-white dark:bg-[#0B1120] p-3.5 space-y-3 shadow-xs animate-slide-down">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-rose-500" />
                      Hidden Test Case #{failedCase.caseIndex}
                    </span>
                    <span className="rounded-full bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/40 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-400">
                      Failed Case Revealed
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Input
                    </span>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                      {failedCase.input}
                    </pre>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
                        Your Output
                      </span>
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-2.5 font-mono text-xs text-rose-700 dark:text-rose-300 font-semibold">
                        {failedCase.received || "(no output)"}
                      </pre>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        Expected Output
                      </span>
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 font-mono text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                        {failedCase.expected}
                      </pre>
                    </div>
                  </div>

                  {failedCase.stderr && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                        stderr / Error Details
                      </span>
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 p-2.5 font-mono text-xs text-amber-700 dark:text-amber-300">
                        {failedCase.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs italic text-slate-500">
              Hidden test inputs and expected outputs are not revealed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export default function Terminal() {
  const { output, isRunning, isSubmitting } = usePlaygroundStore();
  const [selectedCase, setSelectedCase] = useState(0);

  const isBusy = isRunning || isSubmitting;

  useEffect(() => {
    if (output?.testResults.length) {
      setSelectedCase(0);
    }
  }, [output]);

  const hasResults = !!output?.testResults.length;
  const activeResult = output?.testResults[selectedCase];

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 transition-colors text-sm">
      {/* ── Header: test case tabs or idle label ── */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#172033] px-3 py-1.5">
        {hasResults ? (
          <TestCaseTabs
            results={output!.testResults}
            selectedIndex={selectedCase}
            onSelect={setSelectedCase}
          />
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Output
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Running spinner */}
        {isBusy && (
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400 py-4">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <span className="text-xs font-medium">
              {isSubmitting ? "Running full test suite against hidden tests…" : "Executing your solution…"}
            </span>
          </div>
        )}

        {/* Idle hint */}
        {!isBusy && !output && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 text-slate-400 dark:text-slate-500">
            <p className="text-xs">
              Run your solution to see output and test case evaluation here.
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Press{" "}
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Ctrl+Enter
              </kbd>{" "}
              to run, or{" "}
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Ctrl+Shift+Enter
              </kbd>{" "}
              to submit.
            </p>
          </div>
        )}

        {/* Results */}
        {!isBusy && output && (
          <div className="space-y-3">
            {output.hiddenSummary && (
              <VerdictBanner result={output} />
            )}

            {output.stderr && output.testResults.length === 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 p-3.5">
                <p className="mb-1 text-xs font-bold text-red-600 dark:text-red-400">Compilation Error</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-red-700 dark:text-red-300">
                  {output.stderr}
                </pre>
              </div>
            )}

            {activeResult && <TestCaseDetail result={activeResult} />}

            {activeResult && output.stderr && output.testResults.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-[#F1F6FA] dark:border-slate-800 dark:bg-slate-900/50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">stderr</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-600 dark:text-slate-400">
                  {output.stderr}
                </pre>
              </div>
            )}

            {output.hiddenSummary && (
              <HiddenTestSummary
                total={output.hiddenSummary.total}
                passed={output.hiddenSummary.passed}
                failedCase={output.failedHiddenCase}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
