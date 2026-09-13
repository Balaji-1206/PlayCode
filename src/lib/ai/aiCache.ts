import crypto from "crypto";
import type { CodeAnalysis } from "@/lib/schemas/analysis";
import type { ParsedProblem } from "@/lib/schemas/problem";

// ─── Cache Stores ─────────────────────────────────────────────────────────────

const analysisCache = new Map<string, { data: CodeAnalysis; timestamp: number }>();
const problemCache = new Map<string, { data: ParsedProblem; timestamp: number }>();

const MAX_CACHE_SIZE = 100;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Hash helpers ─────────────────────────────────────────────────────────────

function hashKey(content: string): string {
  return crypto.createHash("sha256").update(content.trim()).digest("hex");
}

export function getAnalysisCacheKey(code: string, language: string, problemTitle: string): string {
  // Normalize whitespace to avoid trivial misses (e.g. trailing spaces)
  const normalizedCode = code.replace(/\r\n/g, "\n").trim();
  return hashKey(`${language}:${problemTitle.toLowerCase()}:${normalizedCode}`);
}

export function getProblemCacheKey(statement: string, constraints?: string): string {
  const normalized = `${statement}\n${constraints ?? ""}`.replace(/\r\n/g, "\n").trim();
  return hashKey(normalized);
}

// ─── Analysis Cache Methods ───────────────────────────────────────────────────

export function getCachedAnalysis(key: string): CodeAnalysis | null {
  const entry = analysisCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    analysisCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedAnalysis(key: string, data: CodeAnalysis): void {
  if (analysisCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    const oldestKey = analysisCache.keys().next().value;
    if (oldestKey) analysisCache.delete(oldestKey);
  }
  analysisCache.set(key, { data, timestamp: Date.now() });
}

// ─── Problem Cache Methods ────────────────────────────────────────────────────

export function getCachedProblem(key: string): ParsedProblem | null {
  const entry = problemCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    problemCache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCachedProblem(key: string, data: ParsedProblem): void {
  if (problemCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = problemCache.keys().next().value;
    if (oldestKey) problemCache.delete(oldestKey);
  }
  problemCache.set(key, { data, timestamp: Date.now() });
}
