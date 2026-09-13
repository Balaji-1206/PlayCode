"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import { ArrowLeft, Code2, BookOpen, TerminalSquare } from "lucide-react";

import { usePlaygroundStore } from "@/stores/playgroundStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { LANGUAGES } from "@/lib/languages";
import { SAMPLE_PROBLEM } from "@/lib/sampleProblem";

import LanguageSelector from "@/components/playground/LanguageSelector";
import RunButton from "@/components/playground/RunButton";
import SubmitButton from "@/components/playground/SubmitButton";
import ProblemPanel from "@/components/playground/ProblemPanel";
import EditorToolbar from "@/components/playground/EditorToolbar";
import BottomPanel from "@/components/playground/BottomPanel";

import type { ExecutionResult, Problem, TestResult } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";
import type { CodeAnalysis } from "@/lib/schemas/analysis";

// ─── Dynamic import for Monaco (no SSR) ──────────────────────────────────────

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
  const res = await fetch("/api/code/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, problemSessionId, publicTests, runType }),
  });
  const data = (await res.json()) as ExecuteApiResponse;
  if (!res.ok) throw new Error(data.error ?? `Execution failed: ${res.status}`);

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

async function callAnalyzeApi(
  code: string,
  language: string,
  problemTitle: string,
  problemDescription: string
): Promise<CodeAnalysis> {
  const res = await fetch("/api/code/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language, problemTitle, problemDescription }),
  });
  const data = (await res.json()) as { analysis?: CodeAnalysis; error?: string };
  if (!res.ok) throw new Error(data.error ?? `Analysis failed: ${res.status}`);
  if (!data.analysis) throw new Error("Server returned empty analysis.");
  return data.analysis;
}

// ─── Mobile tab type ──────────────────────────────────────────────────────────

type MobileView = "problem" | "editor" | "output";

