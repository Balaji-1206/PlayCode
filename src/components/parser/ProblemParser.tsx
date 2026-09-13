"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, ChevronDown, ChevronUp, Code2, ArrowRight } from "lucide-react";
import { usePlaygroundStore } from "@/stores/playgroundStore";
import type { LanguageKey } from "@/types";
import type { ParsedProblem } from "@/lib/schemas/problem";

// ─── Example problems the user can click to auto-fill ─────────────────────────

const EXAMPLES = [
  {
    label: "Two Sum",
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

  const isFormValid = statement.trim().length >= 20;

  // ── Auto-fill from example ───────────────────────────────────────────────

  const fillExample = (index: number) => {
    const ex = EXAMPLES[index];
    setStatement(ex.statement);
    setExamples(ex.examples);
    setConstraints(ex.constraints);
    setParseError(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleParse = async () => {
    if (!isFormValid || isParsing) return;

    setIsParsing(true);
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

      if (!data.problem) {
        throw new Error("Server returned an empty problem. Please try again.");
      }

      if (!data.problemSessionId) {
        throw new Error("Server did not return a session ID. Please try again.");
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
    <div className="relative h-screen overflow-y-auto bg-gradient-to-b from-slate-50 via-[#f8fafc] to-slate-100 text-slate-800 antialiased selection:bg-indigo-500/20 selection:text-indigo-900">
      {/* ── Radiant ambient light mesh ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-sky-200/40 blur-[90px]" />
        <div className="absolute top-96 -left-32 h-[380px] w-[420px] rounded-full bg-indigo-100/40 blur-[80px]" />
        <div className="absolute top-[500px] -right-32 h-[380px] w-[420px] rounded-full bg-sky-100/50 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f015_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f015_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-4xl flex-col items-center px-4 py-12 sm:px-6 lg:py-16">
        {/* ── Top Pill Badge ── */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
          <span>Next-Gen AI Coding Environment</span>
          <span className="h-1 w-1 rounded-full bg-indigo-300" />
          <span className="font-semibold text-slate-600">Free Tier Ready</span>
        </div>

        {/* ── Hero header ── */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            DSA <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">Playground</span>
          </h1>
          <p className="mx-auto max-w-xl text-base text-slate-600 sm:text-lg">
            Paste any raw problem statement. Our AI instantly scaffolds test cases, starter code, drivers, and an interactive browser execution IDE.
          </p>
        </div>

        {/* ── Quick examples ── */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Try an example:
          </span>
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex.label}
              onClick={() => fillExample(i)}
              className="rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-1 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:text-indigo-600 hover:shadow-md active:translate-y-0"
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* ── Main form card (Elevated Glassmorphism) ── */}
        <div className="w-full rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
          {/* Problem statement */}
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="problem-statement"
                className="text-sm font-bold text-slate-800"
              >
                Problem Statement
                <span className="ml-1 text-rose-500">*</span>
              </label>
              <span className="text-xs text-slate-400">
                Markdown & code syntax supported
              </span>
            </div>
            <textarea
              id="problem-statement"
              rows={8}
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Paste the problem statement here…

e.g. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
              className="w-full resize-none rounded-2xl border border-slate-200/90 bg-white p-4 text-sm leading-relaxed text-slate-800 placeholder-slate-400 shadow-xs transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-colors ${
                  statement.length >= 20
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {statement.length < 20
                  ? `${20 - statement.length} more characters needed`
                  : "✓ Minimum length reached"}
              </span>
              <div className="flex items-center gap-2.5 text-slate-500">
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ${
                      statement.length > 7000
                        ? "bg-amber-500"
                        : statement.length >= 20
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                        : "bg-slate-300"
                    }`}
                    style={{
                      width: `${Math.min(100, (statement.length / 8000) * 100)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] font-medium text-slate-400">
                  {statement.length} / 8000
                </span>
              </div>
            </div>
          </div>

          {/* Advanced section (examples + constraints) */}
          <div className="mb-5 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex w-full items-center justify-between text-xs font-semibold text-slate-700 transition-colors hover:text-indigo-600"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500">
                  {showAdvanced ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
                {showAdvanced ? "Hide" : "Add"} examples &amp; constraints (optional but improves precision)
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {showAdvanced ? "Collapse" : "Expand"}
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-3.5 grid gap-4 pt-3 border-t border-slate-200/60 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="examples-input"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Examples
                  </label>
                  <textarea
                    id="examples-input"
                    rows={5}
                    value={examples}
                    onChange={(e) => setExamples(e.target.value)}
                    placeholder={"Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]"}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 placeholder-slate-400 shadow-xs transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
                <div>
                  <label
                    htmlFor="constraints-input"
                    className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
                  >
                    Constraints
                  </label>
                  <textarea
                    id="constraints-input"
                    rows={5}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 placeholder-slate-400 shadow-xs transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Language selector */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/70 bg-white">
            <div>
              <label
                htmlFor="parser-language-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Target Starter Language
              </label>
              <p className="text-[11px] text-slate-400">
                You can still switch between all 6 languages at any time in the playground
              </p>
            </div>
            <div className="relative">
              <select
                id="parser-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageKey)}
                className="h-9.5 appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 pr-9 text-xs font-semibold text-slate-800 shadow-xs transition-all hover:bg-white hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer"
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
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Error message */}
          {parseError && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs animate-slide-down">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
              <div className="flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Parsing Notice
                </h4>
                <p className="mt-0.5 text-xs font-medium text-rose-700 leading-relaxed">
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
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:bg-[position:right_center] hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer"
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

          {/* Info note & Direct Playground link */}
          {!isParsing && (
            <div className="mt-5 flex flex-col items-center gap-2.5 pt-4 border-t border-slate-100">
              <p className="text-center text-xs text-slate-500">
                Generates 10–15 automated hidden test cases, multi-language starter code, and driver wrappers.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Prefer testing immediately without AI?</span>
                <button
                  id="open-sample-playground"
                  type="button"
                  onClick={() => setViewMode("playground")}
                  className="font-semibold text-indigo-600 underline underline-offset-4 transition-colors hover:text-indigo-700"
                >
                  Open Two Sum sample in Playground →
                </button>
              </div>
            </div>
          )}

          {/* Loading progress text */}
          {isParsing && (
            <div className="mt-5 space-y-1.5 text-center">
              <p className="text-xs font-semibold text-indigo-600">
                Structuring problem metadata, hidden boundary cases, and compiler drivers…
              </p>
              <p className="text-[11px] text-slate-400">
                Powered by high-speed Gemini Flash · Usually takes ~5–10 seconds.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Code2 className="h-3.5 w-3.5" />
          <span>Local compilation caching enabled · Hidden test cases kept secure server-side</span>
        </div>
      </div>
    </div>
  );
}
