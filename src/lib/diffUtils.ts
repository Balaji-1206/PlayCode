// ─── Token Diff & Telemetry Utilities ─────────────────────────────────────────

export interface DiffToken {
  type: "equal" | "added" | "removed";
  value: string;
}

/**
 * Splits text into granular tokens: numbers, identifiers, punctuation, and whitespace.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/\r\n|\n|\s+|[0-9]+|[A-Za-z_]+|[^\s\w]/g);
  return matches ?? [text];
}

/**
 * Computes a token-level LCS diff between expected output and user received output.
 * "removed" = expected token that user output missed.
 * "added" = extra/different token user output produced.
 * "equal" = matching token.
 */
export function computeTokenDiff(expected: string, received: string): DiffToken[] {
  if (expected === received) {
    return [{ type: "equal", value: expected }];
  }

  const tokensA = tokenize(expected);
  const tokensB = tokenize(received);

  const n = tokensA.length;
  const m = tokensB.length;

  // Cap LCS matrix size for very large strings (e.g. max 600 tokens)
  if (n * m > 400000) {
    return [
      { type: "removed", value: expected },
      { type: "added", value: received },
    ];
  }

  // LCS DP table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const rawDiff: DiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      rawDiff.push({ type: "equal", value: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({ type: "added", value: tokensB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({ type: "removed", value: tokensA[i - 1] });
      i--;
    }
  }

  rawDiff.reverse();

  // Merge contiguous tokens of the same type
  const merged: DiffToken[] = [];
  for (const token of rawDiff) {
    const last = merged[merged.length - 1];
    if (last && last.type === token.type) {
      last.value += token.value;
    } else {
      merged.push({ ...token });
    }
  }

  return merged;
}

/**
 * Detects if a failure is solely caused by trailing whitespace, CRLF vs LF, or spacing.
 */
export function detectWhitespaceMismatch(
  expected: string,
  received: string
): { isMismatch: boolean; reason?: string } {
  if (expected === received) {
    return { isMismatch: false };
  }

  // 1. Line ending difference (LF vs CRLF)
  const normLfExpected = expected.replace(/\r\n/g, "\n");
  const normLfReceived = received.replace(/\r\n/g, "\n");
  if (normLfExpected === normLfReceived) {
    return {
      isMismatch: true,
      reason: "Line endings mismatch (LF vs CRLF)",
    };
  }

  // 2. Trailing or leading whitespace
  if (normLfExpected.trim() === normLfReceived.trim()) {
    return {
      isMismatch: true,
      reason: "Outputs differ only by trailing or leading whitespace",
    };
  }

  // 3. Compact whitespace (internal spacing differences)
  const compactExpected = normLfExpected.replace(/\s+/g, " ").trim();
  const compactReceived = normLfReceived.replace(/\s+/g, " ").trim();
  if (compactExpected === compactReceived) {
    return {
      isMismatch: true,
      reason: "Outputs differ only by internal whitespace formatting",
    };
  }

  return { isMismatch: false };
}

// ─── Telemetry & Speed Tier ───────────────────────────────────────────────────

export interface SpeedTierInfo {
  tier: "blazing" | "optimal" | "moderate" | "slow" | "near_tle";
  label: string;
  badgeClass: string;
  percentOfBudget: number;
}

export function getExecutionSpeedTier(timeMs: number, timeoutBudgetMs = 2000): SpeedTierInfo {
  const percent = Math.min(100, Math.round((timeMs / timeoutBudgetMs) * 100));

  if (timeMs <= 50) {
    return {
      tier: "blazing",
      label: "⚡ Blazing Fast",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
      percentOfBudget: percent,
    };
  }

  if (timeMs <= 200) {
    return {
      tier: "optimal",
      label: "🟢 Optimal Speed",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
      percentOfBudget: percent,
    };
  }

  if (timeMs <= 800) {
    return {
      tier: "moderate",
      label: "🟡 Moderate Speed",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
      percentOfBudget: percent,
    };
  }

  if (percent >= 85) {
    return {
      tier: "near_tle",
      label: "⚠️ Near TLE Limit",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
      percentOfBudget: percent,
    };
  }

  return {
    tier: "slow",
    label: "🟠 Slow Execution",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
    percentOfBudget: percent,
  };
}

export interface LatencyStats {
  min: number;
  max: number;
  avg: number;
  total: number;
}

/**
 * Calculates aggregate latency metrics across an array of test cases.
 */
export function calculateLatencyStats(results: { executionTime?: number }[]): LatencyStats {
  const times = results
    .map((r) => r.executionTime)
    .filter((t): t is number => typeof t === "number" && !isNaN(t) && t >= 0);

  if (times.length === 0) {
    return { min: 0, max: 0, avg: 0, total: 0 };
  }

  const min = Math.min(...times);
  const max = Math.max(...times);
  const total = times.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round(total / times.length);

  return { min, max, avg, total };
}

/**
 * Transforms invisible whitespace characters into visible symbols for easy inspection.
 * Space -> ·
 * Tab -> → 
 * Newline -> ↵\n
 */
export function visualizeWhitespace(text: string): string {
  if (!text) return "";
  return text
    .replace(/ /g, "·")
    .replace(/\t/g, "→\t")
    .replace(/\r\n/g, "↵\r\n")
    .replace(/\n/g, "↵\n");
}
