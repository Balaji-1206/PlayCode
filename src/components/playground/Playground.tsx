"use client";

import dynamic from "next/dynamic";
import { SendHorizontal, ArrowLeft } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import { LANGUAGES } from "@/lib/languages";
import { SAMPLE_PROBLEM } from "@/lib/sampleProblem";
import LanguageSelector from "@/components/playground/LanguageSelector";
import RunButton from "@/components/playground/RunButton";
import ProblemPanel from "@/components/playground/ProblemPanel";
import Terminal from "@/components/playground/Terminal";
import type { ExecutionResult, Problem } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  ),
});

// ─── Adapter: convert ParsedProblem → Problem (for ProblemPanel) ──────────────
// ProblemPanel uses the simpler Problem type from types/index.ts.
// ParsedProblem has more fields (driverCode, starterCode, etc.) that aren't
// needed in the panel. This adapter keeps ProblemPanel decoupled from OpenAI.

function adaptParsedProblem(parsed: ParsedProblem): Problem {
  return {
    id: parsed.title.toLowerCase().replace(/\s+/g, "-"),
    title: parsed.title,
    difficulty: parsed.difficulty,
    description: parsed.description,
    constraints: parsed.constraints,
    examples: parsed.examples,
    tags: parsed.tags,
  };
}

// ─── Mock runner ──────────────────────────────────────────────────────────────
// Simulates execution with mock results.
// Step 3 will replace this with real POST /api/code/execute calls.

async function mockRun(publicTestCases: ParsedProblem["testCases"]["public"] | null): Promise<ExecutionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const testResults = publicTestCases
    ? publicTestCases.map((tc, i) => ({
        caseIndex: i,
        status: "pass" as const,
        input: tc.input,
        expected: tc.expectedOutput,
        received: tc.expectedOutput,
        executionTime: Math.floor(Math.random() * 20) + 5,
      }))
    : [
        { caseIndex: 0, status: "pass" as const, input: "nums=[2,7,11,15], target=9", expected: "[0,1]", received: "[0,1]", executionTime: 12 },
        { caseIndex: 1, status: "pass" as const, input: "nums=[3,2,4], target=6", expected: "[1,2]", received: "[1,2]", executionTime: 9 },
        { caseIndex: 2, status: "pass" as const, input: "nums=[3,3], target=6", expected: "[0,1]", received: "[0,1]", executionTime: 8 },
      ];

  return {
    status: "success",
    stdout: testResults.map((r) => r.received).join("\n"),
    stderr: "",
    executionTime: 42,
    memoryUsage: 18.4,
    testResults,
  };
}

// ─── Main playground layout ───────────────────────────────────────────────────

export default function Playground() {
  const {
    selectedLanguage,
    code,
    setCode,
    setOutput,
    setIsRunning,
    setViewMode,
    isRunning,
    parsedProblem,
  } = usePlaygroundStore();

  // Resolve which problem to display:
  // If we have an AI-parsed problem, use it; otherwise show the sample.
  const displayProblem: Problem = parsedProblem
    ? adaptParsedProblem(parsedProblem)
    : SAMPLE_PROBLEM;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const publicTests = parsedProblem?.testCases.public ?? null;
      const result = await mockRun(publicTests);
      setOutput(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ══════════════════════ Top Navbar ══════════════════════ */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
        {/* Back to parser */}
        <button
          onClick={() => setViewMode("parser")}
          aria-label="Back to problem parser"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Logo / brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-900/40">
            D
          </div>
          <span className="hidden font-bold tracking-tight text-white sm:block">
            DSA Playground
          </span>
        </div>

        <div className="mx-2 h-5 w-px bg-slate-700" />

        {/* Problem title + source badge */}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="truncate text-sm text-slate-300 font-medium">
            {displayProblem.title}
          </span>
          {parsedProblem && (
            <span className="rounded-full bg-violet-600/20 border border-violet-600/30 px-2 py-0.5 text-xs text-violet-400">
              AI Generated
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <LanguageSelector />
        <RunButton onRun={handleRun} />

        {/* Submit button */}
        <button
          id="submit-button"
          disabled={isRunning}
          aria-label="Submit solution"
          className="
            inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600
            px-4 text-sm font-semibold text-white shadow-sm transition-all
            hover:bg-violet-500 active:scale-95
            disabled:cursor-not-allowed disabled:opacity-60
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
            focus:ring-offset-slate-900
          "
        >
          <SendHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Submit</span>
        </button>
      </header>

      {/* ══════════════════════ Main Content ══════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left: Problem Panel ── */}
        <div className="hidden w-[42%] shrink-0 border-r border-slate-700/60 md:flex md:flex-col">
          <ProblemPanel problem={displayProblem} />
        </div>

        {/* ── Right: Editor + Terminal ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Editor toolbar */}
          <div className="flex shrink-0 items-center gap-2 border-b border-slate-700/60 bg-slate-800/50 px-3 py-1.5">
            <span className="text-xs text-slate-500">
              {LANGUAGES[selectedLanguage].label}
            </span>
            <div className="flex-1" />
            <span className="text-xs text-slate-600">
              {code.split("\n").length} lines
            </span>
          </div>

          {/* Monaco Editor */}
          <div className="min-h-0 flex-[65]">
            <CodeEditor
              language={selectedLanguage}
              value={code}
              onChange={setCode}
            />
          </div>

          {/* Divider */}
          <div className="h-px shrink-0 bg-slate-700/60" />

          {/* Terminal */}
          <div className="min-h-0 flex-[35]">
            <Terminal />
          </div>
        </div>
      </div>
    </div>
  );
}
