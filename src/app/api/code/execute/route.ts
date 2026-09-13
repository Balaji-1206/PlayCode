import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getExecutionProvider } from "@/lib/execution/judge0Provider";
import { getProblemSession, SAMPLE_TWO_SUM_SESSION } from "@/lib/serverCache";
import type { InternalLanguageKey } from "@/lib/execution/types";

// ─── Request schema ───────────────────────────────────────────────────────────

const ExecuteRequestSchema = z.object({
  code: z.string().min(1, "Code cannot be empty").max(50000, "Code is too large"),
  language: z.enum(["python", "cpp", "java", "javascript", "go", "rust"]),
  problemSessionId: z.string().uuid().nullable().optional(),
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

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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
  let session = problemSessionId ? getProblemSession(problemSessionId) : null;
  if (!session) {
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
  ).max(5);

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

// ─── Code preparation helper ──────────────────────────────────────────────────
// Ensures essential standard library headers/imports are included at the top
// for C++ and Java so classes like vector, string, stack compile properly.

function prepareCombinedCode(code: string, driverCode: string, language: string): string {
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
#include <sstream>
using namespace std;
`;
    const userCodeWithHeaders = code.includes("<iostream>") || code.includes("<vector>")
      ? code
      : `${headers}\n${code}`;
    return driverCode ? `${userCodeWithHeaders}\n\n${driverCode}` : userCodeWithHeaders;
  }

  if (language === "java") {
    const imports = `import java.util.*;
import java.io.*;
`;
    const userCodeWithImports = code.includes("import ") ? code : `${imports}\n${code}`;
    return driverCode ? `${userCodeWithImports}\n\n${driverCode}` : userCodeWithImports;
  }

  return driverCode ? `${code}\n\n${driverCode}` : code;
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
    executionTime: number;
    stderr: string;
  }> = [];

  let hasCompileError = false;
  let compileErrorMessage = "";
  let totalExecutionTime = 0;

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

      const passed = result.exitCode === 0 && outputsMatch(result.stdout, tc.expectedOutput);

      publicResults.push({
        caseIndex: i,
        status: result.timedOut ? "error" : passed ? "pass" : "fail",
        input: tc.input,
        expected: tc.expectedOutput,
        received: result.timedOut ? "Time Limit Exceeded" : safeTruncate(result.stdout, 200),
        executionTime: result.executionTime,
        stderr: result.stderr,
      });
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

  // ── 6. Execute against hidden tests (submit only) ──────────────────────────
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

    for (let i = 0; i < hiddenTests.length; i++) {
      const tc = hiddenTests[i];
      try {
        const result = await provider.execute({
          code: combinedCode,
          language,
          stdin: tc.input,
          timeoutMs: 5000,
        });

        totalExecutionTime += result.executionTime;

        const isMatch = result.exitCode === 0 && outputsMatch(result.stdout, tc.expectedOutput);
        if (isMatch) {
          hiddenPassed++;
        } else {
          // If this is the first failed hidden test case, capture it for user inspection
          if (!failedHiddenCase) {
            failedHiddenCase = {
              caseIndex: i + 1,
              input: tc.input,
              expected: tc.expectedOutput,
              received: result.timedOut
                ? "Time Limit Exceeded"
                : safeTruncate(result.stdout, 200),
              executionTime: result.executionTime,
              stderr: result.stderr,
              description: tc.description,
            };
          }
        }
      } catch (err) {
        // Provider-level error: count as failed
        if (!failedHiddenCase) {
          failedHiddenCase = {
            caseIndex: i + 1,
            input: tc.input,
            expected: tc.expectedOutput,
            received: "Execution Error",
            executionTime: 0,
            stderr: err instanceof Error ? err.message : "Execution failed",
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