// ─── Main Playground ──────────────────────────────────────────────────────────

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

  const [fontSize, setFontSize] = useState(14);
  const [hideProblempanel, setHideProblemPanel] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("problem");

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

  // ── Run ──────────────────────────────────────────────────────────────────────

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    setActiveBottomTab("output");
    setMobileView("output");

    try {
      const result = await callExecuteApi(
        code, selectedLanguage, problemSessionId, publicTests, "run"
      );
      setOutput(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed";
      setOutput({ status: "error", stdout: "", stderr: message, executionTime: 0, memoryUsage: 0, testResults: [], hiddenSummary: null });
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguage, problemSessionId, publicTests, setIsRunning, setOutput, setActiveBottomTab]);

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setOutput(null);
    setActiveBottomTab("output");
    setMobileView("output");
    setAnalysisStatus("loading");
    setAnalysisError(null);
    setAnalysis(null);

    const analysisPromise = callAnalyzeApi(
      code, selectedLanguage, displayProblem.title, displayProblem.description
    );

    try {
      const result = await callExecuteApi(
        code, selectedLanguage, problemSessionId, publicTests, "submit"
      );
      setOutput(result);
      setIsSubmitting(false);

      try {
        const analysis = await analysisPromise;
        setAnalysis(analysis);
        setAnalysisStatus("ready");
        setActiveBottomTab("analysis");
      } catch (err) {
        setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
        setAnalysisStatus("error");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setOutput({ status: "error", stdout: "", stderr: message, executionTime: 0, memoryUsage: 0, testResults: [], hiddenSummary: null });
      setIsSubmitting(false);
      analysisPromise.catch(() => {});
      setAnalysisStatus("idle");
    }
  }, [code, selectedLanguage, problemSessionId, publicTests, displayProblem, setIsSubmitting, setOutput, setActiveBottomTab, setAnalysisStatus, setAnalysisError, setAnalysis]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────

  useKeyboardShortcuts({ onRun: handleRun, onSubmit: handleSubmit });

  // ── Navbar ────────────────────────────────────────────────────────────────────

  const navbar = (
    <header className="flex shrink-0 items-center gap-3 border-b border-slate-700/60 bg-slate-900 px-4 py-2.5">
      <button
        onClick={() => setViewMode("parser")}
        aria-label="Back to parser"
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

      <div className="mx-2 hidden h-5 w-px bg-slate-700 sm:block" />

      <div className="hidden items-center gap-2 sm:flex">
        <span className="max-w-[200px] truncate text-sm font-medium text-slate-300">
          {displayProblem.title}
        </span>
        {parsedProblem && (
          <span className="rounded-full border border-violet-600/30 bg-violet-600/20 px-2 py-0.5 text-xs text-violet-400">
            AI Generated
          </span>
        )}
      </div>

      <div className="flex-1" />

      {/* Keyboard shortcut hints — desktop only */}
      <div className="hidden items-center gap-3 text-xs text-slate-600 lg:flex">
        <span>
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">
            Enter
          </kbd>{" "}
          Run
        </span>
        <span>
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">
            ⇧
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[10px]">
            Ctrl+Enter
          </kbd>{" "}
          Submit
        </span>
      </div>

      <LanguageSelector />
      <RunButton onRun={handleRun} />
      <SubmitButton onSubmit={handleSubmit} />
    </header>
  );

  // ── Mobile tab bar ────────────────────────────────────────────────────────────

  const mobileTabBar = (
    <div className="flex shrink-0 border-t border-slate-700/60 bg-slate-900 md:hidden">
      {(
        [
          { view: "problem" as MobileView, icon: <BookOpen className="h-4 w-4" />, label: "Problem" },
          { view: "editor" as MobileView, icon: <Code2 className="h-4 w-4" />, label: "Code" },
          { view: "output" as MobileView, icon: <TerminalSquare className="h-4 w-4" />, label: "Output" },
        ] as const
      ).map(({ view, icon, label }) => (
        <button
          key={view}
          onClick={() => setMobileView(view)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
            mobileView === view
              ? "text-violet-400"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );

  // ── Desktop: resizable panels ─────────────────────────────────────────────────

  const desktopLayout = (
    <PanelGroup direction="horizontal" className="hidden md:flex">
      {/* Problem panel — hideable via fullscreen toggle */}
      {!hideProblempanel && (
        <>
          <Panel
            id="problem"
            defaultSize={38}
            minSize={20}
            maxSize={55}
          >
            <div className="h-full border-r border-slate-700/60">
              <ProblemPanel problem={displayProblem} />
            </div>
          </Panel>

          <PanelResizeHandle className="group relative flex w-1.5 items-center justify-center bg-slate-800 transition-colors hover:bg-violet-600/40 active:bg-violet-600">
            <div className="h-8 w-0.5 rounded-full bg-slate-600 transition-colors group-hover:bg-violet-400" />
          </PanelResizeHandle>
        </>
      )}

      {/* Editor + Bottom panel */}
      <Panel id="editor-area" minSize={30}>
        <PanelGroup direction="vertical">
          <Panel id="editor" defaultSize={62} minSize={20}>
            <div className="flex h-full flex-col">
              <EditorToolbar
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onToggleFullscreen={() => setHideProblemPanel((v) => !v)}
                isFullscreen={hideProblempanel}
              />
              <div className="min-h-0 flex-1">
                <CodeEditor
                  language={selectedLanguage}
                  value={code}
                  onChange={setCode}
                  fontSize={fontSize}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="group relative flex h-1.5 items-center justify-center bg-slate-800 transition-colors hover:bg-violet-600/40 active:bg-violet-600">
            <div className="h-0.5 w-8 rounded-full bg-slate-600 transition-colors group-hover:bg-violet-400" />
          </PanelResizeHandle>

          <Panel id="terminal" defaultSize={38} minSize={15}>
            <BottomPanel />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );

  // ── Mobile: tabbed view ───────────────────────────────────────────────────────

  const mobileLayout = (
    <div className="flex min-h-0 flex-1 flex-col md:hidden">
      {mobileView === "problem" && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProblemPanel problem={displayProblem} />
        </div>
      )}
      {mobileView === "editor" && (
        <div className="flex min-h-0 flex-1 flex-col">
          <EditorToolbar
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            onToggleFullscreen={() => {}}
            isFullscreen={false}
          />
          <div className="min-h-0 flex-1">
            <CodeEditor
              language={selectedLanguage}
              value={code}
              onChange={setCode}
              fontSize={fontSize}
            />
          </div>
        </div>
      )}
      {mobileView === "output" && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <BottomPanel />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {navbar}
      <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
        {desktopLayout}
      </div>
      {mobileLayout}
      {mobileTabBar}
    </div>
  );
}
