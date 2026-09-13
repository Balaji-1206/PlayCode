"use client";

import dynamic from "next/dynamic";
import { SendHorizontal } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import { LANGUAGES } from "@/lib/languages";
import LanguageSelector from "@/components/playground/LanguageSelector";
import RunButton from "@/components/playground/RunButton";
import ProblemPanel from "@/components/playground/ProblemPanel";
import Terminal from "@/components/playground/Terminal";
import { SAMPLE_PROBLEM } from "@/lib/sampleProblem";
import type { ExecutionResult } from "@/types";

// Monaco must be dynamically imported (client-side only) to avoid SSR errors.
// next/dynamic with ssr:false is the standard pattern for browser-only packages.
const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  ),
});

// ─── Mock runner ──────────────────────────────────────────────────────────────
// Simulates a 1-second execution delay and returns mock test results.
// Step 3 will replace this with a real call to POST /api/code/execute.

async function mockRun(): Promise<ExecutionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  return {
    status: "success",
    stdout: "[0, 1]\n[1, 2]\n[0, 1]",
    stderr: "",
    executionTime: 42,
    memoryUsage: 18.4,
    testResults: [
      {
        caseIndex: 0,
        status: "pass",
        input: "nums = [2,7,11,15], target = 9",
        expected: "[0, 1]",
        received: "[0, 1]",
        executionTime: 12,
      },
      {
        caseIndex: 1,
        status: "pass",
        input: "nums = [3,2,4], target = 6",
        expected: "[1, 2]",
        received: "[1, 2]",
        executionTime: 9,
      },
      {
        caseIndex: 2,
        status: "pass",
        input: "nums = [3,3], target = 6",
        expected: "[0, 1]",
        received: "[0, 1]",
        executionTime: 8,
      },
    ],
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
    isRunning,
  } = usePlaygroundStore();

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await mockRun();
      setOutput(result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ══════════════════════ Top Navbar ══════════════════════ */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
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

        {/* Problem title */}
        <span className="hidden truncate text-sm text-slate-400 sm:block">
          {SAMPLE_PROBLEM.title}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Controls */}
        <LanguageSelector />
        <RunButton onRun={handleRun} />

        {/* Submit button (non-functional in Step 1) */}
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
      {/*
        Layout: two columns on desktop.
        Left  → Problem description (fixed 40% width)
        Right → Editor (top 65%) + Terminal (bottom 35%)

        In Step 5 we'll make these panels resizable with react-resizable-panels.
      */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── Left: Problem Panel ── */}
        <div className="hidden w-[42%] shrink-0 border-r border-slate-700/60 md:flex md:flex-col">
          <ProblemPanel problem={SAMPLE_PROBLEM} />
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
