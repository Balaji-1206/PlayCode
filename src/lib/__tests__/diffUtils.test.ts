import test from "node:test";
import assert from "node:assert/strict";
import {
  tokenize,
  computeTokenDiff,
  detectWhitespaceMismatch,
  getExecutionSpeedTier,
  calculateLatencyStats,
  visualizeWhitespace,
} from "../diffUtils";

test("Tokenize: splits strings into identifiable tokens and whitespace", () => {
  const tokens = tokenize("[0, 1]\n2");
  assert.deepEqual(tokens, ["[", "0", ",", " ", "1", "]", "\n", "2"]);
});

test("Token Diff: identifies identical outputs as all equal", () => {
  const diff = computeTokenDiff("[0, 1]", "[0, 1]");
  assert.ok(diff.length > 0);
  assert.ok(diff.every((t) => t.type === "equal"));
  assert.equal(diff.map((t) => t.value).join(""), "[0, 1]");
});

test("Token Diff: identifies mismatches with removed (expected) and added (received) tokens", () => {
  const diff = computeTokenDiff("[0, 1]", "[0, 2]");
  // Expect removed "1" and added "2"
  const removed = diff.find((t) => t.type === "removed");
  const added = diff.find((t) => t.type === "added");
  assert.ok(removed, "Must have removed token for expected difference");
  assert.ok(added, "Must have added token for received difference");
  assert.equal(removed?.value, "1");
  assert.equal(added?.value, "2");
});

test("Whitespace Mismatch: accurately detects line ending differences (CRLF vs LF)", () => {
  const result = detectWhitespaceMismatch("hello\nworld", "hello\r\nworld");
  assert.equal(result.isMismatch, true);
  assert.ok(result.reason?.includes("Line ending"));
});

test("Whitespace Mismatch: accurately detects trailing spaces differences", () => {
  const result = detectWhitespaceMismatch("output ", "output");
  assert.equal(result.isMismatch, true);
  assert.ok(result.reason?.includes("whitespace"));
});

test("Whitespace Mismatch: returns false when content differs substantively", () => {
  const result = detectWhitespaceMismatch("42", "43");
  assert.equal(result.isMismatch, false);
});

test("Execution Speed Tier: classifies latencies accurately against budget", () => {
  const blazing = getExecutionSpeedTier(15, 2000);
  assert.equal(blazing.tier, "blazing");
  assert.ok(blazing.label.includes("Blazing"));

  const optimal = getExecutionSpeedTier(120, 2000);
  assert.equal(optimal.tier, "optimal");

  const moderate = getExecutionSpeedTier(450, 2000);
  assert.equal(moderate.tier, "moderate");

  const nearTle = getExecutionSpeedTier(1800, 2000);
  assert.equal(nearTle.tier, "near_tle");
  assert.ok(nearTle.percentOfBudget >= 90);
});

test("Latency Stats: calculates min, max, avg, and total execution times accurately", () => {
  const stats = calculateLatencyStats([
    { executionTime: 10 },
    { executionTime: 30 },
    { executionTime: 20 },
    { executionTime: undefined },
  ]);

  assert.equal(stats.min, 10);
  assert.equal(stats.max, 30);
  assert.equal(stats.avg, 20);
  assert.equal(stats.total, 60);
});

test("Whitespace Visualizer: reveals invisible spaces, tabs, and newlines", () => {
  const visual = visualizeWhitespace("hello world\t\n");
  assert.ok(visual.includes("·")); // space
  assert.ok(visual.includes("→")); // tab
  assert.ok(visual.includes("↵")); // newline
});
