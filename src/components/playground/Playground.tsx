"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
} from "react-resizable-panels";
import {
  ArrowLeft,
  Code2,
  BookOpen,
  TerminalSquare,
  ChevronDown,
  Keyboard,
  Sparkles,
  Check,
  X,
} from "lucide-react";

import { usePlaygroundStore } from "@/stores/playgroundStore";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SAMPLE_PROBLEM } from "@/lib/sampleProblem";
import { PROBLEM_CATALOG } from "@/lib/problemCatalog";

import LanguageSelector from "@/components/playground/LanguageSelector";
import RunButton from "@/components/playground/RunButton";
import SubmitButton from "@/components/playground/SubmitButton";
import ProblemPanel from "@/components/playground/ProblemPanel";
import EditorToolbar from "@/components/playground/EditorToolbar";
import BottomPanel from "@/components/playground/BottomPanel";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ProblemDirectoryModal from "@/components/modals/ProblemDirectoryModal";
import EditorialModal from "@/components/modals/EditorialModal";

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
    referenceSolution: parsed.referenceSolution,
    editorial: parsed.editorial,
  };
}

// ─── Execute API call ─────────────────────────────────────────────────────────

interface ExecuteApiResponse {
  status: "success" | "compile_error";
  code?: string;
  publicResults: Array<{
    caseIndex: number;
    status: "pass" | "fail" | "error";
    input: string;
    expected: string;
    received: string;
    userLogs?: string;
    executionTime: number;
    stderr: string;
  }>;
  hiddenSummary: { total: number; passed: number } | null;
  failedHiddenCase?: {
    caseIndex: number;
    input: string;
    expected: string;
    received: string;
    executionTime?: number;
    stderr?: string;
    description?: string;
  } | null;
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
  runType: "run" | "submit",
  problemTitle?: string,
  problemId?: string
): Promise<ExecutionResult> {
  const res = await fetch("/api/code/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      language,
      problemSessionId: problemSessionId || problemId,
      problemTitle,
      problemId,
      publicTests,
      runType,
    }),
  });
  const data = (await res.json()) as ExecuteApiResponse;
  if (!res.ok) {
    if (res.status === 410 || data.code === "SESSION_EXPIRED") {
      throw new Error("Problem session expired. Please re-parse the problem or select one from the Directory.");
    }
    throw new Error(data.error ?? `Execution failed: ${res.status}`);
  }

  const testResults: TestResult[] = data.publicResults.map((r) => ({
    caseIndex: r.caseIndex,
    status: r.status as TestResult["status"],
    input: r.input,
    expected: r.expected,
    received: r.received,
    userLogs: r.userLogs,
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
    failedHiddenCase: data.failedHiddenCase ?? null,
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
    parsedProblem,
    problemSessionId,
    loadParsedProblem,
    customInput,
    customExpected,
  } = usePlaygroundStore();

  const [fontSize, setFontSize] = useState(14);
  const [hideProblempanel, setHideProblemPanel] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("problem");
  const [isProblemMenuOpen, setIsProblemMenuOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [isEditorialOpen, setIsEditorialOpen] = useState(false);

  // Ctrl+K / Cmd+K listener for problem directory
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsDirectoryModalOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayProblem: Problem = parsedProblem
    ? adaptParsedProblem(parsedProblem)
    : SAMPLE_PROBLEM;

  const publicTests = useMemo(() => {
    const baseTests = parsedProblem?.testCases.public.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    })) ?? [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1, 2]" },
      { input: "[3,3]\n6", expectedOutput: "[0, 1]" },
    ];

    return customInput.trim()
      ? [...baseTests, { input: customInput.trim(), expectedOutput: customExpected.trim() || "(custom)" }]
      : baseTests;
  }, [parsedProblem, customInput, customExpected]);

  // ── On-Demand AI Complexity Analysis ─────────────────────────────────────────

  const handleAnalyze = useCallback(async () => {
    setAnalysisStatus("loading");
    setAnalysisError(null);
    setAnalysis(null);
    setActiveBottomTab("analysis");
    try {
      const analysis = await callAnalyzeApi(
        code,
        selectedLanguage,
        displayProblem.title,
        displayProblem.description
      );
      setAnalysis(analysis);
      setAnalysisStatus("ready");
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
      setAnalysisStatus("error");
    }
  }, [
    code,
    selectedLanguage,
    displayProblem,
    setAnalysisStatus,
    setAnalysisError,
    setAnalysis,
    setActiveBottomTab,
  ]);

  // ── Run ──────────────────────────────────────────────────────────────────────

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    setActiveBottomTab("output");
    setMobileView("output");

    try {
      const result = await callExecuteApi(
        code,
        selectedLanguage,
        problemSessionId,
        publicTests,
        "run",
        displayProblem.title,
        displayProblem.id
      );
      setOutput(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Execution failed";
      setOutput({ status: "error", stdout: "", stderr: message, executionTime: 0, memoryUsage: 0, testResults: [], hiddenSummary: null });
    } finally {
      setIsRunning(false);
    }
  }, [code, selectedLanguage, problemSessionId, publicTests, displayProblem, setIsRunning, setOutput, setActiveBottomTab]);

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
        code,
        selectedLanguage,
        problemSessionId,
        publicTests,
        "submit",
        displayProblem.title,
        displayProblem.id
      );
      setOutput(result);
      setIsSubmitting(false);

      try {
        const analysis = await analysisPromise;
        setAnalysis(analysis);
        setAnalysisStatus("ready");
        const isAllPassed =
          result.status === "success" &&
          result.testResults.every((r) => r.status === "pass") &&
          (!result.hiddenSummary || result.hiddenSummary.passed === result.hiddenSummary.total);
        if (isAllPassed) {
          setActiveBottomTab("analysis");
        }
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
    <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 dark:border-[#263244] bg-white dark:bg-[#111827] px-4 py-2 transition-colors">
      <button
        onClick={() => setViewMode("parser")}
        aria-label="Back to parser"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-xs">
          ◈
        </div>
        <span className="hidden font-bold tracking-tight text-slate-900 dark:text-white sm:block">
          DSA Playground
        </span>
      </div>

      <div className="mx-1 hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

      {/* Directory Modal Button */}
      <button
        onClick={() => setIsDirectoryModalOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Open Problem Directory (Ctrl+K)"
      >
        <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">Directory</span>
        <kbd className="hidden md:inline-block rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1 text-[10px] text-slate-500">
          ⌘K
        </kbd>
      </button>

      {/* Problem Switcher Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsProblemMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <span className="max-w-[140px] truncate sm:max-w-[190px]">
            {displayProblem.title}
          </span>
          {parsedProblem && (
            <span className="hidden rounded-full border border-blue-200 dark:border-blue-600/30 bg-blue-50 dark:bg-blue-600/20 px-1.5 py-0.2 text-[10px] text-blue-600 dark:text-blue-300 md:inline-block font-bold">
              AI
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
              isProblemMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isProblemMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsProblemMenuOpen(false)}
            />
            <div className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-[#111827]/95 p-1.5 shadow-xl backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Switch Challenge
              </div>
              <div className="space-y-1">
                {Object.entries(PROBLEM_CATALOG).map(([key, p]) => {
                  const isSelected =
                    displayProblem.title.toLowerCase() === p.title.toLowerCase();
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        loadParsedProblem(p, selectedLanguage, key);
                        setIsProblemMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-600/20 font-semibold text-blue-700 dark:text-blue-300"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{p.title}</span>
                          {isSelected && (
                            <Check className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              p.difficulty === "Easy"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                                : p.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                                : "bg-rose-50 text-rose-700 dark:bg-red-500/20 dark:text-red-300"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                          <span className="truncate text-[10px] text-slate-400 dark:text-slate-500">
                            {p.tags.slice(0, 2).join(", ")}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                onClick={() => {
                  setIsProblemMenuOpen(false);
                  setViewMode("parser");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-600/10 cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Parse Custom Problem Statement</span>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Keyboard shortcut hints & Dialog trigger */}
      <div className="hidden items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 lg:flex">
        <span>
          <kbd className="rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-1 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-1 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
            Enter
          </kbd>{" "}
          Run
        </span>
        <span>
          <kbd className="rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-1 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
            ⇧
          </kbd>{" "}
          +{" "}
          <kbd className="rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-1 py-0.5 text-[10px] text-slate-600 dark:text-slate-300">
            Ctrl+Enter
          </kbd>{" "}
          Submit
        </span>

        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
          title="Keyboard Shortcuts"
        >
          <Keyboard className="h-3.5 w-3.5 text-blue-500" />
          <span>Shortcuts</span>
        </button>
      </div>

      <LanguageSelector />
      <RunButton onRun={handleRun} />
      <SubmitButton onSubmit={handleSubmit} />
      <ThemeToggle />
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
              ? "text-blue-600 dark:text-blue-400 font-semibold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
            <div className="h-full border-r border-slate-200 dark:border-[#263244]">
              <ProblemPanel problem={displayProblem} />
            </div>
          </Panel>

          <PanelResizeHandle className="group relative flex w-1.5 items-center justify-center bg-[#F1F6FA] dark:bg-[#0B1120] transition-colors hover:bg-blue-500/20 active:bg-blue-500">
            <div className="h-8 w-0.5 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors group-hover:bg-blue-400" />
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
                onOpenEditorial={() => setIsEditorialOpen(true)}
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

          <PanelResizeHandle className="group relative flex h-1.5 items-center justify-center bg-[#F1F6FA] dark:bg-[#0B1120] transition-colors hover:bg-blue-500/20 active:bg-blue-500">
            <div className="h-0.5 w-8 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors group-hover:bg-blue-400" />
          </PanelResizeHandle>

          <Panel id="terminal" defaultSize={38} minSize={15}>
            <BottomPanel onAnalyze={handleAnalyze} />
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
            onOpenEditorial={() => setIsEditorialOpen(true)}
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
          <BottomPanel onAnalyze={handleAnalyze} />
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F6F9FC] dark:bg-[#0B1120] transition-colors">
      {navbar}
      <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
        {desktopLayout}
      </div>
      {mobileLayout}
      {mobileTabBar}

      {/* Keyboard Shortcuts Dialog */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-400">
                  <Keyboard className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Boost your algorithmic speed with quick hotkeys</p>
                </div>
              </div>
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 p-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Run Code (Public Tests)</span>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Ctrl</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 p-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Submit Code (Full Suite + Big-O Analysis)</span>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Ctrl</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Shift</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Enter</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 p-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Toggle Fullscreen Code Area</span>
                <div className="flex items-center gap-1">
                  <span className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 shadow-2xs">Editor Maximize Button</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-800/50 p-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Indent / Outdent Selection</span>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">Tab</kbd>
                  <span className="text-slate-400">/</span>
                  <kbd className="rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-700 dark:text-slate-200 shadow-2xs">⇧ + Tab</kbd>
                </div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Got It, Let&apos;s Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Problem Directory Modal (Ctrl+K) */}
      <ProblemDirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        selectedLanguage={selectedLanguage}
      />

      {/* Editorial & Solution Modal */}
      <EditorialModal
        isOpen={isEditorialOpen}
        onClose={() => setIsEditorialOpen(false)}
        problem={displayProblem}
        selectedLanguage={selectedLanguage}
      />
    </div>
  );
}
