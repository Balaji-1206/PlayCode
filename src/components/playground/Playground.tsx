"use client";

import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import { LANGUAGES } from "@/lib/languages";
import { SAMPLE_PROBLEM } from "@/lib/sampleProblem";
import LanguageSelector from "@/components/playground/LanguageSelector";
import RunButton from "@/components/playground/RunButton";
import SubmitButton from "@/components/playground/SubmitButton";
import ProblemPanel from "@/components/playground/ProblemPanel";
import BottomPanel from "@/components/playground/BottomPanel";
import type { ExecutionResult, Problem, TestResult } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";
import type { CodeAnalysis } from "@/lib/schemas/analysis";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  ),
});

// ─── Adapter ──────────────────────────────────────────────────────────────────

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

// ─── Execute API call ─────────────────────────────────────────────────────────

interface ExecuteApiResponse {
  status: "success" | "compile_error";
  publicResults: Array<{
    caseIndex: number;
    status: "pass" | "fail" | "error";
    input: string;
    expected: string;
    received: string;
    executionTime: number;
    stderr: string;
  }>;
  hiddenSummary: { total: number; passed: number } | null;
  executionTime: number;
  memoryUsage: number;
  stderr: string;
  error?: string;
}

async function callExecuteApi(
  code: string,
  language: string,
  problemSessionId: string | null,
  publicTests: Array<{ input: string; expectedOutput: string }>,
  runType: "run" | "submit"
): Promise<ExecutionResult> {
  const response = await fetch("/api/code/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, problemSessionId, publicTests, runType }),
  });

  const data = (await response.json()) as ExecuteApiResponse;

  if (!response.ok) {
    throw new Error(data.error ?? `Execution failed: ${response.status}`);
  }

  const testResults: TestResult[] = data.publicResults.map((r) => ({
    caseIndex: r.caseIndex,
    status: r.status as TestResult["status"],
    input: r.input,
    expected: r.expected,
    received: r.received,
    executionTime: r.executionTime,
  }));

  return {
    status: data.status === "compile_error" ? "error" : "success",
    stdout: testResults.map((r) => r.received).join("\n"),
    stderr: data.stderr,
    executionTime: data.executionTime,
    memoryUsage: data.memoryUsage,
    testResults,
    hiddenSummary: data.hiddenSummary,
  };
}

// ─── Analyze API call ─────────────────────────────────────────────────────────

async function callAnalyzeApi(
  code: string,
  language: string,
  problemTitle: string,
  problemDescription: string
): Promise<CodeAnalysis> {
  const response = await fetch("/api/code/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, problemTitle, problemDescription }),
  });

  const data = (await response.json()) as { analysis?: CodeAnalysis; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `Analysis failed: ${response.status}`);
  }

  if (!data.analysis) {
    throw new Error("Server returned an empty analysis.");
  }

  return data.analysis;
}

// ─── Playground ───────────────────────────────────────────────────────────────

export default function Playground() {
  const {
    selectedLanguage,
    code,
    setCode,
    setOutput,
    setIsRunning,
    setIsSubmitting,
    setViewMode,
    setActiveBottomTab,
    setAnalysisStatus,
    setAnalysisError,
    setAnalysis,
    isRunning,
    isSubmitting,
    parsedProblem,
    problemSessionId,
  } = usePlaygroundStore();

  const displayProblem: Problem = parsedProblem
    ? adaptParsedProblem(parsedProblem)
    : SAMPLE_PROBLEM;

  const publicTests = parsedProblem?.testCases.public.map((tc) => ({
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  })) ?? [
    { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]" },
    { input: "[3,2,4]\n6", expectedOutput: "[1, 2]" },
    { input: "[3,3]\n6", expectedOutput: "[0, 1]" },
  ];

  // ── Run (public tests only, no analysis) ──────────────────────────────────

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setActiveBottomTab("output");

    try {
      const result = await callExecuteApi(
        code, selectedLanguage, problemSessionId, publicTests, "run"
      );
      setOutput(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed";
      setOutput({
        status: "error",
        stdout: "",
        stderr: message,
        executionTime: 0,
        memoryUsage: 0,
        testResults: [],
        hiddenSummary: null,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // ── Submit (public + hidden tests + AI analysis in parallel) ──────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput(null);
    setActiveBottomTab("output");

    // Start AI analysis immediately in parallel — don't await it yet.
    // This way, execution results appear first without waiting for AI.
    setAnalysisStatus("loading");
    setAnalysisError(null);
    setAnalysis(null);

    const analysisPromise = callAnalyzeApi(
      code,
      selectedLanguage,
      displayProblem.title,
      displayProblem.description
    );

    try {
      // Execute against test cases
      const result = await callExecuteApi(
        code, selectedLanguage, problemSessionId, publicTests, "submit"
      );
      setOutput(result);
      setIsSubmitting(false);

      // Switch to analysis tab automatically once analysis resolves
      try {
        const analysis = await analysisPromise;
        setAnalysis(analysis);
        setAnalysisStatus("ready");
        // Auto-switch to analysis tab so the user sees it
        setActiveBottomTab("analysis");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed";
        setAnalysisError(message);
        setAnalysisStatus("error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setOutput({
        status: "error",
        stdout: "",
        stderr: message,
        executionTime: 0,
        memoryUsage: 0,
        testResults: [],
        hiddenSummary: null,
      });
      setIsSubmitting(false);

      // Cancel analysis gracefully if execution failed
      analysisPromise.catch(() => {});
      setAnalysisStatus("idle");
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ══ Navbar ══════════════════════════════════════════════════════════ */}
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
        <button
          onClick={() => setViewMode("parser")}
          aria-label="Back to problem parser"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-900/40">
            D
          </div>
          <span className="hidden font-bold tracking-tight text-white sm:block">
            DSA Playground
          </span>
        </div>

        <div className="mx-2 h-5 w-px bg-slate-700" />

        <div className="hidden items-center gap-2 sm:flex">
          <span className="truncate text-sm font-medium text-slate-300">
            {displayProblem.title}
          </span>
          {parsedProblem && (
            <span className="rounded-full border border-violet-600/30 bg-violet-600/20 px-2 py-0.5 text-xs text-violet-400">
              AI Generated
            </span>
          )}
        </div>

        <div className="flex-1" />
        <LanguageSelector />
        <RunButton onRun={handleRun} />
        <SubmitButton onSubmit={handleSubmit} />
      </header>

      {/* ══ Content ═════════════════════════════════════════════════════════ */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Problem panel */}
        <div className="hidden w-[42%] shrink-0 border-r border-slate-700/60 md:flex md:flex-col">
          <ProblemPanel problem={displayProblem} />
        </div>

        {/* Right: Editor + Bottom panel */}
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

          <div className="h-px shrink-0 bg-slate-700/60" />

          {/* Tabbed bottom panel: Output + AI Analysis */}
          <div className="min-h-0 flex-[35]">
            <BottomPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
