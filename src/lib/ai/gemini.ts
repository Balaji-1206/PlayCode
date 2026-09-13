import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParsedProblemSchema, type ParsedProblem } from "@/lib/schemas/problem";
import { CodeAnalysisSchema, type CodeAnalysis } from "@/lib/schemas/analysis";
import {
  getCachedAnalysis,
  setCachedAnalysis,
  getCachedProblem,
  setCachedProblem,
  getProblemCacheKey,
} from "./aiCache";

// ─── Gemini Client ─────────────────────────────────────────────────────────────

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") return null;
  return key;
}

export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Determine the preferred AI provider:
 * 1. AI_PROVIDER env var if explicitly set ("gemini" | "openai")
 * 2. If GEMINI_API_KEY is present -> "gemini"
 * 3. Default -> "openai"
 */
export function getActiveAiProvider(): "gemini" | "openai" {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "gemini" || explicit === "openai") return explicit;
  if (isGeminiConfigured()) return "gemini";
  return "openai";
}

/**
 * Sanitizes JSON strings returned by LLMs:
 * 1. Strips markdown fences (```json ... ```)
 * 2. Escapes unescaped control characters (ASCII 0x00 to 0x1F, like raw \n, \r, \t)
 *    inside string literals, which cause:
 *    "SyntaxError: Bad control character in string literal in JSON at position ..."
 * 3. Removes illegal trailing commas before } or ].
 */
export function sanitizeJsonString(raw: string): string {
  let cleaned = raw.trim();

  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Character-by-character scanner to escape control characters within strings
  let out = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    const code = cleaned.charCodeAt(i);

    if (inString) {
      if (isEscaped) {
        // Current character is preceded by a backslash
        out += ch;
        isEscaped = false;
      } else if (ch === "\\") {
        out += ch;
        isEscaped = true;
      } else if (ch === '"') {
        out += ch;
        inString = false;
      } else if (code < 32) {
        // Control character inside a string literal! Must be escaped for valid JSON.
        switch (ch) {
          case "\n":
            out += "\\n";
            break;
          case "\r":
            out += "\\r";
            break;
          case "\t":
            out += "\\t";
            break;
          case "\b":
            out += "\\b";
            break;
          case "\f":
            out += "\\f";
            break;
          default:
            out += "\\u" + code.toString(16).padStart(4, "0");
            break;
        }
      } else {
        out += ch;
      }
    } else {
      if (ch === '"') {
        inString = true;
      }
      out += ch;
    }
  }

  // Remove trailing commas before closing braces or brackets: , } or , ]
  out = out.replace(/,\s*([\]}])/g, "$1");

  return out;
}

export function safeJsonParse<T>(raw: string): T {
  const sanitized = sanitizeJsonString(raw);
  try {
    return JSON.parse(sanitized) as T;
  } catch (firstErr) {
    // Attempt extracting between first '{' and last '}'
    const firstBrace = sanitized.indexOf("{");
    const lastBrace = sanitized.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const slice = sanitized.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(slice) as T;
      } catch {
        // ignore and continue
      }
    }
    throw firstErr;
  }
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// ─── Problem Parsing with Gemini ──────────────────────────────────────────────

