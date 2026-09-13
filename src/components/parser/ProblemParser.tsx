"use client";

import { useState } from "react";
import { Sparkles, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
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

      const data = await response.json() as { problem?: ParsedProblem; problemSessionId?: string; error?: string };

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
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col items-center bg-slate-950 px-4 py-12">
      {/* ── Hero header ── */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-2xl shadow-violet-900/60">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
          DSA Playground
        </h1>
        <p className="max-w-md text-slate-400">
          Paste any DSA problem statement and AI will instantly generate test cases,
          starter code, and a ready-to-use coding playground.
        </p>
      </div>

      {/* ── Quick examples ── */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        <span className="text-xs text-slate-500">Try an example:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={ex.label}
            onClick={() => fillExample(i)}
            className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-violet-500 hover:text-white"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* ── Main form card ── */}
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">
        {/* Problem statement */}
        <div className="mb-4">
          <label
            htmlFor="problem-statement"
            className="mb-1.5 block text-sm font-semibold text-slate-300"
          >
            Problem Statement
            <span className="ml-1 text-red-400">*</span>
          </label>
          <textarea
            id="problem-statement"
            rows={8}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Paste the problem statement here…

e.g. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
            className="
              w-full resize-none rounded-lg border border-slate-700/60
              bg-slate-800/60 p-3 text-sm text-slate-200 placeholder-slate-600
              transition-colors focus:border-violet-500 focus:outline-none
              focus:ring-1 focus:ring-violet-500
            "
          />
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className={statement.length >= 20 ? "text-emerald-400 font-medium" : "text-slate-500"}>
              {statement.length < 20
                ? `${20 - statement.length} more characters needed`
                : "✓ Minimum length reached"}
            </span>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    statement.length > 7000
                      ? "bg-amber-400"
                      : statement.length >= 20
                      ? "bg-violet-500"
                      : "bg-slate-600"
                  }`}
                  style={{ width: `${Math.min(100, (statement.length / 8000) * 100)}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                {statement.length} / 8000
              </span>
            </div>
          </div>
        </div>

        {/* Advanced section (examples + constraints) */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {showAdvanced ? "Hide" : "Add"} examples &amp; constraints (optional but improves quality)
          </button>

          {showAdvanced && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="examples-input"
                  className="mb-1.5 block text-sm font-medium text-slate-400"
                >
                  Examples
                </label>
                <textarea
                  id="examples-input"
                  rows={5}
                  value={examples}
                  onChange={(e) => setExamples(e.target.value)}
                  placeholder={"Example 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]"}
                  className="
                    w-full resize-none rounded-lg border border-slate-700/60
                    bg-slate-800/60 p-3 text-sm text-slate-200 placeholder-slate-600
                    transition-colors focus:border-violet-500 focus:outline-none
                    focus:ring-1 focus:ring-violet-500
                  "
                />
              </div>
              <div>
                <label
                  htmlFor="constraints-input"
                  className="mb-1.5 block text-sm font-medium text-slate-400"
                >
                  Constraints
                </label>
                <textarea
                  id="constraints-input"
                  rows={5}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder={"2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9"}
                  className="
                    w-full resize-none rounded-lg border border-slate-700/60
                    bg-slate-800/60 p-3 text-sm text-slate-200 placeholder-slate-600
                    transition-colors focus:border-violet-500 focus:outline-none
                    focus:ring-1 focus:ring-violet-500
                  "
                />
              </div>
            </div>
          )}
        </div>

        {/* Language selector */}
        <div className="mb-6">
          <label
            htmlFor="parser-language-select"
            className="mb-1.5 block text-sm font-medium text-slate-400"
          >
            Starter language
          </label>
          <select
            id="parser-language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageKey)}
            className="
              h-9 rounded-lg border border-slate-700/60 bg-slate-800
              px-3 text-sm text-slate-200 transition-colors
              hover:border-slate-500 focus:border-violet-500
              focus:outline-none focus:ring-1 focus:ring-violet-500
            "
          >
            {(["python", "cpp", "java", "javascript", "go", "rust"] as LanguageKey[]).map((lang) => (
              <option key={lang} value={lang} className="bg-slate-800">
                {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Error message */}
        {parseError && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-700/40 bg-red-900/20 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-300">{parseError}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          id="parse-button"
          onClick={handleParse}
          disabled={!isFormValid || isParsing}
          className="
            flex w-full items-center justify-center gap-2 rounded-xl
            bg-violet-600 py-3 text-sm font-bold text-white shadow-lg
            shadow-violet-900/40 transition-all
            hover:bg-violet-500 active:scale-[0.99]
            disabled:cursor-not-allowed disabled:opacity-50
            focus:outline-none focus:ring-2 focus:ring-violet-500
            focus:ring-offset-2 focus:ring-offset-slate-900
          "
        >
          {isParsing ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              AI is analyzing the problem…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Playground
            </>
          )}
        </button>

        {/* Info note & Direct Playground link */}
        {!isParsing && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-center text-xs text-slate-600">
              This will generate 10–15 hidden test cases, starter code in 6 languages,
              and driver code for automated execution.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Prefer testing immediately?</span>
              <button
                id="open-sample-playground"
                type="button"
                onClick={() => setViewMode("playground")}
                className="font-medium text-violet-400 underline underline-offset-4 transition-colors hover:text-violet-300"
              >
                Open Two Sum sample in Playground →
              </button>
            </div>
          </div>
        )}

        {/* Loading progress text */}
        {isParsing && (
          <div className="mt-4 space-y-1 text-center">
            <p className="text-xs text-slate-500">
              Generating structured problem metadata, test cases, and starter code…
            </p>
            <p className="text-xs text-slate-600">
              This usually takes 10–20 seconds.
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <p className="mt-8 text-xs text-slate-700">
        Powered by GPT-4o structured output · Hidden test cases never reach your browser
      </p>
    </div>
  );
}
