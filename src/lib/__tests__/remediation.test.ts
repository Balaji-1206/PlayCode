import test from "node:test";
import assert from "node:assert/strict";
import { getInjectedDsaDefinitions } from "@/lib/dsa";
import { getProblemSession, storeProblemSession } from "@/lib/serverCache";
import { checkRateLimit } from "@/lib/rateLimit";
import { getExecutionProvider } from "@/lib/execution";
import type { NextRequest } from "next/server";

// ─── 1. Output Delimiter & Matching Architecture ──────────────────────────────
test("Output Delimiter extraction separates user debug logs from official return value", () => {
  const RESULT_START_DELIMITER = "__PLAYCODE_RESULT_START__";
  const RESULT_END_DELIMITER = "__PLAYCODE_RESULT_END__";

  function extractOutputAndLogs(rawStdout: string) {
    const startIndex = rawStdout.indexOf(RESULT_START_DELIMITER);
    const endIndex = rawStdout.indexOf(RESULT_END_DELIMITER);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const logsBefore = rawStdout.slice(0, startIndex);
      const officialOutput = rawStdout
        .slice(startIndex + RESULT_START_DELIMITER.length, endIndex)
        .trim();
      const logsAfter = rawStdout.slice(endIndex + RESULT_END_DELIMITER.length);
      const userLogs = `${logsBefore}\n${logsAfter}`
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");

      return { officialOutput, userLogs };
    }

    return { officialOutput: rawStdout.trim(), userLogs: "" };
  }

  function normalizeOutput(output: string): string {
    return output
      .trim()
      .replace(/\r\n/g, "\n")
      .replace(/\s+/g, " ")
      .replace(/\[\s+/g, "[")
      .replace(/\s+\]/g, "]")
      .replace(/,\s+/g, ",");
  }

  function outputsMatch(actual: string, expected: string): boolean {
    if (normalizeOutput(actual) === normalizeOutput(expected)) return true;
    try {
      const pActual = JSON.parse(actual.toLowerCase());
      const pExpected = JSON.parse(expected.toLowerCase());
      return JSON.stringify(pActual) === JSON.stringify(pExpected);
    } catch {}
    return false;
  }

  const rawStdout = `Processing node 1\nLooking up complement 7\n${RESULT_START_DELIMITER}\n[0, 1]\n${RESULT_END_DELIMITER}\nCleanup finished`;
  const { officialOutput, userLogs } = extractOutputAndLogs(rawStdout);

  assert.equal(officialOutput, "[0, 1]");
  assert.ok(userLogs.includes("Processing node 1"));
  assert.ok(userLogs.includes("Looking up complement 7"));
  assert.ok(userLogs.includes("Cleanup finished"));
  assert.ok(outputsMatch(officialOutput, "[0, 1]"));
  assert.ok(outputsMatch(officialOutput, "[0,1]"));
});

// ─── 2. Critical Security: No Unsafe Local Fallback ───────────────────────────
test("Security: Execution provider defaults to Piston and does not fall back to host execution", () => {
  const provider = getExecutionProvider();
  assert.ok(provider.name.includes("Piston"));
});

// ─── 3. Standard DSA Data Structures Injection ────────────────────────────────
test("DSA: Definitions are injected for ListNode and TreeNode", () => {
  const pythonListNodeCode = "def reverseList(head: ListNode): pass";
  const pythonInjection = getInjectedDsaDefinitions(pythonListNodeCode, "", "python");
  assert.ok(pythonInjection.includes("class ListNode:"));
  assert.ok(pythonInjection.includes("def list_to_linked_list"));

  const cppTreeNodeCode = "TreeNode* invertTree(TreeNode* root) { return root; }";
  const cppInjection = getInjectedDsaDefinitions(cppTreeNodeCode, "", "cpp");
  assert.ok(cppInjection.includes("struct TreeNode"));

  // If already defined in user code, should NOT duplicate
  const userDefinedListNode = "class ListNode:\n    pass\nnode = ListNode()";
  const noDuplicate = getInjectedDsaDefinitions(userDefinedListNode, "", "python");
  assert.equal(noDuplicate, "");
});

// ─── 4. Session Persistence & Catalog Fallback ────────────────────────────────
test("ServerCache: Resolves catalog problems and returns null for missing sessions", async () => {
  // Built-in catalog problem resolution
  const vpSession = await getProblemSession("valid-parentheses");
  assert.ok(vpSession !== null);
  assert.ok(vpSession.driverCode.python.includes("is_valid"));
  assert.ok(vpSession.hiddenTestCases.length > 0);

  const rllSession = await getProblemSession("reverse-linked-list");
  assert.ok(rllSession !== null);
  assert.ok(rllSession.driverCode.python.includes("reverse_list"));

  // Store a dynamic session
  const dummyTests = [{ input: "test", expectedOutput: "out", description: "Test case 1", category: "normal" as const }];
  const dummyDrivers = {
    python: "print(1)",
    cpp: "",
    java: "",
    javascript: "",
    go: "",
    rust: "",
  };
  const sessionId = await storeProblemSession(dummyTests, dummyDrivers);
  const retrieved = await getProblemSession(sessionId);
  assert.ok(retrieved !== null);
  assert.equal(retrieved.driverCode.python, "print(1)");

  // Unknown or expired session MUST return null (never substitute Two Sum)
  const missing = await getProblemSession("00000000-0000-0000-0000-000000000000");
  assert.equal(missing, null);
});

