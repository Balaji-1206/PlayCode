import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExecutionProvider } from "@/lib/execution";
import { getProblemSession, SAMPLE_TWO_SUM_SESSION, type CachedProblemSession } from "@/lib/serverCache";
import { checkRateLimit } from "@/lib/rateLimit";
import { getInjectedDsaDefinitions } from "@/lib/dsa";
import type { InternalLanguageKey } from "@/lib/execution/types";

// ─── Request schema ───────────────────────────────────────────────────────────

const ExecuteRequestSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(50000, "Code is too large"),
  language: z.enum(["python", "cpp", "java", "javascript", "go", "rust"]),
  problemSessionId: z.string().nullable().optional(),
  problemId: z.string().optional(),
  problemTitle: z.string().optional(),
  runType: z.enum(["run", "submit"]).default("run"),
});

// ─── Output comparison ────────────────────────────────────────────────────────
// Normalize whitespace before comparing to avoid false failures from
// trailing newlines or extra spaces.

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, "\n").replace(/\s+$/gm, "");
}

function compareValuesWithTolerance(valA: unknown, valB: unknown, epsilon = 1e-5): boolean {
  if (typeof valA === "number" && typeof valB === "number") {
    return Math.abs(valA - valB) <= epsilon;
  }
  if (Array.isArray(valA) && Array.isArray(valB)) {
    if (valA.length !== valB.length) return false;
    return valA.every((item, idx) => compareValuesWithTolerance(item, valB[idx], epsilon));
  }
  if (valA && valB && typeof valA === "object" && typeof valB === "object") {
    const keysA = Object.keys(valA).sort();
    const keysB = Object.keys(valB).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) =>
      compareValuesWithTolerance(
        (valA as Record<string, unknown>)[k],
        (valB as Record<string, unknown>)[k],
        epsilon
      )
    );
  }
  return String(valA).trim().toLowerCase() === String(valB).trim().toLowerCase();
}

function outputsMatch(actual: string, expected: string): boolean {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  if (normActual === normExpected) return true;

  // Case-insensitive boolean comparison: "True" == "true", "False" == "false"
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  // Compact whitespace comparison: "[0, 1]" == "[0,1]"
  const compactActual = normActual.replace(/\s+/g, "");
  const compactExpected = normExpected.replace(/\s+/g, "");
  if (compactActual === compactExpected) return true;

  // Single number / floating point comparison with 1e-5 epsilon tolerance
  const numActual = Number(normActual);
  const numExpected = Number(normExpected);
  if (!Number.isNaN(numActual) && !Number.isNaN(numExpected)) {
    return Math.abs(numActual - numExpected) <= 1e-5;
  }

  // Deep JSON numeric / array comparison (e.g. [6.00000, 0.50000] vs [6.0, 0.5])
  try {
    const jsonActual = JSON.parse(normActual);
    const jsonExpected = JSON.parse(normExpected);
    if (compareValuesWithTolerance(jsonActual, jsonExpected)) return true;
  } catch {
    // Non-JSON format, continue
  }

  return false;
}

// ─── Safe output for error display ────────────────────────────────────────────
// Truncates long outputs so we don't accidentally reveal hidden test secrets
// through a very long "expected" value shown in the UI.

function safeTruncate(value: string, maxLen = 120): string {
  const normalized = normalizeOutput(value);
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen) + "…";
}

// ─── Delimiter constants for separating user stdout from official return value ─
export const RESULT_START_DELIMITER = "__PLAYCODE_RESULT_START__";
export const RESULT_END_DELIMITER = "__PLAYCODE_RESULT_END__";

export function extractOutputAndLogs(rawStdout: string, expectedOutput?: string): {
  officialOutput: string;
  userLogs: string;
} {
  const startIndex = rawStdout.lastIndexOf(RESULT_START_DELIMITER);
  if (startIndex !== -1) {
    const afterStart = startIndex + RESULT_START_DELIMITER.length;
    const endIndex = rawStdout.indexOf(RESULT_END_DELIMITER, afterStart);
    const userLogs = (
      rawStdout.substring(0, startIndex) +
      (endIndex !== -1 ? rawStdout.substring(endIndex + RESULT_END_DELIMITER.length) : "")
    ).trim();

    const officialOutput = (
      endIndex !== -1
        ? rawStdout.substring(afterStart, endIndex)
        : rawStdout.substring(afterStart)
    ).trim();

    return { officialOutput, userLogs };
  }

  // Fallback for drivers without explicit delimiters:
  // If user included print("debug") on line 1, and official output is on the last line matching expectedOutput:
  const lines = rawStdout.trim().split("\n");
  if (lines.length > 1 && expectedOutput) {
    const lastLine = lines[lines.length - 1].trim();
    if (outputsMatch(lastLine, expectedOutput)) {
      return {
        officialOutput: lastLine,
        userLogs: lines.slice(0, -1).join("\n").trim(),
      };
    }
  }

  return {
    officialOutput: rawStdout.trim(),
    userLogs: "",
  };
}