export async function parseProblemWithGemini(
  systemPrompt: string,
  userMessage: string
): Promise<ParsedProblem> {
  const cacheKey = getProblemCacheKey(userMessage);
  const cached = getCachedProblem(cacheKey);
  if (cached) {
    console.log("Serving problem parse from in-memory cache (0 API calls)");
    return cached;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `${systemPrompt}

You MUST output ONLY valid JSON matching this exact structure:
{
  "title": "Problem Title",
  "description": "Full problem description",
  "difficulty": "Easy" | "Medium" | "Hard",
  "tags": ["Tag1", "Tag2"],
  "constraints": ["1 <= nums.length <= 10^4"],
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "functionSignature": {
    "functionName": "camelCaseName",
    "parameters": [{ "name": "nums", "type": "int[]", "description": "..." }],
    "returnType": "int[]",
    "returnDescription": "..."
  },
  "starterCode": {
    "python": "def func(): ...",
    "cpp": "class Solution { ... };",
    "java": "class Solution { ... }",
    "javascript": "function func() { ... }",
    "go": "func func() { ... }",
    "rust": "impl Solution { ... }"
  },
  "driverCode": {
    "python": "driver code reading stdin and printing result",
    "cpp": "driver code reading stdin and printing result",
    "java": "driver code reading stdin and printing result",
    "javascript": "driver code reading stdin and printing result",
    "go": "driver code reading stdin and printing result",
    "rust": "driver code reading stdin and printing result"
  },
  "testCases": {
    "public": [
      { "input": "...", "expectedOutput": "...", "description": "...", "category": "normal" }
    ],
    "hidden": [
      { "input": "...", "expectedOutput": "...", "description": "...", "category": "normal" }
    ]
  },
  "timeComplexityHint": "O(n)",
  "spaceComplexityHint": "O(n)"
}

${userMessage}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = safeJsonParse<unknown>(text);

  const validated = ParsedProblemSchema.safeParse(raw);
  if (!validated.success) {
    console.error("Gemini parse failed schema validation:", validated.error);
    throw new Error("AI generated problem structure did not match required schema.");
  }

  setCachedProblem(cacheKey, validated.data);
  return validated.data;
}

// ─── Code Analysis with Gemini ────────────────────────────────────────────────

export async function analyzeCodeWithGemini(
  systemPrompt: string,
  userMessage: string,
  cacheKey?: string
): Promise<CodeAnalysis> {
  if (cacheKey) {
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      console.log("Serving code analysis from in-memory cache (0 API calls)");
      return cached;
    }
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const prompt = `${systemPrompt}

You MUST output ONLY valid JSON matching this exact structure:
{
  "approach": "Detailed description of the algorithmic approach",
  "timeComplexity": {
    "best": "O(1)",
    "average": "O(n)",
    "worst": "O(n)",
    "explanation": "Clear explanation of time complexity",
    "dominantOperations": ["Single pass array scan: O(n)", "Hash table lookup: O(1) avg"],
    "complexityRank": 3
  },
  "spaceComplexity": {
    "value": "O(n)",
    "auxiliary": "O(n)",
    "isAuxiliary": true,
    "explanation": "Clear explanation of auxiliary memory",
    "allocatedStructures": ["Hash map storing up to n elements: O(n)"]
  },
  "isOptimal": true,
  "optimalComplexity": "O(n)",
  "optimalSpaceComplexity": "O(1)",
  "qualityScore": 9,
  "strengths": ["Optimal O(n) time complexity using hash map", "Single-pass algorithm"],
  "bottlenecks": [],
  "optimizationSuggestions": [],
  "overallVerdict": "1-2 sentences summarizing the solution",
  "languageSpecificFeedback": "Feedback for the specific language"
}

${userMessage}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const raw = safeJsonParse<Record<string, unknown>>(text);

  // Normalize / fallback for missing fields if Gemini emits slight variations
  if (raw && typeof raw === "object") {
    if (raw.spaceComplexity && typeof raw.spaceComplexity === "object") {
      const sc = raw.spaceComplexity as Record<string, unknown>;
      if (!sc.value && sc.auxiliary) sc.value = sc.auxiliary;
      if (sc.isAuxiliary === undefined) sc.isAuxiliary = true;
      if (!sc.auxiliary && sc.value) sc.auxiliary = sc.value;
      if (!sc.allocatedStructures) sc.allocatedStructures = [];
    }
    if (raw.timeComplexity && typeof raw.timeComplexity === "object") {
      const tc = raw.timeComplexity as Record<string, unknown>;
      if (!tc.dominantOperations) tc.dominantOperations = [];
      if (!tc.complexityRank) {
        const avg = String(tc.average || tc.worst || "");
        if (avg.includes("1")) tc.complexityRank = 1;
        else if (avg.includes("log")) tc.complexityRank = 2;
        else if (avg.includes("n²") || avg.includes("n^2")) tc.complexityRank = 5;
        else if (avg.includes("n log n")) tc.complexityRank = 4;
        else if (avg.includes("n")) tc.complexityRank = 3;
        else tc.complexityRank = 3;
      }
    }
    if (!raw.optimalSpaceComplexity) raw.optimalSpaceComplexity = "O(1)";
  }

  const validated = CodeAnalysisSchema.safeParse(raw);
  if (!validated.success) {
    console.error("Gemini analysis failed schema validation:", validated.error);
    throw new Error("AI analysis structure did not match required schema.");
  }

  if (cacheKey) {
    setCachedAnalysis(cacheKey, validated.data);
  }

  return validated.data;
}