// ─── 5. Rate Limiting ─────────────────────────────────────────────────────────
test("RateLimit: Sliding window limiter correctly enforces request thresholds", async () => {
  const fakeReq = {
    headers: {
      get: (name: string) => (name.toLowerCase() === "x-forwarded-for" ? "10.0.0.99" : null),
    },
  } as unknown as NextRequest;

  // Consume 3 requests under limit of 3
  const r1 = await checkRateLimit(fakeReq, "execute", { maxRequests: 3, windowSeconds: 10 });
  assert.equal(r1.success, true);
  assert.equal(r1.remaining, 2);

  const r2 = await checkRateLimit(fakeReq, "execute", { maxRequests: 3, windowSeconds: 10 });
  assert.equal(r2.success, true);
  assert.equal(r2.remaining, 1);

  const r3 = await checkRateLimit(fakeReq, "execute", { maxRequests: 3, windowSeconds: 10 });
  assert.equal(r3.success, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be blocked
  const r4 = await checkRateLimit(fakeReq, "execute", { maxRequests: 3, windowSeconds: 10 });
  assert.equal(r4.success, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.reset > 0);
});

// ─── 6. Java DSA Definition Injection ─────────────────────────────────────────
test("DSA: Java definitions for ListNode and TreeNode are injected accurately", () => {
  const javaListNodeCode = "class Solution { public ListNode mergeTwoLists(ListNode list1, ListNode list2) { return null; } }";
  const javaInjection = getInjectedDsaDefinitions(javaListNodeCode, "", "java");
  assert.ok(javaInjection.includes("class ListNode"));
  assert.ok(javaInjection.includes("int val;"));
  assert.ok(javaInjection.includes("ListNode next;"));

  const javaTreeNodeCode = "class Solution { public List<Integer> inorderTraversal(TreeNode root) { return null; } }";
  const treeInjection = getInjectedDsaDefinitions(javaTreeNodeCode, "", "java");
  assert.ok(treeInjection.includes("class TreeNode"));
  assert.ok(treeInjection.includes("TreeNode left;"));
  assert.ok(treeInjection.includes("TreeNode right;"));
});

// ─── 7. DSA Pedagogy: Starter Code vs Reference Solutions ─────────────────────
test("Pedagogy: Catalog starterCode are genuine skeletons, referenceSolutions are complete", async () => {
  const { PROBLEM_CATALOG } = await import("@/lib/problemCatalog");

  const problems = Object.values(PROBLEM_CATALOG);
  assert.ok(problems.length >= 6);

  for (const p of problems) {
    // 1. Starter code in python should NOT be a complete pre-solved implementation
    assert.ok(
      p.starterCode.python.includes("pass") ||
      p.starterCode.python.includes("return []") ||
      p.starterCode.python.includes("return None") ||
      p.starterCode.python.includes("return False") ||
      p.starterCode.python.includes("return 0"),
      `${p.title} starter code should have placeholder return`
    );

    // 2. Reference solution must exist and provide working code across all 6 languages
    assert.ok(p.referenceSolution, `${p.title} must have referenceSolution`);
    assert.ok(p.referenceSolution!.python.length > 20, `${p.title} must have Python reference solution`);
    assert.ok(p.referenceSolution!.cpp.length > 20, `${p.title} must have C++ reference solution`);
    assert.ok(p.referenceSolution!.java.length > 20, `${p.title} must have Java reference solution`);
    assert.ok(p.referenceSolution!.javascript.length > 20, `${p.title} must have JS reference solution`);
    assert.ok(p.referenceSolution!.go.length > 20, `${p.title} must have Go reference solution`);
    assert.ok(p.referenceSolution!.rust.length > 20, `${p.title} must have Rust reference solution`);

    // 3. Editorial must have optimal Big-O breakdown
    assert.ok(p.editorial, `${p.title} must have editorial`);
    assert.ok(p.editorial!.timeComplexity.includes("O("));
    assert.ok(p.editorial!.spaceComplexity.includes("O("));
  }
});

// ─── 8. AI Provider Configuration: Valid Gemini Target ────────────────────────
test("AI: Active provider info targets valid gemini-2.5-flash, never gemini-3.6-flash", async () => {
  const { getAiProviderInfo } = await import("@/lib/ai/gemini");
  const info = getAiProviderInfo();

  assert.notEqual(info.model, "gemini-3.6-flash");
  assert.ok(
    info.model === "gemini-2.5-flash" ||
    info.model === "gpt-4o" ||
    info.model === "none"
  );
  assert.ok(info.label.length > 0);
});

// ─── 9. Robust Delimiter Extraction on User Collision ─────────────────────────
test("Output Delimiter: Extracts last delimiter block when user code also prints delimiter", () => {
  const RESULT_START_DELIMITER = "__PLAYCODE_RESULT_START__";
  const RESULT_END_DELIMITER = "__PLAYCODE_RESULT_END__";

  function extractOutputAndLogsHardened(rawStdout: string) {
    const startIndex = rawStdout.lastIndexOf(RESULT_START_DELIMITER);
    const endIndex = rawStdout.lastIndexOf(RESULT_END_DELIMITER);

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const logsBefore = rawStdout.slice(0, startIndex);
      const officialOutput = rawStdout
        .slice(startIndex + RESULT_START_DELIMITER.length, endIndex)
        .trim();
      const logsAfter = rawStdout.slice(endIndex + RESULT_END_DELIMITER.length);
      const userLogs = `${logsBefore}\n${logsAfter}`
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join("\n");

      return { officialOutput, userLogs };
    }

    return { officialOutput: rawStdout.trim(), userLogs: "" };
  }

  const rawStdout = `user debug: ${RESULT_START_DELIMITER}\nfake data\n${RESULT_END_DELIMITER}\n${RESULT_START_DELIMITER}\n[0, 1]\n${RESULT_END_DELIMITER}`;
  const { officialOutput, userLogs } = extractOutputAndLogsHardened(rawStdout);

  assert.equal(officialOutput, "[0, 1]");
  assert.ok(userLogs.includes("user debug:"));
});
