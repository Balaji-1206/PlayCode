import { randomUUID } from "crypto";
import type { TestCase } from "@/lib/schemas/problem";
import type { InternalLanguageKey } from "@/lib/execution/types";

// ─── Server-side cache ────────────────────────────────────────────────────────
// Stores hidden test cases and driver code server-side so they NEVER reach
// the browser. Keyed by a random UUID (problemSessionId) generated at parse time.
//
// ⚠ This is an in-memory Map — it resets when the Next.js process restarts.
// In production (Step 5+), replace with Redis or a database table.
//
// The Map is declared at module scope, outside of any request handler.
// Next.js keeps modules in memory across requests in the same process.

interface CachedProblemSession {
  hiddenTestCases: TestCase[];
  driverCode: Record<InternalLanguageKey, string>;
  createdAt: number;
}

const problemSessionCache = new Map<string, CachedProblemSession>();

// Evict sessions older than 2 hours to prevent unbounded memory growth.
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

function evictExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of problemSessionCache.entries()) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      problemSessionCache.delete(id);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Store a problem session's hidden tests and driver code.
 * Returns the session ID to send to the browser.
 */
export function storeProblemSession(
  hiddenTestCases: TestCase[],
  driverCode: Record<InternalLanguageKey, string>
): string {
  evictExpiredSessions();

  const sessionId = randomUUID();
  problemSessionCache.set(sessionId, {
    hiddenTestCases,
    driverCode,
    createdAt: Date.now(),
  });

  return sessionId;
}

/**
 * Retrieve a problem session by ID.
 * Returns null if not found or expired.
 */
export function getProblemSession(sessionId: string): CachedProblemSession | null {
  const session = problemSessionCache.get(sessionId);
  if (!session) return null;

  // Check if expired
  if (Date.now() - session.createdAt > SESSION_TTL_MS) {
    problemSessionCache.delete(sessionId);
    return null;
  }

  return session;
}
