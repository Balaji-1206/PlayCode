"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Code2,
  ArrowRight,
  ClipboardPaste,
  Trash2,
  Wand2,
  Play,
  Flame,
  Check,
} from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { LanguageKey } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";

// ─── Example problems ─────────────────────────────────────────────────────────

interface CatalogExample {
  label: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  timeComplexity: string;
  statement: string;
  examples: string;
  constraints: string;
}

const EXAMPLES: CatalogExample[] = [
  {
    label: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    timeComplexity: "O(n)",
    statement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: `Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]

Example 3:
Input: nums = [3,3], target = 6
Output: [0,1]`,
    constraints: `2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
Only one valid answer exists.`,
  },
  {
    label: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    timeComplexity: "O(n)",
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
- Open brackets must be closed by the same type of brackets.
- Open brackets must be closed in the correct order.
- Every close bracket has a corresponding open bracket of the same type.`,
    examples: `Example 1:
Input: s = "()"
Output: true

Example 2:
Input: s = "()[]{}"
Output: true

Example 3:
Input: s = "(]"
Output: false`,
    constraints: `1 <= s.length <= 10^4
s consists of parentheses only '()[]{}'`,
  },
  {
    label: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Array", "Dynamic Programming"],
    timeComplexity: "O(n)",
    statement: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    examples: `Example 1:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.

Example 2:
Input: nums = [1]
Output: 1

Example 3:
Input: nums = [5,4,-1,7,8]
Output: 23`,
    constraints: `1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4`,
  },
];

const PARSE_STEPS = [
  "Analyzing problem statement & inferring function signatures…",
  "Compiling multi-language driver wrappers (C++, Java, Python, JS, Go, Rust)…",
  "Synthesizing edge cases, boundary limits, and hidden test cases…",
  "Finalizing playground environment…",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProblemParser() {
  const {
    setIsParsing,
    setParseError,
    loadParsedProblem,
    isParsing,
    parseError,
    setViewMode,
  } = usePlaygroundStore();

  const [statement, setStatement] = useState("");
  const [examples, setExamples] = useState("");
  const [constraints, setConstraints] = useState("");
  const [language, setLanguage] = useState<LanguageKey>("python");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [parseStepIndex, setParseStepIndex] = useState(0);

  const isFormValid = statement.trim().length >= 20;

  // Cycle progress steps while parsing
  useEffect(() => {
    if (!isParsing) return;
    const interval = setInterval(() => {
      setParseStepIndex((prev) => (prev + 1) % PARSE_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isParsing]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  // ── Auto-fill from example ───────────────────────────────────────────────

  const fillExample = (ex: CatalogExample) => {
    setStatement(ex.statement);
    setExamples(ex.examples);
    setConstraints(ex.constraints);
    setParseError(null);
    showToast(`Loaded ${ex.label} into form`);
  };

  // ── Instant launch challenge ──────────────────────────────────────────────

  const launchInstantChallenge = async (ex: CatalogExample) => {
    fillExample(ex);
    setIsParsing(true);
    setParseError(null);

    try {
      const response = await fetch("/api/problems/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemStatement: ex.statement.trim(),
          examples: ex.examples.trim(),
          constraints: ex.constraints.trim(),
        }),
      });

      const data = (await response.json()) as {
        problem?: ParsedProblem;
        problemSessionId?: string;
        error?: string;
      };

      if (!response.ok) throw new Error(data.error ?? `Server error: ${response.status}`);
      if (!data.problem || !data.problemSessionId) {
        throw new Error("Could not initialize problem session.");
      }

      loadParsedProblem(data.problem, language, data.problemSessionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  };

  // ── Toolbar Actions: Paste, Clear, Format ─────────────────────────────────

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || text.trim().length === 0) {
        showToast("Clipboard is empty");
        return;
      }
      setStatement((prev) => (prev.trim() ? `${prev}\n\n${text}` : text));
      showToast("Pasted from clipboard!");
    } catch {
      showToast("Please allow clipboard permission in browser");
    }
  };

  const handleClear = () => {
    setStatement("");
    setExamples("");
    setConstraints("");
    setParseError(null);
    showToast("Cleared form");
  };

  const handleFormatText = () => {
    if (!statement.trim()) return;
    const formatted = statement
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    setStatement(formatted);
    showToast("Cleaned up text formatting");
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleParse = async () => {
    if (!isFormValid || isParsing) return;

    setIsParsing(true);
    setParseStepIndex(0);
    setParseError(null);

    try {
      const response = await fetch("/api/problems/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemStatement: statement.trim(),
          examples: examples.trim(),
          constraints: constraints.trim(),
        }),
      });

      const data = (await response.json()) as {
        problem?: ParsedProblem;
        problemSessionId?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? `Server error: ${response.status}`);
      }

      if (!data.problem || !data.problemSessionId) {
        throw new Error("Server did not return problem data. Please try again.");
      }

      loadParsedProblem(data.problem, language, data.problemSessionId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative h-screen overflow-y-auto bg-gradient-to-b from-[#F6F9FC] via-[#F8FAFC] to-[#EFF4F9] dark:from-[#0B1120] dark:via-[#0D1527] dark:to-[#0B1120] text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-500/20 selection:text-blue-900 dark:selection:text-blue-200">
      {/* ── Toast notification ── */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 animate-slide-down rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-4 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 shadow-lg shadow-slate-900/10 dark:shadow-black/40 backdrop-blur-md flex items-center gap-2">
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Radiant ambient light mesh ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-200/30 via-indigo-200/20 to-sky-200/30 dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-sky-500/10 blur-[90px]" />
        <div className="absolute top-96 -left-32 h-[380px] w-[420px] rounded-full bg-indigo-100/30 dark:bg-indigo-900/10 blur-[80px]" />
        <div className="absolute top-[500px] -right-32 h-[380px] w-[420px] rounded-full bg-sky-100/40 dark:bg-sky-900/10 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#33415515_1px,transparent_1px),linear-gradient(to_bottom,#33415515_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-4xl flex-col items-center px-4 py-8 sm:px-6 lg:py-12">
        {/* ── Top Bar: Health Pill, Theme Toggle, and Quick Playground Link ── */}
        <div className="mb-6 flex w-full items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 dark:bg-slate-900/90 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 shadow-xs backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gemini 3.6 Flash Active</span>
            <span className="h-1 w-1 rounded-full bg-emerald-300 dark:bg-emerald-600" />
            <span className="font-normal text-slate-500 dark:text-slate-400">Zero-Quota Caching</span>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={() => setViewMode("playground")}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:bg-white dark:hover:bg-slate-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              <span>Open Playground</span>
              <ArrowRight className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* ── Hero header ── */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            DSA <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 dark:from-blue-400 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent">Playground</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Turn any raw DSA problem statement into an interactive coding playground with driver wrappers, hidden tests, and Big-O complexity analysis.
          </p>
        </div>

        {/* ── Quick Challenge Cards Gallery ── */}
        <div className="mb-6 w-full">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
              Instant Start Challenges (0 API Quota Used)
            </span>
            <span className="text-[11px] text-slate-400">Click to load or test instantly</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.label}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-[#263244] bg-white/85 dark:bg-[#111827]/90 p-3.5 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-[#172033] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {ex.label}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.2 text-[10px] font-bold uppercase ${
                        ex.difficulty === "Easy"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50"
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {ex.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                    <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] text-blue-700 dark:text-blue-400 font-mono font-medium">
                      {ex.timeComplexity}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => fillExample(ex)}
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer"
                  >
                    Use in Form
                  </button>
                  <button
                    onClick={() => launchInstantChallenge(ex)}
                    className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 dark:bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition-all hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-95 cursor-pointer"
                    title="Launch directly into Playground"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Launch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main form card (Elevated Surface) ── */}
        <div className="w-full rounded-3xl border border-slate-200/90 dark:border-[#263244] bg-white/95 dark:bg-[#111827]/95 p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
          {/* Problem statement */}
          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="problem-statement"
                className="text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Custom Problem Statement
                <span className="ml-1 text-rose-500">*</span>
              </label>

              {/* Textarea Quick Helpers */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-white dark:hover:bg-slate-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                >
                  <ClipboardPaste className="h-3 w-3 text-slate-400" />
                  <span>Paste Clipboard</span>
                </button>

                <button
                  type="button"
                  onClick={handleFormatText}
                  disabled={!statement.trim()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-white dark:hover:bg-slate-700 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Remove excess blank lines and whitespace"
                >
                  <Wand2 className="h-3 w-3 text-slate-400" />
                  <span>Format</span>
                </button>

                {statement.trim() && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 hover:text-rose-600 cursor-pointer"
                    title="Clear form"
                  >
                    <Trash2 className="h-3 w-3 text-slate-400" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="problem-statement"
              rows={7}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Paste any custom DSA problem statement here…

e.g. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
              className="w-full resize-none rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#0B1120] p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs transition-all duration-150 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />

            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                  statement.length >= 20
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}
              >
                {statement.length < 20
                  ? `${20 - statement.length} more characters needed`
                  : "✓ Ready for generation"}
              </span>

              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      statement.length > 7000
                        ? "bg-amber-500"
                        : statement.length >= 20
                        ? "bg-gradient-to-r from-blue-500 to-sky-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{
                      width: `${Math.min(100, (statement.length / 8000) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {statement.length} / 8000
                </span>
              </div>
            </div>
          </div>

          {/* Advanced section (examples + constraints) */}
          <div className="mb-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A]/50 p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  {showAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
                {showAdvanced ? "Hide" : "Add"} examples &amp; constraints (optional but improves accuracy)
              </span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                {showAdvanced ? "Collapse" : "Expand"}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-3.5 grid gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="examples-input"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                  >
                    Examples
                  </label>
                  <textarea
                    id="examples-input"
                    rows={5}
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    placeholder={"Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]"}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] p-3 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="constraints-input"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                  >
                    Constraints
                  </label>
                  <textarea
                    id="constraints-input"
                    rows={5}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] p-3 font-mono text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xs transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Language selector */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-[#0F172A]">
            <div>
              <label
                htmlFor="parser-language-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Starter Programming Language
              </label>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                You can switch between any of the 6 languages freely inside the IDE
              </p>
            </div>
            <div className="relative">
              <select
                id="parser-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageKey)}
                className="h-9.5 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 px-4 pr-9 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-all hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
              >
                {(
                  ["python", "cpp", "java", "javascript", "go", "rust"] as LanguageKey[]
                ).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === "cpp"
                      ? "C++"
                      : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
          </div>

          {/* Error message */}
          {parseError && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/50 p-4 shadow-xs animate-slide-down">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                  Parsing Notice
                </h4>
                <p className="mt-0.5 text-xs font-medium text-rose-700 dark:text-rose-300/90 leading-relaxed">
                  {parseError}
                </p>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            id="parse-button"
            onClick={handleParse}
            disabled={!isFormValid || isParsing}
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 bg-[length:200%_auto] py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:bg-[position:right_center] hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
          >
            {isParsing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Generating Playground &amp; Test Suite…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                <span>Generate Playground</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Loading dynamic multi-stage progress */}
          {isParsing && (
            <div className="mt-5 space-y-2 text-center animate-slide-down">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                <span>{PARSE_STEPS[parseStepIndex]}</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Powered by high-speed Gemini 3.6 Flash · Instant caching active
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Code2 className="h-3.5 w-3.5" />
          <span>Local compilation caching enabled · Hidden test cases kept secure server-side</span>
        </div>
      </div>
    </div>
  );
}
