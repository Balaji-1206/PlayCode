"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import TestCaseTabs from "@/components/playground/TestCaseTabs";
import VerdictBanner from "@/components/playground/VerdictBanner";
import OutputDiffViewer from "@/components/playground/OutputDiffViewer";
import LatencyBreakdown from "@/components/playground/LatencyBreakdown";
import { getExecutionSpeedTier } from "@/lib/diffUtils";
import type { TestResult, FailedHiddenCase } from "@/types";

// ─── Reusable Copy Button ────────────────────────────────────────────────────

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied or unsupported
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer"
      title={label}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ─── Single test case detail view ─────────────────────────────────────────────

function TestCaseDetail({
  result,
  onUseAsCustomInput,
}: {
  result: TestResult;
  onUseAsCustomInput?: (input: string, expected?: string) => void;
}) {
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
          <div className="ml-auto flex items-center gap-2">
            {(() => {
              const tier = getExecutionSpeedTier(result.executionTime);
              return (
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${tier.badgeClass}`}
                >
                  {tier.label}
                </span>
              );
            })()}
            <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
              <Clock className="h-3 w-3" />
              {result.executionTime} ms
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F1F6FA] dark:bg-[#111827] p-3 shadow-2xs">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Input
          </p>
          <div className="flex items-center gap-1">
            {onUseAsCustomInput && (
              <button
                type="button"
                onClick={() => onUseAsCustomInput(result.input, result.expected)}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                title="Load into Custom Test tab"
              >
                <span>Debug in Custom Tab</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </button>
            )}
            <CopyButton text={result.input} />
          </div>
        </div>
        <pre className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{result.input}</pre>
      </div>

      {/* Output / Diff Inspection */}
      {!isPassing && (
        <OutputDiffViewer
          expected={result.expected}
          received={result.received || ""}
        />
      )}

      {isPassing && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Output
            </p>
            <CopyButton text={result.received || result.expected} />
          </div>
          <pre className="whitespace-pre-wrap text-emerald-700 dark:text-emerald-300 font-semibold">{result.received || result.expected}</pre>
        </div>
      )}

      {result.userLogs && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-[#0B1120] p-3 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Console Logs (stdout)
            </p>
            <CopyButton text={result.userLogs} />
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 dark:text-slate-300">{result.userLogs}</pre>
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
  onUseAsCustomInput,
}: {
  total: number;
  passed: number;
  failedCase?: FailedHiddenCase | null;
  onUseAsCustomInput?: (input: string, expected?: string) => void;
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Input
                      </span>
                      <div className="flex items-center gap-1">
                        {onUseAsCustomInput && (
                          <button
                            type="button"
                            onClick={() => onUseAsCustomInput(failedCase.input, failedCase.expected)}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                            title="Load into Custom Test tab"
                          >
                            <span>Debug in Custom Tab</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        )}
                        <CopyButton text={failedCase.input} />
                      </div>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 p-2.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                      {failedCase.input}
                    </pre>
                  </div>

                  {/* Token Diff Inspector for Revealed Hidden Case */}
                  <OutputDiffViewer
                    expected={failedCase.expected}
                    received={failedCase.received || ""}
                  />

                  {failedCase.stderr && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          stderr / Error Details
                        </span>
                        <CopyButton text={failedCase.stderr} />
                      </div>
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

// ─── Custom test case panel ──────────────────────────────────────────────────

function CustomTestCasePanel({
  input,
  onInputChange,
  expected,
  onExpectedChange,
  customResult,
}: {
  input: string;
  onInputChange: (val: string) => void;
  expected: string;
  onExpectedChange: (val: string) => void;
  customResult?: TestResult | null;
}) {
  return (
    <div className="space-y-3 text-xs font-mono">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F1F6FA] dark:bg-[#111827] p-3 shadow-2xs">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Custom Test Input (stdin)
        </label>
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter custom input (e.g. [2,7,11,15]\n9)"
          rows={3}
          className="w-full resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F1F6FA] dark:bg-[#111827] p-3 shadow-2xs">
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Expected Output (Optional)
        </label>
        <textarea
          value={expected}
          onChange={(e) => onExpectedChange(e.target.value)}
          placeholder="Optional expected output (e.g. [0, 1])"
          rows={2}
          className="w-full resize-y rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
        />
      </div>

      <div className="rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-2.5 text-[11px] text-blue-700 dark:text-blue-300 font-sans">
        💡 Your custom input will be tested when you press <strong>Run (Ctrl+Enter)</strong>.
      </div>

      {customResult && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Execution Result for Custom Test
          </p>
          <TestCaseDetail result={customResult} />
        </div>
      )}
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

export default function Terminal() {
  const {
    output,
    isRunning,
    isSubmitting,
    customInput,
    setCustomInput,
    customExpected,
    setCustomExpected,
    isCustomTestActive,
    setIsCustomTestActive,
  } = usePlaygroundStore();
  const [selectedCase, setSelectedCase] = useState(0);
  const [prevOutput, setPrevOutput] = useState(output);

  if (output !== prevOutput) {
    setPrevOutput(output);
    setSelectedCase(0);
  }

  const isBusy = isRunning || isSubmitting;

  const hasResults = !!output?.testResults.length;
  // If user entered a custom test case, the last result might be the custom test case
  const isLastCaseCustom =
    hasResults &&
    customInput.trim().length > 0 &&
    output!.testResults[output!.testResults.length - 1]?.input.trim() === customInput.trim();

  const standardResults = isLastCaseCustom
    ? output!.testResults.slice(0, -1)
    : (output?.testResults ?? []);

  const customResult = isLastCaseCustom
    ? output!.testResults[output!.testResults.length - 1]
    : null;

  const activeResult = standardResults[selectedCase];

  const handleUseAsCustomInput = (inp: string, exp?: string) => {
    setCustomInput(inp);
    if (exp !== undefined) {
      setCustomExpected(exp);
    }
    setIsCustomTestActive(true);
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-300 transition-colors text-sm">
      {/* ── Header: test case tabs + Custom Test ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-[#263244] bg-[#F8FAFC] dark:bg-[#172033] px-3 py-1.5">
        <TestCaseTabs
          results={standardResults}
          selectedIndex={selectedCase}
          onSelect={(idx) => {
            setIsCustomTestActive(false);
            setSelectedCase(idx);
          }}
          showCustomTab={true}
          isCustomActive={isCustomTestActive}
          onSelectCustom={() => setIsCustomTestActive(true)}
        />
        {!hasResults && !isCustomTestActive && (
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

        {/* Custom Test Editor */}
        {!isBusy && isCustomTestActive && (
          <CustomTestCasePanel
            input={customInput}
            onInputChange={setCustomInput}
            expected={customExpected}
            onExpectedChange={setCustomExpected}
            customResult={customResult}
          />
        )}

        {/* Idle hint */}
        {!isBusy && !output && !isCustomTestActive && (
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
        {!isBusy && output && !isCustomTestActive && (
          <div className="space-y-3">
            {output.hiddenSummary && (
              <VerdictBanner result={output} />
            )}

            {output.stderr && output.testResults.length === 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">Compilation Error</p>
                  <CopyButton text={output.stderr} />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-red-700 dark:text-red-300">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* Aggregate Latency Telemetry Breakdown */}
            {standardResults.length > 1 && (
              <LatencyBreakdown
                results={standardResults}
                selectedIndex={selectedCase}
                onSelectIndex={(idx) => {
                  setIsCustomTestActive(false);
                  setSelectedCase(idx);
                }}
              />
            )}

            {activeResult && (
              <TestCaseDetail
                result={activeResult}
                onUseAsCustomInput={handleUseAsCustomInput}
              />
            )}

            {activeResult && output.stderr && output.testResults.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-[#F1F6FA] dark:border-slate-800 dark:bg-slate-900/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">stderr</p>
                  <CopyButton text={output.stderr} />
                </div>
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
                onUseAsCustomInput={handleUseAsCustomInput}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
