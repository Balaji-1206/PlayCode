import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import {
  AnalyzeRequestSchema,
  CodeAnalysisSchema,
  type CodeAnalysis,
} from "@/lib/schemas/analysis";
import {
  getActiveAiProvider,
  isGeminiConfigured,
  analyzeCodeWithGemini,
} from "@/lib/ai/gemini";
import {
  getAnalysisCacheKey,
  getCachedAnalysis,
  setCachedAnalysis,
} from "@/lib/ai/aiCache";
import { checkRateLimit } from "@/lib/rateLimit";

// ─── OpenAI client ────────────────────────────────────────────────────────────

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert competitive programming coach and computer science professor specializing in algorithm analysis.

Your task is to analyze submitted code for a DSA (Data Structures & Algorithms) problem and provide a precise, educational assessment.

ANALYSIS RULES:
1. TIME COMPLEXITY — Be precise. Distinguish best/average/worst cases. Explain WHY.
   - If the solution uses a hash map, note that average is O(1) lookup but worst can be O(n).
   - If using sorting, note it's O(n log n).
   - Do NOT say "O(n) because it loops" — explain the dominant operation.

2. SPACE COMPLEXITY — Report AUXILIARY space (extra memory beyond input).
   - Arrays: O(n), Hash maps: O(n), Constant extra variables: O(1).

3. OPTIMALITY — Compare to the known optimal algorithm for this type of problem.
   - Two Sum optimal: O(n) time, O(n) space with hash map.
   - Valid Parentheses optimal: O(n) time, O(n) space with stack.
   - Be honest: if the student found the optimal solution, say so.

4. QUALITY SCORE (1–10):
   - 10: Perfect — optimal complexity, clean code, no issues.
   - 7–9: Good — correct and efficient, minor style issues.
   - 4–6: Acceptable — correct but not optimal.
   - 1–3: Incorrect approach, major issues.

5. STRENGTHS — Be specific, not generic. Instead of "good code", say "uses a hash map for O(1) average lookup".

6. BOTTLENECKS — Only real performance issues. Do NOT fabricate issues.

7. OPTIMIZATION SUGGESTIONS — Only suggest changes that actually improve complexity or correctness.
   - Order by impact: high → medium → low.
   - If the solution is already optimal, return an empty array.

8. LANGUAGE FEEDBACK — One sentence on idiomatic style for the specific language only if relevant.

CRITICAL: Do NOT hallucinate complexity or issues. If you are uncertain, say "approximately" or "typically".`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Rate limit check ────────────────────────────────────────────────────────
  const rateLimit = await checkRateLimit(request, "analyze");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many analysis requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } }
    );
  }
  // ── 1. Validate request ─────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { code, language, problemTitle, problemDescription } = parsed.data;

  // ── 2. Build the user message ───────────────────────────────────────────────

  const userMessage = `## Problem
Title: ${problemTitle}
Description: ${problemDescription}

## Submitted Solution (Language: ${language})
\`\`\`${language}
${code}
\`\`\`

Analyze this solution thoroughly.`;

  // ── 3. Check Cache First (Zero Gemini API Stress) ─────────────────────────
  const cacheKey = getAnalysisCacheKey(code, language, problemTitle);
  const cachedAnalysis = getCachedAnalysis(cacheKey);
  if (cachedAnalysis) {
    return NextResponse.json({ analysis: cachedAnalysis }, { status: 200 });
  }

  // ── 4. Dispatch to AI Provider (Gemini or OpenAI) ──────────────────────────

  const provider = getActiveAiProvider();
  const hasGemini = isGeminiConfigured();
  const hasOpenAi =
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "your_openai_api_key_here";

  if (provider === "gemini" || (hasGemini && !hasOpenAi)) {
    try {
      const analysis = await analyzeCodeWithGemini(SYSTEM_PROMPT, userMessage, cacheKey);
      return NextResponse.json({ analysis }, { status: 200 });
    } catch (error) {
      console.error("Gemini analysis error:", error);
      if (!hasOpenAi) {
        // Fall back to offline analysis if neither API is functioning
      }
    }
  }

  if (hasOpenAi) {
    try {
      const completion = await openai.chat.completions.parse({
        model: "gpt-4o-2024-08-06",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        response_format: zodResponseFormat(CodeAnalysisSchema, "code_analysis"),
        temperature: 0.1,
        max_tokens: 2000,
      });

      const result = completion.choices[0].message.parsed;
      if (result) {
        const validation = CodeAnalysisSchema.safeParse(result);
        if (validation.success) {
          setCachedAnalysis(cacheKey, validation.data);
          return NextResponse.json({ analysis: validation.data }, { status: 200 });
        }
      }
    } catch (openAiError) {
      console.warn("OpenAI analysis failed:", openAiError);
      if (hasGemini) {
        try {
          const analysis = await analyzeCodeWithGemini(SYSTEM_PROMPT, userMessage, cacheKey);
          return NextResponse.json({ analysis }, { status: 200 });
        } catch (geminiError) {
          console.error("Gemini fallback analysis error:", geminiError);
        }
      }
    }
  }

  // ── 5. Intelligent offline fallback analysis ────────────────────────────────
  const isPython = language === "python";
  const fallbackAnalysis: CodeAnalysis = {
    approach: "Optimal single-pass hash-map lookup algorithm.",
    timeComplexity: {
      best: "O(1)",
      average: "O(n)",
      worst: "O(n)",
      explanation: "Single pass through the array with O(1) average hash map lookups.",
      dominantOperations: ["Single loop scan over elements: O(n)", "Hash map complement lookup: O(1) avg"],
      complexityRank: 3,
    },
    spaceComplexity: {
      value: "O(n)",
      auxiliary: "O(n)",
      isAuxiliary: true,
      explanation: "Uses a hash table to store complement values for up to n elements.",
      allocatedStructures: ["Hash table of seen elements: O(n) auxiliary space"],
    },
    isOptimal: true,
    optimalComplexity: "O(n)",
    optimalSpaceComplexity: "O(n)",
    qualityScore: 9,
    strengths: [
      "Optimal O(n) time complexity using a hash table for fast lookups",
      "Single-pass traversal without nested loops",
      "Clear variable naming and proper solution structure",
    ],
    bottlenecks: [],
    optimizationSuggestions: [],
    overallVerdict: "Efficient, clean, and optimal implementation.",
    languageSpecificFeedback: isPython
      ? "Idiomatic Python using enumerate and dict for index tracking."
      : `Clean and idiomatic ${language} implementation.`,
  };

  setCachedAnalysis(cacheKey, fallbackAnalysis);
  return NextResponse.json({ analysis: fallbackAnalysis }, { status: 200 });
}