// ─── Detect user-written main / entry point ───────────────────────────────────
// If user writes their own main() (e.g. for competitive programming practice),
// we avoid appending driver code to prevent redefinition errors.

export function userCodeHasMain(code: string, language: string): boolean {
  if (language === "cpp") {
    return (
      /\b(int|void)\s+main\s*\(/.test(code) ||
      /\bmain\s*\([^)]*\)\s*\{/.test(code)
    );
  }
  if (language === "java") {
    return (
      /\bpublic\s+static\s+void\s+main\s*\(/.test(code) ||
      /\bvoid\s+main\s*\(/.test(code)
    );
  }
  if (language === "go") {
    return /\bfunc\s+main\s*\(/.test(code);
  }
  if (language === "rust") {
    return /\bfn\s+main\s*\(/.test(code);
  }
  if (language === "python") {
    return (
      /__name__\s*==\s*['"]__main__['"]/.test(code) ||
      /sys\.stdin/.test(code) ||
      /\binput\s*\(/.test(code)
    );
  }
  if (language === "javascript") {
    return /fs\.readFileSync/.test(code) || /readline/.test(code);
  }
  return false;
}

// ─── Code preparation helper ──────────────────────────────────────────────────
// Ensures essential standard library headers/imports and standard DSA structures
// (ListNode, TreeNode) are included so problems compile and execute smoothly.
// If the user provided their own main(), the driver code is omitted.

export function prepareCombinedCode(code: string, driverCode: string, language: string): string {
  const dsaDefs = getInjectedDsaDefinitions(code, driverCode, language);
  const hasUserMain = userCodeHasMain(code, language);
  const effectiveDriver = hasUserMain ? "" : driverCode;

  if (language === "cpp") {
    const headers = `#include <iostream>
#include <vector>
#include <string>
#include <stack>
#include <queue>
#include <map>
#include <set>
#include <unordered_map>
#include <unordered_set>
#include <algorithm>
#include <climits>
#include <sstream>
using namespace std;
`;
    const userCodeWithHeaders =
      code.includes("<iostream>") ||
      code.includes("<vector>") ||
      code.includes("<bits/stdc++.h>")
        ? code
        : `${headers}\n${code}`;
    const codeWithDefs = dsaDefs ? `${dsaDefs}\n${userCodeWithHeaders}` : userCodeWithHeaders;
    return effectiveDriver ? `${codeWithDefs}\n\n${effectiveDriver}` : codeWithDefs;
  }

  if (language === "java") {
    // Extract and hoist all imports to the very top of the compilation unit
    const allImports = new Set<string>();
    allImports.add("import java.util.*;");
    allImports.add("import java.io.*;");

    const stripImports = (src: string) => {
      return src.replace(/^\s*import\s+[^;]+;\s*$/gm, (match) => {
        allImports.add(match.trim());
        return "";
      });
    };

    const cleanCode = stripImports(code);
    const cleanDefs = dsaDefs ? stripImports(dsaDefs) : "";
    const cleanDriver = effectiveDriver ? stripImports(effectiveDriver) : "";

    // If driverCode has public class Main, ensure non-Main classes are package-private
    const nonPublicCode = effectiveDriver
      ? cleanCode.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, (match, className) => {
          return className === "Main" ? match : `class ${className}`;
        })
      : cleanCode;

    const importsHeader = Array.from(allImports).join("\n");
    const bodyParts = [cleanDefs, nonPublicCode, cleanDriver].filter((p) => p && p.trim().length > 0);
    return `${importsHeader}\n\n${bodyParts.join("\n\n")}`.trim();
  }

  const codeWithDefs = dsaDefs ? `${dsaDefs}\n${code}` : code;
  return effectiveDriver ? `${codeWithDefs}\n\n${effectiveDriver}` : codeWithDefs;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Rate limit check (15 requests/min) ──────────────────────────────────────
  const rateLimit = await checkRateLimit(request, "execute");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many execution requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }

  // ── 1. Validate request ────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  const parsed = ExecuteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { code, language, problemSessionId, runType } = parsed.data;
  const provider = getExecutionProvider();

  // ── 2. Resolve test cases and driver code ──────────────────────────────────
  let session: CachedProblemSession | null = null;
  const targetSessionId = problemSessionId || parsed.data.problemId;

  if (targetSessionId) {
    session = await getProblemSession(targetSessionId);
  }

  // If session not found by ID, try looking up by problem title or problemId slug
  if (!session && (parsed.data.problemTitle || parsed.data.problemId || problemSessionId)) {
    const candidateKeys = [
      parsed.data.problemId,
      problemSessionId,
      parsed.data.problemTitle?.toLowerCase().replace(/\s+/g, "-"),
    ].filter(Boolean) as string[];

    for (const key of candidateKeys) {
      const candidate = await getProblemSession(key);
      if (candidate) {
        session = candidate;
        break;
      }
    }
  }

  if (problemSessionId && !session) {
    return NextResponse.json(
      {
        error: "Problem session expired or invalid. Please re-parse the problem or select one from the Problem Directory.",
        code: "SESSION_EXPIRED",
      },
      { status: 410 }
    );
  }

  if (!session) {
    // Default session for initial interactive demo before any problem is parsed
    session = SAMPLE_TWO_SUM_SESSION;
  }

  const driverCode = session?.driverCode[language as InternalLanguageKey] ?? "";
  const hiddenTests = session?.hiddenTestCases ?? [];

  // ── 3. Determine which test cases to run ──────────────────────────────────
  // "run"    → public tests only (from client, safe to accept)
  // "submit" → hidden tests (server-side, from cache)
  //
  // We always run public tests for "run", and additionally run hidden tests
  // for "submit".

  // Public tests are passed in the request body since they are already visible
  // to the user. We limit them to prevent abuse.
  const PublicTestSchema = z.array(
    z.object({
      input: z.string().max(10000),
      expectedOutput: z.string().max(10000),
    })
  ).max(15);

  let publicTests: { input: string; expectedOutput: string }[] = [];
  const rawPublicTests = (body as Record<string, unknown>).publicTests;
  const publicValidation = PublicTestSchema.safeParse(rawPublicTests);
  if (publicValidation.success) {
    publicTests = publicValidation.data;
  }
  if (publicTests.length === 0) {
    publicTests = [
      { input: "[2,7,11,15]\n9", expectedOutput: "[0, 1]" },
      { input: "[3,2,4]\n6", expectedOutput: "[1, 2]" },
      { input: "[3,3]\n6", expectedOutput: "[0, 1]" },
    ];
  }

  // ── 4. Combine user code with driver code ─────────────────────────────────
  const combinedCode = prepareCombinedCode(code, driverCode, language);

  // ── 5. Execute against public tests ───────────────────────────────────────
  const publicResults: Array<{
    caseIndex: number;
    status: "pass" | "fail" | "error";
    input: string;            // visible to user
    expected: string;         // visible to user
    received: string;         // visible to user
    userLogs?: string;
    executionTime: number;
    stderr: string;
  }> = [];

  let hasCompileError = false;
  let compileErrorMessage = "";
  let totalExecutionTime = 0;
  let publicTimeouts = 0;

  for (let i = 0; i < publicTests.length; i++) {
    const tc = publicTests[i];

    try {
      const result = await provider.execute({
        code: combinedCode,
        language,
        stdin: tc.input,
        timeoutMs: 5000,
      });

      totalExecutionTime += result.executionTime;

      // Detect compile errors on first test case
      if (i === 0 && result.stderr && result.exitCode !== 0 && !result.stdout) {
        hasCompileError = true;
        compileErrorMessage = result.stderr;
        // Push an error result for all remaining test cases
        for (let j = 0; j < publicTests.length; j++) {
          publicResults.push({
            caseIndex: j,
            status: "error",
            input: publicTests[j].input,
            expected: publicTests[j].expectedOutput,
            received: "",
            executionTime: j === 0 ? result.executionTime : 0,
            stderr: j === 0 ? result.stderr : "",
          });
        }
        break;
      }

      if (result.timedOut) {
        publicTimeouts++;
      } else {
        publicTimeouts = 0;
      }

      const { officialOutput, userLogs } = extractOutputAndLogs(result.stdout, tc.expectedOutput);
      const passed = result.exitCode === 0 && outputsMatch(officialOutput, tc.expectedOutput);

      publicResults.push({
        caseIndex: i,
        status: result.timedOut ? "error" : passed ? "pass" : "fail",
        input: tc.input,
        expected: tc.expectedOutput,
        received: result.timedOut ? "Time Limit Exceeded" : safeTruncate(officialOutput, 200),
        userLogs: userLogs ? safeTruncate(userLogs, 500) : undefined,
        executionTime: result.executionTime,
        stderr: result.stderr,
      });

      // Fail-fast if 2 consecutive test cases hit TLE
      if (publicTimeouts >= 2) {
        break;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution provider error";
      publicResults.push({
        caseIndex: i,
        status: "error",
        input: tc.input,
        expected: tc.expectedOutput,
        received: "",
        executionTime: 0,
        stderr: message,
      });
    }
  }

  // ── 6. Execute against hidden tests (submit only) with concurrency & fail-fast ──
  let hiddenSummary: { total: number; passed: number } | null = null;
  let failedHiddenCase: {
    caseIndex: number;
    input: string;
    expected: string;
    received: string;
    executionTime?: number;
    stderr?: string;
    description?: string;
  } | null = null;

  if (runType === "submit" && hiddenTests.length > 0 && !hasCompileError) {
    let hiddenPassed = 0;
    const BATCH_SIZE = 3;
    let consecutiveTimeouts = 0;
    let abortRemaining = false;

    for (let b = 0; b < hiddenTests.length; b += BATCH_SIZE) {
      if (abortRemaining) break;
      const batch = hiddenTests.slice(b, b + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (tc, idx) => {
          const actualIndex = b + idx;
          try {
            const result = await provider.execute({
              code: combinedCode,
              language,
              stdin: tc.input,
              timeoutMs: 5000,
            });
            return { tc, index: actualIndex, result, error: null };
          } catch (err) {
            return { tc, index: actualIndex, result: null, error: err };
          }
        })
      );

      for (const item of batchResults) {
        if (!item.result) {
          if (!failedHiddenCase) {
            failedHiddenCase = {
              caseIndex: item.index + 1,
              input: item.tc.input,
              expected: item.tc.expectedOutput,
              received: "Execution Error",
              executionTime: 0,
              stderr: item.error instanceof Error ? item.error.message : "Execution failed",
              description: item.tc.description,
            };
          }
          continue;
        }

        const { result, tc, index } = item;
        totalExecutionTime += result.executionTime;

        if (result.timedOut) {
          consecutiveTimeouts++;
          if (consecutiveTimeouts >= 2) {
            abortRemaining = true;
          }
        } else {
          consecutiveTimeouts = 0;
        }

        const { officialOutput } = extractOutputAndLogs(result.stdout, tc.expectedOutput);
        const isMatch = result.exitCode === 0 && outputsMatch(officialOutput, tc.expectedOutput);
        if (isMatch) {
          hiddenPassed++;
        } else if (!failedHiddenCase) {
          failedHiddenCase = {
            caseIndex: index + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            received: result.timedOut
              ? "Time Limit Exceeded"
              : safeTruncate(officialOutput, 200),
            executionTime: result.executionTime,
            stderr: result.stderr,
            description: tc.description,
          };
        }
      }
    }

    // If public tests failed (meaning submission is wrong overall), but hidden tests passed,
    // also provide 1 hidden test case for inspection
    const publicAllPass = publicResults.every((r) => r.status === "pass");
    if (!publicAllPass && !failedHiddenCase && hiddenTests.length > 0) {
      const sampleTc = hiddenTests[0];
      failedHiddenCase = {
        caseIndex: 1,
        input: sampleTc.input,
        expected: sampleTc.expectedOutput,
        received: "Passed",
        description: sampleTc.description,
      };
    }

    hiddenSummary = {
      total: hiddenTests.length,
      passed: hiddenPassed,
    };
  }

  // ── 7. Return sanitized results ─────────────────────────────────────────────
  return NextResponse.json({
    status: hasCompileError ? "compile_error" : "success",
    publicResults,
    hiddenSummary,
    failedHiddenCase,
    executionTime: totalExecutionTime,
    // Memory usage is not available via Piston; set to 0 for now.
    memoryUsage: 0,
    stderr: compileErrorMessage,
  });
}
