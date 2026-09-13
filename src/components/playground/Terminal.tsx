"use client";

import { Terminal as TerminalIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import type { TestResult } from "@/types";

// ─── Sub-components ───────────────────────────────────────────────────────────

function TestResultRow({ result }: { result: TestResult }) {
  const isPassing = result.status === "pass";

  return (
    <div
      className={`rounded-lg border p-3 text-xs font-mono ${
        isPassing
          ? "border-emerald-700/40 bg-emerald-900/20"
          : "border-red-700/40 bg-red-900/20"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        {isPassing ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-red-400" />
        )}
        <span className={isPassing ? "text-emerald-300" : "text-red-300"}>
          Test Case {result.caseIndex + 1}
        </span>
        {result.executionTime !== undefined && (
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
            <span className="text-red-300">{result.received}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Terminal component ───────────────────────────────────────────────────────

export default function Terminal() {
  const { output, isRunning } = usePlaygroundStore();

  return (
    <div className="flex h-full flex-col bg-slate-950 text-sm">
      {/* ── Header bar ── */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 px-4 py-2.5">
        <TerminalIcon className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Output
        </span>

        {output && (
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {output.executionTime} ms
            </span>
            <span>{output.memoryUsage.toFixed(1)} MB</span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Running state */}
        {isRunning && (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <span className="text-sm">Executing your solution…</span>
          </div>
        )}

        {/* Idle state */}
        {!isRunning && !output && (
          <p className="text-slate-600 italic">
            Click <span className="font-semibold text-slate-500">Run</span> to
            execute your solution against the test cases.
          </p>
        )}

        {/* Results */}
        {!isRunning && output && (
          <div className="space-y-3">
            {/* Compiler / runtime error */}
            {output.stderr && (
              <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-3">
                <p className="mb-1 text-xs font-semibold text-red-400">Error</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-red-300">
                  {output.stderr}
                </pre>
              </div>
            )}

            {/* Stdout */}
            {output.stdout && (
              <div className="rounded-lg border border-slate-700/40 bg-slate-900/50 p-3">
                <p className="mb-1 text-xs font-semibold text-slate-400">stdout</p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-300">
                  {output.stdout}
                </pre>
              </div>
            )}

            {/* Test case results */}
            {output.testResults.length > 0 && (
              <div className="space-y-2">
                {output.testResults.map((result) => (
                  <TestResultRow key={result.caseIndex} result={result} />
                ))}
              </div>
            )}

            {/* Summary */}
            {output.testResults.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/40 p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">
                  {output.testResults.filter((r) => r.status === "pass").length} /{" "}
                  {output.testResults.length} test cases passed
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
